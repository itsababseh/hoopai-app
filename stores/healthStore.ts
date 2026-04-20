import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// ─── Types ───────────────────────────────────────────────────────────────────

export type HealthSource = 'apple_watch' | 'apple_health' | 'fitbit' | 'garmin' | 'google_fit' | 'health_connect' | 'manual' | 'unknown';

export interface HealthMetric<T> {
  value: T | null;
  source: HealthSource;
  recordedAt: string | null; // ISO timestamp of when data was RECORDED by wearable
  fetchedAt: string | null;  // ISO timestamp of when we last fetched from platform
  isStale: boolean;
}

export interface HealthData {
  hrv: HealthMetric<number>;           // ms (RMSSD)
  restingHeartRate: HealthMetric<number>; // bpm
  sleepHours: HealthMetric<number>;    // hours
  sleepScore: HealthMetric<number>;    // 0-100
  steps: HealthMetric<number>;         // count (today)
}

export type PermissionStatus = 'not_determined' | 'authorized' | 'denied' | 'unavailable';

export interface HealthPermissions {
  hrv: PermissionStatus;
  heartRate: PermissionStatus;
  sleep: PermissionStatus;
  steps: PermissionStatus;
}

export type SyncStatus = 'idle' | 'syncing' | 'success' | 'error';

export interface HealthStoreState {
  // availability
  isAvailable: boolean;           // platform health API exists
  isHealthConnectInstalled: boolean; // Android only
  
  // permissions
  permissions: HealthPermissions;
  permissionRequestedAt: string | null;
  
  // data
  data: HealthData;
  
  // sync
  syncStatus: SyncStatus;
  lastSyncAt: string | null;
  syncError: string | null;
  
  // mode
  autoReadinessEnabled: boolean;   // user can toggle off
  
  // actions
  checkAvailability: () => Promise<void>;
  requestPermissions: () => Promise<boolean>;
  syncHealthData: () => Promise<void>;
  setAutoReadiness: (enabled: boolean) => void;
  clearHealthData: () => void;
  _setMockData: (data: Partial<HealthData>) => void; // dev/simulator only
}

// ─── Stale thresholds ────────────────────────────────────────────────────────

const STALE_THRESHOLDS_MS = {
  hrv: 24 * 60 * 60 * 1000,        // 24h
  restingHeartRate: 3 * 60 * 60 * 1000, // 3h
  sleepHours: 12 * 60 * 60 * 1000, // 12h
  sleepScore: 12 * 60 * 60 * 1000, // 12h
  steps: 3 * 60 * 60 * 1000,       // 3h
};

function makeEmptyMetric<T>(): HealthMetric<T> {
  return { value: null, source: 'unknown', recordedAt: null, fetchedAt: null, isStale: false };
}

function isStaleMetric<T>(metric: HealthMetric<T>, key: keyof typeof STALE_THRESHOLDS_MS): boolean {
  if (!metric.fetchedAt || metric.value === null) return false;
  const age = Date.now() - new Date(metric.fetchedAt).getTime();
  return age > STALE_THRESHOLDS_MS[key];
}

const initialData: HealthData = {
  hrv: makeEmptyMetric<number>(),
  restingHeartRate: makeEmptyMetric<number>(),
  sleepHours: makeEmptyMetric<number>(),
  sleepScore: makeEmptyMetric<number>(),
  steps: makeEmptyMetric<number>(),
};

// ─── Platform health adapters ─────────────────────────────────────────────────
// We dynamically import to avoid errors on platforms where the lib isn't linked

async function checkHealthAvailability(): Promise<{ available: boolean; healthConnectInstalled: boolean }> {
  if (Platform.OS === 'ios') {
    try {
      const Health = await import('expo-health');
      const isAvailable = await Health.isAvailableAsync();
      return { available: isAvailable, healthConnectInstalled: false };
    } catch {
      return { available: false, healthConnectInstalled: false };
    }
  } else if (Platform.OS === 'android') {
    try {
      const HC = await import('react-native-health-connect');
      const isAvailable = await HC.initialize();
      return { available: isAvailable, healthConnectInstalled: isAvailable };
    } catch {
      return { available: false, healthConnectInstalled: false };
    }
  }
  return { available: false, healthConnectInstalled: false };
}

