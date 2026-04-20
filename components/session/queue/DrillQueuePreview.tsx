import React, { useRef, useMemo } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import BottomSheet, { BottomSheetFlatList } from '@gorhom/bottom-sheet';
import { DrillItem, DrillResult } from '../../../constants/sessionTypes';

interface DrillQueuePreviewProps {
  isVisible: boolean;
  drills: DrillItem[];
  currentIndex: number;
  drillResults: DrillResult[];
  onClose: () => void;
}

const CATEGORY_COLORS: Record<string, string> = {
  'ball-handling': '#4FACFE',
  shooting: '#FF6B2C',
  footwork: '#00D4AA',
  conditioning: '#FFB547',
  defense: '#8A8A9A',
  finishing: '#FF6B2C',
  passing: '#4FACFE',
  strength: '#FFB547',
};

export function DrillQueuePreview({
  isVisible,
  drills,
  currentIndex,
  drillResults,
  onClose,
}: DrillQueuePreviewProps) {
  const sheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => ['60%', '90%'], []);

  React.useEffect(() => {
    if (isVisible) {
      sheetRef.current?.expand();
    } else {
      sheetRef.current?.close();
    }
  }, [isVisible]);

  return (
    <BottomSheet
      ref={sheetRef}
      index={-1}
      snapPoints={snapPoints}
      enablePanDownToClose
      onClose={onClose}
      backgroundStyle={styles.sheet}
      handleIndicatorStyle={styles.handle}
    >
      <View style={styles.header}>
        <Text style={styles.title}>SESSION QUEUE</Text>
        <Text style={styles.subtitle}>{drills.length} drills</Text>
      </View>
      <BottomSheetFlatList
        data={drills}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item, index }) => {
          const result = drillResults[index];
          const isDone = result?.completedSets >= item.totalSets || result?.skipped;
          const isCurrent = index === currentIndex;
          const isUpcoming = index > currentIndex;

          return (
            <View
              style={[
                styles.drillRow,
                isCurrent && styles.drillRowActive,
                isDone && styles.drillRowDone,
              ]}
            >
              <View style={styles.indexWrap}>
                {isDone ? (
                  <Text style={styles.checkmark}>✓</Text>
                ) : (
                  <Text
                    style={[
                      styles.indexNum,
                      isCurrent && styles.indexNumActive,
                      isUpcoming && styles.indexNumUpcoming,
                    ]}
                  >
                    {index + 1}
                  </Text>
                )}
              </View>

              <View
                style={[
                  styles.categoryBar,
                  { backgroundColor: CATEGORY_COLORS[item.category] ?? '#8A8A9A' },
                ]}
              />

              <View style={styles.drillInfo}>
                <Text
                  style={[styles.drillName, isDone && styles.drillNameDone]}
                  numberOfLines={1}
                >
                  {item.name}
                </Text>
                <Text style={styles.drillMeta}>
                  {item.totalSets} sets
                  {item.reps ? ` · ${item.reps} reps` : ''}
                  {item.duration ? ` · ${item.duration}s` : ''}
                  {' · '}
                  {item.difficulty}
                </Text>
              </View>

              {isCurrent && (
                <View style={styles.activePill}>
                  <Text style={styles.activePillText}>NOW</Text>
                </View>
              )}
            </View>
          );
        }}
      />
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  sheet: { backgroundColor: '#131318' },
  handle: { backgroundColor: '#2A2A3A' },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#2A2A3A',
    gap: 2,
  },
  title: {
    fontFamily: 'Anton',
    fontSize: 18,
    color: '#FFFFFF',
    letterSpacing: 2,
  },
  subtitle: {
    fontFamily: 'Inter',
    fontSize: 12,
    color: '#4A4A5A',
    fontWeight: '500',
  },
  list: { paddingVertical: 8, paddingHorizontal: 16, gap: 4 },
  drillRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 10,
  },
  drillRowActive: { backgroundColor: '#1C1C26', borderWidth: 1, borderColor: '#FF6B2C40' },
  drillRowDone: { opacity: 0.45 },
  indexWrap: { width: 24, alignItems: 'center' },
  indexNum: {
    fontFamily: 'Anton',
    fontSize: 16,
    color: '#4A4A5A',
  },
  indexNumActive: { color: '#FF6B2C' },
  indexNumUpcoming: { color: '#8A8A9A' },
  checkmark: {
    fontFamily: 'Inter',
    fontSize: 14,
    color: '#00D4AA',
    fontWeight: '700',
  },
  categoryBar: { width: 3, height: 32, borderRadius: 2 },
  drillInfo: { flex: 1, gap: 3 },
  drillName: {
    fontFamily: 'Inter',
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  drillNameDone: { color: '#4A4A5A' },
  drillMeta: {
    fontFamily: 'Inter',
    fontSize: 11,
    color: '#4A4A5A',
    fontWeight: '400',
    textTransform: 'capitalize',
  },
  activePill: {
    backgroundColor: '#FF6B2C',
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  activePillText: {
    fontFamily: 'Inter',
    fontSize: 9,
    color: '#FFFFFF',
    fontWeight: '700',
    letterSpacing: 1,
  },
});
