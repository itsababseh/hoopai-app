import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../../components/ui/Button';
import { Text } from '../../components/ui/Text';
import { Colors, Fonts, Spacing, Radius } from '../../constants/theme';

export default function HealthScreen() {
  const params = useLocalSearchParams();

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safe}>
        <TouchableOpacity onPress={() => router.back()} style={styles.back}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <View style={styles.progressRow}>
          {[1,2,3,4,5,6,7].map(i => (
            <View key={i} style={[styles.dot, i <= 6 && styles.dotActive]} />
          ))}
        </View>
        <View style={styles.content}>
          <View style={styles.iconBlock}>
            <Text style={styles.icon}>❤️</Text>
          </View>
          <View style={styles.header}>
            <Text style={styles.step}>STEP 6 OF 7</Text>
            <Text style={styles.heading}>Connect{'\n'}Health Data</Text>
            <Text style={styles.sub}>
              HoopAI reads your sleep, HRV, and recovery from Apple Health or Google Fit to auto-fill your daily readiness score.
            </Text>
          </View>
          <View style={styles.perks}>
            {[
              ['🌙', 'Auto-fill sleep score', 'No manual logging needed'],
              ['💓', 'HRV-based readiness', 'Know exactly how hard to push'],
              ['📊', 'Recovery trends', 'See how training affects your body'],
            ].map(([emoji, title, sub]) => (
              <View key={title} style={styles.perk}>
                <Text style={styles.perkEmoji}>{emoji}</Text>
                <View style={styles.perkText}>
                  <Text style={styles.perkTitle}>{title}</Text>
                  <Text style={styles.perkSub}>{sub}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>
        <View style={styles.footer}>
          <Button
            label="Connect Health"
            variant="primary"
            size="lg"
            style={styles.btn}
            onPress={() => router.push({ pathname: '/onboarding/complete', params: { ...params, hasHealth: 'true' } })}
          />
          <TouchableOpacity onPress={() => router.push({ pathname: '/onboarding/complete', params: { ...params, hasHealth: 'false' } })}>
            <Text style={styles.skip}>Skip for now</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  safe: { flex: 1, paddingHorizontal: Spacing.lg },
  back: { paddingVertical: Spacing.md },
  backText: { fontFamily: Fonts.interSemi, fontSize: 15, color: Colors.textSecondary },
  progressRow: { flexDirection: 'row', gap: 6, marginBottom: Spacing.lg },
  dot: { flex: 1, height: 3, borderRadius: 2, backgroundColor: Colors.border },
  dotActive: { backgroundColor: Colors.accent },
  content: { flex: 1, gap: Spacing.xl },
  iconBlock: { alignItems: 'center', paddingTop: Spacing.lg },
  icon: { fontSize: 64 },
  header: { gap: Spacing.sm },
  step: { fontFamily: Fonts.interSemi, fontSize: 11, color: Colors.accent, letterSpacing: 2 },
  heading: { fontFamily: Fonts.interBold, fontSize: 32, color: Colors.textPrimary, lineHeight: 40 },
  sub: { fontFamily: Fonts.inter, fontSize: 15, color: Colors.textSecondary, lineHeight: 22 },
  perks: { gap: Spacing.md },
  perk: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, backgroundColor: Colors.surface, borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.border, padding: Spacing.md },
  perkEmoji: { fontSize: 28 },
  perkText: { flex: 1, gap: 2 },
  perkTitle: { fontFamily: Fonts.interSemi, fontSize: 15, color: Colors.textPrimary },
  perkSub: { fontFamily: Fonts.inter, fontSize: 12, color: Colors.textTertiary },
  footer: { paddingBottom: Spacing.lg, gap: Spacing.md },
  btn: { width: '100%' },
  skip: { fontFamily: Fonts.interSemi, fontSize: 14, color: Colors.textTertiary, textAlign: 'center' },
});