async function requestHealthPermissions(): Promise<HealthPermissions> {
  const denied: HealthPermissions = {
    hrv: 'denied',
    heartRate: 'denied',
    sleep: 'denied',
    steps: 'denied',
  };

  if (Platform.OS === 'ios') {
    try {
      const Health = await import('expo-health');
      const permissions = await Health.requestPermissionsAsync([
        { kind: Health.HealthDataType.HeartRateVariabilitySDNN, access: Health.HealthAccessType.Read },
        { kind: Health.HealthDataType.RestingHeartRate, access: Health.HealthAccessType.Read },
        { kind: Health.HealthDataType.SleepAnalysis, access: Health.HealthAccessType.Read },
        { kind: Health.HealthDataType.StepCount, access: Health.HealthAccessType.Read },
      ]);
      // HealthKit doesn't expose per-type status — treat any success as authorized
      const granted = permissions.granted ?? false;
      const status: PermissionStatus = granted ? 'authorized' : 'denied';
      return { hrv: status, heartRate: status, sleep: status, steps: status };
    } catch {
      return denied;
    }
  } else if (Platform.OS === 'android') {
    try {
      const HC = await import('react-native-health-connect');
      const result = await HC.requestPermission([
        { accessType: 'read', recordType: 'HeartRateVariability' },
        { accessType: 'read', recordType: 'RestingHeartRate' },
        { accessType: 'read', recordType: 'SleepSession' },
        { accessType: 'read', recordType: 'Steps' },
      ]);
      const granted = (type: string) => result.some((r: any) => r.recordType === type) ? 'authorized' as const : 'denied' as const;
      return {
        hrv: granted('HeartRateVariability'),
        heartRate: granted('RestingHeartRate'),
        sleep: granted('SleepSession'),
        steps: granted('Steps'),
      };
    } catch {
      return denied;
    }
  }
  return denied;
}

