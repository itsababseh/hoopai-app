import { useCallback, useEffect } from 'react';
import { BackHandler, Platform } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useSessionExecutionStore } from '../stores/sessionExecutionStore';
import { DrillItem } from '../constants/sessionTypes';
import { useElapsedTimer } from './useElapsedTimer';

/**
 * Orchestrator hook for the session execution FSM.
 * Wires up back-button interception, haptics, and exposes
 * action callbacks for screen components.
 */
export function useSessionExecution() {
  const store = useSessionExecutionStore();
  useElapsedTimer();

  // Android back button → pause instead of navigate away
  useEffect(() => {
    if (Platform.OS !== 'android') return;

    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      const state = useSessionExecutionStore.getState().executionState;
      if (state === 'active' || state === 'rest') {
        useSessionExecutionStore.getState().pause();
        return true; // Swallow event
      }
      if (state === 'paused') {
        useSessionExecutionStore.getState().requestEarlyExit();
        return true;
      }
      return false;
    });

    return () => sub.remove();
  }, []);

  const handleCompleteSet = useCallback(async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    store.completeSet();
  }, [store]);

  const handleCompleteDrill = useCallback(async () => {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    store.completeDrill();
  }, [store]);

  const handleSkipDrill = useCallback(async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    store.skipDrill();
  }, [store]);

  const handleRestComplete = useCallback(() => {
    store.endRest();
  }, [store]);

  const handleSkipRest = useCallback(async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    store.skipRest();
  }, [store]);

  const handlePause = useCallback(async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    store.pause();
  }, [store]);

  const handleResume = useCallback(() => {
    store.resume();
  }, [store]);

  const handleRequestEarlyExit = useCallback(() => {
    store.requestEarlyExit();
  }, [store]);

  const handleConfirmEarlyExit = useCallback(async () => {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    store.confirmEarlyExit();
  }, [store]);

  const handleCancelEarlyExit = useCallback(() => {
    store.cancelEarlyExit();
  }, [store]);

  const currentDrill: DrillItem | undefined =
    store.drills[store.currentDrillIndex];

  const nextDrill: DrillItem | undefined =
    store.drills[store.currentDrillIndex + 1];

  return {
    // State
    executionState: store.executionState,
    currentDrill,
    nextDrill,
    currentDrillIndex: store.currentDrillIndex,
    currentSetIndex: store.currentSetIndex,
    totalDrills: store.drills.length,
    drills: store.drills,
    drillResults: store.drillResults,
    elapsedSeconds: store.elapsedSeconds,
    completionPercentage: store.completionPercentage,
    currentRestDuration: store.currentRestDuration,
    sessionPlan: store.sessionPlan,

    // Actions
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
  };
}
