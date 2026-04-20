import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useEffect } from 'react';
import { DrillItem } from '../../../constants/sessionTypes';

const CATEGORY_COLORS: Record<string, string> = {
  'ball-handling': '#4FACFE',
  shooting: '#FF6B2C',
  footwork: '#00D4AA',
  conditioning: '#FFB547',
  defense: '#8A8A9A',
  finishing: '#FF6B2C',
  passing: '#4FACFE',
  strength: '#FFB547',
};

interface DrillCardProps {
  drill: DrillItem;
  currentSet: number;
}

export function DrillCard({ drill, currentSet }: DrillCardProps) {
  const translateY = useSharedValue(30);
  const opacity = useSharedValue(0);

  useEffect(() => {
    opacity.value = 0;
    translateY.value = 20;
    opacity.value = withTiming(1, { duration: 300 });
    translateY.value = withSpring(0, { damping: 18, stiffness: 200 });
  }, [drill.id]);

  const cardStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  const categoryColor = CATEGORY_COLORS[drill.category] ?? '#8A8A9A';
  const isTimeBased = drill.duration !== undefined;

  return (
    <Animated.View style={[styles.card, cardStyle]}>
      {/* Category tag */}
      <View style={[styles.categoryTag, { borderColor: categoryColor }]}>
        <Text style={[styles.categoryText, { color: categoryColor }]}>
          {drill.category.toUpperCase().replace('-', ' ')}
        </Text>
      </View>

      {/* Drill name */}
      <Text style={styles.drillName}>{drill.name}</Text>

      {/* Set / rep info */}
      <View style={styles.metaRow}>
        <View style={styles.metaChip}>
          <Text style={styles.metaValue}>{currentSet + 1}</Text>
          <Text style={styles.metaLabel}>/ {drill.totalSets} SETS</Text>
        </View>
        <View style={styles.metaDivider} />
        {isTimeBased ? (
          <View style={styles.metaChip}>
            <Text style={styles.metaValue}>{drill.duration}s</Text>
            <Text style={styles.metaLabel}>DURATION</Text>
          </View>
        ) : (
          <View style={styles.metaChip}>
            <Text style={styles.metaValue}>{drill.reps}</Text>
            <Text style={styles.metaLabel}>REPS</Text>
          </View>
        )}
        <View style={styles.metaDivider} />
        <View style={styles.metaChip}>
          <Text style={[styles.metaValue, { textTransform: 'capitalize' }]}>
            {drill.difficulty}
          </Text>
          <Text style={styles.metaLabel}>LEVEL</Text>
        </View>
      </View>

      {/* Instructions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>INSTRUCTIONS</Text>
        {drill.instructions.map((step, i) => (
          <View key={i} style={styles.instructionRow}>
            <Text style={styles.instructionNum}>{i + 1}</Text>
            <Text style={styles.instructionText}>{step}</Text>
          </View>
        ))}
      </View>

      {/* Coaching cues */}
      {drill.coachingCues.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>COACHING CUES</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.cuesRow}>
              {drill.coachingCues.map((cue, i) => (
                <View key={i} style={styles.cueChip}>
                  <Text style={styles.cueText}>{cue}</Text>
                </View>
              ))}
            </View>
          </ScrollView>
        </View>
      )}

      {/* Equipment */}
      {drill.equipment.length > 0 && (
        <View style={styles.equipRow}>
          <Text style={styles.equipLabel}>NEEDS: </Text>
          <Text style={styles.equipText}>{drill.equipment.join(', ')}</Text>
        </View>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#131318',
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 16,
    gap: 14,
    borderWidth: 1,
    borderColor: '#2A2A3A',
  },
  categoryTag: {
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  categoryText: {
    fontFamily: 'Inter',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.5,
  },
  drillName: {
    fontFamily: 'Anton',
    fontSize: 28,
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1C1C26',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  metaChip: { flex: 1, alignItems: 'center', gap: 2 },
  metaValue: {
    fontFamily: 'Anton',
    fontSize: 20,
    color: '#FFFFFF',
  },
  metaLabel: {
    fontFamily: 'Inter',
    fontSize: 9,
    color: '#4A4A5A',
    fontWeight: '600',
    letterSpacing: 1,
  },
  metaDivider: { width: 1, height: 28, backgroundColor: '#2A2A3A' },
  section: { gap: 8 },
  sectionTitle: {
    fontFamily: 'Inter',
    fontSize: 10,
    color: '#4A4A5A',
    fontWeight: '700',
    letterSpacing: 1.5,
  },
  instructionRow: { flexDirection: 'row', gap: 10, alignItems: 'flex-start' },
  instructionNum: {
    fontFamily: 'Anton',
    fontSize: 14,
    color: '#FF6B2C',
    width: 18,
  },
  instructionText: {
    fontFamily: 'Inter',
    fontSize: 14,
    color: '#8A8A9A',
    flex: 1,
    lineHeight: 20,
  },
  cuesRow: { flexDirection: 'row', gap: 8 },
  cueChip: {
    backgroundColor: '#1C1C26',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#2A2A3A',
  },
  cueText: {
    fontFamily: 'Inter',
    fontSize: 12,
    color: '#8A8A9A',
  },
  equipRow: { flexDirection: 'row', alignItems: 'center' },
  equipLabel: {
    fontFamily: 'Inter',
    fontSize: 11,
    color: '#4A4A5A',
    fontWeight: '700',
    letterSpacing: 1,
  },
  equipText: {
    fontFamily: 'Inter',
    fontSize: 11,
    color: '#8A8A9A',
  },
});