async function fetchHealthData(permissions: HealthPermissions): Promise<Partial<HealthData>> {
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(startOfDay);
  yesterday.setDate(yesterday.getDate() - 1);
  const fetchedAt = now.toISOString();

  const result: Partial<HealthData> = {};

  if (Platform.OS === 'ios') {
    try {
      const Health = await import('expo-health');

      // HRV — last 24h
      if (permissions.hrv === 'authorized') {
        try {
          const hrvSamples = await Health.queryAsync(Health.HealthDataType.HeartRateVariabilitySDNN, {
            startDate: yesterday.toISOString(),
            endDate: now.toISOString(),
          });
          if (hrvSamples.length > 0) {
            const latest = hrvSamples[hrvSamples.length - 1];
            result.hrv = {
              value: Math.round((latest as any).value),
              source: 'apple_health',
              recordedAt: (latest as any).startDate,
              fetchedAt,
              isStale: false,
            };
          }
        } catch {}
      }

      // Resting HR — last 24h
      if (permissions.heartRate === 'authorized') {
        try {
          const hrSamples = await Health.queryAsync(Health.HealthDataType.RestingHeartRate, {
            startDate: yesterday.toISOString(),
            endDate: now.toISOString(),
          });
          if (hrSamples.length > 0) {
            const latest = hrSamples[hrSamples.length - 1];
            result.restingHeartRate = {
              value: Math.round((latest as any).value),
              source: 'apple_health',
              recordedAt: (latest as any).startDate,
              fetchedAt,
              isStale: false,
            };
          }
        } catch {}
      }

      // Sleep — last night
      if (permissions.sleep === 'authorized') {
        try {
          const sleepSamples = await Health.queryAsync(Health.HealthDataType.SleepAnalysis, {
            startDate: yesterday.toISOString(),
            endDate: now.toISOString(),
          });
          if (sleepSamples.length > 0) {
            // Sum asleep stages
            const asleepDuration = sleepSamples
              .filter((s: any) => s.value === 'ASLEEP' || s.value === 'CORE' || s.value === 'DEEP' || s.value === 'REM')
              .reduce((sum: number, s: any) => {
                const dur = (new Date(s.endDate).getTime() - new Date(s.startDate).getTime()) / 3600000;
                return sum + dur;
              }, 0);
            const hours = Math.round(asleepDuration * 10) / 10;
            result.sleepHours = {
              value: hours,
              source: 'apple_health',
              recordedAt: (sleepSamples[0] as any).startDate,
              fetchedAt,
              isStale: false,
            };
            // Compute a simple sleep score: 7.5h = 80, scale linearly, cap at 100
            const score = Math.min(100, Math.max(0, Math.round((hours / 7.5) * 80)));
            result.sleepScore = {
              value: score,
              source: 'apple_health',
              recordedAt: (sleepSamples[0] as any).startDate,
              fetchedAt,
              isStale: false,
            };
          }
        } catch {}
      }

      // Steps — today
      if (permissions.steps === 'authorized') {
        try {
          const stepSamples = await Health.queryAsync(Health.HealthDataType.StepCount, {
            startDate: startOfDay.toISOString(),
            endDate: now.toISOString(),
          });
          const total = stepSamples.reduce((sum: number, s: any) => sum + (s.value ?? 0), 0);
          if (total > 0) {
            result.steps = {
              value: total,
              source: 'apple_health',
              recordedAt: now.toISOString(),
              fetchedAt,
              isStale: false,
            };
          }
        } catch {}
      }
    } catch {}
  } else if (Platform.OS === 'android') {
    try {
      const HC = await import('react-native-health-connect');

      // HRV
      if (permissions.hrv === 'authorized') {
        try {
          const records = await HC.readRecords('HeartRateVariability', {
            timeRangeFilter: {
              operator: 'between',
              startTime: yesterday.toISOString(),
              endTime: now.toISOString(),
            },
          });
          if ((records as any).records?.length > 0) {
            const latest = (records as any).records[(records as any).records.length - 1];
            result.hrv = {
              value: Math.round(latest.rmssd ?? latest.measurement),
              source: 'health_connect',
              recordedAt: latest.time,
              fetchedAt,
              isStale: false,
            };
          }
        } catch {}
      }

      // Resting HR
      if (permissions.heartRate === 'authorized') {
        try {
          const records = await HC.readRecords('RestingHeartRate', {
            timeRangeFilter: {
              operator: 'between',
              startTime: yesterday.toISOString(),
              endTime: now.toISOString(),
            },
          });
          if ((records as any).records?.length > 0) {
            const latest = (records as any).records[(records as any).records.length - 1];
            result.restingHeartRate = {
              value: Math.round(latest.beatsPerMinute),
              source: 'health_connect',
              recordedAt: latest.time,
              fetchedAt,
              isStale: false,
            };
          }
        } catch {}
      }

      // Sleep
      if (permissions.sleep === 'authorized') {
        try {
          const records = await HC.readRecords('SleepSession', {
            timeRangeFilter: {
              operator: 'between',
              startTime: yesterday.toISOString(),
              endTime: now.toISOString(),
            },
          });
          if ((records as any).records?.length > 0) {
            const latest = (records as any).records[(records as any).records.length - 1];
            const dur = (new Date(latest.endTime).getTime() - new Date(latest.startTime).getTime()) / 3600000;
            const hours = Math.round(dur * 10) / 10;
            result.sleepHours = {
              value: hours,
              source: 'health_connect',
              recordedAt: latest.startTime,
              fetchedAt,
              isStale: false,
            };
            const score = Math.min(100, Math.max(0, Math.round((hours / 7.5) * 80)));
            result.sleepScore = {
              value: score,
              source: 'health_connect',
              recordedAt: latest.startTime,
              fetchedAt,
              isStale: false,
            };
          }
        } catch {}
      }

      // Steps
      if (permissions.steps === 'authorized') {
        try {
          const records = await HC.aggregateRecord({
            recordType: 'Steps',
            timeRangeFilter: {
              operator: 'between',
              startTime: startOfDay.toISOString(),
              endTime: now.toISOString(),
            },
          });
          const count = (records as any).COUNT_TOTAL ?? 0;
          if (count > 0) {
            result.steps = {
              value: count,
              source: 'health_connect',
              recordedAt: now.toISOString(),
              fetchedAt,
              isStale: false,
            };
          }
        } catch {}
      }
    } catch {}
  }

  return result;
}

