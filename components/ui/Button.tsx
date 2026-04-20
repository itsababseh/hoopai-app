import React from 'react';
import {
  Pressable,
  PressableProps,
  StyleSheet,
  View,
  ActivityIndicator,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Text } from './Text';
import { Colors, Radius, Spacing, Fonts } from '../../constants/theme';

interface ButtonProps extends PressableProps {
  label: string;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: React.ReactNode;
}

export function Button({
  label,
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  onPress,
  disabled,
  style,
  ...props
}: ButtonProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePress = async (e: any) => {
    scale.value = withSpring(0.96, { damping: 10, stiffness: 300 }, () => {
      scale.value = withSpring(1);
    });
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress?.(e);
  };

  return (
    <Animated.View style={animatedStyle}>
      <Pressable
        onPress={handlePress}
        disabled={disabled || loading}
        style={[
          styles.base,
          styles[variant],
          styles[size],
          (disabled || loading) && styles.disabled,
          style,
        ]}
        {...props}
      >
        {loading ? (
          <ActivityIndicator
            color={variant === 'primary' ? '#fff' : Colors.accent}
            size="small"
          />
        ) : (
          <View style={styles.row}>
            {icon && <View style={styles.iconWrap}>{icon}</View>}
            <Text style={[styles.label, styles[`label_${variant}`], styles[`label_${size}`]]}>
              {label}
            </Text>
          </View>
        )}
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconWrap: {
    marginRight: 4,
  },
  // variants
  primary: {
    backgroundColor: Colors.accent,
  },
  secondary: {
    backgroundColor: Colors.surface2,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  ghost: {
    backgroundColor: 'transparent',
  },
  danger: {
    backgroundColor: '#FF4D4D',
  },
  disabled: {
    opacity: 0.45,
  },
  // sizes
  sm: { paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm - 2, height: 36 },
  md: { paddingHorizontal: Spacing.lg, paddingVertical: Spacing.sm + 2, height: 48 },
  lg: { paddingHorizontal: Spacing.xl, paddingVertical: Spacing.md, height: 56 },
  // label styles
  label: { fontFamily: Fonts.interSemi, letterSpacing: 0.3 },
  label_primary:   { color: '#fff', fontSize: 15 },
  label_secondary: { color: Colors.textPrimary, fontSize: 15 },
  label_ghost:     { color: Colors.accent, fontSize: 15 },
  label_danger:    { color: '#fff', fontSize: 15 },
  label_sm:  { fontSize: 13 },
  label_md:  { fontSize: 15 },
  label_lg:  { fontSize: 17 },
});
