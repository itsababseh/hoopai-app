import React, { useEffect, useRef } from 'react';
import { ScrollView, View, Pressable, SafeAreaView, RefreshControl } from 'react-native';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import BottomSheet, { BottomSheetBackdrop } from '@gorhom/bottom-sheet';
import { Colors } from '../../constants/theme';
import { AppText } from '../../components/ui/Text';
import { ProgressRing } from '../../components/ui/ProgressRing';
import { AISessionCard } from '../../components/session/AISessionCard';
import { AIInsightsWidget } from '../../components/today/AIInsightsWidget';
import { CheckInSheet } from '../../components/today/CheckInSheet';
import { useUserStore } from '../../stores/userStore';
import { useSessionStore } from '../../stores/sessionStore';
import { useActiveSessionStore } from '../../stores/activeSessionStore';
import { generateSession } from '../../utils/sessionGenerator';
import { getReadinessTheme } from '../../utils/readinessTheme';

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

export default function TodayScreen() {
  const { profile } = useUserStore();
  const { todayCheckIn, history, streak } = useSessionStore();
  const { currentSession, generationStatus, regenerationCount, setCurrentSession, setGenerationStatus, incrementRegenCount } = useActiveSessionStore();
  const sheetRef = useRef<BottomSheet>(null);
  const [refreshing, setRefreshing] = React.useState(false);

  const readinessScore = todayCheckIn?.readinessScore ?? 0;
  const hasCheckedIn = !!todayCheckIn;
  const theme = getReadinessTheme(readinessScore);

  // Auto-generate session on mount if checked in and none yet
  useEffect(() => {
    if (hasCheckedIn && generationStatus === 'idle' && !currentSession) {
      runGeneration();
    }
  }, [hasCheckedIn]);

  function runGeneration(seed?: number) {
    setGenerationStatus('generating');
    setTimeout(() => {
      try {
        const recentDrillIds = history.slice(-7).flatMap((s: any) => s.drillIds ?? []);
        const session = generateSession({
          readinessScore: hasCheckedIn ? readinessScore : 70,
          energyLevel: todayCheckIn?.energyLevel ?? 5,
          sorenessLevel: todayCheckIn?.sorenessLevel ?? 3,
          sleepQuality: todayCheckIn?.sleepScore ? Math.round(todayCheckIn.sleepScore / 20) : 3,
          position: profile?.position ?? 'PG',
          skillLevel: (profile?.level ?? 'intermediate') as any,
          primaryGoal: (profile?.primaryGoal ?? 'scoring') as any,
          sessionDurationPref: (profile?.sessionDuration ?? 45) as any,
          recentDrillIds,
          streakCount: streak,
          regenerationSeed: seed ?? Date.now(),
        });
        setCurrentSession(session);
      } catch {
        setGenerationStatus('error');
      }
    }, 3500); // simulate generation time
  }

  const handleRegenerate = () => {
    if (regenerationCount >= 3) return;
    incrementRegenCount();
    Haptics.selectionAsync();
    setGenerationStatus('generating');
    setTimeout(() => runGeneration(Date.now() + regenerationCount), 100);
  };

  const handleStartSession = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    router.push('/session/active');
  };

  const handleCheckIn = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    sheetRef.current?.expand();
  };

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.background }}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 120 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.accent} />}
      >
        {/* Header */}
        <View style={{ paddingHorizontal: 24, paddingTop: 20, paddingBottom: 8 }}>
          <AppText variant="body" style={{ color: Colors.textSecondary }}>{getGreeting()}{profile?.name ? `, ${profile.name}` : ''}</AppText>
          <AppText variant="display" style={{ fontSize: 32, marginTop: 4 }}>Today's Game Plan</AppText>
        </View>

        {/* Readiness Card */}
        <Pressable onPress={handleCheckIn} style={{ marginHorizontal: 16, marginTop: 12, borderRadius: 20, backgroundColor: Colors.surface, borderWidth: 1, borderColor: hasCheckedIn ? theme.colorBorder : Colors.border, padding: 20 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <View style={{ flex: 1 }}>
              <AppText variant="label" style={{ color: Colors.textTertiary }}>READINESS SCORE</AppText>
              <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 8, marginTop: 6 }}>
                <AppText variant="display" style={{ fontSize: 56, color: hasCheckedIn ? theme.color : Colors.textTertiary }}>
                  {hasCheckedIn ? readinessScore : '--'}
                </AppText>
                {hasCheckedIn && <AppText variant="title" style={{ color: theme.color, fontSize: 16 }}>{theme.label}</AppText>}
              </View>
              {!hasCheckedIn && (
                <AppText variant="body" style={{ marginTop: 4, color: Colors.accent }}>Tap to check in →</AppText>
              )}
              {hasCheckedIn && (
                <AppText variant="body" style={{ marginTop: 4 }}>{currentSession ? 'Session ready below' : 'Building your session...'}</AppText>
              )}
            </View>
            <ProgressRing size={80} progress={hasCheckedIn ? readinessScore / 100 : 0} color={hasCheckedIn ? theme.color : Colors.textTertiary} strokeWidth={6} />
          </View>
        </Pressable>

        {/* Stats Row */}
        <View style={{ flexDirection: 'row', gap: 12, marginHorizontal: 16, marginTop: 12 }}>
          {[
            { label: 'Streak', value: `${streak}d`, icon: '🔥' },
            { label: 'Sessions', value: String(history.length), icon: '📊' },
            { label: 'Level', value: profile?.level ?? 'Beginner', icon: '⚡' },
          ].map(stat => (
            <View key={stat.label} style={{ flex: 1, backgroundColor: Colors.surface, borderRadius: 14, padding: 14, borderWidth: 1, borderColor: Colors.border, alignItems: 'center' }}>
              <AppText style={{ fontSize: 20 }}>{stat.icon}</AppText>
              <AppText variant="heading" style={{ fontSize: 18, marginTop: 4 }}>{stat.value}</AppText>
              <AppText variant="body" style={{ fontSize: 11, marginTop: 2 }}>{stat.label}</AppText>
            </View>
          ))}
        </View>

        {/* AI Session Card */}
        <View style={{ marginHorizontal: 16, marginTop: 20 }}>
          <AppText variant="label" style={{ color: Colors.textTertiary, marginBottom: 12 }}>TODAY'S SESSION</AppText>
          {!hasCheckedIn ? (
            <Pressable onPress={handleCheckIn} style={{ borderRadius: 16, backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border, padding: 24, alignItems: 'center' }}>
              <AppText style={{ fontSize: 32 }}>📋</AppText>
              <AppText variant="title" style={{ marginTop: 12, textAlign: 'center' }}>Complete your check-in</AppText>
              <AppText variant="body" style={{ textAlign: 'center', marginTop: 4 }}>We'll build a personalized session based on how you feel today</AppText>
              <View style={{ marginTop: 16, paddingHorizontal: 20, paddingVertical: 10, borderRadius: 10, backgroundColor: Colors.accent }}>
                <AppText variant="title" style={{ color: '#fff', fontSize: 14 }}>Check In Now</AppText>
              </View>
            </Pressable>
          ) : (
            <AISessionCard
              session={currentSession}
              status={generationStatus}
              readinessScore={readinessScore}
              onStart={handleStartSession}
              onRegenerate={handleRegenerate}
              onDrillPress={id => router.push(`/drill/${id}`)}
              regenCount={regenerationCount}
            />
          )}
        </View>

        {/* AI Insights */}
        <View style={{ marginTop: 20 }}>
          <AppText variant="label" style={{ color: Colors.textTertiary, marginBottom: 12, marginHorizontal: 16 }}>COACH AI</AppText>
          <AIInsightsWidget />
        </View>
      </ScrollView>

      {/* Check-in Bottom Sheet */}
      <BottomSheet
        ref={sheetRef}
        index={-1}
        snapPoints={['75%']}
        enablePanDownToClose
        backgroundStyle={{ backgroundColor: Colors.surface }}
        handleIndicatorStyle={{ backgroundColor: Colors.border }}
        backdropComponent={(props) => (
          <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} opacity={0.7} />
        )}
      >
        <CheckInSheet onComplete={() => {
          sheetRef.current?.close();
          // Trigger session generation after check-in
          setTimeout(() => {
            if (!currentSession) runGeneration();
          }, 500);
        }} />
      </BottomSheet>
    </SafeAreaView>
  );
}
