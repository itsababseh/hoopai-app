import { DRILLS, Drill } from '../constants/drills';
import {
  GeneratedSession,
  SessionDrill,
  SessionType,
  IntensityLevel,
  INTENSITY_REST_SECONDS,
  INTENSITY_SETS,
  MILESTONE_DAYS,
} from '../constants/sessionTypes';

type Goal = 'scoring' | 'defense' | 'conditioning' | 'handles' | 'all_around';
type SkillLevel = 'beginner' | 'intermediate' | 'advanced' | 'elite';
type Position = 'PG' | 'SG' | 'SF' | 'PF' | 'C';

interface GeneratorInputs {
  readinessScore: number;
  energyLevel: number;
  sorenessLevel: number;
  sleepQuality: number;
  hrvScore?: number | null;
  position: Position;
  skillLevel: SkillLevel;
  primaryGoal: Goal;
  sessionDurationPref: 15 | 30 | 45 | 60 | 90;
  recentDrillIds: string[];
  streakCount: number;
  lastSessionType?: SessionType | null;
  lastSessionDate?: string | null;
  regenerationSeed?: number;
}

// ─── Readiness → Session Type Matrix ───────────────────────────────────────
function getSessionType(
  readiness: number,
  inputs: GeneratorInputs
): { sessionType: SessionType; intensityLevel: IntensityLevel } {
  let sessionType: SessionType;
  let intensityLevel: IntensityLevel;

  if (readiness >= 90) { sessionType = 'full'; intensityLevel = 'max'; }
  else if (readiness >= 76) { sessionType = 'full'; intensityLevel = 'intense'; }
  else if (readiness >= 61) { sessionType = 'full'; intensityLevel = 'moderate'; }
  else if (readiness >= 46) { sessionType = 'skills'; intensityLevel = 'moderate'; }
  else if (readiness >= 31) { sessionType = 'recovery'; intensityLevel = 'light'; }
  else { sessionType = 'recovery'; intensityLevel = 'recovery'; }

  // Override rules
  if (inputs.streakCount >= 6) {
    sessionType = 'recovery';
    intensityLevel = 'recovery';
  }
  if (inputs.sorenessLevel >= 4 && intensityLevel === 'intense') intensityLevel = 'moderate';
  if (inputs.sorenessLevel >= 4 && intensityLevel === 'max') intensityLevel = 'intense';
  if (inputs.hrvScore !== null && inputs.hrvScore !== undefined && !isNaN(inputs.hrvScore) && inputs.hrvScore < 40) {
    sessionType = 'recovery';
    intensityLevel = 'recovery';
  }
  // Downgrade if trained hard yesterday
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yStr = yesterday.toISOString().split('T')[0];
  if (inputs.lastSessionType === 'full' && inputs.lastSessionDate === yStr && readiness < 70) {
    const intensityOrder: IntensityLevel[] = ['recovery', 'light', 'moderate', 'intense', 'max'];
    const idx = intensityOrder.indexOf(intensityLevel);
    if (idx > 0) intensityLevel = intensityOrder[idx - 1];
  }

  return { sessionType, intensityLevel };
}

// ─── Drill Count by Duration + Session Type ────────────────────────────────
function getDrillCount(duration: number, sessionType: SessionType): number {
  const matrix: Record<number, Record<SessionType, number>> = {
    15: { recovery: 2, skills: 2, full: 3, conditioning: 2 },
    30: { recovery: 3, skills: 4, full: 5, conditioning: 4 },
    45: { recovery: 4, skills: 5, full: 6, conditioning: 5 },
    60: { recovery: 4, skills: 6, full: 7, conditioning: 6 },
    90: { recovery: 5, skills: 7, full: 9, conditioning: 7 },
  };
  return matrix[duration]?.[sessionType] ?? 5;
}

// ─── Difficulty range by skill level ──────────────────────────────────────
function getDifficultyRange(skillLevel: SkillLevel): string[] {
  const map: Record<SkillLevel, string[]> = {
    beginner: ['beginner', 'intermediate'],
    intermediate: ['beginner', 'intermediate', 'advanced'],
    advanced: ['intermediate', 'advanced'],
    elite: ['intermediate', 'advanced'],
  };
  return map[skillLevel];
}

