import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { Button } from '../../components/ui/Button';
import { Text } from '../../components/ui/Text';
import { Colors, Fonts, Spacing, Radius } from '../../constants/theme';
import type { TrainingGoal } from '../../constants/programs';

const GOALS: { value: TrainingGoal; emoji: string; label: string; description: string }[] = [
  { value: 'shooting',      emoji: '🎯', label: 'Shooting',      description: 'Mechanics, range & shooting off movement' },
  { value: 'ball-handling', emoji: '🏀', label: 'Ball-Handling',  description: 'Handles, crossovers & court vision' },
  { value: 'athleticism',   emoji: '⚡', label: 'Athleticism',    description: 'Speed, vertical & explosiveness' },
  { value: 'defense',       emoji: '🛡️', label: 'Defense',        description: 'Positioning, rotations & lockdown' },
  { value: 'overall',       emoji: '🏆', label: 'Overall Game',   description: 'Balanced improvement across all areas' },
];

export default function GoalScreen() {
  const params = useLocalSearchParams<{ name: string; position: string; level: string }>();
  const [selected, setSelected] = useState<TrainingGoal | null>(null);

  const pick = (g: TrainingGoal) => { Haptics.selectionAsync(); setSelected(g); };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safe}>
        <TouchableOpacity onPress={() => router.back()} style={styles.back}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <View style={styles.progressRow}>
          {[1,2,3,4,5,6,7].map(i => (
            <View key={i} style={[styles.dot, i <= 4 && styles.dotActive]} />
          ))}
        </View>
        <View style={styles.header}>
          <Text style={styles.step}>STEP 4 OF 7</Text>
          <Text style={styles.heading}>Primary{'\n'}training goal?</Text>
          <Text style={styles.sub}>We'll front-load your plan with drills that move the needle fastest.</Text>
        </View>
        <ScrollView style={styles.list} contentContainerStyle={{ gap: Spacing.sm }} showsVerticalScrollIndicator={false}>
          {GOALS.map(g => (
            <TouchableOpacity
              key={g.value}
              style={[styles.card, selected === g.value && styles.cardSelected]}
              onPress={() => pick(g.value)}
              activeOpacity={0.8}
            >
              <Text style={styles.emoji}>{g.emoji}</Text>
              <View style={styles.cardText}>
                <Text style={[styles.label, selected === g.value && { color: Colors.accent }]}>{g.label}</Text>
                <Text style={styles.desc}>{g.description}</Text>
              </View>
              {selected === g.value && (
                <View style={styles.check}><Text style={styles.checkText}>✓</Text></View>
              )}
            </TouchableOpacity>
          ))}
        </ScrollView>
        <View style={styles.footer}>
          <Button label="Continue" size="lg" style={styles.btn} disabled={!selected}
            onPress={() => router.push({ pathname: '/onboarding/schedule', params: { ...params, goal: selected! } })} />
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
  header: { gap: Spacing.sm, marginBottom: Spacing.lg },
  step: { fontFamily: Fonts.interSemi, fontSize: 11, color: Colors.accent, letterSpacing: 2 },
  heading: { fontFamily: Fonts.interBold, fontSize: 32, color: Colors.textPrimary, lineHeight: 40 },
  sub: { fontFamily: Fonts.inter, fontSize: 14, color: Colors.textSecondary },
  list: { flex: 1 },
  card: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.md,
    backgroundColor: Colors.surface, borderRadius: Radius.md,
    borderWidth: 1, borderColor: Colors.border, padding: Spacing.md,
  },
  cardSelected: { borderColor: Colors.accent, backgroundColor: Colors.surface2 },
  emoji: { fontSize: 28 },
  cardText: { flex: 1, gap: 3 },
  label: { fontFamily: Fonts.interSemi, fontSize: 16, color: Colors.textPrimary },
  desc: { fontFamily: Fonts.inter, fontSize: 13, color: Colors.textTertiary },
  check: { width: 24, height: 24, borderRadius: 12, backgroundColor: Colors.accent, alignItems: 'center', justifyContent: 'center' },
  checkText: { fontSize: 12, color: '#fff', fontFamily: Fonts.interBold },
  footer: { paddingBottom: Spacing.lg, paddingTop: Spacing.sm },
  btn: { width: '100%' },
});
