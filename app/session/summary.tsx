import React, { useEffect } from 'react';
import { View, Pressable, SafeAreaView, ScrollView } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, withDelay, withSpring, Easing, useDerivedValue } from 'react-native-reanimated';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Colors } from '../../constants/theme';
import { AppText } from '../../components/ui/Text';
import { ProgressRing } from '../../components/ui/ProgressRing';
import { useActiveSessionStore } from '../../stores/activeSessionStore';
import { useSessionStore } from '../../stores/sessionStore';
import { getReadinessTheme } from '../../utils/readinessTheme';
import { getXPForSession } from '../../utils/sessionGenerator';
import { MILESTONE_DAYS } from '../../constants/sessionTypes';

function useCountUp(target: number, duration: number, delay: number) {
  const counter = useSharedValue(0);
  useEffect(() => {
    counter.value = withDelay(delay, withTiming(target, { duration, easing: Easing.out(Easing.cubic) }));
  }, [target]);
  return useDerivedValue(() => Math.round(counter.value).toString());
}

export default function SessionSummaryScreen() {
  const { todayResult, currentSession } = useActiveSessionStore();
  const { streak } = useSessionStore();
  const theme = getReadinessTheme(todayResult?.readinessScore ?? 70);

  const earnedXP = todayResult ? getXPForSession({
    completedDrills: todayResult.completedDrills,
    intensityLevel: todayResult.intensityLevel,
    streakCount: todayResult.streakAtCompletion,
  }) : 0;

  const xpDisplay = useCountUp(earnedXP, 1200, 500);
  const xpRing = useSharedValue(0);
  const streakScale = useSharedValue(0.85);
  const cardOpacity = useSharedValue(0);

  useEffect(() => {
    xpRing.value = withDelay(400, withTiming(Math.min(earnedXP / 200, 1), { duration: 1200, easing: Easing.out(Easing.cubic) }));
    streakScale.value = withDelay(800, withSpring(1, { damping: 10, stiffness: 200 }));
    cardOpacity.value = withTiming(1, { duration: 400 });
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }, []);

  const streakStyle = useAnimatedStyle(() => ({ transform: [{ scale: streakScale.value }] }));
  const cardStyle = useAnimatedStyle(() => ({ opacity: cardOpacity.value }));

  const isMilestone = MILESTONE_DAYS.includes(streak);
  const totalMinutes = Math.round((todayResult?.actualDuration ?? 0) / 60);

  const stats = [
    { icon: '⏱', value: `${totalMinutes || currentSession?.estimatedDuration || 0}`, label: 'Minutes' },
    { icon: '🎯', value: String(todayResult?.completedDrills ?? 0), label: 'Drills Done' },
    { icon: '🔁', value: String(todayResult?.totalSetsCompleted ?? 0), label: 'Sets Total' },
    { icon: '🔥', value: theme.labelShort, label: 'Intensity', color: theme.color },
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.background }}>
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Header */}
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 24, paddingTop: 16 }}>
          <Pressable onPress={() => router.replace('/(tabs)/today')}>
            <AppText style={{ color: Colors.textSecondary, fontSize: 20 }}>‹</AppText>
          </Pressable>
          <AppText variant="title" style={{ fontSize: 16 }}>Session Summary</AppText>
          <View style={{ width: 20 }} />
        </View>

        {/* XP Hero */}
        <View style={{ alignItems: 'center', marginTop: 32 }}>
          <View style={{ width: 140, height: 140, alignItems: 'center', justifyContent: 'center' }}>
            <ProgressRing size={140} progress={Math.min(earnedXP / 200, 1)} color={Colors.accent} strokeWidth={5} />
            <View style={{ position: 'absolute', alignItems: 'center' }}>
              <Animated.Text style={{ fontFamily: 'Anton_400Regular', fontSize: 42, color: Colors.accent }}>
                {xpDisplay.value}
              </Animated.Text>
            </View>
          </View>
          <AppText variant="label" style={{ color: Colors.textSecondary, marginTop: 4 }}>+XP EARNED</AppText>
          <AppText variant="label" style={{ color: Colors.textTertiary, marginTop: 4, letterSpacing: 2 }}>XP EARNED</AppText>
        </View>

        {/* Stats Grid */}
        <Animated.View style={[{ marginTop: 32, paddingHorizontal: 16 }, cardStyle]}>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
            {stats.map(stat => (
              <View key={stat.label} style={{ width: (W - 44) / 2, backgroundColor: Colors.surface, borderRadius: 16, padding: 20, borderWidth: 1, borderColor: Colors.border }}>
                <AppText style={{ color: Colors.textTertiary, fontSize: 20 }}>{stat.icon}</AppText>
                <AppText variant="display" style={{ fontSize: 32, marginTop: 12, color: stat.color ?? Colors.textPrimary }}>{stat.value}</AppText>
                <AppText variant="body" style={{ fontSize: 13, marginTop: 4 }}>{stat.label}</AppText>
              </View>
            ))}
          </View>
        </Animated.View>

        {/* Streak */}
        <View style={{ marginTop: 16, marginHorizontal: 16 }}>
          <Animated.View style={[{
            backgroundColor: Colors.surface,
            borderRadius: 16, padding: 20,
            borderWidth: 1,
            borderColor: streak > 0 ? '#FFB54744' : Colors.border,
          }, streakStyle]}>
            {streak > 0 ? (
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <AppText style={{ fontSize: 28, color: Colors.warning }}>🔥</AppText>
                <AppText variant="display" style={{ fontSize: 36, color: Colors.warning, marginLeft: 8 }}>{streak}</AppText>
                <View style={{ marginLeft: 12 }}>
                  <AppText variant="title" style={{ fontSize: 15 }}>Day Streak</AppText>
                  <AppText variant="body" style={{ fontSize: 13, marginTop: 2 }}>
                    {isMilestone ? `🏆 Day ${streak} milestone!` : 'Keep it going!'}
                  </AppText>
                </View>
                <AppText style={{ marginLeft: 'auto', fontSize: 20 }}>✨</AppText>
              </View>
            ) : (
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <AppText style={{ fontSize: 28, opacity: 0.4 }}>🔥</AppText>
                <View style={{ marginLeft: 12 }}>
                  <AppText variant="title" style={{ color: Colors.textSecondary, fontSize: 15 }}>Streak Reset</AppText>
                  <AppText variant="body" style={{ fontSize: 13, marginTop: 2 }}>Start a new streak today</AppText>
                </View>
              </View>
            )}
          </Animated.View>
        </View>

        {/* Back CTA */}
        <View style={{ marginTop: 24, marginHorizontal: 16 }}>
          <Pressable onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); router.replace('/(tabs)/today'); }}
            style={{ height: 56, borderRadius: 16, backgroundColor: Colors.accent, alignItems: 'center', justifyContent: 'center' }}>
            <AppText variant="display" style={{ fontSize: 20, color: '#fff' }}>Back to Home</AppText>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const W = Dimensions.get('window').width;
import { Dimensions } from 'react-native';
