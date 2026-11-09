import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

import { SavedHeartPill } from '@/components/feed/SavedHeartPill';
import { colors } from '@/constants/colors';
import { useUserData } from '@/context/userdata';
import { matchScore, type FeedJob } from '@/data/feed';
import { useStyles, useTheme, type Theme } from '@/theme';

function jobRating(job: FeedJob, skills: string[]) {
  const match = matchScore(job, skills);
  if (match !== null) return (Math.min(100, Math.max(40, match)) / 20).toFixed(1);
  const base = 3.8 + (job.id.length % 12) / 10;
  return Math.min(5, base).toFixed(1);
}

function tagForType(type: FeedJob['type']) {
  if (type === 'Full time') return 'Permanent';
  if (type === 'Part time') return 'Part-Time';
  return type;
}

/** Saved-list job card: title, heart pill, tags, company row, star rating. */
export function SavedJobCard({ job }: { job: FeedJob }) {
  const t = useTheme();
  const styles = useStyles(makeStyles);
  const { skills } = useUserData();
  const rating = jobRating(job, skills);
  const scale = useSharedValue(1);
  const pressStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  const tags = [tagForType(job.type), job.workMode, job.category];

  return (
    <Animated.View style={pressStyle}>
      <Pressable
        style={styles.card}
        onPress={() => router.push({ pathname: '/job/[id]', params: { id: job.id } })}
        onPressIn={() => scale.set(withSpring(0.985, { damping: 16, stiffness: 280 }))}
        onPressOut={() => scale.set(withSpring(1, { damping: 14, stiffness: 220 }))}
        accessibilityRole="button"
        accessibilityLabel={`${job.title} at ${job.company}`}>
        <View style={styles.topRow}>
          <Text style={styles.title} numberOfLines={2}>
            {job.title}
          </Text>
          <SavedHeartPill jobId={job.id} />
        </View>

        <View style={styles.tags}>
          {tags.map((tag) => (
            <View key={tag} style={styles.tag}>
              <Text style={styles.tagText}>{tag}</Text>
            </View>
          ))}
        </View>

        <View style={styles.footer}>
          <View style={[styles.logo, { backgroundColor: job.color + '22' }]}>
            <Text style={[styles.logoText, { color: job.color }]}>{job.company.charAt(0)}</Text>
          </View>
          <Text style={styles.companyLine} numberOfLines={1}>
            <Text style={styles.company}>{job.company}</Text>
            <Text style={styles.sep}> | </Text>
            <Text style={styles.location}>{job.location}</Text>
          </Text>
          <View style={styles.rating}>
            <Ionicons name="star" size={14} color={colors.orange} />
            <Text style={styles.ratingText}>{rating}</Text>
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
}

const makeStyles = (t: Theme) =>
  StyleSheet.create({
    card: {
      borderRadius: 24,
      padding: 18,
      backgroundColor: t.scheme === 'dark' ? t.surface : '#faf7f2',
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: t.scheme === 'dark' ? t.border : 'rgba(14,49,76,0.06)',
      shadowColor: '#0e314c',
      shadowOpacity: t.scheme === 'dark' ? 0.2 : 0.07,
      shadowRadius: 16,
      shadowOffset: { width: 0, height: 8 },
      elevation: 3,
    },
    topRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: 10,
    },
    title: {
      flex: 1,
      fontFamily: 'Lexend_700Bold',
      fontSize: 17,
      lineHeight: 23,
      color: t.scheme === 'dark' ? t.text : '#1a1a1a',
      letterSpacing: -0.2,
    },
    tags: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
      marginTop: 14,
    },
    tag: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 999,
      backgroundColor: t.scheme === 'dark' ? t.surfaceAlt : '#f0ebe4',
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: t.scheme === 'dark' ? t.border : 'rgba(14,49,76,0.08)',
    },
    tagText: {
      fontFamily: 'Lexend_400Regular',
      fontSize: 12,
      color: t.textMuted,
    },
    footer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      marginTop: 16,
      paddingTop: 14,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: t.scheme === 'dark' ? t.border : 'rgba(14,49,76,0.08)',
    },
    logo: {
      width: 36,
      height: 36,
      borderRadius: 10,
      alignItems: 'center',
      justifyContent: 'center',
    },
    logoText: {
      fontFamily: 'Lexend_700Bold',
      fontSize: 16,
    },
    companyLine: {
      flex: 1,
      fontFamily: 'Lexend_400Regular',
      fontSize: 13,
    },
    company: {
      color: t.text,
      fontFamily: 'Lexend_700Bold',
    },
    sep: {
      color: t.textFaint,
    },
    location: {
      color: t.textMuted,
    },
    rating: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 3,
    },
    ratingText: {
      fontFamily: 'Lexend_700Bold',
      fontSize: 13,
      color: t.text,
    },
  });
