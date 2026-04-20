import React, { useEffect, useRef } from 'react';
import {
  View,
  Modal,
  ScrollView,
  TouchableOpacity,
  Platform,
  StyleSheet,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withDelay,
  withSequence,
  runOnJS,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { Text } from '../ui/Text';
import { Button } from '../ui/Button';
import { useHealthStore } from '../../stores/healthStore';

// ─── Metric Row ───────────────────────────────────────────────────────────────

interface MetricRowProps {
  icon: string;
  label: string;
  description: string;
  delay: number;
}

function MetricRow({ icon, label, description, delay }: MetricRowProps) {
  const opacity = useSharedValue(0);
  const translateX = useSharedValue(-20);

  useEffect(() => {
    opacity.value = withDelay(delay, withTiming(1, { duration: 350 }));
    translateX.value = withDelay(delay, withSpring(0, { damping: 18, stiffness: 200 }));
  }, []);

  const style = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateX: translateX.value }],
  }));

  return (
    <Animated.View style={[styles.metricRow, style]}>
      <View style={styles.metricIcon}>
        <Text style={styles.metricIconText}>{icon}</Text>
      </View>
      <View style={styles.metricContent}>
        <Text variant="label" style={styles.metricLabel}>{label}</Text>
        <Text variant="caption" style={styles.metricDesc}>{description}</Text>
      </View>
      <View style={styles.metricCheck}>
        <Text style={{ color: '#FF6B2C', fontSize: 16 }}>✓</Text>
      </View>
    </Animated.View>
  );
}

// ─── Source Badge ─────────────────────────────────────────────────────────────