// ─── Goal → category weight mapping ───────────────────────────────────────
function getCategoryWeight(category: string, goal: Goal, position: Position): number {
  const goalMap: Record<Goal, Record<string, number>> = {
    scoring: { shooting: 60, 'ball-handling': 20, finishing: 10, athleticism: 5, defense: 5 },
    handles: { 'ball-handling': 60, shooting: 15, finishing: 15, athleticism: 5, defense: 5 },
    defense: { defense: 60, athleticism: 20, 'ball-handling': 10, shooting: 5, finishing: 5 },
    conditioning: { athleticism: 60, defense: 20, 'ball-handling': 10, shooting: 5, finishing: 5 },
    all_around: { shooting: 25, 'ball-handling': 25, finishing: 20, athleticism: 15, defense: 15 },
  };
  let weight = goalMap[goal][category] ?? 5;
  // Position modifier
  if ((position === 'PG' || position === 'SG') && (category === 'ball-handling' || category === 'shooting')) weight += 20;
  if ((position === 'PF' || position === 'C') && (category === 'finishing' || category === 'defense')) weight += 20;
  if (position === 'SF') weight += 10;
  return weight;
}

// ─── Coaching messages ─────────────────────────────────────────────────────
const MESSAGES: Record<string, string[]> = {
  max: [
    "Today's your day — everything is firing. Go full speed, no holding back.",
    "Peak readiness locked in. This is what you trained for — push every set.",
    "Your body is primed. Don't waste it — make today count.",
  ],
  intense: [
    "High energy, sharper focus. Execute every rep with intention.",
    "You're dialed in today. Push past comfortable — that's where growth lives.",
    "Excellent readiness. Time to put in elite work.",
  ],
  moderate: [
    "Solid baseline. Stay locked in and get quality reps.",
    "You have what it takes today. Consistency beats intensity — focus on form.",
    "Good energy. Execute clean and the results will follow.",
  ],
  light: [
    "Low-key day. Smart work builds over time — quality beats quantity.",
    "Take care of your body. Light work keeps the streak alive.",
    "Stay patient. Light sessions keep you in the game for the long run.",
  ],
  recovery: [
    "Rest is training. Active recovery keeps you sharp for tomorrow.",
    "Your body is asking for a reset. Respect that — come back stronger.",
    "Recovery days are where pros separate themselves. Work the process.",
  ],
  streak_3: ["3 days straight — habits are forming. Keep pushing."],
  streak_7: ["7 days in — this is a real streak now. Don't break the chain."],
  streak_14: ["14 consecutive days. Elite consistency. You're different."],
  streak_21: ["21 days. This has become part of who you are."],
  streak_30: ["30 days. You are the commitment most people only talk about."],
};

function getCoachingMessage(intensity: IntensityLevel, streak: number): string {
  const milestone = MILESTONE_DAYS.find(d => d === streak);
  if (milestone) {
    const key = `streak_${milestone}`;
    if (MESSAGES[key]) return MESSAGES[key][0];
  }
  const pool = MESSAGES[intensity] ?? MESSAGES.moderate;
  return pool[Math.floor(Math.random() * pool.length)];
}

// ─── Session titles ────────────────────────────────────────────────────────
const TITLE_PARTS: Record<IntensityLevel, string[]> = {
  max: ['Elite', 'Peak', 'Apex'],
  intense: ['High-Intensity', 'Power', 'Fire'],
  moderate: ['Focused', 'Sharp', 'Steady'],
  light: ['Light', 'Smooth', 'Easy'],
  recovery: ['Active Recovery', 'Reset', 'Restore'],
};
const GOAL_NOUNS: Record<string, string[]> = {
  scoring: ['Scoring Clinic', 'Shooting Session', 'Bucket Lab'],
  handles: ['Handle Lab', 'Ball Handling', 'Dribble Clinic'],
  defense: ['Defensive Breakdown', 'Lock-Down Work', 'D Session'],
  conditioning: ['Conditioning Circuit', 'Athletic Build', 'Fitness Grind'],
  all_around: ['Full Court Workout', 'Complete Training', 'All-Around Session'],
};

function generateTitle(intensity: IntensityLevel, goal: Goal, seed: number): string {
  const adj = TITLE_PARTS[intensity];
  const noun = GOAL_NOUNS[goal] ?? ['Training Session'];
  const a = adj[seed % adj.length];
  const n = noun[seed % noun.length];
  return `${a} ${n}`;
}

