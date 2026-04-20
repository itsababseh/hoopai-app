import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { Redirect } from 'expo-router';
import { useUserStore } from '../stores/userStore';
import { Colors } from '../constants/theme';

export default function Index() {
  const { profile, isLoading } = useUserStore();

  if (isLoading) {
    return <View style={styles.container} />;
  }

  if (profile?.onboardingComplete) {
    return <Redirect href="/(tabs)/today" />;
  }

  return <Redirect href="/onboarding/welcome" />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
});
