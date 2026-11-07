import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, Share, StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  Extrapolation,
  FadeInDown,
  interpolate,
  useAnimatedScrollHandler,
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
import { useUserData } from '@/context/userdata';
import { getJob, matchScore } from '@/data/feed';

const HEADER = 220;

export default function JobDetails() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const job = getJob(id);
  const insets = useSafeAreaInsets();
  const { skills, applied, apply } = useUserData();
  const [status, setStatus] = useState<'idle' | 'loading'>('idle');

  const scrollY = useSharedValue(0);
  const onScroll = useAnimatedScrollHandler((e) => {
    scrollY.value = e.contentOffset.y;
  });
  const headerStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: interpolate(scrollY.value, [0, HEADER], [0, -HEADER / 2], Extrapolation.CLAMP) },
      { scale: interpolate(scrollY.value, [-120, 0], [1.25, 1], Extrapolation.CLAMP) },
    ],
  }));
  const topBarStyle = useAnimatedStyle(() => ({
    opacity: interpolate(scrollY.value, [HEADER - 90, HEADER - 40], [0, 1], Extrapolation.CLAMP),
  }));

  if (!job) {
    return (
      <View style={[styles.screen, styles.center]}>
        <Text style={styles.sectionTitle}>This job is no longer available.</Text>
        <Pressable onPress={() => router.back()} style={styles.missingButton}>
          <Text style={styles.missingButtonText}>Go back</Text>
        </Pressable>
      </View>
    );
  }

  const match = matchScore(job, skills);
  const mine = new Set(skills.map((s) => s.toLowerCase()));
  const hasApplied = applied.includes(job.id);

  async function onApply() {
    // Replace with the real "apply" API call when available.
    setStatus('loading');
    await new Promise((r) => setTimeout(r, 900));
    apply(job!.id);
    setStatus('idle');
  }

  return (
    <View style={styles.screen}>
      <Animated.ScrollView
        onScroll={onScroll}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 110 }}>
        {/* HEADER */}
        <Animated.View style={[styles.header, { height: HEADER + insets.top }, headerStyle]}>
          <LinearGradient colors={[job.color, colors.dblue]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={StyleSheet.absoluteFill} />
          <View style={styles.headerCircle} />
          <Animated.View entering={ZoomIn.delay(150).springify().damping(11)} style={styles.logo}>
            <Text style={[styles.logoText, { color: job.color }]}>{job.company.charAt(0)}</Text>
          </Animated.View>
        </Animated.View>

        <View style={styles.sheet}>
          <Animated.Text entering={FadeInDown.delay(150).duration(500)} style={styles.company}>
            {job.company}
            {job.via ? <Text style={styles.via}>  via {job.via}</Text> : null}
          </Animated.Text>
          <Animated.Text entering={FadeInDown.delay(220).duration(500)} style={styles.title}>
            {job.title}
          </Animated.Text>

          <Animated.View entering={FadeInDown.delay(290).duration(500)} style={styles.chips}>
            <Chip icon="briefcase-outline" text={job.type} />
            <Chip icon="globe-outline" text={job.workMode} />
            <Chip icon="location-outline" text={job.location} />
            <Chip icon="cash-outline" text={job.salary} />
          </Animated.View>

          {/* MATCH */}
          <Animated.View entering={FadeInDown.delay(360).duration(500)} style={styles.card}>
            <View style={styles.cardRow}>
              <Text style={styles.sectionTitle}>Your match</Text>
              <Text style={styles.matchValue}>{match === null ? '—' : `${match}%`}</Text>
            </View>
            <MatchBar value={(match ?? 0) / 100} />
            <View style={styles.skills}>
              {job.skills.map((skill) => {
                const has = mine.has(skill.toLowerCase());
                return (
                  <View key={skill} style={[styles.skill, has ? styles.skillHas : styles.skillMissing]}>
                    <Ionicons name={has ? 'checkmark' : 'add'} size={13} color={has ? '#1b7f55' : '#7a8796'} />
                    <Text style={[styles.skillText, has && styles.skillTextHas]}>{skill}</Text>
                  </View>
                );
              })}
            </View>
            {match === null || match < 100 ? (
              <Pressable onPress={() => router.push('/skills')} hitSlop={6}>
                <Text style={styles.link}>{match === null ? 'Add your skills to see your match' : 'Update your skills'}</Text>
              </Pressable>
            ) : null}
          </Animated.View>

          {/* DEADLINE */}
          <Animated.View entering={FadeInDown.delay(430).duration(500)} style={[styles.card, styles.deadline]}>
            <View>
              <Text style={styles.sectionTitle}>Applications close in</Text>
              <Text style={styles.muted}>Posted {job.postedAt}</Text>
            </View>
            <Countdown deadline={job.deadline} compact />
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(500).duration(500)}>
            <Text style={styles.heading}>About the role</Text>
            <Text style={styles.paragraph}>{job.summary}</Text>

            <Text style={styles.heading}>What you&apos;ll do</Text>
            {job.responsibilities.map((item) => (
              <Bullet key={item} text={item} />
            ))}

            <Text style={styles.heading}>What we&apos;re looking for</Text>
            {job.requirements.map((item) => (
              <Bullet key={item} text={item} />
            ))}
          </Animated.View>
        </View>
      </Animated.ScrollView>

      {/* TOP BAR (fades in a solid background when the header scrolls away) */}
      <View style={[styles.topBar, { paddingTop: insets.top + 6 }]}>
        <Animated.View style={[StyleSheet.absoluteFill, styles.topBarBg, topBarStyle]} />
        <RoundButton icon="chevron-back" label="Go back" onPress={() => router.back()} />
        <Animated.Text style={[styles.topTitle, topBarStyle]} numberOfLines={1}>
          {job.title}
        </Animated.Text>
        <RoundButton
          icon="share-social-outline"
          label="Share"
          onPress={() => Share.share({ message: `${job.title} at ${job.company} — found on Mpuza` })}
        />
      </View>

      {/* APPLY BAR */}
      <Animated.View entering={FadeInDown.delay(600).springify().damping(16)} style={[styles.applyBar, { paddingBottom: insets.bottom + 12 }]}>
        <View style={styles.starBox}>
          <FavoriteStar jobId={job.id} size={24} />
        </View>
        <View style={styles.flex}>
          {hasApplied ? (
            <Animated.View entering={ZoomIn.springify()} style={styles.appliedBox}>
              <Ionicons name="checkmark-circle" size={20} color="#22a06b" />
              <Text style={styles.appliedText}>Application sent</Text>
            </Animated.View>
          ) : (
            <PrimaryButton label="Apply now" shimmer onPress={onApply} loading={status === 'loading'} />
          )}
        </View>
      </Animated.View>
    </View>
  );
}

