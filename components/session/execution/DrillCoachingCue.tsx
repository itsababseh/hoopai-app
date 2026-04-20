import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  Easing,
} from 'react-native-reanimated';

interface DrillCoachingCueProps {
  cues: string[];
  activeCueIndex?: number;
}

export const DrillCoachingCue = React.memo<DrillCoachingCueProps>(
  ({ cues, activeCueIndex = 0 }) => {
    const opacity = useSharedValue(0);
    const translateY = useSharedValue(8);

    useEffect(() => {
      opacity.value = withSequence(
        withTiming(0, { duration: 100, easing: Easing.out(Easing.ease) }),
        withTiming(1, { duration: 300, easing: Easing.out(Easing.ease) })
      );
      translateY.value = withSequence(
        withTiming(8, { duration: 100 }),
        withTiming(0, { duration: 300, easing: Easing.out(Easing.ease) })
      );
    }, [activeCueIndex]);

    const animStyle = useAnimatedStyle(() => ({
      opacity: opacity.value,
      transform: [{ translateY: translateY.value }],
    }));

    if (!cues || cues.length === 0) return null;

    const activeCue = cues[activeCueIndex % cues.length];

    return (
      <View style={styles.container}>
        <Text style={styles.label}>COACHING CUE</Text>
        <Animated.View style={[styles.cueBox, animStyle]}>
          <Text style={styles.cueText}>{activeCue}</Text>
        </Animated.View>
        {cues.length > 1 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.chips}
          >
            {cues.map((cue, i) => (
              <View
                key={i}
                style={[styles.chip, i === activeCueIndex % cues.length && styles.chipActive]}
              >
                <Text
                  style={[
                    styles.chipText,
                    i === activeCueIndex % cues.length && styles.chipTextActive,
                  ]}
                  numberOfLines={1}
                >
                  {cue}
                </Text>
              </View>
            ))}
          </ScrollView>
        )}
      </View>
    );
  }
);

DrillCoachingCue.displayName = 'DrillCoachingCue';

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  label: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.5,
    color: '#6B7280',
  },
  cueBox: {
    backgroundColor: '#1F2937',
    borderRadius: 12,
    padding: 14,
    borderLeftWidth: 3,
    borderLeftColor: '#F97316',
  },
  cueText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#F9FAFB',
    lineHeight: 22,
  },
  chips: {
    flexDirection: 'row',
    gap: 8,
    paddingBottom: 4,
  },
  chip: {
    backgroundColor: '#374151',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    maxWidth: 160,
  },
  chipActive: {
    backgroundColor: '#F97316',
  },
  chipText: {
    fontSize: 12,
    color: '#9CA3AF',
    fontWeight: '500',
  },
  chipTextActive: {
    color: '#FFFFFF',
  },
});
