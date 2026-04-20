// Add to existing constants/sessionTypes.ts

export type ReadinessTier =
  | 'peak'
  | 'ready'
  | 'moderate'
  | 'low'
  | 'rest'
  | 'recovery';

export type DrillCategory =
  | 'ball-handling'
  | 'shooting'
  | 'footwork'
  | 'conditioning'
  | 'defense'
  | 'finishing'
  | 'passing'
  | 'strength';

export type ExecutionState =
  | 'idle'
  | 'active'
  | 'paused'
  | 'rest'
  | 'completing_drill'
  | 'early_exit_confirm'
  | 'completed'
  | 'partial_complete';

export interface DrillItem {
  id: string;
  index: number;
  name: string;
  category: DrillCategory;
  instructions: string[];
  totalSets: number;
  reps?: number;
  duration?: number; // seconds, undefined if rep-based
  restDuration: number; // seconds between sets/drills
  difficulty: 'easy' | 'medium' | 'hard';
  equipment: string[];
  coachingCues: string[];
}

export interface DrillResult {
  drillId: string;
  drillIndex: number;
  skipped: boolean;
  completedSets: number;
  completedReps: number[];
  setDurations: number[];
  restTimerSkippedCount: number;
  error?: string;
}

export interface SessionResult {
  id: string;
  sessionPlanId: string;
  userId: string;
  startedAt: string; // ISO 8601
  completedAt?: string; // ISO 8601
  elapsedSeconds: number;
  pausedDuration: number; // seconds spent paused
  isPartial: boolean;
  isStale: boolean;
  completionPercentage: number; // 0–1
  totalXPAwarded: number;
  drillResults: DrillResult[];
  streakDayAfter: number;
  xpTotalAfter: number;
}

export interface InProgressSession {
  sessionPlan: any;
  sessionResult: Partial<SessionResult>;
  currentDrillIndex: number;
  currentSetIndex: number;
  lastPersistedAt: string; // ISO 8601
}
