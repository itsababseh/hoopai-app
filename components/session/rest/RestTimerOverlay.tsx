import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { RestRing } from './RestRing';
import { BreathingCue } from './BreathingCue';
import { NextDrillPreview } from './NextDrillPreview';
import { useRestTimer } from '../../../hooks/useRestTimer';
import { DrillItem } from '../../../constants/sessionTypes';

interface RestTimerOverlayProps {
  visible: boolean;
  durationSeconds: number;
  nextDrill: DrillItem | undefined;
  onComplete: () => void;
  onSkip: () => void;
}

export function RestTimerOverlay({
  visible,
  durationSeconds,
  nextDrill,
  onComplete,
  onSkip,
}: RestTimerOverlayProps) {
  const insets = useSafeAreaInsets();
  const opacity = useSharedValue(0);

  const { secondsRemaining, progress, skip } = useRestTimer({
    durationSeconds,
    onComplete,
    autoStart: visible,
  });

  React.useEffect(() => {
    opacity.value = withTiming(visible ? 1 : 0, { duration: 250 });
  }, [visible]);

  const overlayStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    pointerEvents: opacity.value > 0 ? 'auto' : 'none',
  }));

  const skippedRef = useRef(false);
  const handleSkip = () => {
    if (skippedRef.current) return;
    skippedRef.current = true;
    skip();
    onSkip();
  };

  return (
    <Animated.View
      style={[
        styles.overlay,
        overlayStyle,
        { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 20 },
      ]}
    >
      <Text style={styles.title}>REST</Text>

      <RestRing progress={progress} secondsRemaining={secondsRemaining} />

      <BreathingCue />

      {nextDrill && <NextDrillPreview drill={nextDrill} />}

      <TouchableOpacity
        style={styles.skipBtn}
        onPress={handleSkip}
        accessibilityRole="button"
        accessibilityLabel="Skip rest"
      >
        <Text style={styles.skipText}>Skip Rest  →</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#0A0A0F',
    alignItems: 'center',
    justifyContent: 'space-evenly',
    gap: 24,
    zIndex: 100,
  },
  title: {
    fontFamily: 'Anton',
    fontSize: 13,
    color: '#4A4A5A',
    letterSpacing: 5,
  },
  skipBtn: {
    borderWidth: 1,
    borderColor: '#2A2A3A',
    borderRadius: 30,
    paddingVertical: 12,
    paddingHorizontal: 28,
  },
  skipText: {
    fontFamily: 'Inter',
    fontSize: 14,
    color: '#8A8A9A',
    fontWeight: '600',
    letterSpacing: 0.5,
  },
});
