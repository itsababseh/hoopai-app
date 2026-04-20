import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from './Text';
import { Colors, Radius, Fonts } from '../../constants/theme';

type BadgeVariant = 'accent' | 'blue' | 'success' | 'warning' | 'neutral';

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
}

const variantColors: Record<BadgeVariant, { bg: string; text: string }> = {
  accent:  { bg: Colors.accent + '25',   text: Colors.accent },
  blue:    { bg: Colors.accentBlue + '25', text: Colors.accentBlue },
  success: { bg: Colors.success + '25',  text: Colors.success },
  warning: { bg: Colors.warning + '25',  text: Colors.warning },
  neutral: { bg: Colors.surface2,        text: Colors.textSecondary },
};

export function Badge({ label, variant = 'neutral' }: BadgeProps) {
  const { bg, text } = variantColors[variant];
  return (
    <View style={[styles.base, { backgroundColor: bg }]}>
      <Text style={[styles.label, { color: text }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: Radius.full,
    paddingHorizontal: 10,
    paddingVertical: 4,
    alignSelf: 'flex-start',
  },
  label: {
    fontFamily: Fonts.interSemi,
    fontSize: 11,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
});
