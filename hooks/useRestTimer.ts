import { useEffect, useRef, useState, useCallback } from 'react';

interface UseRestTimerOptions {
  durationSeconds: number;
  onComplete: () => void;
  autoStart?: boolean;
}

interface RestTimerState {
  secondsRemaining: number;
  progress: number; // 0–1, where 1 = full/start, 0 = done
  isRunning: boolean;
  skip: () => void;
  restart: () => void;
}

/**
 * Countdown timer for rest periods.
 * Uses Date.now() anchoring for accuracy — immune to tab throttling drift.
 */
export function useRestTimer({
  durationSeconds,
  onComplete,
  autoStart = true,
}: UseRestTimerOptions): RestTimerState {
  const [secondsRemaining, setSecondsRemaining] = useState(durationSeconds);
  const [isRunning, setIsRunning] = useState(autoStart);
  const startRef = useRef<number>(Date.now());
  const skippedRef = useRef(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const completedRef = useRef(false);

  const stop = useCallback(() => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsRunning(false);
  }, []);

  const start = useCallback(() => {
    completedRef.current = false;
    startRef.current = Date.now();
    setSecondsRemaining(durationSeconds);
    setIsRunning(true);
  }, [durationSeconds]);

  const skip = useCallback(() => {
    skippedRef.current = true;
    stop();
    setSecondsRemaining(0);
    if (!completedRef.current) {
      completedRef.current = true;
      onComplete();
    }
  }, [stop, onComplete]);

  const restart = useCallback(() => {
    stop();
    start();
  }, [stop, start]);

  useEffect(() => {
    if (!isRunning) return;

    startRef.current = Date.now();

    intervalRef.current = setInterval(() => {
      const elapsed = (Date.now() - startRef.current) / 1000;
      const remaining = Math.max(0, durationSeconds - elapsed);
      setSecondsRemaining(Math.ceil(remaining));

      if (remaining <= 0 && !completedRef.current) {
        completedRef.current = true;
        stop();
        onComplete();
      }
    }, 200);

    return () => {
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isRunning, durationSeconds, onComplete, stop]);

  return {
    secondsRemaining,
    progress: durationSeconds > 0 ? secondsRemaining / durationSeconds : 0,
    isRunning,
    skip,
    restart,
  };
}
