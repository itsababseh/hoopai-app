import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ReadinessTier } from '../../../constants/sessionTypes';

const READINESS_COLORS: Record<ReadinessTier, string> = {
  peak: '#00D4AA',
  ready: '#4FACFE',
  moderate: '#FFB547',
  low: '#FF6B2C',
  rest: '#8A8A9A',
  recovery: '#4A4A5A',
};

const READINESS_LABELS: Record<ReadinessTier, string> = {
  peak: 'PEAK',
  ready: 'READY',
  moderate: 'MODERATE',
  low: 'LOW',
  rest: 'REST DAY',
  recovery: 'RECOVERY',
};

interface SessionHeaderProps {
  drillIndex: number;
  totalDrills: number;
  elapsedSeconds: number;
  readinessTier: ReadinessTier;
  onPause: () => void;
}

function formatElapsed(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export function SessionHeader({
  drillIndex,
  totalDrills,
  elapsedSeconds,
  readinessTier,
  onPause,
}: SessionHeaderProps) {
  const insets = useSafeAreaInsets();
  const color = READINESS_COLORS[readinessTier];

  return (
    <View style={[styles.container, { paddingTop: insets.top + 8 }]}>
      <View style={styles.left}>
        <Text style={styles.drillCounter}>
          DRILL{' '}
          <Text style={styles.drillCurrent}>{drillIndex + 1}</Text>
          <Text style={styles.drillOf}> / {totalDrills}</Text>
        </Text>
        <View style={[styles.readinessBadge, { borderColor: color }]}>
          <View style={[styles.readinessDot, { backgroundColor: color }]} />
          <Text style={[styles.readinessLabel, { color }]}>
            {READINESS_LABELS[readinessTier]}
          </Text>
        </View>
      </View>

      <View style={styles.right}>
        <Text style={styles.elapsedLabel}>TIME</Text>
        <Text style={styles.elapsed}>{formatElapsed(elapsedSeconds)}</Text>
        <TouchableOpacity
          onPress={onPause}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          style={styles.pauseBtn}
          accessibilityLabel="Pause session"
          accessibilityRole="button"
        >
          <View style={styles.pauseIconWrap}>
            <View style={styles.pauseBar} />
            <View style={styles.pauseBar} />
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 12,
    backgroundColor: '#0A0A0F',
  },
  left: { flex: 1, gap: 6 },
  right: { alignItems: 'flex-end', gap: 2 },
  drillCounter: {
    fontFamily: 'Anton',
    fontSize: 13,
    color: '#8A8A9A',
    letterSpacing: 1.5,
  },
  drillCurrent: {
    fontFamily: 'Anton',
    fontSize: 22,
    color: '#FFFFFF',
  },
  drillOf: {
    fontFamily: 'Anton',
    fontSize: 13,
    color: '#8A8A9A',
  },
  readinessBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 3,
    alignSelf: 'flex-start',
  },
  readinessDot: { width: 6, height: 6, borderRadius: 3 },
  readinessLabel: {
    fontFamily: 'Inter',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.2,
  },
  elapsedLabel: {
    fontFamily: 'Inter',
    fontSize: 10,
    color: '#4A4A5A',
    letterSpacing: 1.2,
    fontWeight: '600',
  },
  elapsed: {
    fontFamily: 'Anton',
    fontSize: 20,
    color: '#8A8A9A',
    letterSpacing: 1,
  },
  pauseBtn: { marginTop: 4 },
  pauseIconWrap: { flexDirection: 'row', gap: 3 },
  pauseBar: {
    width: 3,
    height: 14,
    borderRadius: 2,
    backgroundColor: '#8A8A9A',
  },
});
