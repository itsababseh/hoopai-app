import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withSpring,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

interface TrophyBurstProps {
  onAnimationComplete?: () => void;
}

interface Particle {
  id: number;
  x: number;
  y: number;
  color: string;
  size: number;
}

const COLORS = ['#FF6B2C', '#FFB547', '#00D4AA', '#4FACFE', '#FFFFFF'];

function makeParticles(count: number): Particle[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    x: (Math.random() - 0.5) * 280,
    y: -(Math.random() * 200 + 60),
    color: COLORS[i % COLORS.length],
    size: Math.random() * 8 + 4,
  }));
}

const PARTICLES = makeParticles(20);

function ParticleView({ particle, trigger }: { particle: Particle; trigger: boolean }) {
  const x = useSharedValue(0);
  const y = useSharedValue(0);
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0);

  useEffect(() => {
    if (!trigger) return;
    const delay = Math.random() * 200;
    x.value = withDelay(delay, withTiming(particle.x, { duration: 900 }));
    y.value = withDelay(delay, withTiming(particle.y, { duration: 900 }));
    opacity.value = withDelay(
      delay,
      withSequence(withTiming(1, { duration: 100 }), withDelay(500, withTiming(0, { duration: 300 })))
    );
    scale.value = withDelay(delay, withSpring(1, { damping: 8, stiffness: 200 }));
  }, [trigger]);

  const style = useAnimatedStyle(() => ({
    transform: [{ translateX: x.value }, { translateY: y.value }, { scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        style,
        {
          position: 'absolute',
          width: particle.size,
          height: particle.size,
          borderRadius: particle.size / 2,
          backgroundColor: particle.color,
        },
      ]}
    />
  );
}

export function TrophyBurst({ onAnimationComplete }: TrophyBurstProps) {
  const [triggered, setTriggered] = React.useState(false);
  const trophyScale = useSharedValue(0);
  const trophyOpacity = useSharedValue(0);
  const glowOpacity = useSharedValue(0);

  useEffect(() => {
    const fireHaptic = async () => {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    };

    trophyScale.value = withSpring(1, { damping: 10, stiffness: 120 }, () => {
      runOnJS(setTriggered)(true);
      runOnJS(fireHaptic)();
      if (onAnimationComplete) {
        runOnJS(onAnimationComplete)();
      }
    });
    trophyOpacity.value = withTiming(1, { duration: 300 });
    glowOpacity.value = withDelay(200, withTiming(1, { duration: 600 }));
  }, []);

  const trophyStyle = useAnimatedStyle(() => ({
    transform: [{ scale: trophyScale.value }],
    opacity: trophyOpacity.value,
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
  }));

  return (
    <View style={styles.container}>
      {/* Glow ring */}
      <Animated.View style={[styles.glow, glowStyle]} />

      {/* Particles */}
      {PARTICLES.map((p) => (
        <ParticleView key={p.id} particle={p} trigger={triggered} />
      ))}

      {/* Trophy */}
      <Animated.View style={[styles.trophyWrap, trophyStyle]}>
        <Text style={styles.trophy}>🏆</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 180,
    height: 180,
    alignItems: 'center',
    justifyContent: 'center',
  },
  glow: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: '#FF6B2C40',
    shadowColor: '#FF6B2C',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 40,
    elevation: 12,
  },
  trophyWrap: { zIndex: 10 },
  trophy: { fontSize: 80 },
});
