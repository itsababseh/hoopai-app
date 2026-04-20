import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
  Easing,
  runOnJS,
} from 'react-native-reanimated';

interface XPCounterProps {
  targetXP: number;
  durationMs?: number;
  delayMs?: number;
}

export function XPCounter({ targetXP, durationMs = 1500, delayMs = 400 }: XPCounterProps) {
  const [displayXP, setDisplayXP] = React.useState(0);
  const progress = useSharedValue(0);
  const scale = useSharedValue(0.8);
  const opacity = useSharedValue(0);

  useEffect(() => {
    opacity.value = withDelay(delayMs, withTiming(1, { duration: 300 }));
    scale.value = withDelay(delayMs, withTiming(1, { duration: 300 }));

    progress.value = withDelay(
      delayMs,
      withTiming(1, { duration: durationMs, easing: Easing.out(Easing.cubic) }, () => {
        runOnJS(setDisplayXP)(targetXP);
      })
    );

    // Drive integer count-up via JS-side interval (simpler than runOnJS every frame)
    let start: number | null = null;
    const intervalId = setInterval(() => {
      if (start === null) {
        start = Date.now();
      }
      const elapsed = Date.now() - start - delayMs;
      if (elapsed < 0) return;
      const fraction = Math.min(elapsed / durationMs, 1);
      const eased = 1 - Math.pow(1 - fraction, 3); // cubic ease-out
      setDisplayXP(Math.floor(eased * targetXP));
      if (fraction >= 1) clearInterval(intervalId);
    }, 16);

    return () => clearInterval(intervalId);
  }, [targetXP]);

  const containerStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View style={[styles.container, containerStyle]}>
      <View style={styles.pill}>
        <Text style={styles.plus}>+</Text>
        <Text style={styles.xp}>{displayXP.toLocaleString()}</Text>
        <Text style={styles.xpLabel}>XP</Text>
      </View>
      <Text style={styles.caption}>earned this session</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', gap: 8 },
  pill: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: '#FF6B2C40',
    borderWidth: 1,
    borderColor: '#FF6B2C',
    borderRadius: 50,
    paddingHorizontal: 24,
    paddingVertical: 10,
    gap: 4,
  },
  plus: {
    fontFamily: 'Anton',
    fontSize: 28,
    color: '#FF6B2C',
    lineHeight: 44,
  },
  xp: {
    fontFamily: 'Anton',
    fontSize: 52,
    color: '#FFFFFF',
    letterSpacing: 1,
  },
  xpLabel: {
    fontFamily: 'Anton',
    fontSize: 20,
    color: '#FF6B2C',
    lineHeight: 44,
    letterSpacing: 2,
  },
  caption: {
    fontFamily: 'Inter',
    fontSize: 12,
    color: '#4A4A5A',
    fontWeight: '500',
    letterSpacing: 0.5,
  },
});
