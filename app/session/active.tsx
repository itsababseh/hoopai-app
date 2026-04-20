import React, { useEffect, useRef, useState } from 'react';
import { View, Pressable, SafeAreaView, Alert, Dimensions } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, withSequence, withTiming, FadeIn } from 'react-native-reanimated';
import YoutubeIframe from 'react-native-youtube-iframe';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Colors } from '../../constants/theme';
import { AppText } from '../../components/ui/Text';
import { useActiveSessionStore } from '../../stores/activeSessionStore';
import { useSessionStore } from '../../stores/sessionStore';
import { getReadinessTheme } from '../../utils/readinessTheme';

const { width: W } = Dimensions.get('window');

export default function ActiveSessionScreen() {
  const { currentSession, activeState, startSession, completeSet, skipDrill, nextDrill, tickRestTimer, addRestTime, completeSession, abandonSession } = useActiveSessionStore();
  const { addSessionToHistory } = useSessionStore();
  const [videoPlaying, setVideoPlaying] = useState(false);
  const [showComplete, setShowComplete] = useState(false);
  const restInterval = useRef<ReturnType<typeof setInterval> | null>(null);
  const completeScale = useSharedValue(0);
  const btnScale = useSharedValue(1);
  const overlayOpacity = useSharedValue(0);
  const overlayY = useSharedValue(60);

  useEffect(() => { if (!activeState) startSession(); }, []);

  // Rest timer
  useEffect(() => {
    if (activeState?.isResting) {
      restInterval.current = setInterval(() => tickRestTimer(), 1000);
    } else {
      if (restInterval.current) clearInterval(restInterval.current);
    }
    return () => { if (restInterval.current) clearInterval(restInterval.current); };
  }, [activeState?.isResting]);

  // Check if session done
  useEffect(() => {
    if (!currentSession || !activeState) return;
    const allDone = activeState.currentDrillIndex >= currentSession.drills.length;
    if (allDone && !showComplete) {
      setShowComplete(true);
      overlayOpacity.value = withTiming(1, { duration: 300 });
      overlayY.value = withSpring(0, { damping: 18, stiffness: 180 });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  }, [activeState?.currentDrillIndex]);

  const handleCompleteSet = () => {
    btnScale.value = withSequence(
      withSpring(0.95, { damping: 6, stiffness: 600 }),
      withSpring(1.0, { damping: 10, stiffness: 300 }),
    );
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    completeSet();
    // Check if drill done → move to next
    if (activeState && currentSession) {
      const drill = currentSession.drills[activeState.currentDrillIndex];
      if (activeState.currentSet >= drill.targetSets) {
        setTimeout(() => nextDrill(), 400);
      }
    }
  };

  const handleAbandon = () => {
    Alert.alert('Abandon Session?', 'Your progress will be saved.', [
      { text: 'Keep Going', style: 'cancel' },
      { text: 'Abandon', style: 'destructive', onPress: () => { abandonSession(); router.replace('/(tabs)/today'); } },
    ]);
  };

  const handleFinish = () => {
    const result = completeSession();
    addSessionToHistory(result as any);
    router.replace('/session/summary');
  };

  const btnScaleStyle = useAnimatedStyle(() => ({ transform: [{ scale: btnScale.value }] }));
  const overlayStyle = useAnimatedStyle(() => ({ opacity: overlayOpacity.value, transform: [{ translateY: overlayY.value }] }));

  if (!currentSession || !activeState) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: Colors.background, alignItems: 'center', justifyContent: 'center' }}>
        <AppText variant="body">Loading session...</AppText>
      </SafeAreaView>
    );
  }

  const drill = currentSession.drills[Math.min(activeState.currentDrillIndex, currentSession.drills.length - 1)];
  const theme = getReadinessTheme(currentSession.readinessSnapshot);
  const progress = activeState.completedDrillIds.length / currentSession.drills.length;
  const allSetsComplete = activeState.currentSet > drill?.targetSets;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.background }}>
      {/* Progress bar */}
      <View style={{ height: 3, backgroundColor: Colors.surface2 }}>
        <Animated.View style={{ height: 3, backgroundColor: Colors.accent, width: `${progress * 100}%` }} />
      </View>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 24, paddingTop: 8 }}>
        <AppText variant="label" style={{ color: Colors.textTertiary }}>
          DRILL {activeState.currentDrillIndex + 1} OF {currentSession.drills.length}
        </AppText>
        <Pressable onPress={handleAbandon}>
          <AppText variant="label" style={{ color: Colors.textTertiary }}>✕ END</AppText>
        </Pressable>
      </View>

      {/* Drill Card */}
      {drill && (
        <View style={{ marginHorizontal: 16, marginTop: 20, borderRadius: 20, backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border, overflow: 'hidden' }}>
          {/* Video */}
          <Pressable onPress={() => setVideoPlaying(v => !v)} style={{ width: '100%', aspectRatio: 16 / 9, backgroundColor: Colors.surface2, alignItems: 'center', justifyContent: 'center' }}>
            {videoPlaying ? (
              <YoutubeIframe height={W * (9 / 16)} width={W - 32} videoId={drill.youtubeId} play={true} />
            ) : (
              <View style={{ alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%' }}>
                <View style={{ width: 52, height: 52, borderRadius: 26, backgroundColor: '#00000066', borderWidth: 1.5, borderColor: '#FFFFFF33', alignItems: 'center', justifyContent: 'center' }}>
                  <AppText style={{ color: '#fff', fontSize: 22, marginLeft: 4 }}>▶</AppText>
                </View>
                <View style={{ position: 'absolute', top: 12, left: 12, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 4, backgroundColor: '#4FACFE15', borderWidth: 1, borderColor: '#4FACFE30' }}>
                  <AppText variant="label" style={{ color: Colors.accentBlue, fontSize: 10, letterSpacing: 1.5 }}>{drill.category.toUpperCase()}</AppText>
                </View>
              </View>
            )}
          </Pressable>

          {/* Content */}
          <View style={{ padding: 20 }}>
            <AppText variant="display" style={{ fontSize: 28 }}>{drill.drillName}</AppText>
            <AppText variant="body" style={{ marginTop: 8, fontSize: 15 }}>{drill.targetSets} sets × {drill.reps}</AppText>
            {drill.coachingCue && (
              <View style={{ flexDirection: 'row', marginTop: 12 }}>
                <View style={{ width: 2, borderRadius: 1, backgroundColor: Colors.accent, marginRight: 10 }} />
                <AppText variant="body" style={{ flex: 1, fontSize: 14 }} numberOfLines={2}>{drill.coachingCue}</AppText>
              </View>
            )}
          </View>
        </View>
      )}

      {/* Set Tracker */}
      {drill && (
        <View style={{ paddingHorizontal: 24, marginTop: 24 }}>
          <AppText variant="label" style={{ color: Colors.textTertiary, marginBottom: 12 }}>COMPLETED SETS</AppText>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            {Array.from({ length: drill.targetSets }).map((_, i) => {
              const isDone = i < (activeState.currentSet - 1);
              const isCurrent = i === (activeState.currentSet - 1);
              return (
                <View key={i} style={{
                  width: 36, height: 36, borderRadius: 18,
                  backgroundColor: isDone ? Colors.success : 'transparent',
                  borderWidth: 1.5,
                  borderColor: isDone ? Colors.success : isCurrent ? Colors.accent : Colors.border,
                  alignItems: 'center', justifyContent: 'center',
                }}>
                  <AppText variant="label" style={{ fontSize: 13, color: isDone ? '#fff' : isCurrent ? Colors.accent : Colors.textTertiary }}>
                    {i + 1}
                  </AppText>
                </View>
              );
            })}
          </View>
        </View>
      )}

      {/* Rest Timer */}
      {activeState.isResting && (
        <View style={{ marginHorizontal: 24, marginTop: 24, padding: 20, borderRadius: 16, backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border, alignItems: 'center' }}>
          <AppText variant="label" style={{ color: Colors.textTertiary, letterSpacing: 2 }}>REST</AppText>
          <AppText variant="display" style={{ fontSize: 72, marginTop: 4 }}>{activeState.restSecondsRemaining}</AppText>
          <View style={{ flexDirection: 'row', gap: 12, marginTop: 16, width: '100%' }}>
            <Pressable onPress={() => addRestTime(30)} style={{ flex: 1, height: 44, borderRadius: 12, backgroundColor: Colors.surface2, borderWidth: 1, borderColor: Colors.border, alignItems: 'center', justifyContent: 'center' }}>
              <AppText variant="title" style={{ color: Colors.textSecondary, fontSize: 14 }}>+30s</AppText>
            </Pressable>
            <Pressable onPress={() => { if (restInterval.current) clearInterval(restInterval.current); useActiveSessionStore.getState().setResting(false); }}
              style={{ flex: 1, height: 44, borderRadius: 12, backgroundColor: Colors.surface2, borderWidth: 1, borderColor: Colors.accent, alignItems: 'center', justifyContent: 'center' }}>
              <AppText variant="title" style={{ color: Colors.accent, fontSize: 14 }}>Skip Rest</AppText>
            </Pressable>
          </View>
        </View>
      )}

      {/* Complete Set Button */}
      {!activeState.isResting && drill && (
        <View style={{ paddingHorizontal: 24, marginTop: 'auto', paddingBottom: 24 }}>
          <Animated.View style={btnScaleStyle}>
            <Pressable onPress={allSetsComplete ? () => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); nextDrill(); } : handleCompleteSet}
              style={{ height: 60, borderRadius: 16, backgroundColor: allSetsComplete ? Colors.success : Colors.accent, alignItems: 'center', justifyContent: 'center' }}>
              <AppText variant="display" style={{ fontSize: 22, letterSpacing: 0.5, color: '#fff' }}>
                {allSetsComplete ? 'Next Drill →' : 'Complete Set'}
              </AppText>
            </Pressable>
          </Animated.View>
          <Pressable onPress={() => { Haptics.selectionAsync(); skipDrill(); }} style={{ alignItems: 'center', marginTop: 14 }}>
            <AppText variant="body" style={{ color: Colors.textTertiary, fontSize: 14 }}>Skip this drill</AppText>
          </Pressable>
        </View>
      )}

      {/* Completion Overlay */}
      {showComplete && (
        <Animated.View style={[{ position: 'absolute', inset: 0, backgroundColor: 'rgba(10,10,15,0.95)', alignItems: 'center', justifyContent: 'center' }, overlayStyle]}>
          <View style={{ margin: 24, borderRadius: 24, backgroundColor: Colors.surface, padding: 28, alignItems: 'center', width: W - 48 }}>
            <View style={{ width: 80, height: 80, borderRadius: 40, backgroundColor: Colors.success, alignItems: 'center', justifyContent: 'center' }}>
              <AppText style={{ color: '#fff', fontSize: 36 }}>✓</AppText>
            </View>
            <AppText variant="display" style={{ fontSize: 32, marginTop: 20, textAlign: 'center' }}>Session Complete!</AppText>
            <AppText variant="body" style={{ marginTop: 8, textAlign: 'center' }}>Excellent work.</AppText>
            <View style={{ flexDirection: 'row', gap: 32, marginTop: 24 }}>
              <View style={{ alignItems: 'center' }}>
                <AppText style={{ color: Colors.success, fontSize: 20 }}>🎯</AppText>
                <AppText variant="heading" style={{ fontSize: 24, color: Colors.success }}>{activeState.completedDrillIds.length}</AppText>
                <AppText variant="body" style={{ fontSize: 12 }}>Drills</AppText>
              </View>
              <View style={{ alignItems: 'center' }}>
                <AppText style={{ color: Colors.success, fontSize: 20 }}>🔁</AppText>
                <AppText variant="heading" style={{ fontSize: 24, color: Colors.success }}>{currentSession.drills.reduce((s, d) => s + d.completedSets, 0)}</AppText>
                <AppText variant="body" style={{ fontSize: 12 }}>Sets</AppText>
              </View>
            </View>
            <Pressable onPress={handleFinish}
              style={{ marginTop: 28, width: '100%', height: 56, borderRadius: 14, backgroundColor: Colors.accent, alignItems: 'center', justifyContent: 'center' }}>
              <AppText variant="display" style={{ fontSize: 20, color: '#fff' }}>See Full Summary</AppText>
            </Pressable>
          </View>
        </Animated.View>
      )}
    </SafeAreaView>
  );
}
