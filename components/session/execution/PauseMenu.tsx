import React, { useCallback, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface PauseMenuProps {
  isVisible: boolean;
  elapsedSeconds: number;
  onResume: () => void;
  onEarlyExit: () => void;
}

function formatElapsed(s: number) {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${sec.toString().padStart(2, '0')}`;
}

export function PauseMenu({
  isVisible,
  elapsedSeconds,
  onResume,
  onEarlyExit,
}: PauseMenuProps) {
  const insets = useSafeAreaInsets();
  const sheetRef = useRef<BottomSheet>(null);

  React.useEffect(() => {
    if (isVisible) {
      sheetRef.current?.expand();
    } else {
      sheetRef.current?.close();
    }
  }, [isVisible]);

  const snapPoints = React.useMemo(() => ['45%'], []);

  return (
    <BottomSheet
      ref={sheetRef}
      index={-1}
      snapPoints={snapPoints}
      enablePanDownToClose={false}
      backgroundStyle={styles.sheet}
      handleIndicatorStyle={styles.handle}
    >
      <BottomSheetView style={[styles.content, { paddingBottom: insets.bottom + 16 }]}>
        <Text style={styles.title}>PAUSED</Text>
        <Text style={styles.elapsed}>{formatElapsed(elapsedSeconds)}</Text>
        <Text style={styles.elapsedLabel}>elapsed</Text>

        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.resumeBtn}
            onPress={onResume}
            accessibilityRole="button"
            accessibilityLabel="Resume session"
          >
            <Text style={styles.resumeText}>▶  RESUME</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.exitBtn}
            onPress={onEarlyExit}
            accessibilityRole="button"
            accessibilityLabel="End session early"
          >
            <Text style={styles.exitText}>End Session</Text>
          </TouchableOpacity>
        </View>
      </BottomSheetView>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  sheet: { backgroundColor: '#131318' },
  handle: { backgroundColor: '#2A2A3A' },
  content: {
    flex: 1,
    alignItems: 'center',
    gap: 8,
    paddingTop: 8,
    paddingHorizontal: 24,
  },
  title: {
    fontFamily: 'Anton',
    fontSize: 32,
    color: '#FFFFFF',
    letterSpacing: 4,
    marginBottom: 4,
  },
  elapsed: {
    fontFamily: 'Anton',
    fontSize: 48,
    color: '#FF6B2C',
    letterSpacing: 2,
  },
  elapsedLabel: {
    fontFamily: 'Inter',
    fontSize: 12,
    color: '#4A4A5A',
    fontWeight: '500',
    letterSpacing: 1,
    marginBottom: 16,
  },
  actions: { width: '100%', gap: 12 },
  resumeBtn: {
    backgroundColor: '#FF6B2C',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
  },
  resumeText: {
    fontFamily: 'Anton',
    fontSize: 20,
    color: '#FFFFFF',
    letterSpacing: 2,
  },
  exitBtn: {
    borderWidth: 1,
    borderColor: '#2A2A3A',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
  },
  exitText: {
    fontFamily: 'Inter',
    fontSize: 15,
    color: '#8A8A9A',
    fontWeight: '600',
  },
});
