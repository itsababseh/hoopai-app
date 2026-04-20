import React, { useEffect } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { router } from 'expo-router';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  Easing,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../../components/ui/Button';
import { Text } from '../../components/ui/Text';
import { Colors, Fonts, Spacing } from '../../constants/theme';

const { height } = Dimensions.get('window');

export default function WelcomeScreen() {
  const titleOpacity  = useSharedValue(0);
  const titleY        = useSharedValue(30);
  const subtitleOpacity = useSharedValue(0);
  const buttonOpacity = useSharedValue(0);

  useEffect(() => {
    titleOpacity.value  = withDelay(300, withTiming(1, { duration: 700 }));
    titleY.value        = withDelay(300, withTiming(0, { duration: 700, easing: Easing.out(Easing.cubic) }));
    subtitleOpacity.value = withDelay(700, withTiming(1, { duration: 600 }));
    buttonOpacity.value = withDelay(1100, withTiming(1, { duration: 500 }));
  }, []);

  const titleStyle    = useAnimatedStyle(() => ({ opacity: titleOpacity.value, transform: [{ translateY: titleY.value }] }));
  const subtitleStyle = useAnimatedStyle(() => ({ opacity: subtitleOpacity.value }));
  const buttonStyle   = useAnimatedStyle(() => ({ opacity: buttonOpacity.value }));

  return (
    <View style={styles.container}>
      {/* Background gradient */}
      <LinearGradient
        colors={['#1A0A00', Colors.background]}
        style={StyleSheet.absoluteFill}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 0.6 }}
      />
      {/* Accent glow */}
      <View style={styles.glow} />

      <SafeAreaView style={styles.safe}>
        <View style={styles.content}>
          <Animated.View style={titleStyle}>
            <Text style={styles.eyebrow}>YOUR PERSONAL</Text>
            <Text style={styles.title}>HOOP{'\n'}AI</Text>
            <View style={styles.accentLine} />
          </Animated.View>

          <Animated.View style={[styles.subtitleBlock, subtitleStyle]}>
            <Text style={styles.subtitle}>
              NBA-level training personalized to{'\n'}your body, schedule, and goals.
            </Text>
            <View style={styles.statsRow}>
              {[['20', 'Drills'], ['5', 'Programs'], ['AI', 'Coach']].map(([val, lbl]) => (
                <View key={lbl} style={styles.stat}>
                  <Text style={styles.statVal}>{val}</Text>
                  <Text style={styles.statLbl}>{lbl}</Text>
                </View>
              ))}
            </View>
          </Animated.View>

          <Animated.View style={[styles.buttonBlock, buttonStyle]}>
            <Button
              label="Start Training"
              variant="primary"
              size="lg"
              style={styles.cta}
              onPress={() => router.push('/onboarding/name')}
            />
            <Text style={styles.fine}>No credit card required · Free to start</Text>
          </Animated.View>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  safe: { flex: 1 },
  glow: {
    position: 'absolute',
    top: -60,
    left: '20%',
    width: '60%',
    height: 300,
    backgroundColor: Colors.accent,
    opacity: 0.12,
    borderRadius: 999,
    transform: [{ scaleX: 2 }],
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
    justifyContent: 'space-between',
    paddingTop: height * 0.1,
    paddingBottom: Spacing.xl,
  },
  eyebrow: {
    fontFamily: Fonts.interSemi,
    fontSize: 12,
    color: Colors.accent,
    letterSpacing: 3,
    marginBottom: 8,
  },
  title: {
    fontFamily: Fonts.anton,
    fontSize: 88,
    color: Colors.textPrimary,
    lineHeight: 80,
  },
  accentLine: {
    width: 48,
    height: 4,
    backgroundColor: Colors.accent,
    borderRadius: 2,
    marginTop: 16,
  },
  subtitleBlock: { gap: 24 },
  subtitle: {
    fontFamily: Fonts.inter,
    fontSize: 17,
    color: Colors.textSecondary,
    lineHeight: 26,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 32,
  },
  stat: { gap: 4 },
  statVal: {
    fontFamily: Fonts.interBold,
    fontSize: 28,
    color: Colors.textPrimary,
  },
  statLbl: {
    fontFamily: Fonts.interSemi,
    fontSize: 11,
    color: Colors.textTertiary,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  buttonBlock: { gap: 12 },
  cta: { width: '100%' },
  fine: {
    fontFamily: Fonts.inter,
    fontSize: 12,
    color: Colors.textTertiary,
    textAlign: 'center',
  },
});
