import React, { useState, useRef } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import YoutubeIframe from 'react-native-youtube-iframe';
import * as Haptics from 'expo-haptics';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { Text } from '../../components/ui/Text';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Card } from '../../components/ui/Card';
import { useSessionStore } from '../../stores/sessionStore';
import { DRILLS } from '../../constants/drills';
import { Colors, Fonts, Spacing, Radius } from '../../constants/theme';

const { width } = Dimensions.get('window');
const VIDEO_HEIGHT = width * (9 / 16);

export default function DrillDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const drill = DRILLS.find(d => d.id === id);
  const logSession = useSessionStore(s => s.logSession);

  const [playing, setPlaying]         = useState(false);
  const [setsCompleted, setSets]       = useState(0);
  const [sessionLogged, setLogged]     = useState(false);

  const setScale = useSharedValue(1);

  if (!drill) {
    return (
      <View style={styles.notFound}>
        <Text style={styles.notFoundText}>Drill not found</Text>
        <Button label="Go Back" onPress={() => router.back()} />
      </View>
    );
  }

  const completeSet = async () => {
    if (setsCompleted >= drill.sets) return;
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setScale.value = withSpring(1.15, { damping: 8 }, () => {
      setScale.value = withSpring(1);
    });
    const next = setsCompleted + 1;
    setSets(next);

    if (next === drill.sets && !sessionLogged) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      await logSession({
        id: Date.now().toString(),
        date: new Date().toISOString(),
        drillId: drill.id,
        durationMinutes: drill.durationMinutes,
        setsCompleted: drill.sets,
        ratingOutOf5: 4,
      });
      setLogged(true);
    }
  };

  const setAnimStyle = useAnimatedStyle(() => ({ transform: [{ scale: setScale.value }] }));

  const diffVariant = drill.difficulty === 'advanced' ? 'accent' : drill.difficulty === 'intermediate' ? 'blue' : 'success';

  return (
    <View style={styles.container}>
      {/* Video */}
      <View style={styles.videoContainer}>
        <YoutubeIframe
          height={VIDEO_HEIGHT}
          width={width}
          videoId={drill.youtubeId}
          play={playing}
          onChangeState={state => {
            if (state === 'ended') setPlaying(false);
          }}
        />
        {/* Back button overlay */}
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <View style={styles.backBtnInner}>
            <Text style={styles.backArrow}>←</Text>
          </View>
        </TouchableOpacity>
      </View>

      <SafeAreaView edges={['bottom']} style={{ flex: 1 }}>
        <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.badges}>
              <Badge label={drill.category} variant="accent" />
              <Badge label={drill.difficulty} variant={diffVariant} />
            </View>
            <Text style={styles.title}>{drill.title}</Text>
            <Text style={styles.subtitle}>{drill.subtitle}</Text>
          </View>

          {/* Stats row */}
          <View style={styles.statsRow}>
            {[
              { label: 'DURATION', value: `${drill.durationMinutes}m` },
              { label: 'SETS',     value: `${drill.sets}` },
              { label: 'REPS',     value: drill.reps },
            ].map(s => (
              <Card key={s.label} style={styles.statCard}>
                <Text style={styles.statLabel}>{s.label}</Text>
                <Text style={styles.statValue}>{s.value}</Text>
              </Card>
            ))}
          </View>

          {/* Coach note */}
          <Card variant="accent" style={styles.coachCard}>
            <Text style={styles.coachHeader}>🏀 Coach's Note</Text>
            <Text style={styles.coachNote}>{drill.coachNote}</Text>
          </Card>

          {/* Equipment */}
          {drill.equipment.length > 0 && (
            <View style={styles.equipSection}>
              <Text style={styles.equipTitle}>EQUIPMENT NEEDED</Text>
              <View style={styles.equipList}>
                {drill.equipment.map(eq => (
                  <View key={eq} style={styles.equipItem}>
                    <Text style={styles.equipDot}>•</Text>
                    <Text style={styles.equipText}>{eq}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Set tracker */}
          <View style={styles.setTracker}>
            <Text style={styles.setTrackerTitle}>SET TRACKER</Text>
            <View style={styles.setDots}>
              {Array.from({ length: drill.sets }).map((_, i) => (
                <Animated.View
                  key={i}
                  style={[styles.setDot, i < setsCompleted && styles.setDotDone, i === setsCompleted && setAnimStyle]}
                >
                  {i < setsCompleted && <Text style={styles.setDotCheck}>✓</Text>}
                  {i >= setsCompleted && (
                    <Text style={styles.setDotNum}>{i + 1}</Text>
                  )}
                </Animated.View>
              ))}
            </View>
            <Text style={styles.setProgress}>
              {setsCompleted} / {drill.sets} sets completed
            </Text>
          </View>

          {sessionLogged ? (
            <View style={styles.complete}>
              <Text style={styles.completeEmoji}>🔥</Text>
              <Text style={styles.completeText}>Session logged!</Text>
              <Button label="Back to Train" variant="secondary" size="md" onPress={() => router.back()} />
            </View>
          ) : (
            <Button
              label={setsCompleted === 0 ? 'Start — Complete a Set' : setsCompleted < drill.sets ? `Set ${setsCompleted + 1} Done ✓` : 'All Sets Complete!'}
              variant="primary"
              size="lg"
              style={styles.ctaBtn}
              disabled={setsCompleted >= drill.sets}
              onPress={completeSet}
            />
          )}

          <View style={{ height: 32 }} />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  notFound: { flex: 1, backgroundColor: Colors.background, alignItems: 'center', justifyContent: 'center', gap: 16 },
  notFoundText: { fontFamily: Fonts.interBold, fontSize: 18, color: Colors.textPrimary },
  videoContainer: { position: 'relative', backgroundColor: '#000' },
  backBtn: { position: 'absolute', top: Platform.OS === 'ios' ? 52 : 16, left: 16 },
  backBtnInner: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.6)', alignItems: 'center', justifyContent: 'center',
  },
  backArrow: { fontSize: 18, color: '#fff', fontFamily: Fonts.interBold },
  scroll: { flex: 1 },
  scrollContent: { padding: Spacing.lg, gap: Spacing.lg },
  header: { gap: Spacing.sm },
  badges: { flexDirection: 'row', gap: 8 },
  title: { fontFamily: Fonts.interBold, fontSize: 22, color: Colors.textPrimary },
  subtitle: { fontFamily: Fonts.inter, fontSize: 14, color: Colors.textSecondary },
  statsRow: { flexDirection: 'row', gap: Spacing.sm },
  statCard: { flex: 1, alignItems: 'center', gap: 4, paddingVertical: Spacing.md },
  statLabel: { fontFamily: Fonts.interSemi, fontSize: 9, color: Colors.textTertiary, letterSpacing: 1.2 },
  statValue: { fontFamily: Fonts.interBold, fontSize: 18, color: Colors.textPrimary },
  coachCard: { gap: Spacing.sm },
  coachHeader: { fontFamily: Fonts.interSemi, fontSize: 13, color: Colors.accent },
  coachNote: { fontFamily: Fonts.inter, fontSize: 14, color: Colors.textSecondary, lineHeight: 22 },
  equipSection: { gap: Spacing.sm },
  equipTitle: { fontFamily: Fonts.interSemi, fontSize: 11, color: Colors.textTertiary, letterSpacing: 1.5 },
  equipList: { gap: 6 },
  equipItem: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  equipDot: { color: Colors.accent, fontSize: 16 },
  equipText: { fontFamily: Fonts.inter, fontSize: 14, color: Colors.textSecondary },
  setTracker: {
    backgroundColor: Colors.surface, borderRadius: Radius.lg,
    borderWidth: 1, borderColor: Colors.border, padding: Spacing.md, gap: Spacing.md,
  },
  setTrackerTitle: { fontFamily: Fonts.interSemi, fontSize: 11, color: Colors.textTertiary, letterSpacing: 1.5 },
  setDots: { flexDirection: 'row', gap: 10, flexWrap: 'wrap' },
  setDot: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: Colors.surface2, borderWidth: 1, borderColor: Colors.border,
    alignItems: 'center', justifyContent: 'center',
  },
  setDotDone: { backgroundColor: Colors.success + '20', borderColor: Colors.success },
  setDotCheck: { fontFamily: Fonts.interBold, fontSize: 18, color: Colors.success },
  setDotNum: { fontFamily: Fonts.interBold, fontSize: 16, color: Colors.textTertiary },
  setProgress: { fontFamily: Fonts.interSemi, fontSize: 13, color: Colors.textSecondary },
  complete: { alignItems: 'center', gap: Spacing.md },
  completeEmoji: { fontSize: 48 },
  completeText: { fontFamily: Fonts.interBold, fontSize: 22, color: Colors.textPrimary },
  ctaBtn: { width: '100%' },
});
