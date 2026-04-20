export interface ReadinessInputs {
  sleepHours?: number;
  sleepScore?: number;
  energyLevel: number; // 1-10
  soreness: number;    // 1-10 (10 = most sore)
  hrv?: number;
}

export type ReadinessModifier = 'peak' | 'normal' | 'push_down' | 'recovery';

export interface ReadinessResult {
  score: number;
  modifier: ReadinessModifier;
  label: string;
  color: string;
  explanation: string;
  recommendedIntensity: number; // 0-100
}

function generateExplanation(score: number, inputs: ReadinessInputs): string {
  if (score >= 80) {
    return `You're firing on all cylinders today. Energy at ${inputs.energyLevel}/10 and low soreness — push hard.`;
  } else if (score >= 65) {
    return `Solid readiness. ${inputs.soreness > 5 ? 'Some soreness noted — warm up well.' : 'Good energy levels.'} Train at normal intensity.`;
  } else if (score >= 45) {
    return `Moderate fatigue detected. ${inputs.sleepHours && inputs.sleepHours < 7 ? 'Low sleep contributing.' : ''} Dial back volume 20%.`;
  } else {
    return `Recovery day recommended. HRV and fatigue indicators suggest your body needs rest to adapt.`;
  }
}

export function computeReadiness(inputs: ReadinessInputs): ReadinessResult {
  const sleepScore =
    inputs.sleepScore ??
    (inputs.sleepHours ? Math.min((inputs.sleepHours / 9) * 100, 100) : 70);

  const energyScore = (inputs.energyLevel / 10) * 100;
  const sorenessScore = ((10 - inputs.soreness) / 10) * 100;

  let baseScore = sleepScore * 0.40 + energyScore * 0.35 + sorenessScore * 0.25;

  if (inputs.hrv) {
    const hrvModifier = inputs.hrv > 60 ? 1.1 : inputs.hrv < 30 ? 0.85 : 1.0;
    baseScore *= hrvModifier;
  }

  const score = Math.round(Math.min(baseScore, 100));

  let modifier: ReadinessModifier;
  let label: string;
  let color: string;
  let recommendedIntensity: number;

  if (score > 80) {
    modifier = 'peak';
    label = 'Peak';
    color = '#00D4AA';
    recommendedIntensity = 100;
  } else if (score > 65) {
    modifier = 'normal';
    label = 'Ready';
    color = '#4FACFE';
    recommendedIntensity = 85;
  } else if (score > 45) {
    modifier = 'push_down';
    label = 'Moderate';
    color = '#FFB547';
    recommendedIntensity = 65;
  } else {
    modifier = 'recovery';
    label = 'Recovery';
    color = '#FF4D4D';
    recommendedIntensity = 40;
  }

  return {
    score,
    modifier,
    label,
    color,
    explanation: generateExplanation(score, inputs),
    recommendedIntensity,
  };
}
