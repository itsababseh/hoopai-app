import React, { useEffect, useState } from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  Switch,
  StyleSheet,
  Platform,
  Alert,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  FadeIn,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Text } from '../../components/ui/Text';
import { Button } from '../../components/ui/Button';
import { useHealthStore, hasAnyHealthData } from '../../stores/healthStore';

// ─── Section Header ───────────────────────────────────────────────────────────

function SectionHeader({ title }: { title: string }) {
  return (
    <Text variant="label" style={styles.sectionHeader}>{title}</Text>
  );
}

// ─── Metric Toggle Row ────────────────────────────────────────────────────────

interface MetricToggleProps {
  icon: string;
  label: string;
  description: string;
  permissionStatus: string;
  onToggle: () => void;
}

function MetricToggleRow({ icon, label, description, permissionStatus, onToggle }: MetricToggleProps) {
  const isGranted = permissionStatus === 'authorized';
  const isNA = permissionStatus === 'unavailable';

  return (
    <View style={styles.metricRow}>
      <View style={styles.metricIconWrap}>
        <Text style={{ fontSize: 20 }}>{icon}</Text>
      </View>
      <View style={styles.metricInfo}>
        <Text variant="label" style={styles.metricLabel}>{label}</Text>
        <Text variant="caption" style={styles.metricDesc}>{description}</Text>
      </View>
      <View style={styles.metricRight}>
        {isNA ? (
          <Text variant="caption" style={{ color: '#4B5563' }}>N/A</Text>
        ) : (
          <View style={[styles.statusDot, { backgroundColor: isGranted ? '#34D399' : '#4B5563' }]} />
        )}
      </View>
    </View>
  );
}

// ─── Sync Card ────────────────────────────────────────────────────────────────

function SyncCard() {
  const { syncStatus, lastSyncAt, syncHealthData, syncError } = useHealthStore();

  const handleSync = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await syncHealthData();
  };

  const formatLastSync = () => {
    if (!lastSyncAt) return 'Never';
    const diff = Date.now() - new Date(lastSyncAt).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return new Date(lastSyncAt).toLocaleDateString();
  };

  return (
    <View style={styles.syncCard}>
      <View style={styles.syncTop}>
        <View>
          <Text variant="label" style={{ color: '#FFFFFF', marginBottom: 2 }}>Last Sync</Text>
          <Text variant="caption" style={{ color: '#6B7280' }}>{formatLastSync()}</Text>
        </View>
        <View style={styles.syncStatusBadge}>
          <View style={[
            styles.syncDot,
            { backgroundColor: syncStatus === 'success' ? '#34D399' : syncStatus === 'error' ? '#F87171' : syncStatus === 'syncing' ? '#FF6B2C' : '#4B5563' }
          ]} />
          <Text variant="caption" style={{ color: '#9CA3AF', textTransform: 'capitalize' }}>
            {syncStatus}
          </Text>
        </View>
      </View>

      {syncError && (
        <Text variant="caption" style={styles.syncError}>{syncError}</Text>
      )}

      <Button
        variant={syncStatus === 'syncing' ? 'ghost' : 'secondary'}
        size="sm"
        onPress={handleSync}
        disabled={syncStatus === 'syncing'}
        style={styles.syncBtn}
      >
        {syncStatus === 'syncing' ? 'Syncing…' : 'Sync Now'}
      </Button>
    </View>
  );
}

// ─── Disconnect Sheet ─────────────────────────────────────────────────────────

