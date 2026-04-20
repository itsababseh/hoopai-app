import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { Button } from '../../components/ui/Button';
import { Text } from '../../components/ui/Text';
import { Colors, Fonts, Spacing, Radius } from '../../constants/theme';
import type { Position } from '../../constants/programs';

const POSITIONS: { value: Position; label: string; description: string }[] = [
  { value: 'PG', label: 'Point Guard', description: 'Floor general, handles & vision' },
  { value: 'SG', label: 'Shooting Guard', description: 'Scoring, off-ball movement' },
  { value: 'SF', label: 'Small Forward', description: 'Versatile two-way player' },
  { value: 'PF', label: 'Power Forward', description: 'Physical, interior & stretch' },
  { value: 'C',  label: 'Center',        description: 'Rim protection, post presence' },
];

export default function PositionScreen() {
  const params = useLocalSearchParams<{ name: string }>();
  const [selected, setSelected] = useState<Position | null>(null);

  const pick = (pos: Position) => {
    Haptics.selectionAsync();
    setSelected(pos);
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safe}>
        <TouchableOpacity onPress={() => router.back()} style={styles.back}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <View style={styles.progressRow}>
          {[1, 2, 3, 4, 5, 6, 7].map((i) => (
            <View key={i} style={[styles.dot, i <= 2 && styles.dotActive]} />
          ))}
        </View>
        <View style={styles.header}>
          <Text style={styles.step}>STEP 2 OF 7</Text>
          <Text style={styles.heading}>What's your{'\n'}position?</Text>
          <Text style={styles.sub}>
            Hey {params.name || 'there'} — your drills will be tailored to your role.
          </Text>
        </View>
        <ScrollView style={styles.list} contentContainerStyle={styles.listContent} showsVerticalScrollIndicator={false}>
          {POSITIONS.map((p) => (
            <TouchableOpacity
              key={p.value}
              style={[styles.card, selected === p.value && styles.cardSelected]}
              onPress={() => pick(p.value)}
              activeOpacity={0.8}
            >
              <View style={styles.cardLeft}>
                <Text style={[styles.pos, selected === p.value && { color: Colors.accent }]}>
                  {p.value}
                </Text>
              </View>
              <View style={styles.cardRight}>
                <Text style={[styles.posLabel, selected === p.value && { color: Colors.textPrimary }]}>
                  {p.label}
                </Text>
                <Text style={styles.posDesc}>{p.description}</Text>
              </View>
              {selected === p.value && <View style={styles.check}><Text style={styles.checkText}>✓</Text></View>}
            </TouchableOpacity>
          ))}
        </ScrollView>
        <View style={styles.footer}>
          <Button
            label="Continue"
            size="lg"
            style={styles.btn}
            disabled={!selected}
            onPress={() =>
              router.push({
                pathname: '/onboarding/level',
                params: { ...params, position: selected! },
              })
            }
          />
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
  list: { flex: 1 },
  listContent: { gap: Spacing.sm, paddingBottom: Spacing.md },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.md,
    gap: Spacing.md,
  },
  cardSelected: { borderColor: Colors.accent, backgroundColor: Colors.surface2 },
  cardLeft: {
    width: 48,
    height: 48,
    borderRadius: Radius.sm,
    backgroundColor: Colors.surface2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pos: { fontFamily: Fonts.interBold, fontSize: 15, color: Colors.textSecondary },
  cardRight: { flex: 1, gap: 2 },
  posLabel: { fontFamily: Fonts.interSemi, fontSize: 16, color: Colors.textSecondary },
  posDesc: { fontFamily: Fonts.inter, fontSize: 13, color: Colors.textTertiary },
  check: {
    width: 24, height: 24, borderRadius: 12,
    backgroundColor: Colors.accent,
    alignItems: 'center', justifyContent: 'center',
  },
  checkText: { fontSize: 12, color: '#fff', fontFamily: Fonts.interBold },
  footer: { paddingBottom: Spacing.lg, paddingTop: Spacing.sm },
  btn: { width: '100%' },
});
