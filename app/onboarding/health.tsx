import React, { useEffect, useState } from 'react';
import { View, TouchableOpacity, Platform, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withDelay,
  withSequence,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Text } from '../../components/ui/Text';
import { Button } from '../../components/ui/Button';
import { useHealthStore } from '../../stores/healthStore';

const METRICS = [
  { icon: '📡', label: 'HRV', desc: 'Improves readiness accuracy' },
  { icon: '❤️', label: 'Resting HR', desc: 'Tracks recovery trends' },
  { icon: '😴', label: 'Sleep', desc: 'Powers energy prediction' },
  { icon: '👟', label: 'Steps', desc: 'Daily activity context' },
];

function MetricPill({ icon, label, desc, delay }: { icon: string; label: string; desc: string; delay: number }) {
  const opacity = useSharedValue(0);
  const y = useSharedValue(16);

  useEffect(() => {
    opacity.value = withDelay(delay, withTiming(1, { duration: 350 }));
    y.value = withDelay(delay, withSpring(0, { damping: 18, stiffness: 220 }));
  }, []);

  const style = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: y.value }],
  }));

  return (
    <Animated.View style={[styles.pill, style]}>
      <Text style={styles.pillIcon}>{icon}</Text>
      <View style={{ flex: 1 }}>
        <Text variant="label" style={{ color: '#FFFFFF' }}>{label}</Text>
        <Text variant="caption" style={{ color: '#6B7280' }}>{desc}</Text>
      </View>
      <View style={styles.pillCheck}>
        <Text style={{ color: '#FF6B2C', fontSize: 14 }}>✓</Text>
      </View>
    </Animated.View>
  );
}

