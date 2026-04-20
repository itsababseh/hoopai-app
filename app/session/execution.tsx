import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SessionHeader } from '../../components/session/execution/SessionHeader';
import { SessionProgressBar } from '../../components/session/execution/SessionProgressBar';
import { DrillCard } from '../../components/session/execution/DrillCard';
import { SetRepCounter } from '../../components/session/execution/SetRepCounter';
import { PauseMenu } from '../../components/session/execution/PauseMenu';
import { EarlyExitDialog } from '../../components/session/execution/EarlyExitDialog';
import { RestTimerOverlay } from '../../components/session/rest/RestTimerOverlay';
import { DrillQueuePreview } from '../../components/session/queue/DrillQueuePreview';
import { useSessionExecution } from '../../hooks/useSessionExecution';
import { useSessionExecutionStore } from '../../stores/sessionExecutionStore';
import { DrillItem } from '../../constants/sessionTypes';

/**
 * Entry point for live session execution.
 * Receives sessionPlan + drills via route params (JSON-serialized).
 * Composes: header, progress bar, drill card, set/rep counter.
 * Overlays: rest timer, pause menu, queue preview, early exit dialog.
 */
export default function ExecutionScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ sessionPlanJson: string; drillsJson: string }>();
  const store = useSessionExecutionStore();
  const [queueVisible, setQueueVisible] = useState(false);

  const {
    executionState,
    currentDrill,
    nextDrill,
    currentDrillIndex,
    currentSetIndex,
    totalDrills,
    drills,
    drillResults,
    elapsedSeconds,
    completionPercentage,
    currentRestDuration,
    sessionPlan,
    handleCompleteSet,
    handleCompleteDrill,
    handleSkipDrill,
    handleRestComplete,
    handleSkipRest,
    handlePause,
    handleResume,
    handleRequestEarlyExit,
    handleConfirmEarlyExit,
    handleCancelEarlyExit,
  } = useSessionExecution();

  // Bootstrap session on mount
  useEffect(() => {
    if (!params.sessionPlanJson || !params.drillsJson) return;
    if (executionState !== 'idle') return;

    try {
      const sessionPlanData = JSON.parse(params.sessionPlanJson);
      const drillsData: DrillItem[] = JSON.parse(params.drillsJson);
      store.startSession(sessionPlanData, drillsData);
    } catch (e) {
      // Malformed params — go back
      router.back();
    }
  }, []);

  // Navigate to completion when session ends
  useEffect(() => {
    if (executionState === 'completed' || executionState === 'partial_complete') {
      router.replace('/session/completion');
    }
  }, [executionState]);

  const readinessTier = sessionPlan?.readinessTier ?? 'ready';
  const isResting = executionState === 'rest';
  const isPaused = executionState === 'paused';
  const isEarlyExitConfirm = executionState === 'early_exit_confirm';

  if (!currentDrill && executionState === 'active') return null;

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor="#0A0A0F" />

      <SafeAreaView style={styles.safe} edges={['top']}>
        {/* Header: drill N/X, elapsed, readiness, pause button */}
        {currentDrill && (
          <SessionHeader
            drillIndex={currentDrillIndex}
            totalDrills={totalDrills}
            elapsedSeconds={elapsedSeconds}
            readinessTier={readinessTier}
            onPause={handlePause}
          />
        )}

        {/* Thin progress bar */}
        <SessionProgressBar progress={completionPercentage} />

        {/* Main scrollable area */}
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {currentDrill && (
            <DrillCard drill={currentDrill} currentSet={currentSetIndex} />
          )}

          {currentDrill && (
            <SetRepCounter
              currentSet={currentSetIndex}
              totalSets={currentDrill.totalSets}
              reps={currentDrill.reps}
              duration={currentDrill.duration}
              onCompleteSet={handleCompleteSet}
              onSkip={handleSkipDrill}
            />
          )}
        </ScrollView>

        {/* Bottom pill controls */}
        <View style={styles.bottomBar}>
          <View
            style={styles.queuePill}
            // TouchableOpacity wrapper below
          />
        </View>
      </SafeAreaView>

      {/* Bottom controls: QUEUE + PAUSE pills */}
      <View style={styles.bottomControls}>
        <View style={styles.pillRow}>
          <React.Fragment>
            {/* QUEUE pill */}
            <View style={styles.pillWrap}>
              <PillButton label="≡  QUEUE" onPress={() => setQueueVisible(true)} />
            </View>
            {/* PAUSE pill */}
            <View style={styles.pillWrap}>
              <PillButton label="⏸  PAUSE" onPress={handlePause} />
            </View>
          </React.Fragment>
        </View>
      </View>

      {/* Rest overlay */}
      <RestTimerOverlay
        visible={isResting}
        durationSeconds={currentRestDuration}
        nextDrill={nextDrill}
        onComplete={handleRestComplete}
        onSkip={handleSkipRest}
      />

      {/* Pause menu */}
      <PauseMenu
        isVisible={isPaused}
        elapsedSeconds={elapsedSeconds}
        onResume={handleResume}
        onEarlyExit={handleRequestEarlyExit}
      />

      {/* Drill queue preview */}
      <DrillQueuePreview
        isVisible={queueVisible}
        drills={drills}
        currentIndex={currentDrillIndex}
        drillResults={drillResults}
        onClose={() => setQueueVisible(false)}
      />

      {/* Early exit confirmation dialog */}
      <EarlyExitDialog
        visible={isEarlyExitConfirm}
        completionPercentage={completionPercentage}
        onConfirm={handleConfirmEarlyExit}
        onCancel={handleCancelEarlyExit}
      />
    </View>
  );
}

interface PillButtonProps {
  label: string;
  onPress: () => void;
}

function PillButton({ label, onPress }: PillButtonProps) {
    return (
    <TouchableOpacity style={pillStyles.pill} onPress={onPress} activeOpacity={0.75}>
      <Text style={pillStyles.label}>{label}</Text>
    </TouchableOpacity>
  );
}

const pillStyles = StyleSheet.create({
  pill: {
    backgroundColor: '#1C1C26',
    borderRadius: 30,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderWidth: 1,
    borderColor: '#2A2A3A',
  },
  label: {
    fontFamily: 'Inter',
    fontSize: 13,
    color: '#8A8A9A',
    fontWeight: '600',
    letterSpacing: 1,
  },
});

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0A0A0F' },
  safe: { flex: 1 },
  scroll: { flex: 1 },
  scrollContent: { gap: 20, paddingVertical: 20, paddingBottom: 120 },
  bottomBar: { height: 0 }, // placeholder spacer
  bottomControls: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingBottom: 32,
    paddingHorizontal: 24,
    backgroundColor: 'transparent',
  },
  pillRow: {
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'center',
  },
  pillWrap: {},
  queuePill: {},
});
