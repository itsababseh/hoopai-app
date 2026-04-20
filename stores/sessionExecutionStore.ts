import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STALE_THRESHOLD_MS = 24 * 60 * 60 * 1000; // 24 hours



const COMPLETED_SESSIONS_KEY = '@hoopai:completed_sessions';
const IN_PROGRESS_KEY = '@hoopai:session_in_progress';

async function persistCompletedSession(result: SessionResult): Promise<void> {
  try {
    const existing = await AsyncStorage.getItem(COMPLETED_SESSIONS_KEY);
    const sessions: SessionResult[] = existing ? JSON.parse(existing) : [];
    sessions.push(result);
    await AsyncStorage.setItem(COMPLETED_SESSIONS_KEY, JSON.stringify(sessions));
  } catch (err) {
    console.error('[sessionExecutionStore] persistCompletedSession failed:', err);
  }
}

async function clearPersisted(): Promise<void> {
  try {
    await AsyncStorage.removeItem(IN_PROGRESS_KEY);
  } catch (err) {
    console.error('[sessionExecutionStore] clearPersisted failed:', err);
  }
}


import {
  ExecutionState,
  DrillItem,
  DrillResult,
  SessionResult,
  InProgressSession,
} from '../constants/sessionTypes';

const IN_PROGRESS_KEY = '@hoopai_in_progress_session';

interface SessionExecutionStore {
  // FSM state
  executionState: ExecutionState;

  // Session data
  sessionPlan: any | null;
  drills: DrillItem[];
  currentDrillIndex: number;
  currentSetIndex: number;
  drillResults: DrillResult[];

  // Timing
  startedAt: number | null; // Date.now()
  pausedAt: number | null;
  totalPausedMs: number;
  restStartedAt: number | null;
  currentRestDuration: number; // seconds

  // Derived / display
  elapsedSeconds: number;
  completionPercentage: number;

  // Actions
  startSession: (sessionPlan: any, drills: DrillItem[]) => void;
  completeSet: () => void;
  completeDrill: () => void;
  skipDrill: () => void;
  startRest: (durationSeconds: number) => void;
  endRest: () => void;
  skipRest: () => void;
  pause: () => void;
  resume: () => void;
  requestEarlyExit: () => void;
  confirmEarlyExit: () => void;
  cancelEarlyExit: () => void;
  completeSession: () => void;
  tick: (nowMs: number) => void;
  reset: () => void;
  loadInProgress: () => Promise<InProgressSession | null>;
}

function buildInitialDrillResult(drill: DrillItem): DrillResult {
    const { drills, currentDrillIndex } = get();
    if (!drills || drills.length === 0 || currentDrillIndex >= drills.length) return;
  return {
    drillId: drill.id,
    drillIndex: drill.index,
    skipped: false,
    completedSets: 0,
    completedReps: [],
    setDurations: [],
    restTimerSkippedCount: 0,
  };
}

function calcCompletion(drillResults: DrillResult[], drills: DrillItem[]): number {
  if (!drills.length) return 0;
  let totalSets = 0;
  let completedSets = 0;
  drills.forEach((d, i) => {
    totalSets += d.totalSets;
    completedSets += drillResults[i]?.completedSets ?? 0;
  });
  return totalSets > 0 ? completedSets / totalSets : 0;
}

async function persist(partial: Partial<InProgressSession>) {
  try {
    const existing = await AsyncStorage.getItem(IN_PROGRESS_KEY);
    const base: InProgressSession = existing ? JSON.parse(existing) : {};
    const merged: InProgressSession = {
      ...base,
      ...partial,
      lastPersistedAt: new Date().toISOString(),
    };
    await AsyncStorage.setItem(IN_PROGRESS_KEY, JSON.stringify(merged));
  } catch (_) {
    // Non-fatal — continue even if persistence fails
  }
}

async function clearPersisted() {
  try {
    await AsyncStorage.removeItem(IN_PROGRESS_KEY);
  } catch (_) {}
}

