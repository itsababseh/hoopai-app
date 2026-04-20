import React from 'react';
import { Text as RNText, TextProps, StyleSheet } from 'react-native';
import { Colors, Fonts } from '../../constants/theme';

interface HoopTextProps extends TextProps {
  variant?: 'display' | 'heading' | 'title' | 'body' | 'label' | 'caption';
  color?: string;
}

export function Text({ variant = 'body', color, style, ...props }: HoopTextProps) {
  return (
    <RNText
      style={[styles[variant], color ? { color } : null, style]}
      {...props}
    />
  );
}

const styles = StyleSheet.create({
  display: {
    fontFamily: Fonts.anton,
    fontSize: 64,
    color: Colors.textPrimary,
    letterSpacing: 1,
  },
  heading: {
    fontFamily: Fonts.interBold,
    fontSize: 24,
    color: Colors.textPrimary,
  },
  title: {
    fontFamily: Fonts.interSemi,
    fontSize: 17,
    color: Colors.textPrimary,
  },
  body: {
    fontFamily: Fonts.inter,
    fontSize: 15,
    color: Colors.textSecondary,
    lineHeight: 22,
  },
  label: {
    fontFamily: Fonts.interSemi,
    fontSize: 11,
    color: Colors.textSecondary,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  caption: {
    fontFamily: Fonts.inter,
    fontSize: 12,
    color: Colors.textTertiary,
  },
});
