import React, { useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

interface SetRepCounterProps {
  currentSet: number;
  totalSets: number;
  reps?: number;
  duration?: number;
  onCompleteSet: () => void;
  onSkip: () => void;
}

export function SetRepCounter({
  currentSet,
  totalSets,
  reps,
  duration,
  onCompleteSet,
  onSkip,
}: SetRepCounterProps) {
  const scale = useSharedValue(1);
  const glow = useSharedValue(0);

  const btnStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    shadowOpacity: glow.value,
  }));

  const handlePress = useCallback(async () => {
    scale.value = withSequence(
      withTiming(0.93, { duration: 80 }),
      withSpring(1, { damping: 12, stiffness: 300 })
    );
    glow.value = withSequence(
      withTiming(0.9, { duration: 60 }),
      withTiming(0, { duration: 400 })
    );
    onCompleteSet();
  }, [onCompleteSet]);

  const setsLeft = totalSets - currentSet;

  return (
    <View style={styles.container}>
      {/* Set dots */}
      <View style={styles.dotsRow}>
        {Array.from({ length: totalSets }).map((_, i) => (
          <View
            key={i}
            style={[
              styles.dot,
              i < currentSet && styles.dotComplete,
              i === currentSet && styles.dotActive,
            ]}
          />
        ))}
      </View>

      <Text style={styles.setLabel}>
        SET {currentSet + 1} OF {totalSets}
      </Text>

      {reps !== undefined && (
        <Text style={styles.targetLabel}>{reps} REPS</Text>
      )}
      {duration !== undefined && (
        <Text style={styles.targetLabel}>{duration}s</Text>
      )}

      {/* Main CTA */}
      <Animated.View style={[styles.ctaWrap, btnStyle]}>
        <TouchableOpacity
          style={styles.ctaButton}
          onPress={handlePress}
          activeOpacity={0.85}
          accessibilityLabel={`Complete set ${currentSet + 1}`}
          accessibilityRole="button"
        >
          <Text style={styles.ctaText}>SET DONE</Text>
          {setsLeft > 1 && (
            <Text style={styles.ctaSub}>{setsLeft - 1} more after this</Text>
          )}
        </TouchableOpacity>
      </Animated.View>

      {/* Skip drill */}
      <TouchableOpacity onPress={onSkip} style={styles.skipBtn} accessibilityRole="button">
        <Text style={styles.skipText}>Skip Drill</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', gap: 12, paddingVertical: 8 },
  dotsRow: { flexDirection: 'row', gap: 8 },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#2A2A3A',
  },
  dotComplete: { backgroundColor: '#FF6B2C' },
  dotActive: {
    backgroundColor: '#FF6B2C',
    width: 20,
    shadowColor: '#FF6B2C',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
    elevation: 4,
  },
  setLabel: {
    fontFamily: 'Inter',
    fontSize: 11,
    color: '#4A4A5A',
    fontWeight: '700',
    letterSpacing: 1.5,
  },
  targetLabel: {
    fontFamily: 'Anton',
    fontSize: 42,
    color: '#FFFFFF',
    letterSpacing: 1,
  },
  ctaWrap: {
    shadowColor: '#FF6B2C',
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 20,
    elevation: 8,
  },
  ctaButton: {
    backgroundColor: '#FF6B2C',
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 48,
    alignItems: 'center',
    gap: 4,
  },
  ctaText: {
    fontFamily: 'Anton',
    fontSize: 22,
    color: '#FFFFFF',
    letterSpacing: 2,
  },
  ctaSub: {
    fontFamily: 'Inter',
    fontSize: 11,
    color: 'rgba(255,255,255,0.7)',
    fontWeight: '500',
  },
  skipBtn: { paddingVertical: 8, paddingHorizontal: 16 },
  skipText: {
    fontFamily: 'Inter',
    fontSize: 13,
    color: '#4A4A5A',
    fontWeight: '500',
  },
});
