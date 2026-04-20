export const Colors = {
  background:    '#0A0A0F',
  surface:       '#131318',
  surface2:      '#1C1C26',
  accent:        '#FF6B2C',
  accentGlow:    '#FF6B2C40',
  accentBlue:    '#4FACFE',
  success:       '#00D4AA',
  warning:       '#FFB547',
  error:         '#FF4D4D',
  textPrimary:   '#FFFFFF',
  textSecondary: '#8A8A9A',
  textTertiary:  '#4A4A5A',
  border:        '#2A2A3A',
} as const;

export const Fonts = {
  anton:       'Anton_400Regular',
  inter:       'Inter_400Regular',
  interMedium: 'Inter_500Medium',
  interSemi:   'Inter_600SemiBold',
  interBold:   'Inter_700Bold',
} as const;

export const Spacing = {
  xs:   4,
  sm:   8,
  md:   16,
  lg:   24,
  xl:   32,
  xxl:  48,
  xxxl: 64,
} as const;

export const Radius = {
  sm:   8,
  md:   12,
  lg:   16,
  xl:   24,
  full: 9999,
} as const;
