import React, { useRef, useCallback, useMemo } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import BottomSheet, { BottomSheetBackdrop } from '@gorhom/bottom-sheet';
import { LinearGradient } from 'expo-linear-gradient';
import { Text } from '../../components/ui/Text';
import { Card, PressableCard } from '../../components/ui/Card';
import { ProgressRing } from '../../components/ui/ProgressRing';
import { Badge } from '../../components/ui/Badge';
import { CheckInSheet } from '../../components/today/CheckInSheet';
import { useUserStore } from '../../stores/userStore';
import { useSessionStore } from '../../stores/sessionStore';
import { Colors, Fonts, Spacing, Radius } from '../../constants/theme';
import { DRILLS } from '../../constants/drills';
import { router } from 'expo-router';

function greeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

function todayDate(): string {
  return new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
}

export default function TodayScreen() {
  const profile      = useUserStore(s => s.profile);
  const { todayCheckIn, currentStreak, totalSessions } = useSessionStore();
  const sheetRef     = useRef<BottomSheet>(null);
  const snapPoints   = useMemo(() => ['75%', '92%'], []);

  const openSheet = useCallback(() => sheetRef.current?.expand(), []);
  const closeSheet = useCallback(() => sheetRef.current?.close(), []);

  const readiness    = todayCheckIn?.readiness;
  const score        = readiness?.score ?? 0;
  const hasCheckedIn = !!todayCheckIn;

  // Recommend first 3 drills based on goal
  const recommendedDrills = DRILLS.filter(d =>
    profile?.primaryGoal === 'overall' ? true : d.category === profile?.primaryGoal
  ).slice(0, 3);

  const renderBackdrop = useCallback(
    (props: any) => <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} />,
    []
  );

  return (
    <View style={styles.container}>
      <SafeAreaView edges={['top']} style={styles.safe}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>{greeting()},</Text>
            <Text style={styles.name}>{profile?.name ?? 'Baller'}</Text>
          </View>
          <TouchableOpacity style={styles.avatarBtn}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{(profile?.name ?? 'B')[0].toUpperCase()}</Text>
            </View>
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Date */}
          <Text style={styles.date}>{todayDate()}</Text>

          {/* Readiness Card */}
          <TouchableOpacity onPress={openSheet} activeOpacity={0.85}>
            <LinearGradient
              colors={hasCheckedIn ? ['#1A1A2E', Colors.surface] : [Colors.surface2, Colors.surface]}
              style={styles.readinessCard}
            >
              <View style={styles.readinessLeft}>
                <Text style={styles.readinessLabel}>READINESS</Text>
                {hasCheckedIn ? (
                  <>
                    <Text style={[styles.readinessScore, { color: readiness!.color }]}>
                      {readiness!.label}
                    </Text>
                    <Text style={styles.readinessExplanation} numberOfLines={2}>
                      {readiness!.explanation}
                    </Text>
                  </>
                ) : (
                  <>
                    <Text style={styles.readinessPrompt}>Check in to see{'\n'}your score</Text>
                    <View style={styles.checkInBtn}>
                      <Text style={styles.checkInBtnText}>Log Check-In →</Text>
                    </View>
                  </>
                )}
              </View>
              <ProgressRing
                score={score}
                size={100}
                strokeWidth={7}
                color={readiness?.color ?? Colors.textTertiary}
                label={hasCheckedIn ? 'SCORE' : '—'}
              />
            </LinearGradient>
          </TouchableOpacity>

          {/* Stats Row */}
          <View style={styles.statsRow}>
            {[
              { label: 'STREAK', value: `${currentStreak}`, unit: 'days' },
              { label: 'SESSIONS', value: `${totalSessions}`, unit: 'total' },
              { label: 'LEVEL', value: profile?.skillLevel?.toUpperCase() ?? '—', unit: '' },
            ].map(s => (
              <Card key={s.label} style={styles.statCard}>
                <Text style={styles.statLabel}>{s.label}</Text>
                <Text style={styles.statValue}>{s.value}</Text>
                {s.unit ? <Text style={styles.statUnit}>{s.unit}</Text> : null}
              </Card>
            ))}
          </View>

          {/* Today's Session */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Today's Session</Text>
            <TouchableOpacity onPress={() => router.push('/(tabs)/train')}>
              <Text style={styles.sectionAction}>See all →</Text>
            </TouchableOpacity>
          </View>

          {recommendedDrills.map(drill => (
            <PressableCard
              key={drill.id}
              style={styles.drillCard}
              onPress={() => router.push({ pathname: '/drill/[id]', params: { id: drill.id } })}
            >
              <View style={styles.drillRow}>
                <View style={styles.drillThumb}>
                  <Text style={styles.drillThumbText}>▶</Text>
                </View>
                <View style={styles.drillInfo}>
                  <Text style={styles.drillTitle}>{drill.title}</Text>
                  <Text style={styles.drillMeta}>{drill.durationMinutes} min · {drill.sets} sets · {drill.reps}</Text>
                  <View style={styles.drillBadges}>
                    <Badge label={drill.category} variant="accent" />
                    <Badge label={drill.difficulty} variant="neutral" />
                  </View>
                </View>
              </View>
            </PressableCard>
          ))}

          {/* Bottom padding for tab bar */}
          <View style={{ height: 100 }} />
        </ScrollView>
      </SafeAreaView>

      {/* Check-In Bottom Sheet */}
      <BottomSheet
        ref={sheetRef}
        index={-1}
        snapPoints={snapPoints}
        enablePanDownToClose
        backdropComponent={renderBackdrop}
        backgroundStyle={styles.sheetBg}
        handleIndicatorStyle={styles.sheetHandle}
      >
        <CheckInSheet onClose={closeSheet} existingData={todayCheckIn} />
      </BottomSheet>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  safe: { flex: 1 },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md,
  },
  greeting: { fontFamily: Fonts.inter, fontSize: 14, color: Colors.textSecondary },
  name: { fontFamily: Fonts.interBold, fontSize: 22, color: Colors.textPrimary },
  avatarBtn: {},
  avatar: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: Colors.accent + '30',
    borderWidth: 1, borderColor: Colors.accent + '60',
    alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { fontFamily: Fonts.interBold, fontSize: 16, color: Colors.accent },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: Spacing.lg, gap: Spacing.md },
  date: { fontFamily: Fonts.inter, fontSize: 13, color: Colors.textTertiary, marginBottom: -4 },
  // Readiness card
  readinessCard: {
    borderRadius: Radius.lg, padding: Spacing.lg,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    borderWidth: 1, borderColor: Colors.border,
  },
  readinessLeft: { flex: 1, gap: 6, paddingRight: Spacing.md },
  readinessLabel: { fontFamily: Fonts.interSemi, fontSize: 11, color: Colors.textTertiary, letterSpacing: 1.5 },
  readinessScore: { fontFamily: Fonts.interBold, fontSize: 28 },
  readinessExplanation: { fontFamily: Fonts.inter, fontSize: 13, color: Colors.textSecondary, lineHeight: 18 },
  readinessPrompt: { fontFamily: Fonts.interBold, fontSize: 20, color: Colors.textPrimary, lineHeight: 26 },
  checkInBtn: { alignSelf: 'flex-start', backgroundColor: Colors.accent + '20', borderRadius: Radius.full, paddingHorizontal: 12, paddingVertical: 6 },
  checkInBtnText: { fontFamily: Fonts.interSemi, fontSize: 13, color: Colors.accent },
  // Stats
  statsRow: { flexDirection: 'row', gap: Spacing.sm },
  statCard: { flex: 1, alignItems: 'center', gap: 2, paddingVertical: Spacing.md },
  statLabel: { fontFamily: Fonts.interSemi, fontSize: 9, color: Colors.textTertiary, letterSpacing: 1.2 },
  statValue: { fontFamily: Fonts.interBold, fontSize: 20, color: Colors.textPrimary },
  statUnit: { fontFamily: Fonts.inter, fontSize: 11, color: Colors.textTertiary },
  // Section
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sectionTitle: { fontFamily: Fonts.interBold, fontSize: 18, color: Colors.textPrimary },
  sectionAction: { fontFamily: Fonts.interSemi, fontSize: 13, color: Colors.accent },
  // Drill card
  drillCard: { marginBottom: 0 },
  drillRow: { flexDirection: 'row', gap: Spacing.md, alignItems: 'center' },
  drillThumb: {
    width: 56, height: 56, borderRadius: Radius.sm,
    backgroundColor: Colors.surface2, alignItems: 'center', justifyContent: 'center',
  },
  drillThumbText: { fontSize: 20, color: Colors.accent },
  drillInfo: { flex: 1, gap: 4 },
  drillTitle: { fontFamily: Fonts.interSemi, fontSize: 15, color: Colors.textPrimary },
  drillMeta: { fontFamily: Fonts.inter, fontSize: 12, color: Colors.textTertiary },
  drillBadges: { flexDirection: 'row', gap: 6, marginTop: 2 },
  // Sheet
  sheetBg: { backgroundColor: Colors.surface },
  sheetHandle: { backgroundColor: Colors.border, width: 40 },
});
