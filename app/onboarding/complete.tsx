import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withSpring,
  Easing,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Button } from '../../components/ui/Button';
import { Text } from '../../components/ui/Text';
import { useUserStore } from '../../stores/userStore';
import { Colors, Fonts, Spacing } from '../../constants/theme';
import type { Position, SkillLevel, TrainingGoal } from '../../constants/programs';

export default function CompleteScreen() {
  const params = useLocalSearchParams<{
    name: string; position: string; level: string; goal: string;
    days: string; duration: string; hasHealth: string;
  }>();
  const setProfile = useUserStore(s => s.setProfile);

  const checkScale   = useSharedValue(0);
  const titleOpacity = useSharedValue(0);
  const titleY       = useSharedValue(20);
  const btnOpacity   = useSharedValue(0);

  useEffect(() => {
    checkScale.value   = withDelay(200, withSpring(1, { damping: 10, stiffness: 120 }));
    titleOpacity.value = withDelay(600, withTiming(1, { duration: 600 }));
    titleY.value       = withDelay(600, withTiming(0, { duration: 600, easing: Easing.out(Easing.cubic) }));
    btnOpacity.value   = withDelay(1000, withTiming(1, { duration: 400 }));
  }, []);

  const checkStyle = useAnimatedStyle(() => ({ transform: [{ scale: checkScale.value }] }));
  const titleStyle = useAnimatedStyle(() => ({ opacity: titleOpacity.value, transform: [{ translateY: titleY.value }] }));
  const btnStyle   = useAnimatedStyle(() => ({ opacity: btnOpacity.value }));

  const handleStart = async () => {
    await setProfile({
      id: Date.now().toString(),
      name: params.name || 'Baller',
      age: 0,
      position: params.position as Position,
      skillLevel: params.level as SkillLevel,
      primaryGoal: params.goal as TrainingGoal,
      sessionsPerWeek: parseInt(params.days || '3'),
      sessionDuration: parseInt(params.duration || '45'),
      hasHealthAccess: params.hasHealth === 'true',
      activeProgramId: null,
      onboardingComplete: true,
      createdAt: new Date().toISOString(),
    });
    router.replace('/(tabs)/today');
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#0D1A10', Colors.background]} style={StyleSheet.absoluteFill} />
      <SafeAreaView style={styles.safe}>
        <View style={styles.content}>
          <Animated.View style={[styles.checkCircle, checkStyle]}>
            <Text style={styles.checkMark}>✓</Text>
          </Animated.View>

          <Animated.View style={[styles.titleBlock, titleStyle]}>
            <Text style={styles.ready}>YOU'RE READY,</Text>
            <Text style={styles.name}>{params.name || 'BALLER'}</Text>
            <Text style={styles.sub}>
              Your personalized training plan is built. {'\n'}
              Let's get to work.
            </Text>
          </Animated.View>

          <View style={styles.statsRow}>
            {[
              ['20', 'Drills ready'],
              [params.days || '3', 'Days/week'],
              [params.duration || '45', 'Min/session'],
            ].map(([val, lbl]) => (
              <View key={lbl} style={styles.stat}>
                <Text style={styles.statVal}>{val}</Text>
                <Text style={styles.statLbl}>{lbl}</Text>
              </View>
            ))}
          </View>
        </View>

        <Animated.View style={[styles.footer, btnStyle]}>
          <Button label="Enter HoopAI" variant="primary" size="lg" style={styles.btn} onPress={handleStart} />
        </Animated.View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  safe: { flex: 1, paddingHorizontal: Spacing.lg },
  content: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing.xl },
  checkCircle: {
    width: 96, height: 96, borderRadius: 48,
    backgroundColor: Colors.success + '20',
    borderWidth: 2, borderColor: Colors.success,
    alignItems: 'center', justifyContent: 'center',
  },
  checkMark: { fontSize: 42, color: Colors.success },
  titleBlock: { alignItems: 'center', gap: Spacing.sm },
  ready: { fontFamily: Fonts.interSemi, fontSize: 13, color: Colors.success, letterSpacing: 2 },
  name: { fontFamily: Fonts.anton, fontSize: 52, color: Colors.textPrimary, textAlign: 'center' },
  sub: { fontFamily: Fonts.inter, fontSize: 15, color: Colors.textSecondary, textAlign: 'center', lineHeight: 22 },
  statsRow: { flexDirection: 'row', gap: Spacing.xl },
  stat: { alignItems: 'center', gap: 4 },
  statVal: { fontFamily: Fonts.interBold, fontSize: 28, color: Colors.textPrimary },
  statLbl: { fontFamily: Fonts.interSemi, fontSize: 11, color: Colors.textTertiary, letterSpacing: 1, textTransform: 'uppercase' },
  footer: { paddingBottom: Spacing.xl },
  btn: { width: '100%' },
});