export default function HealthOnboardingScreen() {
  const { checkAvailability, requestPermissions, isAvailable, isHealthConnectInstalled } = useHealthStore();
  const [state, setState] = useState<'idle' | 'requesting' | 'granted' | 'denied' | 'hc_missing'>('idle');

  const heroScale = useSharedValue(0.8);
  const heroOpacity = useSharedValue(0);
  const titleOpacity = useSharedValue(0);
  const titleY = useSharedValue(20);
  const checkScale = useSharedValue(0);

  useEffect(() => {
    checkAvailability();
    heroScale.value = withSpring(1, { damping: 18, stiffness: 200 });
    heroOpacity.value = withTiming(1, { duration: 500 });
    titleOpacity.value = withDelay(200, withTiming(1, { duration: 400 }));
    titleY.value = withDelay(200, withSpring(0, { damping: 20, stiffness: 200 }));
  }, []);

  const heroStyle = useAnimatedStyle(() => ({
    transform: [{ scale: heroScale.value }],
    opacity: heroOpacity.value,
  }));

  const titleStyle = useAnimatedStyle(() => ({
    opacity: titleOpacity.value,
    transform: [{ translateY: titleY.value }],
  }));

  const checkStyle = useAnimatedStyle(() => ({
    transform: [{ scale: checkScale.value }],
  }));

  const handleConnect = async () => {
    if (Platform.OS === 'android' && !isHealthConnectInstalled) {
      setState('hc_missing');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      return;
    }
    setState('requesting');
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const granted = await requestPermissions();
    if (granted) {
      setState('granted');
      checkScale.value = withSequence(
        withSpring(1.3, { damping: 12, stiffness: 300 }),
        withSpring(1, { damping: 16, stiffness: 260 })
      );
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setTimeout(() => router.replace('/onboarding/complete'), 1600);
    } else {
      setState('denied');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  };

  const handleSkip = () => {
    Haptics.selectionAsync();
    router.replace('/onboarding/complete');
  };

  const platformName = Platform.OS === 'ios' ? 'Apple Health' : 'Health Connect';

  return (
    <LinearGradient colors={['#0A0A0F', '#0D0D18', '#0A0A0F']} style={styles.container}>
      {/* Hero icon */}
      <Animated.View style={[styles.heroWrap, heroStyle]}>
        <LinearGradient
          colors={['rgba(255,107,44,0.2)', 'rgba(255,107,44,0.05)']}
          style={styles.heroCircle}
        >
          <Text style={styles.heroIcon}>
            {state === 'granted' ? '✅' : Platform.OS === 'ios' ? '❤️' : '🏃'}
          </Text>
        </LinearGradient>
        {state === 'granted' && (
          <Animated.View style={[styles.checkBadge, checkStyle]}>
            <Text style={{ fontSize: 28 }}>🎉</Text>
          </Animated.View>
        )}
      </Animated.View>

      {/* Title */}
      <Animated.View style={[styles.titleWrap, titleStyle]}>
        <Text variant="display" style={styles.title}>
          {state === 'granted' ? 'Connected!' : 'Smarter\nReadiness'}
        </Text>
        <Text variant="body" style={styles.subtitle}>
          {state === 'granted'
            ? `${platformName} is now powering your AI readiness score.`
            : state === 'denied'
            ? `Enable health access in Settings → Privacy → Health → HoopAI`
            : state === 'hc_missing'
            ? 'Install Health Connect from the Play Store, then come back to connect.'
            : `Connect ${platformName} and HoopAI uses your real body data — HRV, sleep, and heart rate — to set the perfect session intensity every day.`}
        </Text>
      </Animated.View>

      {/* Metrics */}
      {(state === 'idle' || state === 'requesting') && (
        <View style={styles.metricsWrap}>
          {METRICS.map((m, i) => (
            <MetricPill key={m.label} {...m} delay={400 + i * 80} />
          ))}
        </View>
      )}

      {/* Privacy note */}
      {state === 'idle' && (
        <Text variant="caption" style={styles.privacyNote}>
          🔒 Health data stays on your device. Never uploaded.
        </Text>
      )}

      {/* CTA */}
      <View style={styles.ctaWrap}>
        {state === 'idle' && (
          <>
            <Button variant="primary" size="lg" onPress={handleConnect} style={{ width: '100%' }}>
              Connect {platformName}
            </Button>
            <TouchableOpacity onPress={handleSkip} style={styles.skipBtn}>
              <Text variant="caption" style={{ color: '#4B5563' }}>Skip for now</Text>
            </TouchableOpacity>
          </>
        )}
        {state === 'requesting' && (
          <Text variant="body" style={{ color: '#FF6B2C', textAlign: 'center' }}>
            Requesting access…
          </Text>
        )}
        {state === 'denied' && (
          <>
            <Button variant="secondary" size="lg" onPress={handleSkip} style={{ width: '100%' }}>
              Continue Without Health
            </Button>
            <TouchableOpacity onPress={handleSkip} style={styles.skipBtn}>
              <Text variant="caption" style={{ color: '#4B5563' }}>I'll set it up later in Settings</Text>
            </TouchableOpacity>
          </>
        )}
        {state === 'hc_missing' && (
          <Button variant="secondary" size="lg" onPress={handleSkip} style={{ width: '100%' }}>
            Continue Without Health
          </Button>
        )}
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24 },
  heroWrap: { marginBottom: 32, alignItems: 'center', position: 'relative' },
  heroCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroIcon: { fontSize: 48 },
  checkBadge: {
    position: 'absolute',
    bottom: -8,
    right: -8,
  },
  titleWrap: { alignItems: 'center', marginBottom: 28 },
  title: {
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 12,
    fontSize: 52,
  },
  subtitle: {
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 8,
  },
  metricsWrap: { width: '100%', gap: 8, marginBottom: 16 },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#141420',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    padding: 14,
    gap: 12,
  },
  pillIcon: { fontSize: 22 },
  pillCheck: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(255,107,44,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  privacyNote: {
    color: '#4B5563',
    textAlign: 'center',
    marginBottom: 24,
  },
  ctaWrap: { width: '100%', alignItems: 'center', gap: 12, marginTop: 8 },
  skipBtn: { paddingVertical: 8 },
});
