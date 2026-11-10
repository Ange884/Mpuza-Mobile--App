import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, Share, StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
  ZoomIn,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { PrimaryButton } from '@/components/auth/PrimaryButton';
import { Countdown } from '@/components/feed/Countdown';
import { FavoriteStar } from '@/components/feed/FavoriteStar';
import { colors } from '@/constants/colors';
import { toFeedJob } from '@/api/mapJob';
import { getJobDetails, startApplication, submitApplication } from '@/api/mpuza';
import { getToken } from '@/api/session';
import { useJobCatalog } from '@/context/jobs';
import { useUserData } from '@/context/userdata';
import { matchScore, type FeedJob } from '@/data/feed';
import { useI18n } from '@/i18n';
import { useStyles, useTheme, type Theme } from '@/theme';

function StarRow({ rating }: { rating: number }) {
  const full = Math.round(rating / 20);
  return (
    <View style={{ flexDirection: 'row', gap: 2 }}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Ionicons key={i} name={i < full ? 'star' : 'star-outline'} size={14} color={colors.orange} />
      ))}
    </View>
  );
}

export default function JobDetails() {
  const { tr } = useI18n();
  const t = useTheme();
  const styles = useStyles(makeStyles);
  const { id } = useLocalSearchParams<{ id: string }>();
  const { jobById, remember } = useJobCatalog();
  const localJob = jobById(id);
  const [remoteJob, setRemoteJob] = useState<FeedJob | null>(null);
  const [lookup, setLookup] = useState<'loading' | 'ready' | 'missing'>(localJob ? 'ready' : 'loading');
  const insets = useSafeAreaInsets();
  const { skills, applied, apply } = useUserData();
  const [status, setStatus] = useState<'idle' | 'loading'>('idle');
  const job = remoteJob ?? localJob;

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    getJobDetails(id)
      .then((row) => {
        if (cancelled) return;
        if (!row) {
          setLookup((current) => (current === 'ready' ? current : 'missing'));
          return;
        }
        const full = toFeedJob(row, 0);
        setRemoteJob(full);
        remember([full]);
        setLookup('ready');
      })
      .catch(() => {
        if (!cancelled) setLookup((current) => (current === 'ready' ? current : 'missing'));
      });
    return () => {
      cancelled = true;
    };
  }, [id, remember]);

  if (!job) {
    return (
      <View style={[styles.screen, styles.center]}>
        <Text style={styles.sectionTitle}>{lookup === 'loading' ? tr('loading.pleaseWait') : tr('job.missing')}</Text>
        <Pressable onPress={() => router.back()} style={styles.missingButton}>
          <Text style={styles.missingButtonText}>{tr('common.goBack')}</Text>
        </Pressable>
      </View>
    );
  }

  const current = job;
  const match = matchScore(current, skills);
  const mine = new Set(skills.map((s) => s.toLowerCase()));
  const hasApplied = applied.includes(job.id);
  const stars = match ?? 0;

  async function onApply() {
    setStatus('loading');
    try {
      const token = await getToken();
      if (token && /^[0-9a-f-]{36}$/i.test(current.id)) {
        const start = await startApplication(current.id);
        if (!start.alreadySubmitted && start.canApply !== false) await submitApplication(current.id);
      }
      apply(current.id);
    } catch {
      // Keep the button usable. A failed API call does not change the screen.
    } finally {
      setStatus('idle');
    }
  }

  return (
    <View style={styles.screen}>
      <View style={[styles.topBar, { paddingTop: insets.top + 6 }]}>
        <Pressable onPress={() => router.back()} hitSlop={8} style={({ pressed }) => [styles.round, pressed && styles.pressed]} accessibilityLabel={tr('common.goBack')}>
          <Ionicons name="chevron-back" size={20} color={t.text} />
        </Pressable>
        <Text style={styles.topTitle}>{tr('job.detailsTitle')}</Text>
        <View style={styles.round}>
          <FavoriteStar jobId={job.id} size={20} />
        </View>
      </View>

      <Animated.ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: insets.bottom + 120 }}>
        <Animated.View entering={FadeInDown.delay(80).duration(550)} style={[styles.hero, { backgroundColor: job.color + '12' }]}>
          <Text style={[styles.heroInitial, { color: job.color }]}>{job.company.charAt(0)}</Text>
          <View style={styles.heroChip}>
            <Text style={styles.heroChipText}>1/1</Text>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(160).duration(550)} style={styles.body}>
          <Text style={styles.title}>{job.title}</Text>
          <Text style={styles.company}>{job.company}</Text>

          <View style={styles.ratingRow}>
            <StarRow rating={stars} />
            <Text style={styles.ratingText}>{tr('job.reviews', { n: match ?? 0 })}</Text>
          </View>

          <Text style={styles.salary}>{job.salary}</Text>
          <View style={styles.openBadge}>
            <Text style={styles.openText}>{tr('job.open')}</Text>
          </View>

          <Text style={styles.optionLabel}>{tr('job.looking')}</Text>
          <View style={styles.skillDots}>
            {job.skills.map((skill) => {
              const has = mine.has(skill.toLowerCase());
              return (
                <View key={skill} style={[styles.skillDot, has && styles.skillDotOn]}>
                  <Text style={[styles.skillDotText, has && styles.skillDotTextOn]}>{skill.charAt(0)}</Text>
                </View>
              );
            })}
          </View>

          <View style={styles.card}>
            <View style={styles.cardRow}>
              <Text style={styles.sectionTitle}>{tr('job.yourMatch')}</Text>
              <Text style={styles.matchValue}>{match === null ? '—' : `${match}%`}</Text>
            </View>
            <MatchBar value={(match ?? 0) / 100} />
            <View style={styles.skills}>
              {job.skills.map((skill) => {
                const has = mine.has(skill.toLowerCase());
                return (
                  <View key={skill} style={[styles.skill, has ? styles.skillHas : styles.skillMissing]}>
                    <Ionicons name={has ? 'checkmark' : 'add'} size={13} color={has ? t.successText : t.textMuted} />
                    <Text style={[styles.skillText, has && styles.skillTextHas]}>{skill}</Text>
                  </View>
                );
              })}
            </View>
            {match === null || match < 100 ? (
              <Pressable onPress={() => router.push('/skills')} hitSlop={6}>
                <Text style={styles.link}>{match === null ? tr('job.addSkills') : tr('job.updateSkills')}</Text>
              </Pressable>
            ) : null}
          </View>

          <View style={[styles.card, styles.deadline]}>
            <View>
              <Text style={styles.sectionTitle}>{tr('job.closesIn')}</Text>
              <Text style={styles.muted}>{tr('job.posted', { time: job.postedAt })}</Text>
            </View>
            <Countdown deadline={job.deadline} compact />
          </View>

          <View style={styles.chips}>
            <Chip icon="briefcase-outline" text={job.type} />
            <Chip icon="globe-outline" text={job.workMode} />
            <Chip icon="location-outline" text={job.location} />
          </View>

          {job.summary ? <Text style={styles.paragraph}>{job.summary}</Text> : null}

          {job.responsibilities.length > 0 && <Text style={styles.heading}>{tr('job.do')}</Text>}
          {job.responsibilities.map((item) => (
            <Bullet key={item} text={item} />
          ))}

          {job.requirements.length > 0 && <Text style={styles.heading}>{tr('job.about')}</Text>}
          {job.requirements.map((item) => (
            <Bullet key={item} text={item} />
          ))}

          {job.benefits.length > 0 && <Text style={styles.heading}>{tr('job.benefits')}</Text>}
          {job.benefits.map((item) => (
            <Bullet key={item} text={item} />
          ))}
        </Animated.View>
      </Animated.ScrollView>

      <Animated.View entering={FadeInDown.delay(400).springify().damping(16)} style={[styles.applyBar, { paddingBottom: insets.bottom + 12 }]}>
        <Pressable
          onPress={() => Share.share({ message: tr('job.shareMessage', { title: job.title, company: job.company }) })}
          style={styles.shareRound}
          accessibilityLabel={tr('job.share')}>
          <Ionicons name="share-social-outline" size={20} color={t.text} />
        </Pressable>
        <View style={styles.flex}>
          {hasApplied ? (
            <Animated.View entering={ZoomIn.springify()} style={styles.appliedBox}>
              <Ionicons name="checkmark-circle" size={20} color={t.success} />
              <Text style={styles.appliedText}>{tr('job.sent')}</Text>
            </Animated.View>
          ) : (
            <PrimaryButton pill arrow label={tr('job.apply')} shimmer onPress={onApply} loading={status === 'loading'} />
          )}
        </View>
      </Animated.View>
    </View>
  );
}

