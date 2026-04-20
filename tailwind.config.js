/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,jsx,ts,tsx}',
    './components/**/*.{js,jsx,ts,tsx}',
  ],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        background:   '#0A0A0F',
        surface:      '#131318',
        surface2:     '#1C1C26',
        accent:       '#FF6B2C',
        accentGlow:   '#FF6B2C40',
        accentBlue:   '#4FACFE',
        success:      '#00D4AA',
        warning:      '#FFB547',
        textPrimary:  '#FFFFFF',
        textSecondary:'#8A8A9A',
        textTertiary: '#4A4A5A',
        border:       '#2A2A3A',
      },
      fontFamily: {
        'anton':        ['Anton_400Regular'],
        'inter':        ['Inter_400Regular'],
        'inter-medium': ['Inter_500Medium'],
        'inter-semi':   ['Inter_600SemiBold'],
        'inter-bold':   ['Inter_700Bold'],
      },
    },
  },
  plugins: [],
};
