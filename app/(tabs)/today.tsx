import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  StyleSheet,
  Platform,
} from 'react-native';
import Animated, {
  FadeIn,
  FadeInDown,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import BottomSheet, { BottomSheetBackdrop } from '@gorhom/bottom-sheet';

import { Text } from '../../components/ui/Text';
import { Button } from '../../components/ui/Button';
import { AISessionCard } from '../../components/session/AISessionCard';
import { AIInsightsWidget } from '../../components/today/AIInsightsWidget';
import { CheckInSheet } from '../../components/today/CheckInSheet';
import { ReadinessCard } from '../../components/today/ReadinessCard';
import { HealthMetricRow } from '../../components/health/HealthMetricChip';
import { SleepCard } from '../../components/health/SleepCard';
import { StaleDataBanner } from '../../components/health/StaleDataBanner';
import { HealthPermissionModal } from '../../components/health/HealthPermissionModal';

import { useSessionStore } from '../../stores/sessionStore';
import { useUserStore } from '../../stores/userStore';
import { useHealthStore, hasAnyHealthData, hasStaleData } from '../../stores/healthStore';
import { useActiveSessionStore } from '../../stores/activeSessionStore';
import { computeReadiness } from '../../utils/readiness';

// ─── Greeting ─────────────────────────────────────────────────────────────────

function greeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

function formatDate(): string {
  return new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
}

// ─── Health Connect Prompt (Android only) ────────────────────────────────────

function HealthConnectPrompt({ onPress }: { onPress: () => void }) {
  if (Platform.OS !== 'android') return null;
  return (
    <Animated.View entering={FadeInDown.duration(350)} style={styles.hcPrompt}>
      <Text style={{ fontSize: 20 }}>🏃</Text>
      <View style={{ flex: 1 }}>
        <Text variant="label" style={{ color: '#FFFFFF', marginBottom: 2 }}>
          Connect Health Connect
        </Text>
        <Text variant="caption" style={{ color: '#6B7280' }}>
          Get AI-powered readiness from your wearable
        </Text>
      </View>
      <TouchableOpacity onPress={onPress} style={styles.hcPromptBtn}>
        <Text variant="caption" style={{ color: '#FF6B2C' }}>Connect</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

// ─── No check-in state ────────────────────────────────────────────────────────

function NoCheckInBanner({ onCheckIn }: { onCheckIn: () => void }) {
  return (
    <Animated.View entering={FadeInDown.duration(400)} style={styles.noCheckIn}>
      <LinearGradient
        colors={['rgba(255,107,44,0.12)', 'rgba(255,107,44,0.04)']}
        style={styles.noCheckInGradient}
      >
        <Text style={styles.noCheckInIcon}>📋</Text>
        <Text variant="heading" style={styles.noCheckInTitle}>Daily Check-in</Text>
        <Text variant="body" style={styles.noCheckInBody}>
          Rate how you feel today so HoopAI can set the perfect session intensity.
        </Text>
        <Button variant="primary" size="lg" onPress={onCheckIn} style={{ width: '100%', marginTop: 8 }}>
          Start Check-in
        </Button>
      </LinearGradient>
    </Animated.View>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function TodayScreen() {
  const { profile } = useUserStore();
  const { todayCheckIn, streak } = useSessionStore();
  const {
    data: healthData,
    isAvailable: healthAvailable,
    permissions,
    autoReadinessEnabled,
    syncHealthData,
    syncStatus,
  } = useHealthStore();
  const { generateSession, sessionState, activeSession } = useActiveSessionStore();

  const bottomSheetRef = useRef<BottomSheet>(null);
  const [healthModalVisible, setHealthModalVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const isConnected = Object.values(permissions).some(v => v === 'authorized');
  const showHealthPrompt = healthAvailable && !isConnected;
  const hasHealth = hasAnyHealthData(healthData);
  const hasStale = hasStaleData(healthData);

  // ── Compute readiness ───────────────────────────────────────────────────────
  const readinessResult = todayCheckIn
    ? computeReadiness({
        energy: todayCheckIn.energy,
        soreness: todayCheckIn.soreness,
        sleepRating: todayCheckIn.sleep,
        hrv: autoReadinessEnabled ? healthData.hrv.value ?? undefined : undefined,
        restingHeartRate: autoReadinessEnabled ? healthData.restingHeartRate.value ?? undefined : undefined,
        sleepHours: autoReadinessEnabled ? healthData.sleepHours.value ?? undefined : undefined,
        sleepScore: autoReadinessEnabled ? healthData.sleepScore.value ?? undefined : undefined,
      })
    : null;

  const readinessScore = readinessResult?.score ?? 0;

  // ── Auto-generate session after check-in ───────────────────────────────────
  useEffect(() => {
    if (todayCheckIn && !activeSession && sessionState === 'idle') {
      generateSession({
        energy: todayCheckIn.energy,
        soreness: todayCheckIn.soreness,
        sleep: todayCheckIn.sleep,
        hrv: autoReadinessEnabled ? healthData.hrv.value ?? undefined : undefined,
        goal: profile?.goal,
      });
    }
  }, [todayCheckIn?.date]);

  // ── Sync health data on mount ──────────────────────────────────────────────
  useEffect(() => {
    if (isConnected) {
      syncHealthData();
    }
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    if (isConnected) await syncHealthData();
    setRefreshing(false);
  }, [isConnected]);

  const openCheckIn = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    bottomSheetRef.current?.expand();
  };

  const onCheckInComplete = (checkIn: { energy: number; soreness: number; sleep: number }) => {
    bottomSheetRef.current?.close();
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#FF6B2C"
          />
        }
      >
        {/* Header */}
        <Animated.View entering={FadeIn.duration(400)} style={styles.header}>
          <View>
            <Text variant="caption" style={styles.greetingLabel}>{greeting()}</Text>
            <Text variant="heading" style={styles.greetingName}>
              {profile?.name?.split(' ')[0] ?? 'Baller'} 👋
            </Text>
            <Text variant="caption" style={styles.dateLabel}>{formatDate()}</Text>
          </View>
          <View style={styles.streakBadge}>
            <Text style={styles.streakFire}>🔥</Text>
            <Text variant="label" style={styles.streakCount}>{streak}</Text>
          </View>
        </Animated.View>

        {/* Health Connect prompt (Android) */}
        {showHealthPrompt && (
          <HealthConnectPrompt onPress={() => setHealthModalVisible(true)} />
        )}

        {/* Stale data banner */}
        {hasStale && <StaleDataBanner />}

        {/* No check-in — show banner */}
        {!todayCheckIn ? (
          <NoCheckInBanner onCheckIn={openCheckIn} />
        ) : (
          <>
            {/* Readiness Card */}
            <Animated.View entering={FadeInDown.delay(50).duration(400)}>
              <ReadinessCard
                score={readinessScore}
                onOpenCheckIn={openCheckIn}
              />
            </Animated.View>

            {/* Health metrics row — only if connected */}
            {hasHealth && (
              <Animated.View entering={FadeInDown.delay(100).duration(400)} style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Text variant="label" style={styles.sectionTitle}>Health Data</Text>
                  {syncStatus === 'syncing' && (
                    <Text variant="caption" style={{ color: '#FF6B2C' }}>Syncing…</Text>
                  )}
                </View>
                <HealthMetricRow data={healthData} />
              </Animated.View>
            )}

            {/* Sleep Card — only if we have sleep data */}
            {(healthData.sleepHours.value !== null || healthData.sleepScore.value !== null) && (
              <Animated.View entering={FadeInDown.delay(150).duration(400)} style={styles.section}>
                <SleepCard
                  sleepHours={healthData.sleepHours}
                  sleepScore={healthData.sleepScore}
                />
              </Animated.View>
            )}

            {/* AI Session Card */}
            <Animated.View entering={FadeInDown.delay(200).duration(400)} style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text variant="label" style={styles.sectionTitle}>Today's Session</Text>
              </View>
              <AISessionCard
                state={sessionState}
                session={activeSession}
                onStart={() => router.push('/session/active')}
                onRegenerate={() =>
                  generateSession({
                    energy: todayCheckIn.energy,
                    soreness: todayCheckIn.soreness,
                    sleep: todayCheckIn.sleep,
                    hrv: autoReadinessEnabled ? healthData.hrv.value ?? undefined : undefined,
                    goal: profile?.goal,
                  })
                }
              />
            </Animated.View>

            {/* AI Insights Widget */}
            <Animated.View entering={FadeInDown.delay(250).duration(400)} style={styles.section}>
              <AIInsightsWidget
                readiness={readinessScore}
                checkIn={todayCheckIn}
                healthMode={readinessResult?.mode}
              />
            </Animated.View>
          </>
        )}

        {/* Connect Health (iOS) — subtle prompt at bottom if not connected */}
        {Platform.OS === 'ios' && !isConnected && !showHealthPrompt && (
          <Animated.View entering={FadeInDown.delay(300).duration(400)} style={styles.iosHealthPrompt}>
            <TouchableOpacity
              onPress={() => setHealthModalVisible(true)}
              style={styles.iosHealthBtn}
            >
              <Text style={{ fontSize: 16 }}>❤️</Text>
              <Text variant="caption" style={{ color: '#6B7280', flex: 1 }}>
                Connect Apple Health for smarter readiness
              </Text>
              <Text variant="caption" style={{ color: '#FF6B2C' }}>Connect →</Text>
            </TouchableOpacity>
          </Animated.View>
        )}

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Check-in BottomSheet */}
      <BottomSheet
        ref={bottomSheetRef}
        index={-1}
        snapPoints={['75%', '92%']}
        enablePanDownToClose
        backgroundStyle={styles.sheetBg}
        handleIndicatorStyle={styles.sheetHandle}
        backdropComponent={(props) => (
          <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} opacity={0.7} />
        )}
      >
        <CheckInSheet onComplete={onCheckInComplete} />
      </BottomSheet>

      {/* Health Permission Modal */}
      <HealthPermissionModal
        visible={healthModalVisible}
        onDismiss={() => setHealthModalVisible(false)}
        onGranted={() => {
          setHealthModalVisible(false);
        }}
        source="upgrade"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0A0F' },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingTop: 60 },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  greetingLabel: { color: '#6B7280', marginBottom: 2 },
  greetingName: { color: '#FFFFFF', marginBottom: 2 },
  dateLabel: { color: '#4B5563' },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,107,44,0.12)',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    gap: 4,
  },
  streakFire: { fontSize: 16 },
  streakCount: { color: '#FF6B2C' },

  hcPrompt: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#141420',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,107,44,0.2)',
    padding: 14,
    gap: 12,
    marginBottom: 16,
  },
  hcPromptBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: 'rgba(255,107,44,0.12)',
    borderRadius: 8,
  },

  noCheckIn: { marginBottom: 16 },
  noCheckInGradient: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,107,44,0.2)',
    padding: 24,
    alignItems: 'center',
  },
  noCheckInIcon: { fontSize: 40, marginBottom: 12 },
  noCheckInTitle: { color: '#FFFFFF', marginBottom: 8, textAlign: 'center' },
  noCheckInBody: { color: '#9CA3AF', textAlign: 'center', lineHeight: 22, marginBottom: 8 },

  section: { marginBottom: 16 },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionTitle: { color: '#6B7280', fontSize: 11, letterSpacing: 1 },

  iosHealthPrompt: { marginTop: 8, marginBottom: 16 },
  iosHealthBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#141420',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    padding: 14,
  },

  sheetBg: { backgroundColor: '#141420' },
  sheetHandle: { backgroundColor: '#374151' },
});
