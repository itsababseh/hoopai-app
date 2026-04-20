export type SessionType = 'full' | 'recovery' | 'skills' | 'conditioning';
export type IntensityLevel = 'recovery' | 'light' | 'moderate' | 'intense' | 'max';
export type DrillStatus = 'pending' | 'active' | 'completed' | 'skipped';
export type SessionStatus = 'generated' | 'active' | 'completed' | 'abandoned';

export interface GeneratedSession {
  id: string;
  generatedAt: string;
  date: string;
  title: string;
  subtitle: string;
  sessionType: SessionType;
  intensityLevel: IntensityLevel;
  readinessSnapshot: number;
  estimatedDuration: number;
  actualDuration?: number;
  drills: SessionDrill[];
  coachingMessage: string;
  focusArea: string;
  warmupDuration: number;
  cooldownDuration: number;
  status: SessionStatus;
  regenerationCount: number;
  goalAlignment: string;
}

export interface SessionDrill {
  id: string;
  drillId: string;
  drillName: string;
  orderIndex: number;
  targetSets: number;
  completedSets: number;
  status: DrillStatus;
  durationEstimate: number;
  restDuration: number;
  coachingCue?: string;
  youtubeId: string;
  category: string;
  reps: string;
}

export interface ActiveSessionState {
  sessionId: string;
  startedAt: string;
  currentDrillIndex: number;
  currentSet: number;
  isResting: boolean;
  restSecondsRemaining: number;
  elapsedSeconds: number;
  completedDrillIds: string[];
  skippedDrillIds: string[];
  pausedAt?: string;
  totalPausedSeconds: number;
}

export interface SessionResult {
  id: string;
  sessionId: string;
  date: string;
  completedAt: string;
  status: 'completed' | 'abandoned';
  actualDuration: number;
  totalDrills: number;
  completedDrills: number;
  skippedDrills: number;
  completionRate: number;
  totalSetsCompleted: number;
  streakAtCompletion: number;
  readinessScore: number;
  sessionType: SessionType;
  intensityLevel: IntensityLevel;
  isMilestone: boolean;
  milestoneDay?: number;
}

export const MILESTONE_DAYS = [3, 7, 14, 21, 30, 60, 100];

export const INTENSITY_REST_SECONDS: Record<IntensityLevel, number> = {
  recovery: 60,
  light: 45,
  moderate: 30,
  intense: 20,
  max: 15,
};

export const INTENSITY_SETS: Record<IntensityLevel, [number, number]> = {
  recovery: [2, 2],
  light: [2, 3],
  moderate: [3, 3],
  intense: [3, 4],
  max: [4, 5],
};
