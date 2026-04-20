import React, { useEffect } from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Text } from '../ui/Text';
import { useHealthStore } from '../../stores/healthStore';

interface StaleDataBannerProps {
  onSync?: () => void;
}

export function StaleDataBanner({ onSync }: StaleDataBannerProps) {
  const { data, syncStatus, syncHealthData } = useHealthStore();
  const translateY = useSharedValue(-60);
  const opacity = useSharedValue(0);

  const staleMetrics: string[] = [];
  if (data.hrv.isStale) staleMetrics.push('HRV');
  if (data.restingHeartRate.isStale) staleMetrics.push('Heart Rate');
  if (data.sleepHours.isStale) staleMetrics.push('Sleep');
  if (data.steps.isStale) staleMetrics.push('Steps');

  const show = staleMetrics.length > 0;

  useEffect(() => {
    if (show) {
      translateY.value = withSpring(0, { damping: 20, stiffness: 260 });
      opacity.value = withTiming(1, { duration: 300 });
    } else {
      translateY.value = withTiming(-60, { duration: 250 });
      opacity.value = withTiming(0, { duration: 200 });
    }
  }, [show]);

  const bannerStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  if (!show) return null;

  const label =
    staleMetrics.length === 1
      ? staleMetrics[0]
      : staleMetrics.length === 2
      ? staleMetrics.join(' & ')
      : 'Health data';

  const handleSync = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await syncHealthData();
    onSync?.();
  };

  return (
    <Animated.View style={[styles.banner, bannerStyle]}>
      <View style={styles.left}>
        <Text style={styles.icon}>⚠️</Text>
        <Text variant="caption" style={styles.message}>
          {label} {staleMetrics.length === 1 ? 'is' : 'are'} outdated
        </Text>
      </View>
      <TouchableOpacity
        onPress={handleSync}
        disabled={syncStatus === 'syncing'}
        style={styles.syncBtn}
      >
        <Text variant="caption" style={styles.syncText}>
          {syncStatus === 'syncing' ? 'Syncing…' : 'Sync now'}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(245,158,11,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(245,158,11,0.3)',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 12,
  },
  left: { flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 },
  icon: { fontSize: 14 },
  message: { color: '#F59E0B', flex: 1 },
  syncBtn: {
    backgroundColor: 'rgba(245,158,11,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  syncText: { color: '#FBBF24' },
});