function MatchBar({ value }: { value: number }) {
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
  return (
    <View style={styles.chip}>
      <Ionicons name={icon} size={13} color={colors.dblue} />
      <Text style={styles.chipText}>{text}</Text>
    </View>
  );
}

function Bullet({ text }: { text: string }) {
  return (
    <View style={styles.bullet}>
      <View style={styles.bulletDot} />
      <Text style={styles.bulletText}>{text}</Text>
    </View>
  );
}

function RoundButton({ icon, label, onPress }: { icon: keyof typeof Ionicons.glyphMap; label: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} hitSlop={8} style={({ pressed }) => [styles.round, pressed && { opacity: 0.7 }]} accessibilityLabel={label}>
      <Ionicons name={icon} size={20} color={colors.dblue} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  screen: {
    flex: 1,
    backgroundColor: colors.white,
  },
  center: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 14,
  },
  missingButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: colors.orange,
  },
  missingButtonText: {
    fontFamily: 'Lexend_700Bold',
    color: colors.white,
  },
  header: {
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingBottom: 44,
    overflow: 'hidden',
  },
  headerCircle: {
    position: 'absolute',
    top: -60,
    right: -60,
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  logo: {
    width: 84,
    height: 84,
    borderRadius: 24,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
  logoText: {
    fontFamily: 'Lexend_700Bold',
    fontSize: 36,
  },
  sheet: {
    marginTop: -24,
    paddingHorizontal: 20,
    paddingTop: 24,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    backgroundColor: colors.white,
  },
  company: {
    fontFamily: 'Lexend_700Bold',
    fontSize: 14,
    color: colors.orange,
    textAlign: 'center',
  },
  via: {
    fontFamily: 'Lexend_400Regular',
    fontSize: 12,
    color: '#8a95a3',
  },
  title: {
    fontFamily: 'Lexend_700Bold',
    fontSize: 24,
    lineHeight: 31,
    color: colors.dblue,
    textAlign: 'center',
    marginTop: 4,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
    marginTop: 16,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: '#f3f5f9',
  },
  chipText: {
    fontFamily: 'Lexend_400Regular',
    fontSize: 12,
    color: colors.dblue,
  },
  card: {
    marginTop: 18,
    padding: 16,
    borderRadius: 18,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#edf0f5',
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    fontFamily: 'Lexend_700Bold',
    fontSize: 15,
    color: colors.dblue,
  },
  matchValue: {
    fontFamily: 'Lexend_700Bold',
    fontSize: 22,
    color: colors.blue,
  },
  track: {
    height: 8,
    borderRadius: 4,
    backgroundColor: '#e6ebf1',
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
    borderRadius: 16,
  },
  skillHas: {
    backgroundColor: 'rgba(34,160,107,0.12)',
  },
  skillMissing: {
    backgroundColor: '#eef1f5',
  },
  skillText: {
    fontFamily: 'Lexend_400Regular',
    fontSize: 12,
    color: '#5b6b7a',
  },
  skillTextHas: {
    fontFamily: 'Lexend_700Bold',
    color: '#1b7f55',
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
    color: '#8a95a3',
    marginTop: 2,
  },
  heading: {
    fontFamily: 'Lexend_700Bold',
    fontSize: 17,
    color: colors.dblue,
    marginTop: 26,
    marginBottom: 8,
  },
  paragraph: {
    fontFamily: 'Lexend_400Regular',
    fontSize: 14,
    lineHeight: 22,
    color: '#4a5866',
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
    color: '#4a5866',
  },
  topBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  topBarBg: {
    backgroundColor: colors.white,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e3e6ec',
  },
  topTitle: {
    flex: 1,
    fontFamily: 'Lexend_700Bold',
    fontSize: 15,
    color: colors.dblue,
    textAlign: 'center',
  },
  round: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.92)',
    alignItems: 'center',
    justifyContent: 'center',
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
    borderTopColor: '#e3e6ec',
  },
  starBox: {
    width: 56,
    height: 56,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#e3e6ec',
    alignItems: 'center',
    justifyContent: 'center',
  },
  appliedBox: {
    height: 56,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: 'rgba(34,160,107,0.1)',
  },
  appliedText: {
    fontFamily: 'Lexend_700Bold',
    fontSize: 15,
    color: '#1b7f55',
  },
});
