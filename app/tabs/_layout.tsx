import React from 'react';
import { Tabs } from 'expo-router';
import { View, StyleSheet, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { Colors, Fonts } from '../../constants/theme';

function TabIcon({ focused, emoji, label }: { focused: boolean; emoji: string; label: string }) {
  return (
    <View style={styles.tabItem}>
      <View style={[styles.iconWrap, focused && styles.iconWrapActive]}>
        <View style={{ opacity: focused ? 1 : 0.5 }}>
          {/* We use text emoji as icons — clean, no dep needed */}
        </View>
      </View>
    </View>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: Colors.accent,
        tabBarInactiveTintColor: Colors.textTertiary,
        tabBarLabelStyle: styles.tabLabel,
        tabBarBackground: () =>
          Platform.OS === 'ios' ? (
            <BlurView intensity={80} tint="dark" style={StyleSheet.absoluteFill} />
          ) : (
            <View style={[StyleSheet.absoluteFill, { backgroundColor: Colors.surface + 'F0' }]} />
          ),
      }}
    >
      <Tabs.Screen
        name="today"
        options={{ title: 'Today', tabBarIcon: ({ focused }) => <View style={[styles.dot, focused && styles.dotActive]} /> }}
      />
      <Tabs.Screen
        name="train"
        options={{ title: 'Train', tabBarIcon: ({ focused }) => <View style={[styles.dot, focused && styles.dotActive]} /> }}
      />
      <Tabs.Screen
        name="progress"
        options={{ title: 'Progress', tabBarIcon: ({ focused }) => <View style={[styles.dot, focused && styles.dotActive]} /> }}
      />
      <Tabs.Screen
        name="profile"
        options={{ title: 'Profile', tabBarIcon: ({ focused }) => <View style={[styles.dot, focused && styles.dotActive]} /> }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    position: 'absolute',
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    backgroundColor: 'transparent',
    elevation: 0,
    height: Platform.OS === 'ios' ? 88 : 64,
  },
  tabLabel: {
    fontFamily: Fonts.interSemi,
    fontSize: 10,
    letterSpacing: 0.5,
  },
  tabItem: { alignItems: 'center', gap: 4 },
  iconWrap: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  iconWrapActive: { backgroundColor: Colors.accentGlow },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.textTertiary },
  dotActive: { backgroundColor: Colors.accent },
});
