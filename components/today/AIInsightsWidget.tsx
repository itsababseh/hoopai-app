import React, { useState } from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { Text } from '../ui/Text';
import { useUserStore } from '../../stores/userStore';
import { useSessionStore } from '../../stores/sessionStore';

const INSIGHTS: Record<string, string[]> = {
  scoring: [
    "Your pull-up efficiency is trending up. Push past the arc today — your off-dribble three is ready.",
    "Focus on catch-and-shoot rhythm. The cleanest shooters eliminate wasted motion every single rep.",
    "Shot quality beats shot quantity. Five great makes beat twenty rushed ones.",
  ],
  handles: [
    "Ball security under pressure is elite. Tighten your weak hand — that's your edge.",
    "Your change of pace is developing. Sell the slow before the fast. Make them believe.",
    "Crossovers win games, but hesitation wins defenders. Master the pause today.",
  ],
  defense: [
    "Your lateral quickness is a weapon. Stay low on the first step — that's where you win.",
    "Anticipation beats athleticism at the highest level. Study your opponent's tendencies.",
    "Great defenders communicate. Even solo, talk to yourself through every defensive rep.",
  ],
  conditioning: [
    "Power comes from the ground up. Every jump today — full extension, full intent.",
    "Your conditioning separates you in the fourth quarter. Today's reps are fourth quarter reps.",
    "Explosiveness is built in the details. Land soft, reset fast, go again.",
  ],
  all_around: [
    "The complete player masters the unsexy skills. Your fundamentals are your foundation.",
    "Versatility is your edge. Today, make every drill count in both directions.",
    "Great players make everyone around them better. Even in training — high standards.",
  ],
};

// Health-aware insights layered on top when auto mode is active
const HEALTH_INSIGHTS: Record<string, string> = {
  auto:     "Your wearable data is powering today's plan. Trust the science — your body doesn't lie.",
  adjusted: "Your health data and how you feel are telling slightly different stories. We've balanced both.",
  stale:    "Health data is a bit old. Check-in ratings are carrying today's readiness score.",
};

const CATEGORIES: Record<string, string> = {
  scoring: 'SHOOTING', handles: 'HANDLES', defense: 'DEFENSE', conditioning: 'FITNESS', all_around: 'COMPLETE',
};

function getInsight(goal: string, sessionCount: number): string {
  const pool = INSIGHTS[goal] ?? INSIGHTS.all_around;
  return pool[sessionCount % pool.length];
}

interface AIInsightsWidgetProps {
  readiness?: number;
  checkIn?: { energy: number; soreness: number; sleep: number } | null;
  healthMode?: 'manual' | 'auto' | 'adjusted';
}

export function AIInsightsWidget({ readiness, checkIn, healthMode }: AIInsightsWidgetProps) {
  const { profile } = useUserStore();
  const { history } = useSessionStore();
  const [expanded, setExpanded] = useState(false);
  const chevron = useSharedValue(0);

  const goal = profile?.primaryGoal ?? 'all_around';
  const insight = getInsight(goal, history.length);
  const category = CATEGORIES[goal] ?? 'TRAINING';
  const healthInsight = healthMode && healthMode !== 'manual' ? HEALTH_INSIGHTS[healthMode] : null;

  const toggle = () => {
    setExpanded(e => !e);
    chevron.value = withSpring(expanded ? 0 : 180, { damping: 15, stiffness: 200 });
  };

  const chevronStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${chevron.value}deg` }],
  }));

  return (
    <Pressable onPress={toggle} style={styles.card}>
      {/* Accent top line */}
      <View style={styles.accentLine} />

      <View style={styles.inner}>
        {/* Header */}
        <View style={styles.headerRow}>
          <View style={styles.headerLeft}>
            <View style={styles.iconCircle}>
              <Text style={{ fontSize: 16 }}>🏀</Text>
            </View>
            <View>
              <Text variant="title" style={styles.coachLabel}>Coach AI</Text>
              <Text variant="body" style={styles.insightLabel}>Today's Insight</Text>
            </View>
          </View>
          <View style={styles.headerRight}>
            {healthMode && healthMode !== 'manual' && (
              <View style={styles.aiPoweredBadge}>
                <View style={styles.aiDot} />
                <Text variant="caption" style={styles.aiPoweredText}>AI</Text>
              </View>
            )}
            <View style={styles.categoryBadge}>
              <Text variant="label" style={styles.categoryText}>{category}</Text>
            </View>
            <Animated.Text style={[styles.chevron, chevronStyle]}>⌄</Animated.Text>
          </View>
        </View>

        {/* Health insight (when auto mode) */}
        {healthInsight && (
          <View style={styles.healthInsightRow}>
            <Text style={styles.healthInsightIcon}>⚡</Text>
            <Text variant="caption" style={styles.healthInsightText}>{healthInsight}</Text>
          </View>
        )}

        {/* Main insight */}
        <Text variant="body" style={styles.insightText} numberOfLines={expanded ? undefined : 2}>
          {insight}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    backgroundColor: '#141420',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    overflow: 'hidden',
  },
  accentLine: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: '#FF6B2C',
  },
  inner: {
    padding: 16,
    paddingTop: 18,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,107,44,0.08)',
    borderWidth: 1.5,
    borderColor: '#FF6B2C',
    alignItems: 'center',
    justifyContent: 'center',
  },
  coachLabel: { fontSize: 13, color: '#FFFFFF' },
  insightLabel: { fontSize: 11, color: '#6B7280' },
  aiPoweredBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255,107,44,0.12)',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 4,
  },
  aiDot: { width: 5, height: 5, borderRadius: 2.5, backgroundColor: '#FF6B2C' },
  aiPoweredText: { fontSize: 10, color: '#FF6B2C', letterSpacing: 0.5 },
  categoryBadge: {
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  categoryText: { fontSize: 10, color: '#4B5563' },
  chevron: { color: '#4B5563', fontSize: 14 },
  healthInsightRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: 'rgba(255,107,44,0.06)',
    borderRadius: 8,
    padding: 10,
    marginTop: 12,
    marginBottom: 4,
  },
  healthInsightIcon: { fontSize: 13, marginTop: 1 },
  healthInsightText: { color: '#FF6B2C', flex: 1, lineHeight: 17 },
  insightText: { marginTop: 12, fontSize: 15, lineHeight: 22, color: '#E5E7EB' },
});
