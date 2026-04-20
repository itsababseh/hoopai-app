import React, { useState, useEffect } from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { Text } from '../ui/Text';
import type { HealthMetric } from '../../stores/healthStore';

interface SleepCardProps {
  sleepHours: HealthMetric<number>;
  sleepScore: HealthMetric<number>;
}

function sleepQualityLabel(hours: number): { label: string; color: string } {
  if (hours >= 8) return { label: 'Excellent', color: '#34D399' };
  if (hours >= 7) return { label: 'Good', color: '#86EFAC' };
  if (hours >= 6) return { label: 'Fair', color: '#FBBF24' };
  return { label: 'Poor', color: '#F87171' };
}

function formatDuration(hours: number): string {
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

function ScoreBar({ score, color }: { score: number; color: string }) {
  const width = useSharedValue(0);

  useEffect(() => {
    width.value = withTiming(score, { duration: 700 });
  }, [score]);

  const barStyle = useAnimatedStyle(() => ({
    width: `${width.value}%` as any,
  }));

  return (
    <View style={styles.scoreBarTrack}>
      <Animated.View style={[styles.scoreBarFill, { backgroundColor: color }, barStyle]} />
    </View>
  );
}

export function SleepCard({ sleepHours, sleepScore }: SleepCardProps) {
  const [expanded, setExpanded] = useState(false);
  const expandHeight = useSharedValue(0);

  const toggleExpand = () => {
    Haptics.selectionAsync();
    setExpanded((e) => !e);
    expandHeight.value = expanded
      ? withSpring(0, { damping: 20, stiffness: 300 })
      : withSpring(80, { damping: 20, stiffness: 300 });
  };

  const expandStyle = useAnimatedStyle(() => ({
    height: expandHeight.value,
    overflow: 'hidden',
  }));

  const isEmpty = sleepHours.value === null;
  const hours = sleepHours.value ?? 0;
  const score = sleepScore.value ?? 0;
  const quality = isEmpty ? null : sleepQualityLabel(hours);

  return (
    <TouchableOpacity onPress={isEmpty ? undefined : toggleExpand} activeOpacity={isEmpty ? 1 : 0.85}>
      <LinearGradient
        colors={['#141420', '#0F0F1A']}
        style={[styles.card, sleepHours.isStale && styles.cardStale]}
      >
        {/* Top row */}
        <View style={styles.topRow}>
          <View style={styles.leftCol}>
            <Text style={styles.cardIcon}>😴</Text>
            <View>
              <Text variant="label" style={styles.cardLabel}>Sleep</Text>
              {quality && (
                <Text variant="caption" style={{ color: quality.color }}>
                  {quality.label}
                </Text>
              )}
            </View>
          </View>

          <View style={styles.rightCol}>
            {isEmpty ? (
              <Text variant="caption" style={{ color: '#4B5563' }}>No data</Text>
            ) : (
              <>
                <Text style={[styles.durationText, { color: quality!.color }]}>
                  {formatDuration(hours)}
                </Text>
                {!isEmpty && (
                  <Text variant="caption" style={{ color: '#6B7280' }}>
                    {expanded ? '▲' : '▼'}
                  </Text>
                )}
              </>
            )}
          </View>
        </View>

        {/* Score bar */}
        {!isEmpty && (
          <View style={styles.scoreRow}>
            <ScoreBar score={score} color={quality!.color} />
            <Text variant="caption" style={{ color: '#6B7280', marginLeft: 8, minWidth: 30 }}>
              {score}
            </Text>
          </View>
        )}

        {/* Expanded detail */}
        <Animated.View style={expandStyle}>
          <View style={styles.expandedContent}>
            <View style={styles.expandedItem}>
              <Text variant="caption" style={{ color: '#6B7280' }}>Duration</Text>
              <Text variant="label" style={{ color: '#FFFFFF' }}>{formatDuration(hours)}</Text>
            </View>
            <View style={styles.expandedItem}>
              <Text variant="caption" style={{ color: '#6B7280' }}>Score</Text>
              <Text variant="label" style={{ color: quality?.color ?? '#FFFFFF' }}>{score}/100</Text>
            </View>
            <View style={styles.expandedItem}>
              <Text variant="caption" style={{ color: '#6B7280' }}>Source</Text>
              <Text variant="label" style={{ color: '#9CA3AF' }}>
                {sleepHours.source === 'apple_health' ? 'Apple Health' : 'Health Connect'}
              </Text>
            </View>
          </View>
        </Animated.View>

        {/* Stale warning */}
        {sleepHours.isStale && (
          <View style={styles.staleRow}>
            <Text style={styles.staleIcon}>⚠️</Text>
            <Text variant="caption" style={{ color: '#F59E0B' }}>
              Sleep data may be outdated
            </Text>
          </View>
        )}
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  cardStale: {
    borderColor: 'rgba(245,158,11,0.3)',
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  leftCol: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  rightCol: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cardIcon: { fontSize: 24 },
  cardLabel: { color: '#FFFFFF', marginBottom: 2 },
  durationText: {
    fontSize: 20,
    fontFamily: 'Anton_400Regular',
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  scoreBarTrack: {
    flex: 1,
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  scoreBarFill: {
    height: 4,
    borderRadius: 2,
  },
  expandedContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 14,
    paddingBottom: 4,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.06)',
    marginTop: 12,
  },
  expandedItem: { alignItems: 'center', gap: 2 },
  staleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(245,158,11,0.15)',
  },
  staleIcon: { fontSize: 12 },
});
