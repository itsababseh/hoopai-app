import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Position, SkillLevel, TrainingGoal } from '../constants/programs';

export interface UserProfile {
  id: string;
  name: string;
  age: number;
  position: Position;
  skillLevel: SkillLevel;
  primaryGoal: TrainingGoal;
  sessionsPerWeek: number;
  sessionDuration: number; // minutes
  hasHealthAccess: boolean;
  activeProgramId: string | null;
  onboardingComplete: boolean;
  createdAt: string;
}

interface UserState {
  profile: UserProfile | null;
  isLoading: boolean;
  setProfile: (profile: UserProfile) => Promise<void>;
  updateProfile: (patch: Partial<UserProfile>) => Promise<void>;
  loadProfile: () => Promise<void>;
  clearProfile: () => Promise<void>;
}

const STORAGE_KEY = 'hoopai_user_profile';

export const useUserStore = create<UserState>((set, get) => ({
  profile: null,
  isLoading: false,

  setProfile: async (profile) => {
    set({ profile });
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
  },

  updateProfile: async (patch) => {
    const current = get().profile;
    if (!current) return;
    const updated = { ...current, ...patch };
    set({ profile: updated });
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  },

  loadProfile: async () => {
    set({ isLoading: true });
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        set({ profile: JSON.parse(stored) });
      }
    } catch (e) {
      console.error('Failed to load profile', e);
    } finally {
      set({ isLoading: false });
    }
  },

  clearProfile: async () => {
    set({ profile: null });
    await AsyncStorage.removeItem(STORAGE_KEY);
  },
}));
