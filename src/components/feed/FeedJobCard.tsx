import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

import { Countdown } from '@/components/feed/Countdown';
import { FavoriteStar } from '@/components/feed/FavoriteStar';
import { colors } from '@/constants/colors';
import { jobCardPalette, jobCardTone } from '@/constants/jobCardPalette';
import { useUserData } from '@/context/userdata';
import { matchScore, type FeedJob } from '@/data/feed';
import { useI18n } from '@/i18n';
import { useStyles, useTheme, type Theme } from '@/theme';

/** Feed job card — reference layout with alternating blue accents on white. */
export function FeedJobCard({ job, index = 0 }: { job: FeedJob; index?: number }) {
  const { tr } = useI18n();
  const theme = useTheme();
  const styles = useStyles(makeStyles);
  const { skills, applied } = useUserData();
  const match = matchScore(job, skills);
  const scale = useSharedValue(1);
  const pressStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  const p = jobCardPalette(jobCardTone(index), theme.scheme);

  const initials = job.company
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const tags = job.skills.slice(0, 3);

  return (
    <Animated.View style={pressStyle}>
      <Pressable
        style={[styles.card, { backgroundColor: p.cardBg, borderColor: p.cardBorder }]}
        onPress={() => router.push({ pathname: '/job/[id]', params: { id: job.id } })}
        onPressIn={() => scale.set(withSpring(0.97, { damping: 15, stiffness: 300 }))}
        onPressOut={() => scale.set(withSpring(1, { damping: 12, stiffness: 220 }))}
        accessibilityRole="button"
        accessibilityLabel={`${job.title} at ${job.company}`}>
        <View style={styles.top}>
          <View style={[styles.logo, { backgroundColor: p.logoBg, borderColor: p.logoBorder }]}>
            <Text style={[styles.logoText, { color: p.logoText }]}>{initials}</Text>
          </View>
          <View style={styles.headline}>
            <Text style={[styles.title, { color: p.title }]} numberOfLines={2}>
              {job.title}
            </Text>
            <Text style={[styles.company, { color: p.meta }]} numberOfLines={1}>
              {job.company}
            </Text>
          </View>
          <FavoriteStar jobId={job.id} accent={p.heartAccent} />
        </View>

        <View style={styles.meta}>
          <Meta icon="location-outline" text={job.location} iconColor={p.icon} textColor={p.meta} />
          <Meta icon="briefcase-outline" text={job.type} iconColor={p.icon} textColor={p.meta} />
          <Meta icon="time-outline" text={job.postedAt} iconColor={p.icon} textColor={p.meta} />
        </View>

        <View style={styles.tags}>
          {tags.map((tag) => (
            <View key={tag} style={[styles.tag, { backgroundColor: p.chipBg, borderColor: p.chipBorder }]}>
              <Text style={[styles.tagText, { color: p.chipText }]}>{tag}</Text>
            </View>
          ))}
          {match !== null && (
            <View style={[styles.tag, { backgroundColor: p.chipBg, borderColor: p.chipBorder }]}>
              <Text style={[styles.tagText, { color: p.chipText }]}>{tr('feed.match', { n: match })}</Text>
            </View>
          )}
        </View>

        <View style={[styles.footer, { borderTopColor: p.divider }]}>
          <Text style={[styles.salary, { color: p.salary }]} numberOfLines={1}>
            {job.salary}
          </Text>
          <View style={styles.footerRight}>
            {applied.includes(job.id) ? (
              <View style={styles.applied}>
                <Ionicons name="checkmark-circle" size={14} color={colors.blue} />
                <Text style={[styles.appliedText, { color: colors.blue }]}>{tr('feed.applied')}</Text>
              </View>
            ) : (
              <Countdown deadline={job.deadline} compact brandBlue />
            )}
            <Pressable
              style={[styles.viewPill, { backgroundColor: p.ctaBg }]}
              onPress={(e) => {
                e.stopPropagation();
                router.push({ pathname: '/job/[id]', params: { id: job.id } });
              }}>
              <Text style={styles.viewText}>{tr('jobcard.view')}</Text>
              <Ionicons name="arrow-forward" size={13} color={colors.white} />
            </Pressable>
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
}

function Meta({
  icon,
  text,
  iconColor,
  textColor,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  text: string;
  iconColor: string;
  textColor: string;
}) {
  const styles = useStyles(makeStyles);
  return (
    <View style={styles.metaItem}>
      <Ionicons name={icon} size={13} color={iconColor} />
      <Text style={[styles.metaText, { color: textColor }]}>{text}</Text>
    </View>
  );
}

const makeStyles = (t: Theme) =>
  StyleSheet.create({
    card: {
      borderRadius: 18,
      padding: 16,
      borderWidth: 1,
      shadowColor: colors.dblue,
      shadowOpacity: 0.07,
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
      width: 46,
      height: 46,
      borderRadius: 14,
      borderWidth: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    logoText: {
      fontFamily: 'Lexend_700Bold',
      fontSize: 15,
    },
    headline: {
      flex: 1,
    },
    title: {
      fontFamily: 'Lexend_700Bold',
      fontSize: 15,
      lineHeight: 20,
    },
    company: {
      fontFamily: 'Lexend_400Regular',
      fontSize: 12,
      marginTop: 2,
    },
    meta: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 14,
      marginTop: 14,
    },
    metaItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    metaText: {
      fontFamily: 'Lexend_400Regular',
      fontSize: 12,
    },
    tags: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 6,
      marginTop: 12,
    },
    tag: {
      borderRadius: 8,
      paddingHorizontal: 9,
      paddingVertical: 4,
      borderWidth: 1,
    },
    tagText: {
      fontFamily: 'Lexend_400Regular',
      fontSize: 11,
    },
    footer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginTop: 14,
      paddingTop: 12,
      borderTopWidth: 1,
      gap: 8,
    },
    salary: {
      flex: 1,
      fontFamily: 'Lexend_700Bold',
      fontSize: 13,
    },
    footerRight: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      flexShrink: 1,
    },
    applied: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    appliedText: {
      fontFamily: 'Lexend_700Bold',
      fontSize: 11,
    },
    viewPill: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 20,
    },
    viewText: {
      fontFamily: 'Lexend_700Bold',
      fontSize: 12,
      color: colors.white,
    },
  });
