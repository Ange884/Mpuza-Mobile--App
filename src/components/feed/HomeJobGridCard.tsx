import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown, useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

import { FavoriteStar } from '@/components/feed/FavoriteStar';
import { colors } from '@/constants/colors';
import { useUserData } from '@/context/userdata';
import { matchScore, type FeedJob } from '@/data/feed';
import { useStyles, useTheme, type Theme } from '@/theme';

type Props = { job: FeedJob; index?: number };

/** Compact card for the home “popular jobs” grid. */
export function HomeJobGridCard({ job, index = 0 }: Props) {
  const t = useTheme();
  const styles = useStyles(makeStyles);
  const { skills } = useUserData();
  const match = matchScore(job, skills);
  const scale = useSharedValue(1);
  const pressStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <Animated.View entering={FadeInDown.delay(120 + index * 70).springify().damping(16)} style={pressStyle}>
      <Pressable
        style={styles.card}
        onPress={() => router.push({ pathname: '/job/[id]', params: { id: job.id } })}
        onPressIn={() => scale.set(withSpring(0.96, { damping: 16, stiffness: 320 }))}
        onPressOut={() => scale.set(withSpring(1, { damping: 12, stiffness: 220 }))}
        accessibilityRole="button"
        accessibilityLabel={`${job.title} at ${job.company}`}>
        <View style={[styles.visual, { backgroundColor: job.color + '14' }]}>
          <Text style={[styles.initial, { color: job.color }]}>{job.company.charAt(0)}</Text>
          <View style={styles.fav}>
            <FavoriteStar jobId={job.id} size={18} />
          </View>
        </View>
        <Text style={styles.title} numberOfLines={2}>
          {job.title}
        </Text>
        <View style={styles.meta}>
          <Text style={styles.salary} numberOfLines={1}>
            {job.salary}
          </Text>
          <View style={styles.rating}>
            <Ionicons name="star" size={12} color={colors.orange} />
            <Text style={styles.ratingText}>{match !== null ? (match / 20).toFixed(1) : '—'}</Text>
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
}

const makeStyles = (t: Theme) =>
  StyleSheet.create({
    card: {
      flex: 1,
      backgroundColor: t.surface,
      borderRadius: 18,
      padding: 10,
      borderWidth: 1,
      borderColor: t.border,
      shadowColor: '#0e314c',
      shadowOpacity: 0.06,
      shadowRadius: 12,
      shadowOffset: { width: 0, height: 5 },
      elevation: 2,
    },
    visual: {
      height: 108,
      borderRadius: 14,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 10,
    },
    initial: {
      fontFamily: 'Lexend_700Bold',
      fontSize: 34,
    },
    fav: {
      position: 'absolute',
      top: 8,
      right: 8,
    },
    title: {
      fontFamily: 'Lexend_700Bold',
      fontSize: 13,
      lineHeight: 18,
      color: t.text,
      minHeight: 36,
    },
    meta: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginTop: 6,
      gap: 6,
    },
    salary: {
      flex: 1,
      fontFamily: 'Lexend_700Bold',
      fontSize: 12,
      color: colors.blue,
    },
    rating: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 3,
    },
    ratingText: {
      fontFamily: 'Lexend_700Bold',
      fontSize: 12,
      color: t.text,
    },
  });
