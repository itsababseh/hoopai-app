import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

interface StreakModuleProps {
  streakDays: number;
  delayMs?: number;
}

export function StreakModule({ streakDays, delayMs = 800 }: StreakModuleProps) {
  const scale = useSharedValue(0.6);
  const opacity = useSharedValue(0);
  const flameScale = useSharedValue(1);

  useEffect(() => {
    opacity.value = withDelay(delayMs, withTiming(1, { duration: 300 }));
    scale.value = withDelay(delayMs, withSpring(1, { damping: 12, stiffness: 180 }));
  }, []);

  const containerStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View style={[styles.container, containerStyle]}>
      <View style={styles.inner}>
        <Text style={styles.flame}>🔥</Text>
        <View style={styles.text}>
          <Text style={styles.count}>{streakDays}</Text>
          <Text style={styles.label}>
            {streakDays === 1 ? 'day streak' : 'day streak'}
          </Text>
        </View>
        {streakDays >= 7 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>WEEK!</Text>
          </View>
        )}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {},
  inner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#1C1C26',
    borderRadius: 50,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#FFB547',
  },
  flame: { fontSize: 24 },
  text: { flexDirection: 'row', alignItems: 'baseline', gap: 6 },
  count: {
    fontFamily: 'Anton',
    fontSize: 28,
    color: '#FFB547',
    letterSpacing: 0.5,
  },
  label: {
    fontFamily: 'Inter',
    fontSize: 13,
    color: '#8A8A9A',
    fontWeight: '500',
  },
  badge: {
    backgroundColor: '#FFB547',
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  badgeText: {
    fontFamily: 'Anton',
    fontSize: 10,
    color: '#0A0A0F',
    letterSpacing: 1,
  },
});
