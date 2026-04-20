import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import Animated, {
  useAnimatedProps,
  useSharedValue,
  withTiming,
  Easing,
} from 'react-native-reanimated';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const SIZE = 200;
const STROKE_WIDTH = 10;
const RADIUS = (SIZE - STROKE_WIDTH) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

interface RestRingProps {
  progress: number; // 1 = full, 0 = empty
  secondsRemaining: number;
}

export function RestRing({ progress, secondsRemaining }: RestRingProps) {
  const animProgress = useSharedValue(progress);

  React.useEffect(() => {
    animProgress.value = withTiming(progress, {
      duration: 300,
      easing: Easing.linear,
    });
  }, [progress]);

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: CIRCUMFERENCE * (1 - animProgress.value),
  }));

  return (
    <View style={styles.container}>
      <Svg width={SIZE} height={SIZE} style={styles.svg}>
        {/* Track */}
        <Circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={RADIUS}
          stroke="#2A2A3A"
          strokeWidth={STROKE_WIDTH}
          fill="none"
        />
        {/* Progress arc */}
        <AnimatedCircle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={RADIUS}
          stroke="#FF6B2C"
          strokeWidth={STROKE_WIDTH}
          fill="none"
          strokeDasharray={CIRCUMFERENCE}
          animatedProps={animatedProps}
          strokeLinecap="round"
          rotation="-90"
          origin={`${SIZE / 2}, ${SIZE / 2}`}
        />
      </Svg>
      {/* Center seconds */}
      <View style={styles.centerLabel} pointerEvents="none">
        <Animated.Text style={styles.seconds}>{secondsRemaining}</Animated.Text>
        <Animated.Text style={styles.secLabel}>SEC</Animated.Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { width: SIZE, height: SIZE, alignItems: 'center', justifyContent: 'center' },
  svg: { position: 'absolute' },
  centerLabel: { alignItems: 'center', gap: 2 },
  seconds: {
    fontFamily: 'Anton',
    fontSize: 56,
    color: '#FFFFFF',
    letterSpacing: 1,
  },
  secLabel: {
    fontFamily: 'Inter',
    fontSize: 11,
    color: '#4A4A5A',
    fontWeight: '700',
    letterSpacing: 2,
  },
});
