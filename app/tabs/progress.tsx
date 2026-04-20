import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text } from '../../components/ui/Text';
import { Card } from '../../components/ui/Card';
import { ProgressRing } from '../../components/ui/ProgressRing';
import { useSessionStore } from '../../stores/sessionStore';
import { useUserStore } from '../../stores/userStore';
import { Colors, Fonts, Spacing, Radius } from '../../constants/theme';

export default function ProgressScreen() {
  const { currentStreak, totalSessions, sessionHistory } = useSessionStore();
  const profile = useUserStore(s => s.profile);

  const last7 = sessionHistory.slice(-7);
  const avgRating = last7.length
    ? Math.round((last7.reduce((sum, s) => sum + s.ratingOutOf5, 0) / last7.length) * 10) / 10
    : 0;

  return (
    <View style={styles.container}>
      <SafeAreaView edges={['top']} style={styles.safe}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <Text style={styles.title}>Progress</Text>
          <Text style={styles.subtitle}>Track your journey</Text>

          {/* Overview ring */}
          <View style={styles.ringBlock}>
            <ProgressRing
              score={Math.min(totalSessions * 5, 100)}
              size={140}
              strokeWidth={10}
              color={Colors.accent}
              label="PROGRESS"
            />
            <View style={styles.ringStats}>
              {[
                { label: 'Streak',   value: `${currentStreak}d` },
                { label: 'Sessions', value: `${totalSessions}` },
                { label: 'Rating',   value: avgRating ? `${avgRating}/5` : '—' },
              ].map(s => (
                <View key={s.label} style={styles.ringStat}>
                  <Text style={styles.ringStatVal}>{s.value}</Text>
                  <Text style={styles.ringStatLbl}>{s.label}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Empty state */}
          {totalSessions === 0 && (
            <Card style={styles.emptyCard}>
              <Text style={styles.emptyEmoji}>🏀</Text>
              <Text style={styles.emptyTitle}>No sessions yet</Text>
              <Text style={styles.emptySub}>Complete your first drill to start tracking progress.</Text>
            </Card>
          )}

          {/* Recent sessions */}
          {sessionHistory.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Recent Sessions</Text>
              {sessionHistory.slice(-5).reverse().map(s => (
                <Card key={s.id} style={styles.sessionCard}>
                  <View style={styles.sessionRow}>
                    <View>
                      <Text style={styles.sessionDrill}>{s.drillId.replace('drill-', 'Drill #')}</Text>
                      <Text style={styles.sessionDate}>{new Date(s.date).toLocaleDateString()}</Text>
                    </View>
                    <View style={styles.sessionRight}>
                      <Text style={styles.sessionDuration}>{s.durationMinutes}m</Text>
                      <Text style={styles.sessionRating}>{'★'.repeat(s.ratingOutOf5)}</Text>
                    </View>
                  </View>
                </Card>
              ))}
            </View>
          )}

          <View style={{ height: 100 }} />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  safe: { flex: 1 },
  content: { paddingHorizontal: Spacing.lg, gap: Spacing.lg, paddingTop: Spacing.md },
  title: { fontFamily: Fonts.interBold, fontSize: 28, color: Colors.textPrimary },
  subtitle: { fontFamily: Fonts.inter, fontSize: 13, color: Colors.textTertiary, marginTop: -8 },
  ringBlock: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xl, backgroundColor: Colors.surface, borderRadius: Radius.lg, padding: Spacing.lg, borderWidth: 1, borderColor: Colors.border },
  ringStats: { flex: 1, gap: Spacing.lg },
  ringStat: { gap: 2 },
  ringStatVal: { fontFamily: Fonts.interBold, fontSize: 22, color: Colors.textPrimary },
  ringStatLbl: { fontFamily: Fonts.interSemi, fontSize: 11, color: Colors.textTertiary, letterSpacing: 1 },
  emptyCard: { alignItems: 'center', gap: Spacing.sm, paddingVertical: Spacing.xl },
  emptyEmoji: { fontSize: 48 },
  emptyTitle: { fontFamily: Fonts.interBold, fontSize: 18, color: Colors.textPrimary },
  emptySub: { fontFamily: Fonts.inter, fontSize: 14, color: Colors.textSecondary, textAlign: 'center' },
  section: { gap: Spacing.sm },
  sectionTitle: { fontFamily: Fonts.interBold, fontSize: 18, color: Colors.textPrimary },
  sessionCard: { marginBottom: 0 },
  sessionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sessionDrill: { fontFamily: Fonts.interSemi, fontSize: 14, color: Colors.textPrimary },
  sessionDate: { fontFamily: Fonts.inter, fontSize: 12, color: Colors.textTertiary },
  sessionRight: { alignItems: 'flex-end', gap: 3 },
  sessionDuration: { fontFamily: Fonts.interSemi, fontSize: 13, color: Colors.textSecondary },
  sessionRating: { fontSize: 12, color: Colors.warning },
});
