import React, { useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Share,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { TrophyBurst } from '../../components/session/completion/TrophyBurst';
import { SessionStatsGrid } from '../../components/session/completion/SessionStatsGrid';
import { XPCounter } from '../../components/session/completion/XPCounter';
import { StreakModule } from '../../components/session/completion/StreakModule';
import { useSessionExecutionStore } from '../../stores/sessionExecutionStore';

/**
 * Completion screen shown after a session finishes (full or partial).
 * Displays trophy burst, XP award, stats, and streak.
 */
export default function CompletionScreen() {
  const router = useRouter();
  const store = useSessionExecutionStore();

  const {
    drills,
    drillResults,
    elapsedSeconds,
    completionPercentage,
    sessionPlan,
  } = store;

  const targetXP: number = sessionPlan?.targetXP ?? 100;
  const totalXPAwarded = Math.floor(targetXP * completionPercentage);
  const streakDays: number = sessionPlan?.currentStreakDays ?? 1;

  const completedDrills = drillResults.filter(
    (r, i) => !r.skipped && r.completedSets >= (drills[i]?.totalSets ?? 1)
  ).length;

  const totalSets = drills.reduce((acc, d) => acc + d.totalSets, 0);
  const completedSets = drillResults.reduce((acc, r) => acc + r.completedSets, 0);

  const isPartial = completionPercentage < 1;

  const handleShare = async () => {
    const pct = Math.round(completionPercentage * 100);
    try {
      await Share.share({
        message: `Just crushed a ${pct}% basketball session on HoopAI! +${totalXPAwarded} XP 🏀🔥`,
      });
    } catch (_) {}
  };

  const handleHome = () => {
    store.reset();
    router.replace('/');
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor="#0A0A0F" />
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {/* Title */}
          <Text style={styles.title}>
            {isPartial ? 'SESSION\nCOMPLETE' : 'SESSION\nCOMPLETE'}
          </Text>
          {isPartial && (
            <Text style={styles.partialNote}>
              {Math.round(completionPercentage * 100)}% completed
            </Text>
          )}

          {/* Trophy burst animation */}
          <View style={styles.trophyWrap}>
            <TrophyBurst />
          </View>

          {/* XP counter */}
          <XPCounter targetXP={totalXPAwarded} delayMs={600} />

          {/* Stats */}
          <SessionStatsGrid
            elapsedSeconds={elapsedSeconds}
            totalDrills={drills.length}
            completedDrills={completedDrills}
            totalSets={totalSets}
            completedSets={completedSets}
          />

          {/* Streak */}
          <StreakModule streakDays={streakDays} delayMs={1000} />

          {/* Actions */}
          <View style={styles.actions}>
            <TouchableOpacity
              style={styles.shareBtn}
              onPress={handleShare}
              accessibilityRole="button"
              accessibilityLabel="Share session result"
            >
              <Text style={styles.shareBtnText}>Share Result</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.homeBtn}
              onPress={handleHome}
              accessibilityRole="button"
              accessibilityLabel="Back to home"
            >
              <Text style={styles.homeBtnText}>Back to Home</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0A0A0F' },
  safe: { flex: 1 },
  content: {
    alignItems: 'center',
    gap: 28,
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 48,
  },
  title: {
    fontFamily: 'Anton',
    fontSize: 42,
    color: '#FFFFFF',
    letterSpacing: 3,
    textAlign: 'center',
    lineHeight: 46,
  },
  partialNote: {
    fontFamily: 'Inter',
    fontSize: 14,
    color: '#FFB547',
    fontWeight: '600',
    letterSpacing: 0.5,
    marginTop: -16,
  },
  trophyWrap: { marginVertical: 8 },
  actions: { width: '100%', gap: 12, marginTop: 8 },
  shareBtn: {
    borderWidth: 1,
    borderColor: '#FF6B2C',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
  },
  shareBtnText: {
    fontFamily: 'Inter',
    fontSize: 15,
    color: '#FF6B2C',
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  homeBtn: {
    backgroundColor: '#FF6B2C',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
  },
  homeBtnText: {
    fontFamily: 'Anton',
    fontSize: 18,
    color: '#FFFFFF',
    letterSpacing: 2,
  },
});
