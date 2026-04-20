import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { GeneratedSession, ActiveSessionState, SessionResult, SessionDrill } from '../constants/sessionTypes';
import { getXPForSession } from '../utils/sessionGenerator';

interface ActiveSessionStore {
  currentSession: GeneratedSession | null;
  activeState: ActiveSessionState | null;
  todayResult: SessionResult | null;
  generationStatus: 'idle' | 'generating' | 'ready' | 'error';
  regenerationCount: number;

  setCurrentSession: (session: GeneratedSession) => void;
  startSession: () => void;
  completeSet: () => void;
  skipDrill: () => void;
  nextDrill: () => void;
  setResting: (resting: boolean) => void;
  tickRestTimer: () => void;
  addRestTime: (seconds: number) => void;
  abandonSession: () => SessionResult | null;
  completeSession: () => SessionResult;
  setGenerationStatus: (status: 'idle' | 'generating' | 'ready' | 'error') => void;
  incrementRegenCount: () => void;
  reset: () => void;
}

const STORAGE_KEY = 'hoopai_active_session';

export const useActiveSessionStore = create<ActiveSessionStore>((set, get) => ({
  currentSession: null,
  activeState: null,
  todayResult: null,
  generationStatus: 'idle',
  regenerationCount: 0,

  setCurrentSession: (session) => {
    set({ currentSession: session, generationStatus: 'ready', regenerationCount: session.regenerationCount });
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  },

  startSession: () => {
    const { currentSession } = get();
    if (!currentSession) return;
    const state: ActiveSessionState = {
      sessionId: currentSession.id,
      startedAt: new Date().toISOString(),
      currentDrillIndex: 0,
      currentSet: 1,
      isResting: false,
      restSecondsRemaining: 0,
      elapsedSeconds: 0,
      completedDrillIds: [],
      skippedDrillIds: [],
      totalPausedSeconds: 0,
    };
    set({ activeState: state });
  },

  completeSet: () => {
    const { activeState, currentSession } = get();
    if (!activeState || !currentSession) return;
    const drill = currentSession.drills[activeState.currentDrillIndex];
    const newSet = activeState.currentSet + 1;
    const isLastSet = activeState.currentSet >= drill.targetSets;

    if (isLastSet) {
      // Drill complete
      const updatedDrills = currentSession.drills.map((d, i) =>
        i === activeState.currentDrillIndex ? { ...d, completedSets: drill.targetSets, status: 'completed' as const } : d
      );
      const newSession = { ...currentSession, drills: updatedDrills };
      set({
        currentSession: newSession,
        activeState: {
          ...activeState,
          completedDrillIds: [...activeState.completedDrillIds, drill.drillId],
          isResting: false,
          restSecondsRemaining: 0,
        },
      });
    } else {
      // Start rest timer
      const updatedDrills = currentSession.drills.map((d, i) =>
        i === activeState.currentDrillIndex ? { ...d, completedSets: activeState.currentSet } : d
      );
      set({
        currentSession: { ...currentSession, drills: updatedDrills },
        activeState: {
          ...activeState,
          currentSet: newSet,
          isResting: true,
          restSecondsRemaining: drill.restDuration,
        },
      });
    }
  },

  skipDrill: () => {
    const { activeState, currentSession } = get();
    if (!activeState || !currentSession) return;
    const drill = currentSession.drills[activeState.currentDrillIndex];
    const updatedDrills = currentSession.drills.map((d, i) =>
      i === activeState.currentDrillIndex ? { ...d, status: 'skipped' as const } : d
    );
    set({
      currentSession: { ...currentSession, drills: updatedDrills },
      activeState: {
        ...activeState,
        skippedDrillIds: [...activeState.skippedDrillIds, drill.drillId],
        currentDrillIndex: activeState.currentDrillIndex + 1,
        currentSet: 1,
        isResting: false,
      },
    });
  },

  nextDrill: () => {
    const { activeState } = get();
    if (!activeState) return;
    set({
      activeState: {
        ...activeState,
        currentDrillIndex: activeState.currentDrillIndex + 1,
        currentSet: 1,
        isResting: false,
        restSecondsRemaining: 0,
      },
    });
  },

  setResting: (resting) => set(s => ({ activeState: s.activeState ? { ...s.activeState, isResting: resting } : null })),

  tickRestTimer: () => {
    const { activeState } = get();
    if (!activeState || !activeState.isResting) return;
    const newTime = activeState.restSecondsRemaining - 1;
    if (newTime <= 0) {
      set({ activeState: { ...activeState, isResting: false, restSecondsRemaining: 0 } });
    } else {
      set({ activeState: { ...activeState, restSecondsRemaining: newTime } });
    }
  },

  addRestTime: (seconds) => set(s => ({
    activeState: s.activeState ? { ...s.activeState, restSecondsRemaining: s.activeState.restSecondsRemaining + seconds } : null,
  })),

  abandonSession: () => {
    const { activeState, currentSession } = get();
    if (!activeState || !currentSession) return null;
    const completed = activeState.completedDrillIds.length;
    const total = currentSession.drills.length;
    const rate = total > 0 ? completed / total : 0;
    if (rate < 0.6) {
      const result: SessionResult = {
        id: `result-${Date.now()}`,
        sessionId: activeState.sessionId,
        date: currentSession.date,
        completedAt: new Date().toISOString(),
        status: 'abandoned',
        actualDuration: activeState.elapsedSeconds,
        totalDrills: total,
        completedDrills: completed,
        skippedDrills: activeState.skippedDrillIds.length,
        completionRate: rate,
        totalSetsCompleted: currentSession.drills.reduce((s, d) => s + d.completedSets, 0),
        streakAtCompletion: 0,
        readinessScore: currentSession.readinessSnapshot,
        sessionType: currentSession.sessionType,
        intensityLevel: currentSession.intensityLevel,
        isMilestone: false,
      };
      set({ todayResult: result, activeState: null });
      return result;
    }
    return get().completeSession();
  },

  completeSession: () => {
    const { activeState, currentSession } = get();
    const completed = activeState?.completedDrillIds.length ?? 0;
    const total = currentSession?.drills.length ?? 1;
    const result: SessionResult = {
      id: `result-${Date.now()}`,
      sessionId: activeState?.sessionId ?? '',
      date: currentSession?.date ?? new Date().toISOString().split('T')[0],
      completedAt: new Date().toISOString(),
      status: 'completed',
      actualDuration: activeState?.elapsedSeconds ?? 0,
      totalDrills: total,
      completedDrills: completed,
      skippedDrills: activeState?.skippedDrillIds.length ?? 0,
      completionRate: completed / total,
      totalSetsCompleted: currentSession?.drills.reduce((s, d) => s + d.completedSets, 0) ?? 0,
      streakAtCompletion: 0, // populated by sessionStore after
      readinessScore: currentSession?.readinessSnapshot ?? 0,
      sessionType: currentSession?.sessionType ?? 'full',
      intensityLevel: currentSession?.intensityLevel ?? 'moderate',
      isMilestone: false,
    };
    set({ todayResult: result, activeState: null });
    return result;
  },

  setGenerationStatus: (status) => {
    if (status === 'generating' && get().generationStatus === 'generating') return; // BUG-06 mutex
    set({ generationStatus: status });
  },
  incrementRegenCount: () => set(s => ({ regenerationCount: s.regenerationCount + 1 })),
  reset: () => set({ currentSession: null, activeState: null, todayResult: null, generationStatus: 'idle', regenerationCount: 0 }),
}));
