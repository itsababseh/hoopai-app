import React, { useEffect, useState } from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withSequence,
  withDelay,
  interpolateColor,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { Text } from '../ui/Text';
import { ProgressRing } from '../ui/ProgressRing';
import { useHealthStore, hasAnyHealthData } from '../../stores/healthStore';
import { useSessionStore } from '../../stores/sessionStore';
import { getReadinessTheme } from '../../utils/readinessTheme';

// ─── Mode Badge ───────────────────────────────────────────────────────────────

type ReadinessMode = 'manual' | 'auto' | 'adjusted' | 'stale';

const MODE_CONFIG: Record<ReadinessMode, { label: string; color: string; bg: string }> = {
  manual:   { label: 'MANUAL',     color: '#9CA3AF', bg: 'rgba(156,163,175,0.12)' },
  auto:     { label: 'AI POWERED', color: '#FF6B2C', bg: 'rgba(255,107,44,0.12)' },
  adjusted: { label: 'ADJUSTED',   color: '#FBBF24', bg: 'rgba(251,191,36,0.12)' },
  stale:    { label: 'STALE DATA', color: '#F59E0B', bg: 'rgba(245,158,11,0.12)' },
};

function ModeBadge({ mode }: { mode: ReadinessMode }) {
  const cfg = MODE_CONFIG[mode];
  return (
    <View style={[styles.modeBadge, { backgroundColor: cfg.bg }]}>
      <View style={[styles.modeDot, { backgroundColor: cfg.color }]} />
      <Text variant="caption" style={[styles.modeLabel, { color: cfg.color }]}>
        {cfg.label}
      </Text>
    </View>
  );
}

// ─── ReadinessCard ─────────────────────────────────────────────────────────────

interface ReadinessCardProps {
  score: number;
  onOpenCheckIn?: () => void;
  onToggleMode?: () => void;
}