function MatchBar({ value }: { value: number }) {
  const styles = useStyles(makeStyles);
  const progress = useSharedValue(0);
  useEffect(() => {
    progress.set(withDelay(500, withTiming(value, { duration: 900, easing: Easing.out(Easing.cubic) })));
  }, [progress, value]);
  const style = useAnimatedStyle(() => ({ transform: [{ scaleX: progress.value }] }));
  return (
    <View style={styles.track}>
      <Animated.View style={[styles.fill, style]} />
    </View>
  );
}

function Chip({ icon, text }: { icon: keyof typeof Ionicons.glyphMap; text: string }) {
  const t = useTheme();
  const styles = useStyles(makeStyles);
  return (
    <View style={styles.chip}>
      <Ionicons name={icon} size={13} color={colors.blue} />
      <Text style={styles.chipText}>{text}</Text>
    </View>
  );
}

function Bullet({ text }: { text: string }) {
  const styles = useStyles(makeStyles);
  return (
    <View style={styles.bullet}>
      <View style={styles.bulletDot} />
      <Text style={styles.bulletText}>{text}</Text>
    </View>
  );
}

const makeStyles = (t: Theme) =>
  StyleSheet.create({
    flex: {
      flex: 1,
    },
    screen: {
      flex: 1,
      backgroundColor: t.scheme === 'dark' ? t.bg : colors.white,
    },
    pressed: {
      opacity: 0.7,
    },
    center: {
      alignItems: 'center',
      justifyContent: 'center',
      gap: 14,
    },
    missingButton: {
      paddingHorizontal: 20,
      paddingVertical: 10,
      borderRadius: 7,
      backgroundColor: colors.orange,
    },
    missingButtonText: {
      fontFamily: 'Lexend_700Bold',
      color: colors.white,
    },
    topBar: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      paddingHorizontal: 16,
      paddingBottom: 10,
      backgroundColor: colors.white,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: t.border,
    },
    topTitle: {
      flex: 1,
      fontFamily: 'Lexend_700Bold',
      fontSize: 17,
      color: t.text,
      textAlign: 'center',
    },
    round: {
      width: 42,
      height: 42,
      borderRadius: 7,
      backgroundColor: t.surfaceAlt,
      alignItems: 'center',
      justifyContent: 'center',
    },
    hero: {
      marginHorizontal: 20,
      marginTop: 12,
      height: 240,
      borderRadius: 7,
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
      shadowColor: '#0e314c',
      shadowOpacity: 0.08,
      shadowRadius: 16,
      shadowOffset: { width: 0, height: 8 },
      elevation: 3,
    },
    heroInitial: {
      fontFamily: 'Lexend_700Bold',
      fontSize: 72,
    },
    heroChip: {
      position: 'absolute',
      right: 14,
      bottom: 14,
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderRadius: 7,
      backgroundColor: 'rgba(14,49,76,0.55)',
    },
    heroChipText: {
      fontFamily: 'Lexend_700Bold',
      fontSize: 11,
      color: colors.white,
    },
    body: {
      paddingHorizontal: 20,
      paddingTop: 18,
    },
    title: {
      fontFamily: 'Lexend_700Bold',
      fontSize: 22,
      lineHeight: 28,
      color: t.text,
    },
    company: {
      fontFamily: 'Lexend_400Regular',
      fontSize: 14,
      color: t.textMuted,
      marginTop: 4,
    },
    ratingRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      marginTop: 10,
    },
    ratingText: {
      fontFamily: 'Lexend_400Regular',
      fontSize: 13,
      color: t.textMuted,
    },
    salary: {
      fontFamily: 'Lexend_700Bold',
      fontSize: 24,
      color: colors.orange,
      marginTop: 12,
    },
    openBadge: {
      alignSelf: 'flex-start',
      marginTop: 10,
      paddingHorizontal: 12,
      paddingVertical: 5,
      borderRadius: 7,
      backgroundColor: 'rgba(34,160,107,0.12)',
    },
    openText: {
      fontFamily: 'Lexend_700Bold',
      fontSize: 12,
      color: t.successText,
    },
    paragraph: {
      fontFamily: 'Lexend_400Regular',
      fontSize: 14,
      lineHeight: 22,
      color: t.textBody,
      marginTop: 14,
    },
    optionLabel: {
      fontFamily: 'Lexend_700Bold',
      fontSize: 15,
      color: t.text,
      marginTop: 22,
      marginBottom: 10,
    },
    skillDots: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 10,
      marginBottom: 8,
    },
    skillDot: {
      width: 38,
      height: 38,
      borderRadius: 7,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: t.surfaceAlt,
      borderWidth: 2,
      borderColor: 'transparent',
    },
    skillDotOn: {
      borderColor: colors.blue,
      backgroundColor: 'rgba(53,168,223,0.12)',
    },
    skillDotText: {
      fontFamily: 'Lexend_700Bold',
      fontSize: 14,
      color: t.textMuted,
    },
    skillDotTextOn: {
      color: colors.blue,
    },
    card: {
      marginTop: 16,
      padding: 16,
      borderRadius: 7,
      backgroundColor: colors.white,
      borderWidth: 1,
      borderColor: t.border,
    },
    cardRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    sectionTitle: {
      fontFamily: 'Lexend_700Bold',
      fontSize: 15,
      color: t.text,
    },
    matchValue: {
      fontFamily: 'Lexend_700Bold',
      fontSize: 22,
      color: colors.blue,
    },
    track: {
      height: 8,
      borderRadius: 4,
      backgroundColor: t.surfaceAlt,
      marginTop: 10,
      overflow: 'hidden',
    },
    fill: {
      flex: 1,
      borderRadius: 4,
      backgroundColor: colors.blue,
      transformOrigin: 'left',
    },
    skills: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 6,
      marginTop: 14,
    },
    skill: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderRadius: 7,
    },
    skillHas: {
      backgroundColor: 'rgba(34,160,107,0.12)',
    },
    skillMissing: {
      backgroundColor: t.surfaceAlt,
    },
    skillText: {
      fontFamily: 'Lexend_400Regular',
      fontSize: 12,
      color: t.textBody,
    },
    skillTextHas: {
      fontFamily: 'Lexend_700Bold',
      color: t.successText,
    },
    link: {
      fontFamily: 'Lexend_700Bold',
      fontSize: 13,
      color: colors.blue,
      marginTop: 12,
    },
    deadline: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 10,
    },
    muted: {
      fontFamily: 'Lexend_400Regular',
      fontSize: 12,
      color: t.textMuted,
      marginTop: 2,
    },
    chips: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
      marginTop: 16,
    },
    chip: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
      paddingHorizontal: 12,
      paddingVertical: 7,
      borderRadius: 7,
      backgroundColor: 'rgba(53,168,223,0.08)',
    },
    chipText: {
      fontFamily: 'Lexend_400Regular',
      fontSize: 12,
      color: t.text,
    },
    heading: {
      fontFamily: 'Lexend_700Bold',
      fontSize: 17,
      color: t.text,
      marginTop: 22,
      marginBottom: 8,
    },
    bullet: {
      flexDirection: 'row',
      gap: 10,
      marginBottom: 8,
    },
    bulletDot: {
      width: 6,
      height: 6,
      borderRadius: 3,
      backgroundColor: colors.orange,
      marginTop: 8,
    },
    bulletText: {
      flex: 1,
      fontFamily: 'Lexend_400Regular',
      fontSize: 14,
      lineHeight: 22,
      color: t.textBody,
    },
    applyBar: {
      position: 'absolute',
      left: 0,
      right: 0,
      bottom: 0,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      paddingHorizontal: 20,
      paddingTop: 12,
      backgroundColor: colors.white,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: t.border,
    },
    shareRound: {
      width: 50,
      height: 50,
      borderRadius: 7,
      borderWidth: 1,
      borderColor: t.border,
      alignItems: 'center',
      justifyContent: 'center',
    },
    appliedBox: {
      height: 56,
      borderRadius: 7,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      backgroundColor: 'rgba(34,160,107,0.1)',
    },
    appliedText: {
      fontFamily: 'Lexend_700Bold',
      fontSize: 15,
      color: t.successText,
    },
  });
