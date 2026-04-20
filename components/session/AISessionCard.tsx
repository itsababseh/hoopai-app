import React, { useEffect, useRef } from 'react';
import { View, Pressable, Dimensions, ScrollView } from 'react-native';
import Animated, {
  useSharedValue, useAnimatedStyle, withRepeat, withSequence,
  withTiming, withSpring, interpolateColor, Easing,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Colors } from '../../constants/theme';
import { getReadinessTheme } from '../../utils/readinessTheme';
import { GeneratedSession } from '../../constants/sessionTypes';
import { AppText } from '../ui/Text';
import { Skeleton } from '../ui/Skeleton';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface Props {
  session: GeneratedSession | null;
  status: 'idle' | 'generating' | 'ready' | 'error';
  readinessScore: number;
  onStart: () => void;
  onRegenerate: () => void;
  onDrillPress?: (drillId: string) => void;
  regenCount: number;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function AISessionCard({ session, status, readinessScore, onStart, onRegenerate, onDrillPress, regenCount }: Props) {
  const theme = getReadinessTheme(readinessScore);
  const [expanded, setExpanded] = React.useState(false);

  // Generating animations
  const borderOpacity = useSharedValue(0);
  const shimmerX = useSharedValue(-SCREEN_WIDTH);
  const dotScale = useSharedValue(1);
  const cardOpacity = useSharedValue(0);
  const cardScale = useSharedValue(0.97);
  const chevronRotation = useSharedValue(0);
  const startScale = useSharedValue(1);

  useEffect(() => {
    if (status === 'generating') {
      borderOpacity.value = withRepeat(withSequence(
        withTiming(1, { duration: 1000, easing: Easing.inOut(Easing.sin) }),
        withTiming(0, { duration: 1000, easing: Easing.inOut(Easing.sin) }),
      ), -1, false);
      shimmerX.value = withRepeat(
        withTiming(SCREEN_WIDTH, { duration: 1600, easing: Easing.linear }),
        -1, false
      );
      dotScale.value = withRepeat(withSequence(
        withTiming(1.3, { duration: 400 }),
        withTiming(1.0, { duration: 400 }),
      ), -1, false);
    } else if (status === 'ready') {
      borderOpacity.value = withTiming(0, { duration: 300 });
      cardOpacity.value = withSpring(1, { damping: 20, stiffness: 300 });
      cardScale.value = withSpring(1, { damping: 20, stiffness: 300 });
    }
  }, [status]);

  const borderStyle = useAnimatedStyle(() => ({
    borderColor: interpolateColor(borderOpacity.value, [0, 1], ['#2A2A3A', '#FF6B2C66']),
    borderWidth: 1,
  }));
  const shimmerStyle = useAnimatedStyle(() => ({ transform: [{ translateX: shimmerX.value }] }));
  const dotStyle = useAnimatedStyle(() => ({ transform: [{ scale: dotScale.value }] }));
  const readyStyle = useAnimatedStyle(() => ({ opacity: cardOpacity.value, transform: [{ scale: cardScale.value }] }));
  const chevronStyle = useAnimatedStyle(() => ({ transform: [{ rotate: `${chevronRotation.value}deg` }] }));
  const startScaleStyle = useAnimatedStyle(() => ({ transform: [{ scale: startScale.value }] }));

  const toggleExpand = () => {
    setExpanded(e => !e);
    chevronRotation.value = withSpring(expanded ? 0 : 180, { damping: 15, stiffness: 200 });
  };

  const handleStart = () => {
    startScale.value = withSequence(
      withSpring(0.97, { damping: 6, stiffness: 600 }),
      withSpring(1.0, { damping: 10, stiffness: 300 }),
    );
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onStart();
  };

  const handleRegen = () => {
    if (regenCount >= 3) return;
    Haptics.selectionAsync();
    onRegenerate();
  };

  if (status === 'generating') {
    return (
      <Animated.View style={[{ borderRadius: 16, overflow: 'hidden', backgroundColor: Colors.surface, height: 168 }, borderStyle]}>
        <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, padding: 20 }}>
          {/* Header row */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <AppText variant="label" style={{ color: Colors.accent, opacity: 0.8, letterSpacing: 2 }}>AI BUILDING</AppText>
            <Animated.View style={[{ width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.accent }, dotStyle]} />
          </View>
          <View style={{ marginTop: 12 }}>
            <Skeleton width="60%" height={14} borderRadius={7} />
            <View style={{ marginTop: 8 }}>
              <Skeleton width="40%" height={10} borderRadius={5} />
            </View>
          </View>
          <View style={{ flexDirection: 'row', gap: 16, marginTop: 20 }}>
            <Skeleton width={72} height={28} borderRadius={14} />
            <Skeleton width={72} height={28} borderRadius={14} />
          </View>
          <View style={{ marginTop: 16 }}>
            <Skeleton width="100%" height={48} borderRadius={12} />
          </View>
        </View>
        {/* Shimmer */}
        <Animated.View style={[{ position: 'absolute', top: 0, bottom: 0, width: SCREEN_WIDTH * 0.5 }, shimmerStyle]}
          pointerEvents="none">
          <View style={{ flex: 1, background: 'linear-gradient(90deg, transparent, #FFFFFF0A, #FFFFFF14, #FFFFFF0A, transparent)' }} />
        </Animated.View>
      </Animated.View>
    );
  }

  if (status === 'error') {
    return (
      <View style={{ borderRadius: 16, backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border, height: 100, alignItems: 'center', justifyContent: 'center' }}>
        <AppText variant="body" style={{ color: Colors.textSecondary }}>Couldn't generate session</AppText>
        <Pressable onPress={onRegenerate} style={{ marginTop: 8 }}>
          <AppText variant="body" style={{ color: Colors.accent }}>Try again</AppText>
        </Pressable>
      </View>
    );
  }

  if (!session || status !== 'ready') return null;

  return (
    <Animated.View style={[{ borderRadius: 16, backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border, overflow: 'hidden' }, readyStyle]}>
      <Pressable onPress={toggleExpand}>
        <View style={{ padding: 20 }}>
          {/* Header */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <View style={{ paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4, backgroundColor: theme.colorGlow, borderWidth: 1, borderColor: theme.colorBorder }}>
              <AppText variant="label" style={{ color: theme.color, letterSpacing: 1.5 }}>{theme.intensityLabel}</AppText>
            </View>
            <Animated.View style={chevronStyle}>
              <AppText variant="body" style={{ color: Colors.textTertiary }}>⌄</AppText>
            </Animated.View>
          </View>
          {/* Title */}
          <AppText variant="heading" style={{ fontSize: 22, marginTop: 10, fontFamily: 'Anton_400Regular' }} numberOfLines={1}>{session.title}</AppText>
          <AppText variant="body" style={{ marginTop: 4, fontSize: 13 }} numberOfLines={1}>{session.subtitle}</AppText>
          {/* Metrics */}
          <View style={{ flexDirection: 'row', gap: 16, marginTop: 14 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <AppText style={{ color: Colors.textTertiary, fontSize: 14 }}>⏱</AppText>
              <AppText variant="title" style={{ fontSize: 14 }}>{session.estimatedDuration}</AppText>
              <AppText variant="body" style={{ fontSize: 12 }}>min</AppText>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <AppText style={{ color: Colors.textTertiary, fontSize: 14 }}>⚡</AppText>
              <AppText variant="title" style={{ fontSize: 14 }}>{session.drills.length}</AppText>
              <AppText variant="body" style={{ fontSize: 12 }}>drills</AppText>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <AppText style={{ color: theme.color, fontSize: 14 }}>🔥</AppText>
              <AppText variant="title" style={{ fontSize: 14, color: theme.color }}>{theme.labelShort}</AppText>
            </View>
          </View>
        </View>
      </Pressable>

      {/* Expanded drill list */}
      {expanded && (
        <View style={{ borderTopWidth: 1, borderTopColor: Colors.border, paddingHorizontal: 20, paddingBottom: 4 }}>
          {session.drills.map((drill, i) => (
            <Pressable key={drill.id} onPress={() => onDrillPress?.(drill.drillId)}
              style={{ flexDirection: 'row', height: 44, alignItems: 'center', borderBottomWidth: i < session.drills.length - 1 ? 1 : 0, borderBottomColor: Colors.border }}>
              <View style={{ width: 24, height: 24, borderRadius: 12, backgroundColor: Colors.surface2, alignItems: 'center', justifyContent: 'center' }}>
                <AppText variant="label" style={{ fontSize: 11, color: Colors.textSecondary }}>{i + 1}</AppText>
              </View>
              <AppText variant="title" style={{ flex: 1, marginLeft: 10, fontSize: 14 }} numberOfLines={1}>{drill.drillName}</AppText>
              <AppText variant="body" style={{ fontSize: 12 }}>{drill.targetSets}×{drill.reps}</AppText>
              <AppText style={{ color: Colors.textTertiary, marginLeft: 8, fontSize: 12 }}>›</AppText>
            </Pressable>
          ))}
          {regenCount < 3 && (
            <Pressable onPress={handleRegen} style={{ alignSelf: 'flex-end', flexDirection: 'row', alignItems: 'center', gap: 4, paddingVertical: 12 }}>
              <AppText style={{ color: Colors.textTertiary, fontSize: 13 }}>↻</AppText>
              <AppText variant="body" style={{ color: Colors.textTertiary, fontSize: 13 }}>Regenerate</AppText>
            </Pressable>
          )}
        </View>
      )}

      {/* CTA */}
      <View style={{ paddingHorizontal: 20, paddingBottom: 20, paddingTop: expanded ? 0 : 4 }}>
        <AnimatedPressable onPress={handleStart} style={[{ height: 48, borderRadius: 12, backgroundColor: Colors.accent, alignItems: 'center', justifyContent: 'center' }, startScaleStyle]}>
          <AppText variant="title" style={{ color: '#FFFFFF', fontSize: 16, fontFamily: 'Inter_700Bold' }}>Start Session</AppText>
        </AnimatedPressable>
      </View>
    </Animated.View>
  );
}
