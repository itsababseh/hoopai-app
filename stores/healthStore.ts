import { create } from 'zustand';

export interface HealthData {
  hrv?: number;
  restingHeartRate?: number;
  sleepHours?: number;
  sleepScore?: number;
  steps?: number;
  lastUpdated?: string;
}

interface HealthState {
  data: HealthData;
  isAvailable: boolean;
  isAuthorized: boolean;
  isLoading: boolean;
  setData: (data: Partial<HealthData>) => void;
  setAvailable: (available: boolean) => void;
  setAuthorized: (authorized: boolean) => void;
  setLoading: (loading: boolean) => void;
}

export const useHealthStore = create<HealthState>((set) => ({
  data: {},
  isAvailable: false,
  isAuthorized: false,
  isLoading: false,

  setData: (data) =>
    set((state) => ({ data: { ...state.data, ...data, lastUpdated: new Date().toISOString() } })),
  setAvailable: (isAvailable) => set({ isAvailable }),
  setAuthorized: (isAuthorized) => set({ isAuthorized }),
  setLoading: (isLoading) => set({ isLoading }),
}));
