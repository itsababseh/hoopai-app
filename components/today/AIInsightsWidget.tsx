import React, { useState } from 'react';
import { View, Pressable } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { Colors } from '../../constants/theme';
import { AppText } from '../ui/Text';
import { Skeleton } from '../ui/Skeleton';
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

const CATEGORIES: Record<string, string> = {
  scoring: 'SHOOTING', handles: 'HANDLES', defense: 'DEFENSE', conditioning: 'FITNESS', all_around: 'COMPLETE',
};

function getInsight(goal: string, sessionCount: number): string {
  const pool = INSIGHTS[goal] ?? INSIGHTS.all_around;
  return pool[sessionCount % pool.length];
}

export function AIInsightsWidget() {
  const { profile } = useUserStore();
  const { history } = useSessionStore();
  const [expanded, setExpanded] = useState(false);
  const chevron = useSharedValue(0);

  const goal = profile?.primaryGoal ?? 'all_around';
  const insight = getInsight(goal, history.length);
  const category = CATEGORIES[goal] ?? 'TRAINING';

  const toggle = () => {
    setExpanded(e => !e);
    chevron.value = withSpring(expanded ? 0 : 180, { damping: 15, stiffness: 200 });
  };

  const chevronStyle = useAnimatedStyle(() => ({ transform: [{ rotate: `${chevron.value}deg` }] }));

  return (
    <Pressable onPress={toggle} style={{ borderRadius: 16, backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border, overflow: 'hidden', marginHorizontal: 16, marginBottom: 8 }}>
      {/* Accent top line */}
      <View style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, borderTopLeftRadius: 16, borderTopRightRadius: 16, backgroundColor: Colors.accent }} />
      <View style={{ padding: 16, paddingTop: 18 }}>
        {/* Header */}
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: '#FF6B2C15', borderWidth: 1.5, borderColor: Colors.accent, alignItems: 'center', justifyContent: 'center' }}>
              <AppText style={{ fontSize: 16 }}>🏀</AppText>
            </View>
            <View>
              <AppText variant="title" style={{ fontSize: 13 }}>Coach AI</AppText>
              <AppText variant="body" style={{ fontSize: 11 }}>Today's Insight</AppText>
            </View>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <View style={{ paddingHorizontal: 7, paddingVertical: 3, borderRadius: 4, backgroundColor: Colors.surface2, borderWidth: 1, borderColor: Colors.border }}>
              <AppText variant="label" style={{ fontSize: 10, color: Colors.textTertiary }}>{category}</AppText>
            </View>
            <Animated.Text style={[{ color: Colors.textTertiary, fontSize: 14 }, chevronStyle]}>⌄</Animated.Text>
          </View>
        </View>

        {/* Insight */}
        <AppText variant="body" style={{ marginTop: 14, fontSize: 15, lineHeight: 22 }} numberOfLines={expanded ? undefined : 2}>
          {insight}
        </AppText>
      </View>
    </Pressable>
  );
}
