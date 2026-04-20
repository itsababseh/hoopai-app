import { useEffect, useRef } from 'react';
import { useSessionExecutionStore } from '../stores/sessionExecutionStore';

/**
 * Monotonic elapsed timer using Date.now() deltas.
 * Fires every 500ms; calls store.tick() with current timestamp.
 * Avoids setInterval drift by anchoring to wall clock, not tick count.
 */
export function useElapsedTimer() {
  const tick = useSessionExecutionStore((s) => s.tick);
  const executionState = useSessionExecutionStore((s) => s.executionState);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const isRunning = executionState === 'active' || executionState === 'rest';

    if (isRunning) {
      intervalRef.current = setInterval(() => {
        tick(Date.now());
      }, 500);
    } else {
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [executionState, tick]);
}
