import React from 'react';
import { View, ViewStyle } from 'react-native';

interface GlowBorderProps {
  glowColor: string;
  borderRadius: number;
  surfaceColor?: string;
  children: React.ReactNode;
  style?: ViewStyle;
}

export function GlowBorder({ glowColor, borderRadius, surfaceColor = '#131318', children, style }: GlowBorderProps) {
  return (
    <View style={[{ borderRadius: borderRadius + 1, backgroundColor: glowColor, padding: 1 }, style]}>
      <View style={{ borderRadius, backgroundColor: surfaceColor, overflow: 'hidden' }}>
        {children}
      </View>
    </View>
  );
}
