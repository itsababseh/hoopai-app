import React, { useEffect } from 'react';
import { View } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withSequence, withTiming, withDelay, withSpring, Easing } from 'react-native-reanimated';
import { Colors } from '../../../constants/theme';
import { AppText } from '../../ui/Text';

type StepState = 'pending' | 'active' | 'complete';

interface Step {
  label: string;
  state: StepState;
}

interface Props { steps: Step[] }

function StepRow({ step, index }: { step: Step; index: number }) {
  const dotOpacity1 = useSharedValue(0.2);
  const dotOpacity2 = useSharedValue(0.2);
  const dotOpacity3 = useSharedValue(0.2);
  const checkScale = useSharedValue(0);
  const spinnerRotation = useSharedValue(0);

  useEffect(() => {
    if (step.state === 'active') {
      spinnerRotation.value = withRepeat(withTiming(360, { duration: 1200, easing: Easing.linear }), -1, false);
      dotOpacity1.value = withRepeat(withSequence(withTiming(1, { duration: 400 }), withTiming(0.2, { duration: 400 })), -1, false);
      dotOpacity2.value = withDelay(200, withRepeat(withSequence(withTiming(1, { duration: 400 }), withTiming(0.2, { duration: 400 })), -1, false));
      dotOpacity3.value = withDelay(400, withRepeat(withSequence(withTiming(1, { duration: 400 }), withTiming(0.2, { duration: 400 })), -1, false));
    } else if (step.state === 'complete') {
      checkScale.value = withSpring(1, { damping: 12, stiffness: 300 });
    }
  }, [step.state]);

  const spinStyle = useAnimatedStyle(() => ({ transform: [{ rotate: `${spinnerRotation.value}deg` }] }));
  const dot1Style = useAnimatedStyle(() => ({ opacity: dotOpacity1.value }));
  const dot2Style = useAnimatedStyle(() => ({ opacity: dotOpacity2.value }));
  const dot3Style = useAnimatedStyle(() => ({ opacity: dotOpacity3.value }));
  const checkStyle = useAnimatedStyle(() => ({ transform: [{ scale: checkScale.value }] }));

  return (
    <View style={{ height: 44, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        {/* Icon */}
        {step.state === 'pending' && (
          <View style={{ width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: Colors.textTertiary }} />
        )}
        {step.state === 'active' && (
          <Animated.View style={[{ width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: Colors.accent }, spinStyle]} />
        )}
        {step.state === 'complete' && (
          <View style={{ width: 20, height: 20, borderRadius: 10, backgroundColor: Colors.success, alignItems: 'center', justifyContent: 'center' }}>
            <Animated.Text style={[{ color: '#fff', fontSize: 11 }, checkStyle]}>✓</Animated.Text>
          </View>
        )}
        <AppText variant="body" style={{ fontSize: 15, color: step.state === 'active' ? Colors.textPrimary : step.state === 'complete' ? Colors.textSecondary : Colors.textTertiary }}>
          {step.label}
        </AppText>
      </View>
      {/* Right side */}
      {step.state === 'active' && (
        <View style={{ flexDirection: 'row', gap: 4 }}>
          <Animated.View style={[{ width: 4, height: 4, borderRadius: 2, backgroundColor: Colors.accent }, dot1Style]} />
          <Animated.View style={[{ width: 4, height: 4, borderRadius: 2, backgroundColor: Colors.accent }, dot2Style]} />
          <Animated.View style={[{ width: 4, height: 4, borderRadius: 2, backgroundColor: Colors.accent }, dot3Style]} />
        </View>
      )}
      {step.state === 'complete' && (
        <Animated.Text style={[{ color: Colors.success, fontSize: 16 }, checkStyle]}>✓</Animated.Text>
      )}
    </View>
  );
}

export function ProgressStepList({ steps }: Props) {
  return (
    <View style={{ paddingHorizontal: 24 }}>
      {steps.map((step, i) => <StepRow key={i} step={step} index={i} />)}
    </View>
  );
}
