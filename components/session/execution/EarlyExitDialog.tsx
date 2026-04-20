import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Pressable,
} from 'react-native';

interface EarlyExitDialogProps {
  visible: boolean;
  completionPercentage: number;
  onConfirm: () => void;
  onCancel: () => void;
}

export function EarlyExitDialog({
  visible,
  completionPercentage,
  onConfirm,
  onCancel,
}: EarlyExitDialogProps) {
  const pct = Math.round(completionPercentage * 100);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onCancel}
    >
      <Pressable style={styles.backdrop} onPress={onCancel}>
        <Pressable style={styles.dialog} onPress={() => {}}>
          <Text style={styles.emoji}>🏀</Text>
          <Text style={styles.title}>End Session Early?</Text>
          <Text style={styles.body}>
            You're{' '}
            <Text style={styles.pct}>{pct}%</Text>
            {' '}through this session. You'll still earn XP for completed sets.
          </Text>

          <View style={styles.buttons}>
            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={onCancel}
              accessibilityRole="button"
              accessibilityLabel="Keep going"
            >
              <Text style={styles.cancelText}>Keep Going</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.confirmBtn}
              onPress={onConfirm}
              accessibilityRole="button"
              accessibilityLabel="End session"
            >
              <Text style={styles.confirmText}>End Session</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.72)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  dialog: {
    backgroundColor: '#131318',
    borderRadius: 20,
    padding: 28,
    width: '100%',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: '#2A2A3A',
  },
  emoji: { fontSize: 40 },
  title: {
    fontFamily: 'Anton',
    fontSize: 24,
    color: '#FFFFFF',
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  body: {
    fontFamily: 'Inter',
    fontSize: 14,
    color: '#8A8A9A',
    textAlign: 'center',
    lineHeight: 20,
  },
  pct: {
    fontFamily: 'Anton',
    fontSize: 16,
    color: '#FF6B2C',
  },
  buttons: { flexDirection: 'row', gap: 12, marginTop: 8, width: '100%' },
  cancelBtn: {
    flex: 1,
    backgroundColor: '#FF6B2C',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  cancelText: {
    fontFamily: 'Anton',
    fontSize: 16,
    color: '#FFFFFF',
    letterSpacing: 1,
  },
  confirmBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#2A2A3A',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  confirmText: {
    fontFamily: 'Inter',
    fontSize: 14,
    color: '#8A8A9A',
    fontWeight: '600',
  },
});
