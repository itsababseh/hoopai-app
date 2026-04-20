import React, { useEffect } from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withDelay,
} from 'react-native-reanimated';
import { Text } from '../ui/Text';
import type { HealthMetric, HealthSource } from '../../stores/healthStore';

// ─── Source dot ───────────────────────────────────────────────────────────────

function SourceDot({ source }: { source: HealthSource }) {
  const color =
    source === 'apple_watch' || source === 'apple_health'
      ? '#FC3C44'
      : source === 'health_connect' || source === 'google_fit'
      ? '#4285F4'
      : '#6B7280';
  return (
    <View style={[styles.sourceDot, { backgroundColor: color }]} />
  );
}

// ─── Stale badge ──────────────────────────────────────────────────────────────

function StaleBadge() {
  return (
    <View style={styles.staleBadge}>
      <Text style={styles.staleText}>!</Text>
    </View>
  );
}

// ─── HealthMetricChip ─────────────────────────────────────────────────────────

export type MetricVariant = 'hrv' | 'heartRate' | 'steps' | 'sleep';

interface HealthMetricChipProps {
  variant: MetricVariant;
  metric: HealthMetric<number>;
  onPress?: () => void;
  delay?: number;
  compact?: boolean;
}

const METRIC_CONFIG: Record<MetricVariant, {
  icon: string;
  label: string;
  unit: string;
  goodRange?: [number, number];
  formatValue: (v: number) => string;
}> = {
  hrv: {
    icon: '📡',
    label: 'HRV',
    unit: 'ms',
    goodRange: [50, 120],
    formatValue: (v) => Math.round(v).toString(),
  },
  heartRate: {
    icon: '❤️',
    label: 'RHR',
    unit: 'bpm',
    goodRange: [40, 70],
    formatValue: (v) => Math.round(v).toString(),
  },
  steps: {
    icon: '👟',
    label: 'Steps',
    unit: '',
    formatValue: (v) => v >= 1000 ? `${(v / 1000).toFixed(1)}k` : v.toString(),
  },
  sleep: {
    icon: '😴',
    label: 'Sleep',
    unit: 'hrs',
    goodRange: [7, 9],
    formatValue: (v) => v.toFixed(1),
  },
};

function getValueColor(variant: MetricVariant, value: number): string {
  const config = METRIC_CONFIG[variant];
  if (!config.goodRange) return '#FFFFFF';
  const [low, high] = config.goodRange;
  if (value >= low && value <= high) return '#34D399'; // green
  if (variant === 'hrv' && value < low) return '#FBBF24'; // amber
  if (variant === 'heartRate' && value > high) return '#F87171'; // red
  return '#FBBF24';
}

export function HealthMetricChip({
  variant,
  metric,
  onPress,
  delay = 0,
  compact = false,
}: HealthMetricChipProps) {
  const config = METRIC_CONFIG[variant];
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.85);

  useEffect(() => {
    opacity.value = withDelay(delay, withTiming(1, { duration: 300 }));
    scale.value = withDelay(delay, withSpring(1, { damping: 18, stiffness: 220 }));
  }, []);

  const animStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  const isEmpty = metric.value === null;
  const valueColor = isEmpty ? '#4B5563' : getValueColor(variant, metric.value!);

  return (
    <Animated.View style={animStyle}>
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={onPress ? 0.7 : 1}
        style={[
          styles.chip,
          compact && styles.chipCompact,
          isEmpty && styles.chipEmpty,
          metric.isStale && styles.chipStale,
        ]}
      >
        {/* Top row: icon + stale */}
        <View style={styles.chipTop}>
          <Text style={compact ? styles.iconSm : styles.iconMd}>{config.icon}</Text>
          {metric.isStale && <StaleBadge />}
          {!isEmpty && metric.source !== 'unknown' && (
            <SourceDot source={metric.source} />
          )}
        </View>

        {/* Value */}
        {isEmpty ? (
          <View style={styles.emptyValue}>
            <View style={styles.emptyLine} />
          </View>
        ) : (
          <View style={styles.valueRow}>
            <Text style={[compact ? styles.valueSm : styles.valueMd, { color: valueColor }]}>
              {config.formatValue(metric.value!)}
            </Text>
            {config.unit ? (
              <Text variant="caption" style={styles.unit}>{config.unit}</Text>
            ) : null}
          </View>
        )}

        {/* Label */}
        <Text variant="caption" style={styles.label}>{config.label}</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

// ─── HealthMetricRow — all 4 chips in one row ─────────────────────────────────

import type { HealthData } from '../../stores/healthStore';

interface HealthMetricRowProps {
  data: HealthData;
  onChipPress?: (variant: MetricVariant) => void;
}

export function HealthMetricRow({ data, onChipPress }: HealthMetricRowProps) {
  return (
    <View style={styles.row}>
      <HealthMetricChip variant="hrv" metric={data.hrv} delay={0} onPress={() => onChipPress?.('hrv')} />
      <HealthMetricChip variant="heartRate" metric={data.restingHeartRate} delay={60} onPress={() => onChipPress?.('heartRate')} />
      <HealthMetricChip variant="sleep" metric={data.sleepHours} delay={120} onPress={() => onChipPress?.('sleep')} />
      <HealthMetricChip variant="steps" metric={data.steps} delay={180} onPress={() => onChipPress?.('steps')} />
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    backgroundColor: '#141420',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    padding: 12,
    alignItems: 'center',
    minWidth: 72,
  },
  chipCompact: {
    padding: 8,
    minWidth: 60,
  },
  chipEmpty: {
    opacity: 0.5,
  },
  chipStale: {
    borderColor: 'rgba(251,191,36,0.3)',
  },
  chipTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 6,
  },
  iconMd: { fontSize: 20 },
  iconSm: { fontSize: 16 },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 2,
    marginBottom: 4,
  },
  valueMd: {
    fontSize: 22,
    fontFamily: 'Anton_400Regular',
    color: '#FFFFFF',
  },
  valueSm: {
    fontSize: 18,
    fontFamily: 'Anton_400Regular',
    color: '#FFFFFF',
  },
  unit: {
    color: '#6B7280',
    marginBottom: 2,
  },
  label: {
    color: '#6B7280',
  },
  emptyValue: {
    height: 28,
    justifyContent: 'center',
    marginBottom: 4,
  },
  emptyLine: {
    width: 32,
    height: 3,
    backgroundColor: '#1F2937',
    borderRadius: 2,
  },
  staleBadge: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#F59E0B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  staleText: {
    fontSize: 9,
    color: '#000',
    fontWeight: '700',
  },
  sourceDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
});