function SourceBadge() {
  const source = Platform.OS === 'ios' ? 'Apple Health' : 'Health Connect';
  const icon = Platform.OS === 'ios' ? '❤️' : '🏃';
  return (
    <View style={styles.sourceBadge}>
      <Text style={{ fontSize: 12, marginRight: 4 }}>{icon}</Text>
      <Text variant="caption" style={{ color: '#9CA3AF' }}>via {source}</Text>
    </View>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

interface HealthPermissionModalProps {
  visible: boolean;
  onDismiss: () => void;
  onGranted?: () => void;
  source?: 'onboarding' | 'settings' | 'upgrade';
}

export function HealthPermissionModal({
  visible,
  onDismiss,
  onGranted,
  source = 'settings',
}: HealthPermissionModalProps) {
  const { requestPermissions, isAvailable, isHealthConnectInstalled } = useHealthStore();

  const sheetY = useSharedValue(600);
  const overlayOpacity = useSharedValue(0);
  const [requesting, setRequesting] = React.useState(false);
  const [state, setState] = React.useState<'idle' | 'requesting' | 'granted' | 'denied' | 'hc_missing'>('idle');

  useEffect(() => {
    if (visible) {
      overlayOpacity.value = withTiming(1, { duration: 250 });
      sheetY.value = withSpring(0, { damping: 22, stiffness: 280 });
      setState('idle');
    } else {
      overlayOpacity.value = withTiming(0, { duration: 200 });
      sheetY.value = withTiming(600, { duration: 250 });
    }
  }, [visible]);

  const overlayStyle = useAnimatedStyle(() => ({ opacity: overlayOpacity.value }));
  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: sheetY.value }],
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
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setTimeout(() => {
        onGranted?.();
        onDismiss();
      }, 1400);
    } else {
      setState('denied');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  };

  const metrics = [
    { icon: '💓', label: 'Heart Rate Variability', description: 'Powers AI readiness score accuracy', delay: 100 },
    { icon: '❤️', label: 'Resting Heart Rate', description: 'Tracks recovery between sessions', delay: 175 },
    { icon: '😴', label: 'Sleep Analysis', description: 'Sleep quality drives energy prediction', delay: 250 },
    { icon: '👟', label: 'Step Count', description: 'Daily activity context for load management', delay: 325 },
  ];

  if (!visible) return null;

  return (
    <Modal transparent visible={visible} animationType="none" onRequestClose={onDismiss}>
      <Animated.View style={[styles.overlay, overlayStyle]}>
        <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={state === 'idle' ? onDismiss : undefined} />
        <Animated.View style={[styles.sheet, sheetStyle]}>
          <LinearGradient
            colors={['#141420', '#0A0A0F']}
            style={styles.sheetGradient}
          >
            {/* Handle */}
            <View style={styles.handle} />

            {/* Header */}
            <View style={styles.header}>
              <View style={styles.iconCircle}>
                <Text style={styles.headerIcon}>🏀</Text>
              </View>
              <Text variant="heading" style={styles.title}>
                {state === 'granted' ? 'Connected!' : 'Unlock AI Readiness'}
              </Text>
              <Text variant="body" style={styles.subtitle}>
                {state === 'granted'
                  ? 'Your health data is now powering smarter sessions.'
                  : state === 'denied'
                  ? 'Health access denied. Enable it in your device Settings → Privacy → Health → HoopAI.'
                  : state === 'hc_missing'
                  ? 'Health Connect app is required. Install it from the Play Store to continue.'
                  : 'Connect your health data to get a personalized readiness score before every session.'}
              </Text>
              <SourceBadge />
            </View>

            {/* Metrics list */}
            {(state === 'idle' || state === 'requesting') && (
              <View style={styles.metricsList}>
                {metrics.map((m) => (
                  <MetricRow key={m.label} {...m} />
                ))}
              </View>
            )}

            {/* Granted state */}
            {state === 'granted' && (
              <View style={styles.grantedContainer}>
                <Text style={styles.grantedCheck}>✓</Text>
                <Text variant="body" style={{ color: '#9CA3AF', textAlign: 'center' }}>
                  First sync in progress…
                </Text>
              </View>
            )}

            {/* Privacy note */}
            {state === 'idle' && (
              <Text variant="caption" style={styles.privacyNote}>
                All health data stays on your device. HoopAI never uploads health metrics to external servers.
              </Text>
            )}

            {/* CTA */}
            <View style={styles.ctaContainer}>
              {state === 'idle' && (
                <>
                  <Button
                    variant="primary"
                    size="lg"
                    onPress={handleConnect}
                    style={styles.ctaButton}
                  >
                    Connect Health Data
                  </Button>
                  <TouchableOpacity onPress={onDismiss} style={styles.skipButton}>
                    <Text variant="caption" style={{ color: '#6B7280' }}>
                      {source === 'onboarding' ? 'Skip for now' : 'Not now'}
                    </Text>
                  </TouchableOpacity>
                </>
              )}
              {state === 'requesting' && (
                <Text variant="body" style={{ color: '#FF6B2C', textAlign: 'center' }}>
                  Requesting access…
                </Text>
              )}
              {state === 'denied' && (
                <Button variant="secondary" size="lg" onPress={onDismiss} style={styles.ctaButton}>
                  Open Settings
                </Button>
              )}
              {state === 'hc_missing' && (
                <Button variant="secondary" size="lg" onPress={onDismiss} style={styles.ctaButton}>
                  Install Health Connect
                </Button>
              )}
            </View>
          </LinearGradient>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  sheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden',
  },
  sheetGradient: {
    paddingBottom: 40,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: '#374151',
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 8,
  },
  header: {
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 20,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255,107,44,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  headerIcon: { fontSize: 32 },
  title: { color: '#FFFFFF', textAlign: 'center', marginBottom: 8 },
  subtitle: { color: '#9CA3AF', textAlign: 'center', lineHeight: 22, marginBottom: 10 },
  sourceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.06)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  metricsList: {
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  metricRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  metricIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,107,44,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  metricIconText: { fontSize: 20 },
  metricContent: { flex: 1 },
  metricLabel: { color: '#FFFFFF', marginBottom: 2 },
  metricDesc: { color: '#6B7280' },
  metricCheck: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(255,107,44,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  grantedContainer: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  grantedCheck: {
    fontSize: 56,
    color: '#FF6B2C',
    marginBottom: 16,
  },
  privacyNote: {
    color: '#4B5563',
    textAlign: 'center',
    paddingHorizontal: 32,
    marginBottom: 20,
    lineHeight: 18,
  },
  ctaContainer: {
    paddingHorizontal: 24,
    gap: 12,
    alignItems: 'center',
  },
  ctaButton: { width: '100%' },
  skipButton: { paddingVertical: 8 },
});
