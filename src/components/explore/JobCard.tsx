import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

import { colors } from '@/constants/colors';
import { jobCardPalette, jobCardTone } from '@/constants/jobCardPalette';
import type { Job } from '@/data/explore';
import { useI18n } from '@/i18n';
import { useStyles, useTheme, type Theme } from '@/theme';

type Props = {
  job: Job;
  index?: number;
  onPress: (job: Job) => void;
  locked?: boolean;
  applied?: boolean;
};

export function JobCard({ job, onPress, index = 0, locked = true, applied = false }: Props) {
  const { tr } = useI18n();
  const theme = useTheme();
  const styles = useStyles(makeStyles);
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  const p = jobCardPalette(jobCardTone(index), theme.scheme);

  const initials = job.company
    .split(' ')
    .map((word) => word[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <Animated.View style={[styles.wrapper, animatedStyle]}>
      <Pressable
        style={[styles.card, { backgroundColor: p.cardBg, borderColor: p.cardBorder }]}
        onPress={() => onPress(job)}
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
            <Text style={[styles.company, { color: p.meta }]}>{job.company}</Text>
          </View>
          {locked && <Ionicons name="lock-closed" size={16} color={p.meta} />}
        </View>

        <View style={styles.meta}>
          <Meta icon="location-outline" text={job.location} iconColor={p.icon} textColor={p.meta} />
          <Meta icon="briefcase-outline" text={job.type} iconColor={p.icon} textColor={p.meta} />
          <Meta icon="time-outline" text={job.posted} iconColor={p.icon} textColor={p.meta} />
        </View>

        <View style={styles.bottom}>
          <View style={styles.tags}>
            {job.tags.map((tag) => (
              <View key={tag} style={[styles.tag, { backgroundColor: p.chipBg, borderColor: p.chipBorder }]}>
                <Text style={[styles.tagText, { color: p.chipText }]}>{tag}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={[styles.footer, { borderTopColor: p.divider }]}>
          <Text style={[styles.salary, { color: p.salary }]}>{job.salary}</Text>
          <View style={[styles.applyPill, { backgroundColor: p.ctaBg }]}>
            <Text style={styles.applyText}>{applied ? tr('jobcard.applied') : locked ? tr('jobcard.view') : tr('jobcard.apply')}</Text>
            <Ionicons name={applied ? 'checkmark' : 'arrow-forward'} size={13} color={colors.white} />
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
    wrapper: {
      marginBottom: 14,
    },
    card: {
      borderRadius: 7,
      padding: 16,
      borderWidth: 1,
      shadowColor: colors.dblue,
      shadowOpacity: t.scheme === 'dark' ? 0.22 : 0.08,
      shadowRadius: 16,
      shadowOffset: { width: 0, height: 6 },
      elevation: t.scheme === 'dark' ? 4 : 3,
    },
    top: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: 12,
    },
    logo: {
      width: 46,
      height: 46,
      borderRadius: 7,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
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
    bottom: {
      marginTop: 12,
    },
    tags: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 6,
    },
    tag: {
      borderRadius: 7,
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
    },
    salary: {
      fontFamily: 'Lexend_700Bold',
      fontSize: 13,
    },
    applyPill: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 7,
    },
    applyText: {
      fontFamily: 'Lexend_700Bold',
      fontSize: 12,
      color: colors.white,
    },
  });
