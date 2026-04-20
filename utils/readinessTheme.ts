export type ReadinessTheme = {
  label: string;
  labelShort: string;
  color: string;
  colorGlow: string;
  colorBorder: string;
  intensityLabel: string;
};

export function getReadinessTheme(score: number): ReadinessTheme {
  if (score >= 80) return {
    label: 'Peak Performance',
    labelShort: 'PEAK',
    color: '#4FACFE',
    colorGlow: '#4FACFE22',
    colorBorder: '#4FACFE44',
    intensityLabel: 'HIGH INTENSITY',
  };
  if (score >= 60) return {
    label: 'Game Ready',
    labelShort: 'READY',
    color: '#00D4AA',
    colorGlow: '#00D4AA22',
    colorBorder: '#00D4AA44',
    intensityLabel: 'STANDARD',
  };
  if (score >= 40) return {
    label: 'Building',
    labelShort: 'BUILD',
    color: '#FFB547',
    colorGlow: '#FFB54722',
    colorBorder: '#FFB54744',
    intensityLabel: 'MODERATE',
  };
  if (score >= 20) return {
    label: 'Light Day',
    labelShort: 'LIGHT',
    color: '#FF8C5A',
    colorGlow: '#FF8C5A22',
    colorBorder: '#FF8C5A44',
    intensityLabel: 'LOW INTENSITY',
  };
  return {
    label: 'Recovery',
    labelShort: 'RECOVERY',
    color: '#8A8A9A',
    colorGlow: '#8A8A9A11',
    colorBorder: '#8A8A9A22',
    intensityLabel: 'RECOVERY',
  };
}