export function ReadinessCard({ score, onOpenCheckIn, onToggleMode }: ReadinessCardProps) {
  const { data, autoReadinessEnabled, setAutoReadiness, syncStatus } = useHealthStore();
  const hasHealth = hasAnyHealthData(data);
  const hasStale = Object.values(data).some(m => m.isStale && m.value !== null);

  // Determine mode
  const mode: ReadinessMode = !autoReadinessEnabled
    ? 'manual'
    : hasStale
    ? 'stale'
    : hasHealth
    ? 'auto'
    : 'manual';

  const theme = getReadinessTheme(score);
  const ringProgress = score / 100;

  // Animate score in
  const scoreScale = useSharedValue(0.7);
  const scoreOpacity = useSharedValue(0);
  const glowOpacity = useSharedValue(0);

  useEffect(() => {
    scoreScale.value = withSpring(1, { damping: 16, stiffness: 220 });
    scoreOpacity.value = withTiming(1, { duration: 400 });
    glowOpacity.value = withDelay(300, withTiming(0.6, { duration: 600 }));
  }, [score]);

  const scoreStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scoreScale.value }],
    opacity: scoreOpacity.value,
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
  }));

  // Pulse when syncing
  const syncPulse = useSharedValue(1);
  useEffect(() => {
    if (syncStatus === 'syncing') {
      syncPulse.value = withSequence(
        withTiming(0.95, { duration: 600 }),
        withTiming(1, { duration: 600 })
      );
    }
  }, [syncStatus]);

  const cardStyle = useAnimatedStyle(() => ({
    transform: [{ scale: syncPulse.value }],
  }));

  const handleModeToggle = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setAutoReadiness(!autoReadinessEnabled);
    onToggleMode?.();
  };

  return (
    <Animated.View style={cardStyle}>
      <LinearGradient
        colors={['#141420', '#0A0A0F']}
        style={[styles.card, { borderColor: `${theme.colorBorder}40` }]}
      >
        {/* Glow blob */}
        <Animated.View
          style={[styles.glowBlob, { backgroundColor: theme.colorGlow }, glowStyle]}
        />

        {/* Header row */}
        <View style={styles.headerRow}>
          <View>
            <Text variant="label" style={styles.cardTitle}>Daily Readiness</Text>
            {hasHealth && autoReadinessEnabled && (
              <Text variant="caption" style={{ color: '#4B5563' }}>
                Based on your health data
              </Text>
            )}
          </View>
          <ModeBadge mode={mode} />
        </View>

        {/* Score + ring */}
        <View style={styles.scoreContainer}>
          <ProgressRing
            progress={ringProgress}
            size={130}
            strokeWidth={8}
            color={theme.color}
          />
          <Animated.View style={[styles.scoreInner, scoreStyle]}>
            <Text style={[styles.scoreText, { color: theme.color }]}>{score}</Text>
            <Text variant="caption" style={styles.scoreLabel}>{theme.label}</Text>
          </Animated.View>
        </View>

        {/* Intensity */}
        <View style={styles.intensityRow}>
          <View style={[styles.intensityBadge, { borderColor: `${theme.color}40` }]}>
            <Text variant="label" style={{ color: theme.color }}>{theme.intensityLabel}</Text>
          </View>
        </View>

        {/* Health data preview — only in auto mode */}
        {mode === 'auto' && (
          <View style={styles.healthPreview}>
            {data.hrv.value !== null && (
              <View style={styles.previewChip}>
                <Text variant="caption" style={{ color: '#6B7280' }}>HRV</Text>
                <Text variant="label" style={{ color: '#FFFFFF' }}>{Math.round(data.hrv.value)}ms</Text>
              </View>
            )}
            {data.restingHeartRate.value !== null && (
              <View style={styles.previewChip}>
                <Text variant="caption" style={{ color: '#6B7280' }}>RHR</Text>
                <Text variant="label" style={{ color: '#FFFFFF' }}>{Math.round(data.restingHeartRate.value)}bpm</Text>
              </View>
            )}
            {data.sleepHours.value !== null && (
              <View style={styles.previewChip}>
                <Text variant="caption" style={{ color: '#6B7280' }}>Sleep</Text>
                <Text variant="label" style={{ color: '#FFFFFF' }}>{data.sleepHours.value.toFixed(1)}h</Text>
              </View>
            )}
          </View>
        )}

        {/* Action row */}
        <View style={styles.actionRow}>
          <TouchableOpacity onPress={onOpenCheckIn} style={styles.actionBtn}>
            <Text variant="label" style={styles.actionText}>
              {mode === 'manual' ? 'Update Check-in' : 'Manual Override'}
            </Text>
          </TouchableOpacity>

          {hasHealth && (
            <TouchableOpacity onPress={handleModeToggle} style={styles.modeToggle}>
              <Text variant="caption" style={{ color: '#6B7280' }}>
                {autoReadinessEnabled ? 'Use manual' : 'Use AI'}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </LinearGradient>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 20,
    overflow: 'hidden',
    position: 'relative',
  },
  glowBlob: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    top: -80,
    right: -60,
    filter: undefined, // RN doesn't support CSS filter; relies on opacity
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  cardTitle: { color: '#FFFFFF', marginBottom: 2 },
  modeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    gap: 6,
  },
  modeDot: { width: 6, height: 6, borderRadius: 3 },
  modeLabel: { fontSize: 10, letterSpacing: 0.8 },
  scoreContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  scoreInner: {
    position: 'absolute',
    alignItems: 'center',
  },
  scoreText: {
    fontSize: 48,
    fontFamily: 'Anton_400Regular',
    lineHeight: 52,
  },
  scoreLabel: { color: '#9CA3AF', marginTop: 2 },
  intensityRow: { alignItems: 'center', marginBottom: 16 },
  intensityBadge: {
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 6,
  },
  healthPreview: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.06)',
  },
  previewChip: { alignItems: 'center', gap: 2 },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.06)',
  },
  actionBtn: {
    backgroundColor: 'rgba(255,107,44,0.12)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
  },
  actionText: { color: '#FF6B2C' },
  modeToggle: { paddingHorizontal: 12, paddingVertical: 8 },
});
