import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

import { Countdown } from '@/components/feed/Countdown';
import { FavoriteStar } from '@/components/feed/FavoriteStar';
import { colors } from '@/constants/colors';
import { useUserData } from '@/context/userdata';
import { matchScore, type FeedJob } from '@/data/feed';

/** Job card in the feed: company, title, work mode, skill match, live deadline and favourite star. */
export function FeedJobCard({ job }: { job: FeedJob }) {
  const { skills, applied } = useUserData();
  const match = matchScore(job, skills);
  const scale = useSharedValue(1);
  const pressStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <Animated.View style={pressStyle}>
      <Pressable
        style={styles.card}
        onPress={() => router.push({ pathname: '/job/[id]', params: { id: job.id } })}
        onPressIn={() => scale.set(withSpring(0.97, { damping: 15, stiffness: 300 }))}
        onPressOut={() => scale.set(withSpring(1, { damping: 12, stiffness: 220 }))}
        accessibilityRole="button"
        accessibilityLabel={`${job.title} at ${job.company}`}>
        <View style={styles.top}>
          <View style={[styles.logo, { backgroundColor: job.color + '18', borderColor: job.color + '33' }]}>
            <Text style={[styles.logoText, { color: job.color }]}>{job.company.charAt(0)}</Text>
          </View>
          <View style={styles.headline}>
            <Text style={styles.company} numberOfLines={1}>
              {job.company}
              {job.via ? <Text style={styles.via}>  via {job.via}</Text> : null}
            </Text>
            <Text style={styles.title} numberOfLines={2}>
              {job.title} <Text style={styles.type}>[{job.type}]</Text>
            </Text>
          </View>
          <FavoriteStar jobId={job.id} />
        </View>

        <View style={styles.chips}>
          <View style={[styles.chip, styles.modeChip]}>
            <Text style={[styles.chipText, styles.modeText]}>{job.workMode}</Text>
          </View>
          {match !== null && (
            <View style={[styles.chip, styles.matchChip]}>
              <Ionicons name="sparkles" size={12} color={colors.blue} />
              <Text style={[styles.chipText, styles.matchText]}>{match}% Match</Text>
            </View>
          )}
          <View style={[styles.chip, styles.plainChip]}>
            <Ionicons name="location-outline" size={12} color="#6b7685" />
            <Text style={styles.chipText}>{job.location}</Text>
          </View>
        </View>

        <View style={styles.bottom}>
          <Countdown deadline={job.deadline} compact />
          {applied.includes(job.id) ? (
            <View style={styles.applied}>
              <Ionicons name="checkmark-circle" size={14} color="#22a06b" />
              <Text style={styles.appliedText}>Applied</Text>
            </View>
          ) : (
            <Text style={styles.posted}>{job.postedAt}</Text>
          )}
        </View>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#edf0f5',
    shadowColor: '#0e314c',
    shadowOpacity: 0.06,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
  },
  top: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  logo: {
    width: 50,
    height: 50,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    fontFamily: 'Lexend_700Bold',
    fontSize: 20,
  },
  headline: {
    flex: 1,
  },
  company: {
    fontFamily: 'Lexend_700Bold',
    fontSize: 14,
    color: colors.dblue,
  },
  via: {
    fontFamily: 'Lexend_400Regular',
    fontSize: 11,
    color: '#8a95a3',
  },
  title: {
    fontFamily: 'Lexend_400Regular',
    fontSize: 14,
    lineHeight: 20,
    color: '#2b3a4a',
    marginTop: 2,
  },
  type: {
    color: '#8a95a3',
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 12,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  chipText: {
    fontFamily: 'Lexend_400Regular',
    fontSize: 11,
    color: '#4a5866',
  },
  modeChip: {
    backgroundColor: 'rgba(34,160,107,0.1)',
  },
  modeText: {
    fontFamily: 'Lexend_700Bold',
    color: '#1b7f55',
  },
  matchChip: {
    backgroundColor: 'rgba(53,168,223,0.12)',
  },
  matchText: {
    fontFamily: 'Lexend_700Bold',
    color: '#1f86b8',
  },
  plainChip: {
    backgroundColor: '#f3f5f9',
  },
  bottom: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f1f3f7',
  },
  posted: {
    fontFamily: 'Lexend_400Regular',
    fontSize: 11,
    color: '#8a95a3',
  },
  applied: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  appliedText: {
    fontFamily: 'Lexend_700Bold',
    fontSize: 11,
    color: '#22a06b',
  },
});
