// ─── Readiness Computation ─────────────────────────────────────────────────────
// Two modes:
//   Manual: uses check-in sliders (energy, soreness, sleep) only
//   Auto:   blends health data (HRV, RHR, sleep from Apple Health / Health Connect)
//           with check-in sliders for a more accurate score

export interface ReadinessInputs {
  // Check-in sliders (always present)
  energy: number;    // 1–10
  soreness: number;  // 1–10 (1 = very sore, 10 = fresh)
  sleepRating: number; // 1–10

  // Optional health data (auto mode)
  hrv?: number;              // ms (RMSSD) — from wearable
  restingHeartRate?: number; // bpm — from wearable
  sleepHours?: number;       // hours — from Apple Health / Health Connect
  sleepScore?: number;       // 0–100 — platform sleep score
}

export interface ReadinessResult {
  score: number;       // 0–100
  mode: 'manual' | 'auto' | 'adjusted';
  confidence: number;  // 0–1, how many health signals are present
}

// ─── Manual computation (baseline) ───────────────────────────────────────────
// Weights: sleep 40%, energy 35%, soreness 25%

function computeManual(inputs: ReadinessInputs): number {
  const { energy, soreness, sleepRating } = inputs;
  const sleepNorm   = ((sleepRating - 1) / 9) * 100;
  const energyNorm  = ((energy - 1) / 9) * 100;
  const sorenessNorm = ((soreness - 1) / 9) * 100; // higher = fresher

  return Math.round(sleepNorm * 0.40 + energyNorm * 0.35 + sorenessNorm * 0.25);
}

// ─── HRV modifier ────────────────────────────────────────────────────────────
// Maps HRV to a -15 … +15 adjustment
// Reference baseline: 55ms (population median)
// Elite athletes: 80–120ms; sedentary: 20–40ms

function hrvModifier(hrv: number): number {
  const safeHrv = hrv ?? 55;
  const baseline = 55;
  const delta = safeHrv - baseline;
  // Scale: every 10ms above/below baseline = ±5 points, capped at ±15
  return Math.max(-15, Math.min(15, Math.round((delta / 10) * 5)));
}

// ─── RHR modifier ────────────────────────────────────────────────────────────
// Low RHR = well recovered; high = fatigued
// Reference: 60bpm baseline; <50 = excellent, >75 = stressed

function rhrModifier(rhr: number): number {
  const baseline = 60;
  const delta = baseline - rhr; // positive = RHR lower than baseline = better
  return Math.max(-10, Math.min(10, Math.round((delta / 5) * 4)));
}

// ─── Sleep hours modifier ─────────────────────────────────────────────────────
// Overrides the slider-based sleep component when real data is available

function sleepHoursScore(hours: number): number {
  // 8h = 100, 6h = 60, 4h = 20, >9h = 95 (slight overtraining signal)
  if (hours >= 9) return 95;
  if (hours >= 8) return 100;
  if (hours >= 7) return 82;
  if (hours >= 6) return 62;
  if (hours >= 5) return 40;
  return 20;
}

// ─── Main computation ─────────────────────────────────────────────────────────

export function computeReadiness(inputs: ReadinessInputs): ReadinessResult {
  const {
    energy,
    soreness,
    sleepRating,
    hrv,
    restingHeartRate,
    sleepHours,
    sleepScore,
  } = inputs;

  const hasHrv   = hrv != null && hrv > 0;
  const hasRhr   = restingHeartRate != null && restingHeartRate > 0;
  const hasSleep = sleepHours != null && sleepHours > 0;

  const healthSignals = [hasHrv, hasRhr, hasSleep].filter(Boolean).length;

  // ── Pure manual (no health data) ─────────────────────────────────────────
  if (healthSignals === 0) {
    return {
      score: Math.max(5, Math.min(100, computeManual(inputs))),
      mode: 'manual',
      confidence: 0,
    };
  }

  // ── Auto mode: blend health + sliders ────────────────────────────────────
  const confidence = healthSignals / 3;

  // Sleep component: prefer real sleep hours over slider if available
  const sleepComponent = hasSleep
    ? (sleepScore != null ? sleepScore : sleepHoursScore(sleepHours!))
    : ((sleepRating - 1) / 9) * 100;

  // Energy and soreness still come from check-in sliders
  const energyNorm   = ((energy - 1) / 9) * 100;
  const sorenessNorm = ((soreness - 1) / 9) * 100;

  // Base weighted score
  let base = sleepComponent * 0.40 + energyNorm * 0.35 + sorenessNorm * 0.25;

  // Apply HRV modifier (strong signal)
  if (hasHrv) {
    base += hrvModifier(hrv!);
  }

  // Apply RHR modifier (supporting signal)
  if (hasRhr) {
    base += rhrModifier(restingHeartRate!);
  }

  const score = Math.max(5, Math.min(100, Math.round(base)));
  const manualScore = computeManual(inputs);
  const mode: ReadinessResult['mode'] =
    Math.abs(score - manualScore) > 8 ? 'adjusted' : 'auto';

  return { score, mode, confidence };
}

// ─── Legacy wrapper for session generator ────────────────────────────────────
// sessionGenerator.ts calls computeReadiness with a simpler signature

export function computeReadinessLegacy(
  energy: number,
  soreness: number,
  sleep: number,
  hrv?: number
): number {
  return computeReadiness({
    energy,
    soreness,
    sleepRating: sleep,
    hrv,
  }).score;
}
