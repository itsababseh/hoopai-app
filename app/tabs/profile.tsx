import React from 'react';
import { View, ScrollView, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Text } from '../../components/ui/Text';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { useUserStore } from '../../stores/userStore';
import { useSessionStore } from '../../stores/sessionStore';
import { Colors, Fonts, Spacing, Radius } from '../../constants/theme';

export default function ProfileScreen() {
  const { profile, clearProfile } = useUserStore();
  const { currentStreak, totalSessions } = useSessionStore();

  const handleReset = () => {
    Alert.alert(
      'Reset App',
      'This will delete all your data and restart onboarding.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset', style: 'destructive',
          onPress: async () => { await clearProfile(); router.replace('/onboarding/welcome'); },
        },
      ]
    );
  };

  if (!profile) return null;

  return (
    <View style={styles.container}>
      <SafeAreaView edges={['top']} style={styles.safe}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <Text style={styles.title}>Profile</Text>

          {/* Avatar block */}
          <View style={styles.avatarBlock}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{profile.name[0].toUpperCase()}</Text>
            </View>
            <View style={styles.avatarInfo}>
              <Text style={styles.name}>{profile.name}</Text>
              <View style={styles.badges}>
                <Badge label={profile.position} variant="accent" />
                <Badge label={profile.skillLevel} variant="blue" />
              </View>
            </View>
          </View>

          {/* Stats */}
          <View style={styles.statsRow}>
            {[
              { label: 'STREAK',   value: `${currentStreak}`, unit: 'days' },
              { label: 'SESSIONS', value: `${totalSessions}`, unit: 'total' },
              { label: 'GOAL',     value: profile.primaryGoal.toUpperCase(), unit: '' },
            ].map(s => (
              <Card key={s.label} style={styles.statCard}>
                <Text style={styles.statLabel}>{s.label}</Text>
                <Text style={styles.statVal}>{s.value}</Text>
                {s.unit ? <Text style={styles.statUnit}>{s.unit}</Text> : null}
              </Card>
            ))}
          </View>

          {/* Settings */}
          <Card style={styles.settingsCard}>
            {[
              { label: 'Position',        value: profile.position },
              { label: 'Skill Level',     value: profile.skillLevel },
              { label: 'Primary Goal',    value: profile.primaryGoal },
              { label: 'Days / Week',     value: `${profile.sessionsPerWeek}x` },
              { label: 'Session Length',  value: `${profile.sessionDuration} min` },
              { label: 'Health Access',   value: profile.hasHealthAccess ? 'Connected' : 'Not connected' },
            ].map((row, i, arr) => (
              <View key={row.label} style={[styles.settingRow, i < arr.length - 1 && styles.settingBorder]}>
                <Text style={styles.settingLabel}>{row.label}</Text>
                <Text style={styles.settingValue}>{row.value}</Text>
              </View>
            ))}
          </Card>

          <Button label="Reset & Restart Onboarding" variant="ghost" size="md" onPress={handleReset} />

          <View style={{ height: 100 }} />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  safe: { flex: 1 },
  content: { paddingHorizontal: Spacing.lg, gap: Spacing.lg, paddingTop: Spacing.md },
  title: { fontFamily: Fonts.interBold, fontSize: 28, color: Colors.textPrimary },
  avatarBlock: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  avatar: {
    width: 64, height: 64, borderRadius: 32,
    backgroundColor: Colors.accent + '30', borderWidth: 2, borderColor: Colors.accent + '60',
    alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { fontFamily: Fonts.interBold, fontSize: 28, color: Colors.accent },
  avatarInfo: { gap: 8 },
  name: { fontFamily: Fonts.interBold, fontSize: 22, color: Colors.textPrimary },
  badges: { flexDirection: 'row', gap: 6 },
  statsRow: { flexDirection: 'row', gap: Spacing.sm },
  statCard: { flex: 1, alignItems: 'center', gap: 3, paddingVertical: Spacing.md },
  statLabel: { fontFamily: Fonts.interSemi, fontSize: 9, color: Colors.textTertiary, letterSpacing: 1.2 },
  statVal: { fontFamily: Fonts.interBold, fontSize: 18, color: Colors.textPrimary },
  statUnit: { fontFamily: Fonts.inter, fontSize: 11, color: Colors.textTertiary },
  settingsCard: { gap: 0, padding: 0, overflow: 'hidden' },
  settingRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: Spacing.md, paddingVertical: 14 },
  settingBorder: { borderBottomWidth: 1, borderBottomColor: Colors.border },
  settingLabel: { fontFamily: Fonts.inter, fontSize: 14, color: Colors.textSecondary },
  settingValue: { fontFamily: Fonts.interSemi, fontSize: 14, color: Colors.textPrimary },
});
