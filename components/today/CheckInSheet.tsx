import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Text } from '../ui/Text';
import { Button } from '../ui/Button';
import { ProgressRing } from '../ui/ProgressRing';
import { useSessionStore, type CheckInData } from '../../stores/sessionStore';
import { computeReadiness } from '../../utils/readiness';
import { Colors, Fonts, Spacing, Radius } from '../../constants/theme';

interface CheckInSheetProps {
  onClose: () => void;
  existingData: CheckInData | null;
}

interface SliderProps {
  label: string;
  sublabel: string;
  value: number;
  min?: number;
  max?: number;
  step?: number;
  onChange: (v: number) => void;
  formatValue?: (v: number) => string;
}

function HapticSlider({ label, sublabel, value, min = 1, max = 10, step = 1, onChange, formatValue }: SliderProps) {
  const dotPositions = Array.from({ length: (max - min) / step + 1 }, (_, i) => min + i * step);

  return (
    <View style={sliderStyles.container}>
      <View style={sliderStyles.header}>
        <View>
          <Text style={sliderStyles.label}>{label}</Text>
          <Text style={sliderStyles.sublabel}>{sublabel}</Text>
        </View>
        <View style={sliderStyles.valueBadge}>
          <Text style={sliderStyles.valueText}>{formatValue ? formatValue(value) : value}</Text>
        </View>
      </View>
      <View style={sliderStyles.track}>
        {dotPositions.map(v => (
          <TouchableOpacity
            key={v}
            style={[sliderStyles.dot, value >= v && sliderStyles.dotFilled, value === v && sliderStyles.dotActive]}
            onPress={() => {
              Haptics.selectionAsync();
              onChange(v);
            }}
          />
        ))}
      </View>
      <View style={sliderStyles.labels}>
        <Text style={sliderStyles.minLabel}>{min}</Text>
        <Text style={sliderStyles.maxLabel}>{max}</Text>
      </View>
    </View>
  );
}

export function CheckInSheet({ onClose, existingData }: CheckInSheetProps) {
  const setTodayCheckIn = useSessionStore(s => s.setTodayCheckIn);

  const [energy, setEnergy]    = useState(existingData?.energyLevel ?? 7);
  const [soreness, setSoreness] = useState(existingData?.soreness ?? 3);
  const [sleep, setSleep]       = useState(existingData?.sleepHours ?? 7);

  const readiness = computeReadiness({ energyLevel: energy, soreness, sleepHours: sleep });

  const handleSave = async () => {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    await setTodayCheckIn({
      date: new Date().toISOString().split('T')[0],
      energyLevel: energy,
      soreness,
      sleepHours: sleep,
      readiness,
    });
    onClose();
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <Text style={styles.title}>Daily Check-In</Text>
      <Text style={styles.subtitle}>How's your body feeling today?</Text>

      {/* Live readiness preview */}
      <View style={styles.readinessPreview}>
        <ProgressRing score={readiness.score} size={88} strokeWidth={6} color={readiness.color} label="SCORE" />
        <View style={styles.readinessText}>
          <Text style={[styles.readinessLabel, { color: readiness.color }]}>{readiness.label}</Text>
          <Text style={styles.readinessExplanation} numberOfLines={3}>{readiness.explanation}</Text>
          <Text style={styles.intensityLine}>
            Recommended intensity: <Text style={{ color: readiness.color }}>{readiness.recommendedIntensity}%</Text>
          </Text>
        </View>
      </View>

      {/* Sliders */}
      <HapticSlider
        label="Energy Level"
        sublabel="How energized do you feel?"
        value={energy}
        onChange={setEnergy}
      />
      <HapticSlider
        label="Muscle Soreness"
        sublabel="Any pain or tightness? (10 = very sore)"
        value={soreness}
        onChange={setSoreness}
      />
      <HapticSlider
        label="Sleep Last Night"
        sublabel="Hours slept"
        value={sleep}
        min={3}
        max={11}
        step={0.5}
        onChange={setSleep}
        formatValue={v => `${v}h`}
      />

      <Button label="Save Check-In" variant="primary" size="lg" style={styles.btn} onPress={handleSave} />
      <View style={{ height: 32 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingHorizontal: Spacing.lg, gap: Spacing.lg, paddingTop: Spacing.md },
  title: { fontFamily: Fonts.interBold, fontSize: 22, color: Colors.textPrimary },
  subtitle: { fontFamily: Fonts.inter, fontSize: 14, color: Colors.textSecondary, marginTop: -8 },
  readinessPreview: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.md,
    backgroundColor: Colors.surface2, borderRadius: Radius.lg,
    padding: Spacing.md, borderWidth: 1, borderColor: Colors.border,
  },
  readinessText: { flex: 1, gap: 4 },
  readinessLabel: { fontFamily: Fonts.interBold, fontSize: 20 },
  readinessExplanation: { fontFamily: Fonts.inter, fontSize: 13, color: Colors.textSecondary, lineHeight: 18 },
  intensityLine: { fontFamily: Fonts.interSemi, fontSize: 12, color: Colors.textTertiary },
  btn: { width: '100%' },
});

const sliderStyles = StyleSheet.create({
  container: {
    backgroundColor: Colors.surface, borderRadius: Radius.md,
    borderWidth: 1, borderColor: Colors.border, padding: Spacing.md, gap: 12,
  },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  label: { fontFamily: Fonts.interSemi, fontSize: 15, color: Colors.textPrimary },
  sublabel: { fontFamily: Fonts.inter, fontSize: 12, color: Colors.textTertiary },
  valueBadge: {
    backgroundColor: Colors.accent + '20', borderRadius: Radius.full,
    paddingHorizontal: 12, paddingVertical: 4, borderWidth: 1, borderColor: Colors.accent + '40',
  },
  valueText: { fontFamily: Fonts.interBold, fontSize: 16, color: Colors.accent },
  track: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 4 },
  dot: {
    width: 18, height: 18, borderRadius: 9,
    backgroundColor: Colors.surface2, borderWidth: 1, borderColor: Colors.border,
  },
  dotFilled: { backgroundColor: Colors.accent + '40', borderColor: Colors.accent + '80' },
  dotActive: { backgroundColor: Colors.accent, borderColor: Colors.accent, transform: [{ scale: 1.25 }] },
  labels: { flexDirection: 'row', justifyContent: 'space-between' },
  minLabel: { fontFamily: Fonts.inter, fontSize: 11, color: Colors.textTertiary },
  maxLabel: { fontFamily: Fonts.inter, fontSize: 11, color: Colors.textTertiary },
});
