import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown, useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

import { FavoriteStar } from '@/components/feed/FavoriteStar';
import { colors } from '@/constants/colors';
import { jobCardPalette, jobCardTone } from '@/constants/jobCardPalette';
import { useUserData } from '@/context/userdata';
import { matchScore, type FeedJob } from '@/data/feed';
import { useStyles, useTheme, type Theme } from '@/theme';

const COMPANY_LOGOS = [
  require('@/assets/images/logo1.jpg'),
  require('@/assets/images/logo2.png'),
  require('@/assets/images/logo3.jpg'),
] as const;

type Props = { job: FeedJob; index?: number };

export function HomeJobGridCard({ job, index = 0 }: Props) {
  const theme = useTheme();
  const styles = useStyles(makeStyles);
  const { skills } = useUserData();
  const match = matchScore(job, skills);
  const scale = useSharedValue(1);
  const pressStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  const p = jobCardPalette(jobCardTone(index), theme.scheme);

  const logo = COMPANY_LOGOS[index % COMPANY_LOGOS.length];

  return (
    <Animated.View entering={FadeInDown.delay(120 + index * 70).springify().damping(16)} style={pressStyle}>
      <Pressable
        style={[styles.card, { backgroundColor: p.cardBg, borderColor: p.cardBorder }]}
        onPress={() => router.push({ pathname: '/job/[id]', params: { id: job.id } })}
        onPressIn={() => scale.set(withSpring(0.96, { damping: 16, stiffness: 320 }))}
        onPressOut={() => scale.set(withSpring(1, { damping: 12, stiffness: 220 }))}
        accessibilityRole="button"
        accessibilityLabel={`${job.title} at ${job.company}`}>
        <View style={[styles.visual, { borderColor: p.logoBorder }]}>
          <Image
            source={logo}
            style={styles.logo}
            contentFit="contain"
            contentPosition="center"
            transition={180}
            accessibilityLabel={job.company}
          />
          <View style={styles.fav}>
            <FavoriteStar jobId={job.id} size={18} accent={p.heartAccent} />
          </View>
        </View>
        <Text style={[styles.title, { color: p.title }]} numberOfLines={2}>
          {job.title}
        </Text>
        <View style={styles.meta}>
          <Text style={[styles.salary, { color: p.salary }]} numberOfLines={1}>
            {job.salary}
          </Text>
          <View style={styles.rating}>
            <Ionicons name="star" size={12} color={p.icon} />
            <Text style={[styles.ratingText, { color: p.title }]}>{match !== null ? (match / 20).toFixed(1) : '—'}</Text>
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
      borderRadius: 7,
      padding: 10,
      borderWidth: 1,
      shadowColor: colors.dblue,
      shadowOpacity: 0.07,
      shadowRadius: 12,
      shadowOffset: { width: 0, height: 5 },
      elevation: 2,
    },
    visual: {
      height: 108,
      borderRadius: 7,
      overflow: 'hidden',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 10,
      borderWidth: 1,
      backgroundColor: colors.white,
      paddingHorizontal: 10,
      paddingVertical: 12,
    },
    logo: {
      width: '100%',
      height: '100%',
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
    },
    rating: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 3,
    },
    ratingText: {
      fontFamily: 'Lexend_700Bold',
      fontSize: 12,
    },
  });