function useDisconnectConfirm(onConfirm: () => void) {
  const handleDisconnect = () => {
    Alert.alert(
      'Disconnect Health Data',
      'This will remove all health data from HoopAI and switch to manual readiness mode. You can reconnect anytime.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Disconnect',
          style: 'destructive',
          onPress: onConfirm,
        },
      ]
    );
  };
  return handleDisconnect;
}

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function HealthSettingsScreen() {
  const {
    isAvailable,
    isHealthConnectInstalled,
    permissions,
    data,
    autoReadinessEnabled,
    setAutoReadiness,
    requestPermissions,
    clearHealthData,
    checkAvailability,
  } = useHealthStore();

  const [requesting, setRequesting] = useState(false);
  const hasData = hasAnyHealthData(data);
  const isConnected = Object.values(permissions).some(v => v === 'authorized');

  useEffect(() => {
    checkAvailability();
  }, []);

  const handleConnect = async () => {
    setRequesting(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const granted = await requestPermissions();
    setRequesting(false);
    if (!granted) {
      Alert.alert(
        'Permission Required',
        Platform.OS === 'ios'
          ? 'Go to Settings → Privacy → Health → HoopAI and enable all metrics.'
          : 'Go to Health Connect → Apps → HoopAI and grant permissions.',
        [{ text: 'OK' }]
      );
    }
  };

  const handleDisconnect = useDisconnectConfirm(() => {
    clearHealthData();
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  });

  const platformName = Platform.OS === 'ios' ? 'Apple Health' : 'Health Connect';
  const platformIcon = Platform.OS === 'ios' ? '❤️' : '🏃';

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text variant="heading" style={styles.headerTitle}>Health Data</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Connection Status Card */}
        <Animated.View entering={FadeIn.duration(300)} style={styles.connectionCard}>
          <LinearGradient
            colors={isConnected ? ['#0D1F16', '#0A0A0F'] : ['#141420', '#0A0A0F']}
            style={[styles.connectionGradient, { borderColor: isConnected ? 'rgba(52,211,153,0.3)' : 'rgba(255,255,255,0.08)' }]}
          >
            <View style={styles.connectionTop}>
              <View style={styles.connectionLeft}>
                <Text style={{ fontSize: 32, marginBottom: 8 }}>{platformIcon}</Text>
                <Text variant="heading" style={{ color: '#FFFFFF' }}>{platformName}</Text>
                <Text variant="caption" style={{ color: '#6B7280', marginTop: 4 }}>
                  {isConnected ? 'Connected · Providing health insights' : 'Not connected · Manual mode active'}
                </Text>
              </View>
              <View style={[styles.connectionStatus, { backgroundColor: isConnected ? 'rgba(52,211,153,0.12)' : 'rgba(107,114,128,0.12)' }]}>
                <View style={[styles.connectionDot, { backgroundColor: isConnected ? '#34D399' : '#4B5563' }]} />
                <Text variant="caption" style={{ color: isConnected ? '#34D399' : '#6B7280' }}>
                  {isConnected ? 'Active' : 'Off'}
                </Text>
              </View>
            </View>

            {!isAvailable && Platform.OS === 'android' && !isHealthConnectInstalled && (
              <View style={styles.hcWarning}>
                <Text style={{ fontSize: 14 }}>⚠️</Text>
                <Text variant="caption" style={{ color: '#F59E0B', flex: 1 }}>
                  Health Connect is not installed. Install it from the Play Store to connect health data.
                </Text>
              </View>
            )}

            {isConnected ? (
              <TouchableOpacity onPress={handleDisconnect} style={styles.disconnectBtn}>
                <Text variant="label" style={{ color: '#F87171' }}>Disconnect</Text>
              </TouchableOpacity>
            ) : (
              <Button
                variant="primary"
                size="md"
                onPress={handleConnect}
                disabled={requesting || !isAvailable}
                style={{ marginTop: 16 }}
              >
                {requesting ? 'Connecting…' : `Connect ${platformName}`}
              </Button>
            )}
          </LinearGradient>
        </Animated.View>

        {/* Metrics Section */}
        {isConnected && (
          <Animated.View entering={FadeIn.delay(100).duration(300)}>
            <SectionHeader title="CONNECTED METRICS" />
            <View style={styles.metricsCard}>
              <MetricToggleRow
                icon="📡"
                label="Heart Rate Variability"
                description="Powers AI readiness accuracy"
                permissionStatus={permissions.hrv}
                onToggle={() => {}}
              />
              <View style={styles.divider} />
              <MetricToggleRow
                icon="❤️"
                label="Resting Heart Rate"
                description="Recovery between sessions"
                permissionStatus={permissions.heartRate}
                onToggle={() => {}}
              />
              <View style={styles.divider} />
              <MetricToggleRow
                icon="😴"
                label="Sleep Analysis"
                description="Sleep quality and duration"
                permissionStatus={permissions.sleep}
                onToggle={() => {}}
              />
              <View style={styles.divider} />
              <MetricToggleRow
                icon="👟"
                label="Step Count"
                description="Daily activity context"
                permissionStatus={permissions.steps}
                onToggle={() => {}}
              />
            </View>
          </Animated.View>
        )}

        {/* Auto Readiness Toggle */}
        {isConnected && (
          <Animated.View entering={FadeIn.delay(150).duration(300)}>
            <SectionHeader title="READINESS MODE" />
            <View style={styles.toggleCard}>
              <View style={styles.toggleRow}>
                <View style={styles.toggleInfo}>
                  <Text variant="label" style={{ color: '#FFFFFF', marginBottom: 4 }}>
                    AI-Powered Readiness
                  </Text>
                  <Text variant="caption" style={{ color: '#6B7280' }}>
                    Use health data to compute your readiness score automatically
                  </Text>
                </View>
                <Switch
                  value={autoReadinessEnabled}
                  onValueChange={(val) => {
                    Haptics.selectionAsync();
                    setAutoReadiness(val);
                  }}
                  trackColor={{ false: '#1F2937', true: 'rgba(255,107,44,0.4)' }}
                  thumbColor={autoReadinessEnabled ? '#FF6B2C' : '#4B5563'}
                />
              </View>
              {!autoReadinessEnabled && (
                <Text variant="caption" style={styles.toggleNote}>
                  Manual mode: readiness is computed from your check-in sliders only.
                </Text>
              )}
            </View>
          </Animated.View>
        )}

        {/* Sync Section */}
        {isConnected && (
          <Animated.View entering={FadeIn.delay(200).duration(300)}>
            <SectionHeader title="SYNC" />
            <SyncCard />
          </Animated.View>
        )}

        {/* Privacy note */}
        <Animated.View entering={FadeIn.delay(250).duration(300)} style={styles.privacyCard}>
          <Text style={{ fontSize: 16, marginBottom: 8 }}>🔒</Text>
          <Text variant="caption" style={styles.privacyText}>
            All health data is stored on-device only. HoopAI never uploads health information to external servers. Data is used exclusively to personalize your readiness score and session recommendations.
          </Text>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0A0F' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 16,
  },
  backBtn: { width: 40, height: 40, justifyContent: 'center' },
  backIcon: { fontSize: 22, color: '#FFFFFF' },
  headerTitle: { color: '#FFFFFF' },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 48 },

  sectionHeader: {
    color: '#4B5563',
    fontSize: 11,
    letterSpacing: 1.2,
    marginTop: 24,
    marginBottom: 10,
    marginLeft: 4,
  },

  connectionCard: { marginTop: 8 },
  connectionGradient: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 20,
  },
  connectionTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  connectionLeft: { flex: 1 },
  connectionStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  connectionDot: { width: 6, height: 6, borderRadius: 3 },
  hcWarning: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: 'rgba(245,158,11,0.08)',
    borderRadius: 10,
    padding: 12,
    marginTop: 16,
  },
  disconnectBtn: {
    alignSelf: 'flex-start',
    marginTop: 16,
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(248,113,113,0.1)',
    borderRadius: 10,
  },

  metricsCard: {
    backgroundColor: '#141420',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    overflow: 'hidden',
  },
  metricRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  metricIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,107,44,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  metricInfo: { flex: 1 },
  metricLabel: { color: '#FFFFFF', marginBottom: 2 },
  metricDesc: { color: '#6B7280' },
  metricRight: { alignItems: 'center', justifyContent: 'center', width: 32 },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  divider: { height: 1, backgroundColor: 'rgba(255,255,255,0.06)', marginLeft: 68 },

  toggleCard: {
    backgroundColor: '#141420',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    padding: 16,
  },
  toggleRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  toggleInfo: { flex: 1 },
  toggleNote: {
    color: '#4B5563',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.06)',
  },

  syncCard: {
    backgroundColor: '#141420',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    padding: 16,
  },
  syncTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  syncStatusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.06)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  syncDot: { width: 6, height: 6, borderRadius: 3 },
  syncError: { color: '#F87171', marginBottom: 10 },
  syncBtn: { alignSelf: 'flex-start' },

  privacyCard: {
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 32,
    paddingBottom: 8,
  },
  privacyText: {
    color: '#4B5563',
    textAlign: 'center',
    lineHeight: 18,
  },
});