export const useSessionExecutionStore = create<SessionExecutionStore>((set, get) => ({
  executionState: 'idle',
  sessionPlan: null,
  drills: [],
  currentDrillIndex: 0,
  currentSetIndex: 0,
  drillResults: [],
  startedAt: null,
  pausedAt: null,
  totalPausedMs: 0,
  restStartedAt: null,
  currentRestDuration: 0,
  elapsedSeconds: 0,
  completionPercentage: 0,

  startSession: (sessionPlan, drills) => {
    const now = Date.now();
    const initialResults = drills.map(buildInitialDrillResult);
    set({
      executionState: 'active',
      sessionPlan,
      drills,
      currentDrillIndex: 0,
      currentSetIndex: 0,
      drillResults: initialResults,
      startedAt: now,
      pausedAt: null,
      totalPausedMs: 0,
      restStartedAt: null,
      currentRestDuration: 0,
      elapsedSeconds: 0,
      completionPercentage: 0,
    });
    persist({
      sessionPlan,
      currentDrillIndex: 0,
      currentSetIndex: 0,
      sessionResult: {
        startedAt: new Date(now).toISOString(),
        drillResults: initialResults,
      },
    });
  },

  completeSet: () => {
    const s = get();
    if (s.executionState !== 'active') return;
    const drill = s.drills[s.currentDrillIndex];
    if (!drill) return;

    const setStart = s.restStartedAt ?? s.startedAt ?? Date.now();
    const setDuration = Math.floor((Date.now() - setStart) / 1000);

    const updatedResults = s.drillResults.map((r, i) => {
      if (i !== s.currentDrillIndex) return r;
      return {
        ...r,
        completedSets: r.completedSets + 1,
        completedReps: [...r.completedReps, drill.reps ?? 0],
        setDurations: [...r.setDurations, setDuration],
      };
    });

    const newSetIndex = s.currentSetIndex + 1;
    const completion = calcCompletion(updatedResults, s.drills);

    if (newSetIndex >= drill.totalSets) {
      set({
        executionState: 'completing_drill',
        drillResults: updatedResults,
        currentSetIndex: newSetIndex,
        completionPercentage: completion,
      });
    } else {
      set({
        drillResults: updatedResults,
        currentSetIndex: newSetIndex,
        completionPercentage: completion,
      });
      // Trigger rest between sets
      get().startRest(drill.restDuration);
    }

    persist({
      currentDrillIndex: s.currentDrillIndex,
      currentSetIndex: newSetIndex,
      sessionResult: { drillResults: updatedResults, completionPercentage: completion },
    });
  },

  completeDrill: () => {
    const s = get();
    const nextIndex = s.currentDrillIndex + 1;

    if (nextIndex >= s.drills.length) {
      set({ executionState: 'completed', currentDrillIndex: nextIndex, currentSetIndex: 0 });
      get().completeSession();
    } else {
      const nextDrill = s.drills[nextIndex];
      set({
        executionState: 'rest',
        currentDrillIndex: nextIndex,
        currentSetIndex: 0,
        restStartedAt: Date.now(),
        currentRestDuration: nextDrill.restDuration,
      });
    }

    persist({ currentDrillIndex: nextIndex, currentSetIndex: 0 });
  },

  skipDrill: () => {
    const s = get();
    if (s.executionState !== 'active' && s.executionState !== 'completing_drill') return;

    const updatedResults = s.drillResults.map((r, i) =>
      i === s.currentDrillIndex ? { ...r, skipped: true } : r
    );
    const nextIndex = s.currentDrillIndex + 1;
    const completion = calcCompletion(updatedResults, s.drills);

    if (nextIndex >= s.drills.length) {
      set({
        executionState: 'partial_complete',
        drillResults: updatedResults,
        completionPercentage: completion,
      });
      get().completeSession();
    } else {
      set({
        executionState: 'active',
        drillResults: updatedResults,
        currentDrillIndex: nextIndex,
        currentSetIndex: 0,
        completionPercentage: completion,
      });
    }

    persist({
      currentDrillIndex: nextIndex,
      currentSetIndex: 0,
      sessionResult: { drillResults: updatedResults, completionPercentage: completion },
    });
  },

  startRest: (durationSeconds) => {
    set({
      executionState: 'rest',
      restStartedAt: Date.now(),
      currentRestDuration: durationSeconds,
    });
  },

  endRest: () => {
    const s = get();
    set({ executionState: 'active', restStartedAt: null });
    // If we were between drills (completing_drill led to rest), mark drill complete
    if (s.executionState === 'rest' && s.currentSetIndex === 0 && s.currentDrillIndex > 0) {
      // Already advanced index in completeDrill — just resume
    }
  },

  skipRest: () => {
    const s = get();
    if (s.executionState !== 'rest') return;

    const updatedResults = s.drillResults.map((r, i) =>
      i === s.currentDrillIndex
        ? { ...r, restTimerSkippedCount: r.restTimerSkippedCount + 1 }
        : r
    );

    set({ executionState: 'active', restStartedAt: null, drillResults: updatedResults });
    persist({ sessionResult: { drillResults: updatedResults } });
  },

  pause: () => {
    const s = get();
    if (s.executionState !== 'active' && s.executionState !== 'rest') return;
    set({ executionState: 'paused', pausedAt: Date.now() });
  },

  resume: () => {
    const s = get();
    if (s.executionState !== 'paused') return;
    const pausedMs = s.pausedAt ? Date.now() - s.pausedAt : 0;
    set({
      executionState: 'active',
      pausedAt: null,
      totalPausedMs: s.totalPausedMs + pausedMs,
    });
  },

  requestEarlyExit: () => {
    const s = get();
    if (s.executionState === 'active' || s.executionState === 'paused' || s.executionState === 'rest') {
      set({ executionState: 'early_exit_confirm' });
    }
  },

  confirmEarlyExit: () => {
    set({ executionState: 'partial_complete' });
    get().completeSession();
  },

  cancelEarlyExit: () => {
    set({ executionState: 'paused' });
  },

  completeSession: () => {
    const s = get();
    const now = Date.now();
    const elapsedMs = s.startedAt ? now - s.startedAt - s.totalPausedMs : 0;
    const elapsedSeconds = Math.floor(elapsedMs / 1000);
    const isPartial =
      s.executionState === 'partial_complete' ||
      s.drillResults.some((r) => r.skipped);

    const completion = calcCompletion(s.drillResults, s.drills);
    const targetXP: number = s.sessionPlan?.targetXP ?? 100;
    const totalXPAwarded = Math.floor(targetXP * completion);

    const result: Partial<SessionResult> = {
      completedAt: new Date(now).toISOString(),
      elapsedSeconds,
      pausedDuration: Math.floor(s.totalPausedMs / 1000),
      isPartial,
      isStale: false,
      completionPercentage: completion,
      totalXPAwarded,
      drillResults: s.drillResults,
    };

    set({ elapsedSeconds, completionPercentage: completion });
    persist({ sessionResult: result });
    clearPersisted(); // Remove in-progress on completion
  },

  tick: (nowMs) => {
    const s = get();
    if (s.executionState !== 'active' && s.executionState !== 'rest') return;
    if (!s.startedAt) return;
    const elapsed = Math.floor((nowMs - s.startedAt - s.totalPausedMs) / 1000);
    set({ elapsedSeconds: elapsed });
  },

  reset: () => {
    clearPersisted();
    set({
      executionState: 'idle',
      sessionPlan: null,
      drills: [],
      currentDrillIndex: 0,
      currentSetIndex: 0,
      drillResults: [],
      startedAt: null,
      pausedAt: null,
      totalPausedMs: 0,
      restStartedAt: null,
      currentRestDuration: 0,
      elapsedSeconds: 0,
      completionPercentage: 0,
    });
  },

  loadInProgress: async () => {
    try {
      const raw = await AsyncStorage.getItem(IN_PROGRESS_KEY);
      if (!raw) return null;
      return JSON.parse(raw) as InProgressSession;
    } catch (_) {
      return null;
    }
  },
}));
