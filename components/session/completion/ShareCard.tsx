import React, { useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Share,
  Platform,
} from 'react-native';
import type { SessionResult } from '../../../constants/sessionTypes';

interface ShareCardProps {
  sessionResult: SessionResult;
  streakDays: number;
}

export const ShareCard = React.memo<ShareCardProps>(({ sessionResult, streakDays }) => {
  const durationMin = Math.floor(sessionResult.elapsedSeconds / 60);
  const completionPct = Math.round(sessionResult.completionPercentage * 100);

  const handleShare = async () => {
    const message = [
      `🏀 Just crushed a HoopAI session!`,
      ``,
      `⏱ ${durationMin} min  •  ${completionPct}% complete`,
      `⚡ +${sessionResult.totalXPAwarded} XP  •  🔥 ${streakDays} day streak`,
      ``,
      `Training smarter with HoopAI`,
    ].join('\n');

    try {
      await Share.share(
        Platform.OS === 'ios'
          ? { message, url: 'https://hoopai.app' }
          : { message }
      );
    } catch (err) {
      // Share cancelled or failed — silent
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <View style={styles.header}>
          <Text style={styles.logo}>🏀 HoopAI</Text>
          <Text style={styles.subtitle}>SESSION COMPLETE</Text>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <Text style={styles.statValue}>{durationMin}m</Text>
            <Text style={styles.statLabel}>Duration</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.stat}>
            <Text style={styles.statValue}>{completionPct}%</Text>
            <Text style={styles.statLabel}>Complete</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.stat}>
            <Text style={styles.statValue}>+{sessionResult.totalXPAwarded}</Text>
            <Text style={styles.statLabel}>XP</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.stat}>
            <Text style={styles.statValue}>{streakDays}</Text>
            <Text style={styles.statLabel}>Streak</Text>
          </View>
        </View>
      </View>

      <TouchableOpacity style={styles.shareButton} onPress={handleShare} activeOpacity={0.8}>
        <Text style={styles.shareButtonText}>Share Results</Text>
      </TouchableOpacity>
    </View>
  );
});

ShareCard.displayName = 'ShareCard';

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    gap: 12,
  },
  card: {
    backgroundColor: '#111827',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#1F2937',
  },
  header: {
    alignItems: 'center',
    marginBottom: 16,
    gap: 4,
  },
  logo: {
    fontSize: 20,
    fontWeight: '800',
    color: '#F9FAFB',
  },
  subtitle: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 2,
    color: '#F97316',
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  stat: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '800',
    color: '#F9FAFB',
  },
  statLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#6B7280',
    letterSpacing: 0.5,
  },
  divider: {
    width: 1,
    height: 32,
    backgroundColor: '#1F2937',
  },
  shareButton: {
    backgroundColor: '#F97316',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  shareButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