// ─── Store ────────────────────────────────────────────────────────────────────

export const useHealthStore = create<HealthStoreState>()(
  persist(
    (set, get) => ({
      isAvailable: false,
      isHealthConnectInstalled: false,
      permissions: {
        hrv: 'not_determined',
        heartRate: 'not_determined',
        sleep: 'not_determined',
        steps: 'not_determined',
      },
      permissionRequestedAt: null,
      data: initialData,
      syncStatus: 'idle',
      lastSyncAt: null,
      syncError: null,
      autoReadinessEnabled: true,

      checkAvailability: async () => {
        const { available, healthConnectInstalled } = await checkHealthAvailability();
        set({ isAvailable: available, isHealthConnectInstalled: healthConnectInstalled });
      },

      requestPermissions: async () => {
        const permissions = await requestHealthPermissions();
        set({ permissions, permissionRequestedAt: new Date().toISOString() });
        const anyGranted = Object.values(permissions).some(v => v === 'authorized');
        if (anyGranted) {
          await get().syncHealthData();
        }
        return anyGranted;
      },

      syncHealthData: async () => {
        const { permissions, data } = get();
        const anyAuthorized = Object.values(permissions).some(v => v === 'authorized');
        if (!anyAuthorized) return;

        set({ syncStatus: 'syncing', syncError: null });
        try {
          const fetched = await fetchHealthData(permissions);
          const merged: HealthData = { ...data, ...fetched };

          // Apply stale flags
          (Object.keys(STALE_THRESHOLDS_MS) as Array<keyof typeof STALE_THRESHOLDS_MS>).forEach(key => {
            if (merged[key]) {
              (merged[key] as HealthMetric<any>).isStale = isStaleMetric(merged[key] as HealthMetric<any>, key);
            }
          });

          set({ data: merged, syncStatus: 'success', lastSyncAt: new Date().toISOString() });
        } catch (e: any) {
          set({ syncStatus: 'error', syncError: e?.message ?? 'Sync failed' });
        }
      },

      setAutoReadiness: (enabled: boolean) => set({ autoReadinessEnabled: enabled }),

      clearHealthData: () =>
        set({
          data: initialData,
          permissions: {
            hrv: 'not_determined',
            heartRate: 'not_determined',
            sleep: 'not_determined',
            steps: 'not_determined',
          },
          permissionRequestedAt: null,
          lastSyncAt: null,
          syncStatus: 'idle',
          syncError: null,
        }),

      _setMockData: (mockData: Partial<HealthData>) => {
        const { data } = get();
        set({ data: { ...data, ...mockData } });
      },
    }),
    {
      name: 'hoopai_health_store',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        permissions: state.permissions,
        permissionRequestedAt: state.permissionRequestedAt,
        data: state.data,
        lastSyncAt: state.lastSyncAt,
        autoReadinessEnabled: state.autoReadinessEnabled,
      }),
    }
  )
);

// ─── Selectors ────────────────────────────────────────────────────────────────

export function hasAnyHealthData(data: HealthData): boolean {
  return Object.values(data).some(m => m.value !== null);
}

export function hasStaleData(data: HealthData): boolean {
  return Object.values(data).some(m => m.isStale && m.value !== null);
}

export function getHealthReadinessInputs(data: HealthData): {
  hrv?: number;
  restingHeartRate?: number;
  sleepHours?: number;
  sleepScore?: number;
} {
  return {
    hrv: data.hrv.value ?? undefined,
    restingHeartRate: data.restingHeartRate.value ?? undefined,
    sleepHours: data.sleepHours.value ?? undefined,
    sleepScore: data.sleepScore.value ?? undefined,
  };
}
