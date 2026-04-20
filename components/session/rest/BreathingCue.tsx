import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
} from 'react-native-reanimated';

const INHALE_MS = 4000;
const EXHALE_MS = 4000;

export function BreathingCue() {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(0.4);
  const phase = useSharedValue(0); // 0 = inhale, 1 = exhale

  useEffect(() => {
    scale.value = withRepeat(
      withSequence(
        withTiming(1.35, { duration: INHALE_MS, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: EXHALE_MS, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      false
    );
    opacity.value = withRepeat(
      withSequence(
        withTiming(0.85, { duration: INHALE_MS, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.4, { duration: EXHALE_MS, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      false
    );
  }, []);

  const circleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.breathCircle, circleStyle]} />
      <Text style={styles.label}>Breathe</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', justifyContent: 'center', gap: 10 },
  breathCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FF6B2C40',
    borderWidth: 2,
    borderColor: '#FF6B2C',
  },
  label: {
    fontFamily: 'Inter',
    fontSize: 12,
    color: '#8A8A9A',
    fontWeight: '500',
    letterSpacing: 1,
  },
});
