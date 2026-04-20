import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { ReadinessResult } from '../utils/readiness';

export interface CheckInData {
  date: string;
  energyLevel: number;
  soreness: number;
  sleepHours: number;
  notes?: string;
  readiness: ReadinessResult;
}

export interface SessionLog {
  id: string;
  date: string;
  drillId: string;
  durationMinutes: number;
  setsCompleted: number;
  ratingOutOf5: number;
  notes?: string;
}

interface SessionState {
  todayCheckIn: CheckInData | null;
  sessionHistory: SessionLog[];
  currentStreak: number;
  totalSessions: number;
  setTodayCheckIn: (data: CheckInData) => Promise<void>;
  logSession: (session: SessionLog) => Promise<void>;
  loadHistory: () => Promise<void>;
  getTodayCheckIn: () => CheckInData | null;
}

const CHECK_IN_KEY = 'hoopai_checkin';
const HISTORY_KEY  = 'hoopai_history';

function computeStreak(history: SessionLog[]): number {
  if (!history.length) return 0;
  const today = new Date().toDateString();
  const sorted = [...history].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  let streak = 0;
  let current = new Date(today);
  for (const s of sorted) {
    const d = new Date(s.date).toDateString();
    if (d === current.toDateString()) {
      streak++;
      current.setDate(current.getDate() - 1);
    } else {
      break;
    }
  }
  return streak;
}

export const useSessionStore = create<SessionState>((set, get) => ({
  todayCheckIn: null,
  sessionHistory: [],
  currentStreak: 0,
  totalSessions: 0,

  setTodayCheckIn: async (data) => {
    set({ todayCheckIn: data });
    await AsyncStorage.setItem(CHECK_IN_KEY + '_' + data.date, JSON.stringify(data));
  },

  logSession: async (session) => {
    const history = [...get().sessionHistory, session];
    set({
      sessionHistory: history,
      currentStreak: computeStreak(history),
      totalSessions: history.length,
    });
    await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  },

  loadHistory: async () => {
    try {
      const todayKey = CHECK_IN_KEY + '_' + new Date().toISOString().split('T')[0];
      const [historyRaw, checkInRaw] = await Promise.all([
        AsyncStorage.getItem(HISTORY_KEY),
        AsyncStorage.getItem(todayKey),
      ]);
      const history: SessionLog[] = historyRaw ? JSON.parse(historyRaw) : [];
      set({
        sessionHistory: history,
        currentStreak: computeStreak(history),
        totalSessions: history.length,
        todayCheckIn: checkInRaw ? JSON.parse(checkInRaw) : null,
      });
    } catch (e) {
      console.error('Failed to load session history', e);
    }
  },

  getTodayCheckIn: () => get().todayCheckIn,
}));