// ─── Weighted random selection ─────────────────────────────────────────────
function weightedSample<T extends { weight: number }>(items: T[], count: number, seed: number): T[] {
  const selected: T[] = [];
  let pool = [...items];
  let s = seed;
  while (selected.length < count && pool.length > 0) {
    const totalWeight = pool.reduce((sum, item) => sum + item.weight, 0);
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    let r = Math.abs(s) % totalWeight;
    let idx = 0;
    for (let i = 0; i < pool.length; i++) {
      r -= pool[i].weight;
      if (r <= 0) { idx = i; break; }
    }
    selected.push(pool[idx]);
    pool.splice(idx, 1);
  }
  return selected;
}

// ─── MAIN GENERATOR ────────────────────────────────────────────────────────
export function generateSession(inputs: GeneratorInputs): GeneratedSession {
  const { sessionType, intensityLevel } = getSessionType(inputs.readinessScore, inputs);
  const drillCount = getDrillCount(inputs.sessionDurationPref, sessionType);
  const difficultyRange = getDifficultyRange(inputs.skillLevel);
  const seed = inputs.regenerationSeed ?? Date.now();

  // Recency filter
  const today = new Date().toISOString().split('T')[0];
  const recentSet = new Set(inputs.recentDrillIds);

  // Build weighted drill pool
  let pool = DRILLS
    .filter(d => difficultyRange.includes(d.difficulty))
    .map(d => {
      let weight = getCategoryWeight(d.category, inputs.primaryGoal, inputs.position);
      // Recency bonus
      if (!recentSet.has(d.id)) weight += 10;
      return { ...d, weight };
    });

  // Recency filter — exclude last 3 days
  let filtered = pool.filter(d => !recentSet.has(d.id));
  if (filtered.length < drillCount) filtered = pool; // relax

  // Select drills
  const [minSets, maxSets] = INTENSITY_SETS[intensityLevel];
  const restDuration = INTENSITY_REST_SECONDS[intensityLevel];
  const selectedDrills = weightedSample(filtered, drillCount, seed);

  const sessionDrills: SessionDrill[] = selectedDrills.map((drill, i) => ({
    id: `${Date.now()}-${i}`,
    drillId: drill.id,
    drillName: drill.title,
    orderIndex: i,
    targetSets: minSets + (i % (maxSets - minSets + 1)),
    completedSets: 0,
    status: 'pending',
    durationEstimate: drill.durationMinutes * 60,
    restDuration,
    coachingCue: drill.coachNote,
    youtubeId: drill.youtubeId,
    category: drill.category,
    reps: drill.reps,
  }));

  const warmupDuration = sessionType === 'recovery' ? 3 : sessionType === 'full' ? 7 : 5;
  const cooldownDuration = sessionType === 'recovery' ? 3 : sessionType === 'full' ? 5 : 4;
  const isMilestone = MILESTONE_DAYS.includes(inputs.streakCount);

  const titleSeed = Math.abs(seed % 1000);
  const title = generateTitle(intensityLevel, inputs.primaryGoal, titleSeed);
  const subtitle = isMilestone
    ? `Day ${inputs.streakCount} Streak — You're building something real`
    : `Built for your ${inputs.readinessScore} readiness`;

  return {
    id: `session-${Date.now()}`,
    generatedAt: new Date().toISOString(),
    date: today,
    title,
    subtitle,
    sessionType,
    intensityLevel,
    readinessSnapshot: inputs.readinessScore,
    estimatedDuration: inputs.sessionDurationPref,
    drills: sessionDrills,
    coachingMessage: getCoachingMessage(intensityLevel, inputs.streakCount),
    focusArea: GOAL_NOUNS[inputs.primaryGoal]?.[0] ?? 'Full Training',
    warmupDuration,
    cooldownDuration,
    status: 'generated',
    regenerationCount: 0,
    goalAlignment: inputs.primaryGoal,
  };
}

export function getXPForSession(result: { completedDrills: number; intensityLevel: IntensityLevel; streakCount: number }): number {
  const baseXP = result.completedDrills * 10;
  const intensityBonus: Record<IntensityLevel, number> = { recovery: 0, light: 5, moderate: 10, intense: 20, max: 30 };
  const streakBonus = result.streakCount >= 7 ? 25 : result.streakCount >= 3 ? 10 : 0;
  return baseXP + intensityBonus[result.intensityLevel] + streakBonus;
}
