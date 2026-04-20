import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import type { DrillItem } from '../../../constants/sessionTypes';

interface DrillQueueItemProps {
  drill: DrillItem;
  index: number;
  status: 'done' | 'active' | 'upcoming';
}

const STATUS_COLORS = {
  done: '#10B981',
  active: '#F97316',
  upcoming: '#374151',
};

const STATUS_TEXT_COLORS = {
  done: '#6EE7B7',
  active: '#FFFFFF',
  upcoming: '#9CA3AF',
};

export const DrillQueueItem = React.memo<DrillQueueItemProps>(({ drill, index, status }) => {
  const isDone = status === 'done';
  const isActive = status === 'active';

  return (
    <View style={[styles.container, isActive && styles.containerActive]}>
      <View style={[styles.indexBadge, { backgroundColor: STATUS_COLORS[status] }]}>
        {isDone ? (
          <Text style={styles.checkmark}>✓</Text>
        ) : (
          <Text style={styles.indexText}>{index + 1}</Text>
        )}
      </View>

      <View style={styles.info}>
        <Text
          style={[styles.name, { color: STATUS_TEXT_COLORS[status] }]}
          numberOfLines={1}
        >
          {drill.name}
        </Text>
        <Text style={styles.meta}>
          {drill.totalSets} sets
          {drill.reps ? ` × ${drill.reps} reps` : ''}
          {drill.duration ? ` × ${drill.duration}s` : ''}
          {' · '}
          {drill.category}
        </Text>
      </View>

      {isActive && (
        <View style={styles.activePill}>
          <Text style={styles.activePillText}>NOW</Text>
        </View>
      )}
    </View>
  );
});

DrillQueueItem.displayName = 'DrillQueueItem';

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1F2937',
  },
  containerActive: {
    backgroundColor: '#1F2937',
  },
  indexBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  indexText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  checkmark: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  info: {
    flex: 1,
    gap: 2,
  },
  name: {
    fontSize: 14,
    fontWeight: '600',
  },
  meta: {
    fontSize: 12,
    color: '#6B7280',
    textTransform: 'capitalize',
  },
  activePill: {
    backgroundColor: '#F97316',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  activePillText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 1,
  },
});
