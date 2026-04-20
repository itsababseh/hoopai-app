import React, { useEffect, useState } from 'react';
import { View, Pressable, SafeAreaView } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, withSpring, withDelay, FadeIn, FadeOut } from 'react-native-reanimated';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Colors } from '../../constants/theme';
import { AppText } from '../../components/ui/Text';
import { ProgressStepList } from '../../components/session/generation/ProgressStepList';
import { useUserStore } from '../../stores/userStore';
import { useSessionStore } from '../../stores/sessionStore';
import { useActiveSessionStore } from '../../stores/activeSessionStore';
import { generateSession } from '../../utils/sessionGenerator';
import { getReadinessTheme } from '../../utils/readinessTheme';

type StepState = 'pending' | 'active' | 'complete';

const STEP_LABELS = [
  'Analyzing readiness score',
  'Building drill sequence',
  'Optimizing session intensity',
  'Finalizing your session',
];

const STEP_DURATIONS = [700, 900, 800, 600];

export default function GenerateSessionScreen() {
  const { profile } = useUserStore();
  const { todayCheckIn, history } = useSessionStore();
  const { setCurrentSession, currentSession } = useActiveSessionStore();
  const [stepStates, setStepStates] = useState<StepState[]>(['active', 'pending', 'pending', 'pending']);
  const [done, setDone] = useState(false);

  const readinessScore = todayCheckIn?.readinessScore ?? 70;
  const theme = getReadinessTheme(readinessScore);

  const stepsOpacity = useSharedValue(1);
  const stepsY = useSharedValue(0);
  const readyOpacity = useSharedValue(0);
  const readyY = useSharedValue(40);

  // Run generation steps
  useEffect(() => {
    let elapsed = 0;
    STEP_DURATIONS.forEach((dur, i) => {
      setTimeout(() => {
        setStepStates(prev => {
          const next = [...prev];
          if (i > 0) next[i - 1] = 'complete';
          next[i] = i === STEP_DURATIONS.length - 1 ? 'complete' : 'active';
          if (i === STEP_DURATIONS.length - 1) {
            // All done — generate and transition
            const recentDrillIds = history.slice(-7).flatMap(s =>
              (s as any).drillIds ?? []
            );
            const session = generateSession({
              readinessScore,
              energyLevel: todayCheckIn?.energyLevel ?? 5,
              sorenessLevel: todayCheckIn?.sorenessLevel ?? 3,
              sleepQuality: todayCheckIn?.sleepScore ? Math.round(todayCheckIn.sleepScore / 20) : 3,
              position: profile?.position ?? 'PG',
              skillLevel: (profile?.level ?? 'intermediate') as any,
              primaryGoal: (profile?.primaryGoal ?? 'scoring') as any,
              sessionDurationPref: (profile?.sessionDuration ?? 45) as any,
              recentDrillIds,
              streakCount: 0,
            });
            setCurrentSession(session);

            setTimeout(() => {
              stepsOpacity.value = withTiming(0, { duration: 250 });
              stepsY.value = withTiming(20, { duration: 250 });
              setTimeout(() => {
                setDone(true);
                readyOpacity.value = withSpring(1, { damping: 18, stiffness: 200 });
                readyY.value = withSpring(0, { damping: 18, stiffness: 200 });
              }, 400);
            }, 600);
          }
          return next;
        });
      }, elapsed);
      elapsed += dur;
    });
  }, []);

  const stepsStyle = useAnimatedStyle(() => ({ opacity: stepsOpacity.value, transform: [{ translateY: stepsY.value }] }));
  const readyStyle = useAnimatedStyle(() => ({ opacity: readyOpacity.value, transform: [{ translateY: readyY.value }] }));

  const steps = STEP_LABELS.map((label, i) => ({ label, state: stepStates[i] }));

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.background }}>
      {/* Pill handle */}
      <View style={{ alignItems: 'center', paddingTop: 12 }}>
        <View style={{ width: 32, height: 4, borderRadius: 2, backgroundColor: Colors.border }} />
      </View>

      {/* Court animation placeholder */}
      <View style={{ alignSelf: 'center', marginTop: 40, width: 320, height: 160, borderRadius: 12, backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border, alignItems: 'center', justifyContent: 'center' }}>
        <AppText style={{ color: Colors.accent, fontSize: 40 }}>🏀</AppText>
        <AppText variant="label" style={{ color: Colors.textTertiary, marginTop: 8 }}>NEURAL COURT</AppText>
      </View>

      {/* Header */}
      <View style={{ alignItems: 'center', marginTop: 32, paddingHorizontal: 24 }}>
        <AppText variant="display" style={{ fontSize: 32, textAlign: 'center' }}>Building Your Session</AppText>
        <AppText variant="body" style={{ marginTop: 8, textAlign: 'center' }}>
          Personalized for{' '}
          <AppText variant="body" style={{ color: theme.color }}>{readinessScore}</AppText>
          {' '}readiness · {profile?.primaryGoal ?? 'training'} focus
        </AppText>
      </View>

      {/* Progress steps */}
      {!done && (
        <Animated.View style={[{ marginTop: 40 }, stepsStyle]}>
          <ProgressStepList steps={steps} />
        </Animated.View>
      )}

      {/* Session Ready */}
      {done && currentSession && (
        <Animated.View style={[{ marginTop: 40, paddingHorizontal: 24 }, readyStyle]}>
          {/* Readiness badge */}
          <View style={{ alignSelf: 'center', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6, backgroundColor: theme.colorGlow, borderWidth: 1, borderColor: theme.colorBorder }}>
            <AppText variant="label" style={{ color: theme.color, fontSize: 12 }}>Adjusted for {readinessScore} readiness</AppText>
          </View>

          {/* Session title */}
          <AppText variant="display" style={{ fontSize: 36, textAlign: 'center', marginTop: 16 }}>{currentSession.title}</AppText>
          <AppText variant="body" style={{ textAlign: 'center', fontSize: 16, marginTop: 8 }}>{currentSession.coachingMessage}</AppText>

          {/* Stats */}
          <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 24, marginTop: 24 }}>
            {[
              { icon: '⏱', value: String(currentSession.estimatedDuration), label: 'Duration' },
              { icon: '🎯', value: String(currentSession.drills.length), label: 'Drills' },
              { icon: '🔥', value: theme.labelShort, label: 'Intensity', color: theme.color },
            ].map(stat => (
              <View key={stat.label} style={{ alignItems: 'center', gap: 4 }}>
                <AppText style={{ fontSize: 18, color: stat.color ?? Colors.textTertiary }}>{stat.icon}</AppText>
                <AppText variant="heading" style={{ fontSize: 16, color: stat.color ?? Colors.textPrimary }}>{stat.value}</AppText>
                <AppText variant="label" style={{ fontSize: 12, color: Colors.textSecondary }}>{stat.label}</AppText>
              </View>
            ))}
          </View>

          {/* Divider */}
          <View style={{ height: 1, backgroundColor: Colors.border, marginTop: 24 }} />

          {/* CTA */}
          <Pressable
            onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy); router.replace('/session/active'); }}
            style={{ marginTop: 24, height: 56, borderRadius: 16, backgroundColor: Colors.accent, alignItems: 'center', justifyContent: 'center' }}>
            <AppText variant="display" style={{ fontSize: 20, letterSpacing: 1, color: '#fff' }}>LET'S WORK</AppText>
          </Pressable>
        </Animated.View>
      )}
    </SafeAreaView>
  );
}
