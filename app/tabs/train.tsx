import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Text } from '../../components/ui/Text';
import { PressableCard } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Colors, Fonts, Spacing, Radius } from '../../constants/theme';
import { DRILLS, type DrillCategory } from '../../constants/drills';
import { PROGRAMS } from '../../constants/programs';

const CATEGORIES: { value: DrillCategory | 'all'; label: string }[] = [
  { value: 'all',          label: 'All' },
  { value: 'shooting',     label: 'Shooting' },
  { value: 'ball-handling',label: 'Handles' },
  { value: 'athleticism',  label: 'Athletic' },
  { value: 'defense',      label: 'Defense' },
  { value: 'finishing',    label: 'Finishing' },
];

export default function TrainScreen() {
  const [activeCategory, setActiveCategory] = useState<DrillCategory | 'all'>('all');

  const filtered = activeCategory === 'all'
    ? DRILLS
    : DRILLS.filter(d => d.category === activeCategory);

  return (
    <View style={styles.container}>
      <SafeAreaView edges={['top']} style={styles.safe}>
        <View style={styles.header}>
          <Text style={styles.title}>Train</Text>
          <Text style={styles.subtitle}>20 drills · 5 programs</Text>
        </View>

        {/* Programs row */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Programs</Text>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.programsRow}
          style={styles.programsScroll}
        >
          {PROGRAMS.map(prog => (
            <TouchableOpacity key={prog.id} style={[styles.programCard, { borderColor: prog.coverColor + '60' }]} activeOpacity={0.8}>
              <View style={[styles.programAccent, { backgroundColor: prog.coverColor }]} />
              <Text style={styles.programTitle}>{prog.title}</Text>
              <Text style={styles.programMeta}>{prog.weeks}w · {prog.sessionsPerWeek}x/wk</Text>
              <View style={styles.programTags}>
                {prog.focusAreas.slice(0, 2).map(f => (
                  <View key={f} style={[styles.progTag, { backgroundColor: prog.coverColor + '20' }]}>
                    <Text style={[styles.progTagText, { color: prog.coverColor }]}>{f}</Text>
                  </View>
                ))}
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Category filter */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Drill Library</Text>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterRow}
          style={styles.filterScroll}
        >
          {CATEGORIES.map(cat => (
            <TouchableOpacity
              key={cat.value}
              style={[styles.filterChip, activeCategory === cat.value && styles.filterChipActive]}
              onPress={() => setActiveCategory(cat.value)}
            >
              <Text style={[styles.filterText, activeCategory === cat.value && styles.filterTextActive]}>
                {cat.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Drill list */}
        <FlatList
          data={filtered}
          keyExtractor={d => d.id}
          contentContainerStyle={styles.drillList}
          showsVerticalScrollIndicator={false}
          renderItem={({ item: drill }) => (
            <PressableCard
              style={styles.drillCard}
              onPress={() => router.push({ pathname: '/drill/[id]', params: { id: drill.id } })}
            >
              <View style={styles.drillRow}>
                <View style={styles.drillThumb}>
                  <Text style={styles.drillPlay}>▶</Text>
                </View>
                <View style={styles.drillInfo}>
                  <Text style={styles.drillTitle} numberOfLines={1}>{drill.title}</Text>
                  <Text style={styles.drillSubtitle} numberOfLines={1}>{drill.subtitle}</Text>
                  <View style={styles.drillMeta}>
                    <Text style={styles.drillMetaText}>{drill.durationMinutes}m</Text>
                    <Text style={styles.drillMetaDot}>·</Text>
                    <Text style={styles.drillMetaText}>{drill.sets} sets</Text>
                    <Text style={styles.drillMetaDot}>·</Text>
                    <Text style={styles.drillMetaText}>{drill.reps}</Text>
                  </View>
                </View>
                <Badge label={drill.difficulty} variant={drill.difficulty === 'advanced' ? 'accent' : drill.difficulty === 'intermediate' ? 'blue' : 'success'} />
              </View>
            </PressableCard>
          )}
        />
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  safe: { flex: 1 },
  header: { paddingHorizontal: Spacing.lg, paddingTop: Spacing.md, paddingBottom: Spacing.sm, gap: 2 },
  title: { fontFamily: Fonts.interBold, fontSize: 28, color: Colors.textPrimary },
  subtitle: { fontFamily: Fonts.inter, fontSize: 13, color: Colors.textTertiary },
  sectionHeader: { paddingHorizontal: Spacing.lg, marginBottom: Spacing.sm, marginTop: Spacing.sm },
  sectionTitle: { fontFamily: Fonts.interBold, fontSize: 18, color: Colors.textPrimary },
  // Programs
  programsScroll: { marginBottom: Spacing.md },
  programsRow: { paddingHorizontal: Spacing.lg, gap: Spacing.sm },
  programCard: {
    width: 180, backgroundColor: Colors.surface, borderRadius: Radius.lg,
    borderWidth: 1, padding: Spacing.md, gap: 6, overflow: 'hidden',
  },
  programAccent: { position: 'absolute', top: 0, left: 0, right: 0, height: 3 },
  programTitle: { fontFamily: Fonts.interBold, fontSize: 14, color: Colors.textPrimary, lineHeight: 18 },
  programMeta: { fontFamily: Fonts.inter, fontSize: 12, color: Colors.textTertiary },
  programTags: { flexDirection: 'row', gap: 4, flexWrap: 'wrap' },
  progTag: { borderRadius: Radius.full, paddingHorizontal: 8, paddingVertical: 3 },
  progTagText: { fontFamily: Fonts.interSemi, fontSize: 10, letterSpacing: 0.5 },
  // Filter
  filterScroll: { marginBottom: Spacing.sm },
  filterRow: { paddingHorizontal: Spacing.lg, gap: Spacing.sm },
  filterChip: {
    paddingHorizontal: 14, paddingVertical: 7, borderRadius: Radius.full,
    backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border,
  },
  filterChipActive: { backgroundColor: Colors.accent + '20', borderColor: Colors.accent },
  filterText: { fontFamily: Fonts.interSemi, fontSize: 13, color: Colors.textSecondary },
  filterTextActive: { color: Colors.accent },
  // Drill list
  drillList: { paddingHorizontal: Spacing.lg, gap: Spacing.sm, paddingBottom: 100 },
  drillCard: { marginBottom: 0 },
  drillRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  drillThumb: {
    width: 52, height: 52, borderRadius: Radius.sm,
    backgroundColor: Colors.surface2, alignItems: 'center', justifyContent: 'center',
  },
  drillPlay: { fontSize: 18, color: Colors.accent },
  drillInfo: { flex: 1, gap: 3 },
  drillTitle: { fontFamily: Fonts.interSemi, fontSize: 15, color: Colors.textPrimary },
  drillSubtitle: { fontFamily: Fonts.inter, fontSize: 12, color: Colors.textTertiary },
  drillMeta: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  drillMetaText: { fontFamily: Fonts.inter, fontSize: 12, color: Colors.textTertiary },
  drillMetaDot: { fontSize: 12, color: Colors.textTertiary },
});
