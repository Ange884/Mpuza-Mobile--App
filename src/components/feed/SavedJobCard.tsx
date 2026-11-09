import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

import { SavedHeartPill } from '@/components/feed/SavedHeartPill';
import { colors } from '@/constants/colors';
import { jobCardPalette, jobCardTone } from '@/constants/jobCardPalette';
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

export function SavedJobCard({ job, index = 0 }: { job: FeedJob; index?: number }) {
  const theme = useTheme();
  const styles = useStyles(makeStyles);
  const { skills } = useUserData();
  const rating = jobRating(job, skills);
  const scale = useSharedValue(1);
  const pressStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  const p = jobCardPalette(jobCardTone(index), theme.scheme);

  const tags = [tagForType(job.type), job.workMode, job.category];
  const initials = job.company
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <Animated.View style={pressStyle}>
      <Pressable
        style={[styles.card, { backgroundColor: p.cardBg, borderColor: p.cardBorder }]}
        onPress={() => router.push({ pathname: '/job/[id]', params: { id: job.id } })}
        onPressIn={() => scale.set(withSpring(0.985, { damping: 16, stiffness: 280 }))}
        onPressOut={() => scale.set(withSpring(1, { damping: 14, stiffness: 220 }))}
        accessibilityRole="button"
        accessibilityLabel={`${job.title} at ${job.company}`}>
        <View style={styles.topRow}>
          <Text style={[styles.title, { color: p.title }]} numberOfLines={2}>
            {job.title}
          </Text>
          <SavedHeartPill jobId={job.id} />
        </View>

        <View style={styles.tags}>
          {tags.map((tag) => (
            <View key={tag} style={[styles.tag, { backgroundColor: p.chipBg, borderColor: p.chipBorder }]}>
              <Text style={[styles.tagText, { color: p.chipText }]}>{tag}</Text>
            </View>
          ))}
        </View>

        <View style={[styles.footer, { borderTopColor: p.divider }]}>
          <View style={[styles.logo, { backgroundColor: p.logoBg, borderColor: p.logoBorder }]}>
            <Text style={[styles.logoText, { color: p.logoText }]}>{initials}</Text>
          </View>
          <Text style={styles.companyLine} numberOfLines={1}>
            <Text style={[styles.company, { color: p.title }]}>{job.company}</Text>
            <Text style={[styles.sep, { color: p.meta }]}> | </Text>
            <Text style={[styles.location, { color: p.meta }]}>{job.location}</Text>
          </Text>
          <View style={styles.rating}>
            <Ionicons name="star" size={14} color={p.icon} />
            <Text style={[styles.ratingText, { color: p.title }]}>{rating}</Text>
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
}

const makeStyles = (t: Theme) =>
  StyleSheet.create({
    card: {
      borderRadius: 7,
      padding: 18,
      borderWidth: 1,
      shadowColor: colors.dblue,
      shadowOpacity: t.scheme === 'dark' ? 0.2 : 0.08,
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
      borderRadius: 7,
      borderWidth: 1,
    },
    tagText: {
      fontFamily: 'Lexend_400Regular',
      fontSize: 12,
    },
    footer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      marginTop: 16,
      paddingTop: 14,
      borderTopWidth: StyleSheet.hairlineWidth,
    },
    logo: {
      width: 36,
      height: 36,
      borderRadius: 7,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
    },
    logoText: {
      fontFamily: 'Lexend_700Bold',
      fontSize: 13,
    },
    companyLine: {
      flex: 1,
      fontFamily: 'Lexend_400Regular',
      fontSize: 13,
    },
    company: {
      fontFamily: 'Lexend_700Bold',
    },
    sep: {},
    location: {},
    rating: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 3,
    },
    ratingText: {
      fontFamily: 'Lexend_700Bold',
      fontSize: 13,
    },
  });
