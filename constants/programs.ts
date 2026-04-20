export type Position = 'PG' | 'SG' | 'SF' | 'PF' | 'C';
export type SkillLevel = 'beginner' | 'intermediate' | 'advanced' | 'elite';
export type TrainingGoal = 'shooting' | 'athleticism' | 'ball-handling' | 'defense' | 'overall';

export interface Program {
  id: string;
  title: string;
  subtitle: string;
  weeks: number;
  sessionsPerWeek: number;
  focusAreas: string[];
  targetPositions: Position[];
  targetLevel: SkillLevel[];
  drillIds: string[];
  coverColor: string;
}

export const PROGRAMS: Program[] = [
  {
    id: 'prog-001',
    title: 'Pure Shooter Protocol',
    subtitle: '6-week shooting transformation',
    weeks: 6,
    sessionsPerWeek: 4,
    focusAreas: ['Catch & Shoot', 'Pull-Up', 'Corner Three'],
    targetPositions: ['PG', 'SG', 'SF'],
    targetLevel: ['intermediate', 'advanced'],
    drillIds: ['drill-001', 'drill-005', 'drill-009', 'drill-014', 'drill-015'],
    coverColor: '#FF6B2C',
  },
  {
    id: 'prog-002',
    title: 'Elite Handle Blueprint',
    subtitle: '4-week ball-handling mastery',
    weeks: 4,
    sessionsPerWeek: 5,
    focusAreas: ['Crossover', 'Two-Ball', 'Off-Ball'],
    targetPositions: ['PG', 'SG'],
    targetLevel: ['beginner', 'intermediate', 'advanced'],
    drillIds: ['drill-002', 'drill-004', 'drill-010', 'drill-013', 'drill-020'],
    coverColor: '#4FACFE',
  },
  {
    id: 'prog-003',
    title: 'Explosion Academy',
    subtitle: '8-week athleticism overhaul',
    weeks: 8,
    sessionsPerWeek: 3,
    focusAreas: ['Vertical', 'Speed', 'Agility'],
    targetPositions: ['PG', 'SG', 'SF', 'PF', 'C'],
    targetLevel: ['intermediate', 'advanced', 'elite'],
    drillIds: ['drill-003', 'drill-008', 'drill-016'],
    coverColor: '#00D4AA',
  },
  {
    id: 'prog-004',
    title: 'Lockdown Defender',
    subtitle: '5-week defensive system',
    weeks: 5,
    sessionsPerWeek: 3,
    focusAreas: ['Lateral Quickness', 'Rotation', 'Help Defense'],
    targetPositions: ['PG', 'SG', 'SF', 'PF'],
    targetLevel: ['beginner', 'intermediate'],
    drillIds: ['drill-006', 'drill-011', 'drill-018'],
    coverColor: '#FFB547',
  },
  {
    id: 'prog-005',
    title: 'Paint Presence',
    subtitle: '4-week finishing clinic',
    weeks: 4,
    sessionsPerWeek: 4,
    focusAreas: ['Euro Step', 'Floater', 'Post'],
    targetPositions: ['SF', 'PF', 'C'],
    targetLevel: ['intermediate', 'advanced'],
    drillIds: ['drill-007', 'drill-012', 'drill-017', 'drill-019'],
    coverColor: '#FF6B2C',
  },
];
