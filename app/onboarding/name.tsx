import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../../components/ui/Button';
import { Text } from '../../components/ui/Text';
import { Colors, Fonts, Spacing, Radius } from '../../constants/theme';

export default function NameScreen() {
  const [name, setName] = useState('');

  const handleContinue = () => {
    if (name.trim().length < 2) return;
    router.push({ pathname: '/onboarding/position', params: { name: name.trim() } });
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <SafeAreaView style={styles.safe}>
        {/* Back */}
        <TouchableOpacity onPress={() => router.back()} style={styles.back}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>

        {/* Progress */}
        <View style={styles.progressRow}>
          {[1, 2, 3, 4, 5, 6, 7].map((i) => (
            <View key={i} style={[styles.dot, i === 1 && styles.dotActive]} />
          ))}
        </View>

        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.step}>STEP 1 OF 7</Text>
            <Text style={styles.heading}>What should we{'\n'}call you?</Text>
            <Text style={styles.sub}>We'll personalize your training around you.</Text>
          </View>

          <View style={styles.inputBlock}>
            <TextInput
              style={styles.input}
              placeholder="Your first name"
              placeholderTextColor={Colors.textTertiary}
              value={name}
              onChangeText={setName}
              autoFocus
              autoCapitalize="words"
              returnKeyType="done"
              onSubmitEditing={handleContinue}
            />
          </View>
        </View>

        <View style={styles.footer}>
          <Button
            label="Continue"
            size="lg"
            style={styles.btn}
            disabled={name.trim().length < 2}
            onPress={handleContinue}
          />
        </View>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  safe: { flex: 1, paddingHorizontal: Spacing.lg },
  back: { paddingVertical: Spacing.md },
  backText: { fontFamily: Fonts.interSemi, fontSize: 15, color: Colors.textSecondary },
  progressRow: { flexDirection: 'row', gap: 6, marginBottom: Spacing.xl },
  dot: { flex: 1, height: 3, borderRadius: 2, backgroundColor: Colors.border },
  dotActive: { backgroundColor: Colors.accent },
  content: { flex: 1, justifyContent: 'center', gap: Spacing.xl },
  header: { gap: Spacing.sm },
  step: { fontFamily: Fonts.interSemi, fontSize: 11, color: Colors.accent, letterSpacing: 2 },
  heading: { fontFamily: Fonts.interBold, fontSize: 32, color: Colors.textPrimary, lineHeight: 40 },
  sub: { fontFamily: Fonts.inter, fontSize: 15, color: Colors.textSecondary },
  inputBlock: {},
  input: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    height: 56,
    fontFamily: Fonts.interSemi,
    fontSize: 20,
    color: Colors.textPrimary,
  },
  footer: { paddingBottom: Spacing.lg },
  btn: { width: '100%' },
});
