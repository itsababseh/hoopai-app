import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { Button } from '../../components/ui/Button';
import { Text } from '../../components/ui/Text';
import { Colors, Fonts, Spacing, Radius } from '../../constants/theme';

const DAYS_OPTIONS = [2, 3, 4, 5, 6];
const DURATION_OPTIONS = [20, 30, 45, 60, 90];

export default function ScheduleScreen() {
  const params = useLocalSearchParams<{ name: string; position: string; level: string; goal: string }>();
  const [days, setDays] = useState<number | null>(null);
  const [duration, setDuration] = useState<number | null>(null);

  const pick = (type: 'days' | 'dur', val: number) => {
    Haptics.selectionAsync();
    if (type === 'days') setDays(val);
    else setDuration(val);
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safe}>
        <TouchableOpacity onPress={() => router.back()} style={styles.back}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <View style={styles.progressRow}>
          {[1,2,3,4,5,6,7].map(i => (
            <View key={i} style={[styles.dot, i <= 5 && styles.dotActive]} />
          ))}
        </View>
        <View style={styles.header}>
          <Text style={styles.step}>STEP 5 OF 7</Text>
          <Text style={styles.heading}>Training{'\n'}schedule</Text>
          <Text style={styles.sub}>We'll build your plan around your life — not the other way around.</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>DAYS PER WEEK</Text>
          <View style={styles.chips}>
            {DAYS_OPTIONS.map(d => (
              <TouchableOpacity key={d} style={[styles.chip, days === d && styles.chipActive]} onPress={() => pick('days', d)}>
                <Text style={[styles.chipText, days === d && styles.chipTextActive]}>{d}x</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>SESSION LENGTH</Text>
          <View style={styles.chips}>
            {DURATION_OPTIONS.map(d => (
              <TouchableOpacity key={d} style={[styles.chip, duration === d && styles.chipActive]} onPress={() => pick('dur', d)}>
                <Text style={[styles.chipText, duration === d && styles.chipTextActive]}>{d}m</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {days && duration && (
          <View style={styles.summary}>
            <Text style={styles.summaryText}>
              That's <Text style={{ color: Colors.accent }}>{days * duration} min/week</Text> — enough to see real improvement in 4–6 weeks.
            </Text>
          </View>
        )}

        <View style={{ flex: 1 }} />
        <View style={styles.footer}>
          <Button label="Continue" size="lg" style={styles.btn} disabled={!days || !duration}
            onPress={() => router.push({ pathname: '/onboarding/health', params: { ...params, days: String(days), duration: String(duration) } })} />
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  safe: { flex: 1, paddingHorizontal: Spacing.lg },
  back: { paddingVertical: Spacing.md },
  backText: { fontFamily: Fonts.interSemi, fontSize: 15, color: Colors.textSecondary },
  progressRow: { flexDirection: 'row', gap: 6, marginBottom: Spacing.lg },
  dot: { flex: 1, height: 3, borderRadius: 2, backgroundColor: Colors.border },
  dotActive: { backgroundColor: Colors.accent },
  header: { gap: Spacing.sm, marginBottom: Spacing.xl },
  step: { fontFamily: Fonts.interSemi, fontSize: 11, color: Colors.accent, letterSpacing: 2 },
  heading: { fontFamily: Fonts.interBold, fontSize: 32, color: Colors.textPrimary, lineHeight: 40 },
  sub: { fontFamily: Fonts.inter, fontSize: 15, color: Colors.textSecondary },
  section: { marginBottom: Spacing.xl, gap: Spacing.sm },
  sectionLabel: { fontFamily: Fonts.interSemi, fontSize: 11, color: Colors.textTertiary, letterSpacing: 1.5 },
  chips: { flexDirection: 'row', gap: Spacing.sm },
  chip: {
    flex: 1, height: 48, borderRadius: Radius.md,
    backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border,
    alignItems: 'center', justifyContent: 'center',
  },
  chipActive: { backgroundColor: Colors.accent + '20', borderColor: Colors.accent },
  chipText: { fontFamily: Fonts.interSemi, fontSize: 15, color: Colors.textSecondary },
  chipTextActive: { color: Colors.accent },
  summary: {
    backgroundColor: Colors.surface2, borderRadius: Radius.md, padding: Spacing.md,
    borderWidth: 1, borderColor: Colors.border,
  },
  summaryText: { fontFamily: Fonts.inter, fontSize: 14, color: Colors.textSecondary, lineHeight: 20 },
  footer: { paddingBottom: Spacing.lg },
  btn: { width: '100%' },
});
