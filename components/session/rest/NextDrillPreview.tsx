import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { DrillItem } from '../../../constants/sessionTypes';

interface NextDrillPreviewProps {
  drill: DrillItem;
}

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

export function NextDrillPreview({ drill }: NextDrillPreviewProps) {
  const color = CATEGORY_COLORS[drill.category] ?? '#8A8A9A';

  return (
    <View style={styles.container}>
      <Text style={styles.upNextLabel}>UP NEXT</Text>
      <View style={styles.card}>
        <View style={[styles.accent, { backgroundColor: color }]} />
        <View style={styles.info}>
          <Text style={styles.name}>{drill.name}</Text>
          <Text style={styles.meta}>
            {drill.totalSets} sets
            {drill.reps ? ` · ${drill.reps} reps` : ''}
            {drill.duration ? ` · ${drill.duration}s` : ''}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 8, width: '100%', paddingHorizontal: 24 },
  upNextLabel: {
    fontFamily: 'Inter',
    fontSize: 10,
    color: '#4A4A5A',
    fontWeight: '700',
    letterSpacing: 2,
    textAlign: 'center',
  },
  card: {
    flexDirection: 'row',
    backgroundColor: '#1C1C26',
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#2A2A3A',
  },
  accent: { width: 4 },
  info: { flex: 1, padding: 14, gap: 4 },
  name: {
    fontFamily: 'Anton',
    fontSize: 18,
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  meta: {
    fontFamily: 'Inter',
    fontSize: 12,
    color: '#8A8A9A',
    fontWeight: '500',
  },
});
