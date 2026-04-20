import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface SessionStatsGridProps {
  elapsedSeconds: number;
  totalDrills: number;
  completedDrills: number;
  totalSets: number;
  completedSets: number;
}

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}m ${s}s`;
}

interface StatCellProps {
  value: string;
  label: string;
  accent?: boolean;
}

function StatCell({ value, label, accent }: StatCellProps) {
  return (
    <View style={styles.cell}>
      <Text style={[styles.value, accent && styles.valueAccent]}>{value}</Text>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

export function SessionStatsGrid({
  elapsedSeconds,
  totalDrills,
  completedDrills,
  totalSets,
  completedSets,
}: SessionStatsGridProps) {
  const pct = totalDrills > 0 ? Math.round((completedDrills / totalDrills) * 100) : 0;

  return (
    <View style={styles.grid}>
      <StatCell value={formatDuration(elapsedSeconds)} label="DURATION" />
      <View style={styles.divider} />
      <StatCell value={`${completedDrills}/${totalDrills}`} label="DRILLS" accent={pct === 100} />
      <View style={styles.divider} />
      <StatCell value={`${completedSets}`} label="SETS DONE" />
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    backgroundColor: '#131318',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#2A2A3A',
    alignItems: 'center',
    width: '100%',
  },
  cell: { flex: 1, alignItems: 'center', gap: 4 },
  value: {
    fontFamily: 'Anton',
    fontSize: 22,
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  valueAccent: { color: '#00D4AA' },
  label: {
    fontFamily: 'Inter',
    fontSize: 9,
    color: '#4A4A5A',
    fontWeight: '700',
    letterSpacing: 1.5,
  },
  divider: { width: 1, height: 36, backgroundColor: '#2A2A3A' },
});
