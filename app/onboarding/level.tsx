import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { Button } from '../../components/ui/Button';
import { Text } from '../../components/ui/Text';
import { Colors, Fonts, Spacing, Radius } from '../../constants/theme';
import type { SkillLevel } from '../../constants/programs';

const LEVELS: { value: SkillLevel; label: string; description: string; years: string }[] = [
  { value: 'beginner',     label: 'Beginner',     description: 'Just getting started',               years: '0–2 yrs' },
  { value: 'intermediate', label: 'Intermediate',  description: 'Comfortable with fundamentals',      years: '3–6 yrs' },
  { value: 'advanced',     label: 'Advanced',      description: 'Competitive player, strong base',    years: '7–12 yrs' },
  { value: 'elite',        label: 'Elite',         description: 'Varsity / college / pro aspirant',  years: '12+ yrs' },
];

export default function LevelScreen() {
  const params = useLocalSearchParams<{ name: string; position: string }>();
  const [selected, setSelected] = useState<SkillLevel | null>(null);

  const pick = (lvl: SkillLevel) => { Haptics.selectionAsync(); setSelected(lvl); };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safe}>
        <TouchableOpacity onPress={() => router.back()} style={styles.back}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <View style={styles.progressRow}>
          {[1,2,3,4,5,6,7].map(i => (
            <View key={i} style={[styles.dot, i <= 3 && styles.dotActive]} />
          ))}
        </View>
        <View style={styles.header}>
          <Text style={styles.step}>STEP 3 OF 7</Text>
          <Text style={styles.heading}>Your skill{'\n'}level?</Text>
          <Text style={styles.sub}>Be honest — we adapt every drill to where you are today.</Text>
        </View>
        <View style={styles.grid}>
          {LEVELS.map(l => (
            <TouchableOpacity
              key={l.value}
              style={[styles.card, selected === l.value && styles.cardSelected]}
              onPress={() => pick(l.value)}
              activeOpacity={0.8}
            >
              <Text style={[styles.label, selected === l.value && { color: Colors.accent }]}>{l.label}</Text>
              <Text style={styles.years}>{l.years}</Text>
              <Text style={styles.desc}>{l.description}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <View style={{ flex: 1 }} />
        <View style={styles.footer}>
          <Button label="Continue" size="lg" style={styles.btn} disabled={!selected}
            onPress={() => router.push({ pathname: '/onboarding/goal', params: { ...params, level: selected! } })} />
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
  sub: { fontFamily: Fonts.inter, fontSize: 15, color: Colors.textSecondary },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  card: {
    width: '47%',
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.md,
    gap: 6,
  },
  cardSelected: { borderColor: Colors.accent, backgroundColor: Colors.surface2 },
  label: { fontFamily: Fonts.interBold, fontSize: 18, color: Colors.textPrimary },
  years: { fontFamily: Fonts.interSemi, fontSize: 11, color: Colors.accent, letterSpacing: 1 },
  desc: { fontFamily: Fonts.inter, fontSize: 12, color: Colors.textTertiary, lineHeight: 16 },
  footer: { paddingBottom: Spacing.lg },
  btn: { width: '100%' },
});
