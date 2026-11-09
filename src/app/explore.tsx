import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import Animated, {
    Easing,
    FadeInDown,
    FadeOut,
    interpolate,
    interpolateColor,
    LinearTransition,
    useAnimatedRef,
    useAnimatedScrollHandler,
    useAnimatedStyle,
    useReducedMotion,
    useSharedValue,
    withRepeat,
    withTiming,
    type SharedValue,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AuthPromptSheet } from '@/components/explore/AuthPromptSheet';
import { JobCard } from '@/components/explore/JobCard';
import { Reveal, ScrollYContext } from '@/components/Reveal';
import { colors } from '@/constants/colors';
import { useAuth } from '@/context/auth';
import { categories, jobs, partners, stats, steps, type Job } from '@/data/explore';
import { useI18n } from '@/i18n';
import type { TranslationKey } from '@/i18n/en';
import { useStyles, useTheme, type Theme } from '@/theme';

const HEADER_HEIGHT = 56;

export default function Explore() {
  const { tr, cat } = useI18n();
  const t = useTheme();
  const styles = useStyles(makeStyles);
  const insets = useSafeAreaInsets();
  const scrollRef = useAnimatedRef<Animated.ScrollView>();
  const scrollY = useSharedValue(0);
  const { user } = useAuth();

  const [query, setQuery] = useState('');
  const [location, setLocation] = useState('');
  const [category, setCategory] = useState('All');
  const [jobsY, setJobsY] = useState(0);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);

  const visibleJobs = useMemo(() => {
    const q = query.trim().toLowerCase();
    const loc = location.trim().toLowerCase();
    return jobs.filter(
      (job) =>
        (category === 'All' || job.category === category) &&
        (!q ||
          job.title.toLowerCase().includes(q) ||
          job.company.toLowerCase().includes(q) ||
          job.tags.some((tag) => tag.toLowerCase().includes(q))) &&
        (!loc || job.location.toLowerCase().includes(loc))
    );
  }, [query, location, category]);

  const onScroll = useAnimatedScrollHandler((event) => {
    scrollY.value = event.contentOffset.y;
  });

  const headerStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(scrollY.value, [0, 80], [t.surface + '00', t.surface]),
    shadowOpacity: interpolate(scrollY.value, [0, 80], [0, 0.08], 'clamp'),
    borderBottomColor: interpolateColor(scrollY.value, [0, 80], ['rgba(0,0,0,0)', 'rgba(0,0,0,0.05)']),
  }));

  function goBack() {
    if (router.canGoBack()) router.back();
    else router.replace('/landing');
  }

  function searchJobs() {
    scrollRef.current?.scrollTo({ y: jobsY - insets.top - HEADER_HEIGHT, animated: true });
  }

  return (
    <ScrollYContext.Provider value={scrollY}>
      <View style={styles.screen}>
        <Animated.ScrollView
          ref={scrollRef}
          onScroll={onScroll}
          scrollEventThrottle={16}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          {/* HERO */}
          <View style={[styles.hero, { paddingTop: insets.top + HEADER_HEIGHT + 24 }]}>
            <LinearGradient
              colors={t.scheme === 'dark' ? ['#0e2230', '#1d1a1c', t.bg] : ['#eaf6fd', '#fdf1ec', '#ffffff']}
              locations={[0, 0.6, 1]}
              style={StyleSheet.absoluteFill}
            />
            <FloatingBlob scrollY={scrollY} color="rgba(53,168,223,0.18)" size={220} top={40} left={-80} />
            <FloatingBlob scrollY={scrollY} color="rgba(237,99,60,0.16)" size={180} top={170} left={230} reverse />
            <HeroGrid />

            <Animated.Text entering={FadeInDown.delay(100).duration(600)} style={styles.heroTitle}>
              {tr('explore.heroPrefix')}
              <Text style={styles.heroAccent}>{tr('explore.heroAccent')}</Text>
              {tr('explore.heroSuffix')}
            </Animated.Text>
            <Animated.Text entering={FadeInDown.delay(220).duration(600)} style={styles.heroSubtitle}>
              Thousands of jobs in technology, engineering, design and business are waiting for you.
            </Animated.Text>

            <Animated.View entering={FadeInDown.delay(360).duration(650)} style={styles.searchCard}>
              <View style={styles.searchRow}>
                <Ionicons name="search-outline" size={18} color={t.textMuted} />
                <TextInput
                  value={query}
                  onChangeText={setQuery}
                  placeholder={tr('explore.positionPlaceholder')}
                  placeholderTextColor={t.textFaint}
                  style={styles.searchInput}
                  returnKeyType="search"
                  onSubmitEditing={searchJobs}
                />
              </View>
              <View style={styles.searchDivider} />
              <View style={styles.searchRow}>
                <Ionicons name="location-outline" size={18} color={t.textMuted} />
                <TextInput
                  value={location}
                  onChangeText={setLocation}
                  placeholder={tr('explore.locationPlaceholder')}
                  placeholderTextColor={t.textFaint}
                  style={styles.searchInput}
                  returnKeyType="search"
                  onSubmitEditing={searchJobs}
                />
              </View>
            </Animated.View>

            <Animated.View entering={FadeInDown.delay(480).duration(650)}>
              <Pressable
                style={({ pressed }) => [styles.searchButton, pressed && styles.pressed]}
                onPress={searchJobs}>
                <Text style={styles.searchButtonText}>{tr('explore.searchJobs')}</Text>
                <Ionicons name="arrow-forward" size={16} color={colors.white} />
              </Pressable>
            </Animated.View>
          </View>

          {/* STATS */}
          <Reveal style={styles.stats}>
            {stats.map((stat, index) => (
              <View key={stat.label} style={[styles.stat, index > 0 && styles.statDivider]}>
                <Text style={styles.statValue}>{stat.value}</Text>
                <Text style={styles.statLabel}>{tr(`explore.stat${index}` as TranslationKey)}</Text>
              </View>
            ))}
          </Reveal>

          {/* JOBS */}
          <View style={styles.section} onLayout={(event) => setJobsY(event.nativeEvent.layout.y)}>
            <Reveal>
              <Text style={styles.eyebrow}>{tr('explore.eyebrow')}</Text>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>{tr('explore.jobsTitle')}</Text>
                <Text style={styles.count}>{tr('explore.found', { n: visibleJobs.length })}</Text>
              </View>
            </Reveal>

            <Reveal delay={100}>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.chips}
                style={styles.chipsScroll}>
                {categories.map((item) => (
                  <Chip key={item} label={cat(item)} active={item === category} onPress={() => setCategory(item)} />
                ))}
              </ScrollView>
            </Reveal>

            {visibleJobs.map((job, index) => (
              <Animated.View key={job.id} layout={LinearTransition.springify().damping(18)} exiting={FadeOut.duration(180)}>
                <Reveal delay={Math.min(index, 3) * 80}>
                  <JobCard job={job} onPress={user ? () => router.push('/home') : setSelectedJob} locked={!user} />
                </Reveal>
              </Animated.View>
            ))}

            {visibleJobs.length === 0 && (
              <Animated.View entering={FadeInDown.duration(400)} style={styles.empty}>
                <Ionicons name="search" size={28} color={t.textFaint} />
                <Text style={styles.emptyTitle}>{tr('explore.emptyTitle')}</Text>
                <Text style={styles.emptyText}>{tr('explore.emptyText')}</Text>
              </Animated.View>
            )}

            <Reveal>
              <Pressable
                style={({ pressed }) => [styles.seeAll, pressed && styles.pressed]}
                onPress={() => router.push('/signup')}>
                <Ionicons name="lock-closed" size={14} color={colors.blue} />
                <Text style={styles.seeAllText}>{tr('explore.seeAll')}</Text>
              </Pressable>
            </Reveal>
          </View>

          {/* TRUSTED BY */}
          <View style={[styles.section, styles.trustedSection]}>
            <Reveal>
              <Text style={[styles.sectionTitle, styles.centered]}>{tr('explore.trustedTitle')}</Text>
              <Text style={styles.sectionSubtitle}>{tr('explore.trustedSubtitle')}</Text>
            </Reveal>
            <View style={styles.partnerGrid}>
              {partners.map((partner, index) => (
                <Reveal key={partner.name} delay={(index % 3) * 90} distance={18} style={styles.partnerCell}>
                  <View style={styles.partner}>
                    <Ionicons name={partner.icon} size={18} color={partner.color} />
                    <Text style={[styles.partnerName, { color: partner.color }]} numberOfLines={1}>
                      {partner.name}
                    </Text>
                  </View>
                </Reveal>
              ))}
            </View>
          </View>

          {/* HOW WE DO */}
          <View style={styles.section}>
            <Reveal>
              <Text style={[styles.sectionTitle, styles.centered]}>{tr('explore.howTitle')}</Text>
            </Reveal>
            {steps.map((step, index) => (
              <Reveal key={step.title} delay={80} style={styles.step}>
                <PulseIcon icon={step.icon} color={step.color} />
                <Text style={styles.stepLabel}>{tr('explore.step', { n: index + 1 })}</Text>
                <Text style={styles.stepTitle}>{tr(`explore.step${index}Title` as TranslationKey)}</Text>
                <Text style={styles.stepText}>{tr(`explore.step${index}Text` as TranslationKey)}</Text>
              </Reveal>
            ))}
          </View>

          {/* CTA */}
          <Reveal style={styles.ctaWrap}>
            <LinearGradient
              colors={[colors.orange, '#f28b5b']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.cta}>
              <Text style={styles.ctaTitle}>{tr('explore.ctaTitle')}</Text>
              <Text style={styles.ctaText}>
                {tr('explore.ctaText')}
              </Text>
              <Pressable
                style={({ pressed }) => [styles.ctaButton, pressed && styles.pressed]}
                onPress={() => router.push('/signup')}>
                <Text style={styles.ctaButtonText}>{tr('explore.ctaButton')}</Text>
              </Pressable>
            </LinearGradient>
          </Reveal>

          {/* FOOTER */}
          <View style={[styles.footer, { paddingBottom: insets.bottom + 32 }]}>
            <Reveal>
              <Logo light />
              <Text style={styles.footerBlurb}>
                {tr('explore.footerBlurb')}
              </Text>
              <View style={styles.socials}>
                {(['logo-facebook', 'logo-twitter', 'logo-linkedin', 'logo-instagram'] as const).map((icon) => (
                  <View key={icon} style={styles.social}>
                    <Ionicons name={icon} size={15} color={colors.white} />
                  </View>
                ))}
              </View>
            </Reveal>

            <Reveal style={styles.footerColumns}>
              <FooterColumn
                title={tr('explore.footerExplore')}
                links={[tr('explore.footerJobs'), tr('explore.footerCompanies'), tr('explore.footerHow')]}
              />
              <FooterColumn
                title={tr('explore.footerAccount')}
                links={[tr('common.logIn'), tr('common.signUp'), tr('explore.footerHelp')]}
                onPress={footerLink}
              />
            </Reveal>

            <Reveal>
              <Text style={styles.footerHeading}>{tr('explore.contact')}</Text>
              <Text style={styles.footerLink}>hello@mpuza.rw</Text>
              <Text style={styles.copyright}>{tr('explore.rights', { year: new Date().getFullYear() })}</Text>
            </Reveal>
          </View>
        </Animated.ScrollView>

        {/* STICKY HEADER */}
        <Animated.View style={[styles.header, { paddingTop: insets.top, height: insets.top + HEADER_HEIGHT }, headerStyle]}>
          <Pressable onPress={goBack} hitSlop={10} style={styles.headerIcon} accessibilityLabel={tr('common.goBack')}>
            <Ionicons name="arrow-back" size={22} color={t.text} />
          </Pressable>
          <Logo />
          <Pressable
            onPress={() => router.push('/login')}
            style={({ pressed }) => [styles.loginPill, pressed && styles.pressed]}>
            <Text style={styles.loginText}>{tr('common.logIn')}</Text>
          </Pressable>
        </Animated.View>

        <AuthPromptSheet job={selectedJob} onClose={() => setSelectedJob(null)} />
      </View>
    </ScrollYContext.Provider>
  );
}

/** Footer "Account" column: 0 = Log in, 1 = Sign up. */
function footerLink(index: number) {
  if (index === 0) router.push('/login');
  if (index === 1) router.push('/signup');
}

function Logo({ light }: { light?: boolean }) {
  const styles = useStyles(makeStyles);
  return (
    <View style={styles.logo}>
      <View style={styles.logoMark}>
        <Ionicons name="leaf" size={14} color={colors.white} />
      </View>
      <Text style={[styles.logoText, light && { color: colors.white }]}>MPUZA</Text>
    </View>
  );
}

function Chip({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  const t = useTheme();
  const styles = useStyles(makeStyles);
  const progress = useSharedValue(active ? 1 : 0);

  useEffect(() => {
    progress.set(withTiming(active ? 1 : 0, { duration: 250 }));
  }, [active, progress]);

  const style = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(progress.value, [0, 1], [t.surfaceAlt, t.navy]),
    transform: [{ scale: interpolate(progress.value, [0, 1], [1, 1.04]) }],
  }));
  const textStyle = useAnimatedStyle(() => ({
    color: interpolateColor(progress.value, [0, 1], [t.textBody, '#ffffff']),
  }));

  return (
    <Pressable onPress={onPress}>
      <Animated.View style={[styles.chip, style]}>
        <Animated.Text style={[styles.chipText, textStyle]}>{label}</Animated.Text>
      </Animated.View>
    </Pressable>
  );
}

function FloatingBlob({
  scrollY,
  color,
  size,
  top,
  left,
  reverse,
}: {
  scrollY: SharedValue<number>;
  color: string;
  size: number;
  top: number;
  left: number;
  reverse?: boolean;
}) {
  const reduceMotion = useReducedMotion();
  const drift = useSharedValue(0);

  useEffect(() => {
    if (reduceMotion) return;
    drift.set(withRepeat(withTiming(1, { duration: 4200, easing: Easing.inOut(Easing.sin) }), -1, true));
  }, [drift, reduceMotion]);

  const style = useAnimatedStyle(() => {
    const direction = reverse ? -1 : 1;
    return {
      transform: [
        { translateX: interpolate(drift.value, [0, 1], [0, 24 * direction]) },
        { translateY: interpolate(drift.value, [0, 1], [0, 18]) + scrollY.value * 0.25 },
        { scale: interpolate(drift.value, [0, 1], [1, 1.08]) },
      ],
    };
  });

  return (
    <Animated.View
      pointerEvents="none"
      style={[{ position: 'absolute', top, left, width: size, height: size, borderRadius: size / 2, backgroundColor: color }, style]}
    />
  );
}

/** Faint perspective grid at the bottom of the hero, like the mockup. */
function HeroGrid() {
  const styles = useStyles(makeStyles);
  return (
    <View pointerEvents="none" style={styles.grid}>
      {Array.from({ length: 7 }).map((_, i) => (
        <View key={`h${i}`} style={[styles.gridLine, { top: i * i * 4 + 4, opacity: 0.15 + i * 0.05 }]} />
      ))}
      {Array.from({ length: 11 }).map((_, i) => (
        <View
          key={`v${i}`}
          style={[styles.gridLineV, { left: `${i * 10}%`, transform: [{ rotate: `${(i - 5) * 7}deg` }] }]}
        />
      ))}
    </View>
  );
}

function PulseIcon({ icon, color }: { icon: keyof typeof Ionicons.glyphMap; color: string }) {
  const styles = useStyles(makeStyles);
  const reduceMotion = useReducedMotion();
  const pulse = useSharedValue(0);

  useEffect(() => {
    if (reduceMotion) return;
    pulse.set(withRepeat(withTiming(1, { duration: 2000, easing: Easing.out(Easing.quad) }), -1, false));
  }, [pulse, reduceMotion]);

  const ringStyle = useAnimatedStyle(() => ({
    opacity: interpolate(pulse.value, [0, 1], [0.45, 0]),
    transform: [{ scale: interpolate(pulse.value, [0, 1], [1, 1.45]) }],
  }));

  return (
    <View style={styles.pulse}>
      <Animated.View style={[styles.pulseRing, { borderColor: color }, ringStyle]} />
      <View style={[styles.pulseOuter, { borderColor: color }]}>
        <View style={[styles.pulseInner, { backgroundColor: color }]}>
          <Ionicons name={icon} size={30} color={colors.white} />
        </View>
      </View>
    </View>
  );
}

function FooterColumn({
  title,
  links,
  onPress,
}: {
  title: string;
  links: string[];
  onPress?: (index: number) => void;
}) {
  const styles = useStyles(makeStyles);
  return (
    <View style={styles.footerColumn}>
      <Text style={styles.footerHeading}>{title}</Text>
      {links.map((link, index) => (
        <Text key={link} style={styles.footerLink} onPress={onPress ? () => onPress(index) : undefined}>
          {link}
        </Text>
      ))}
    </View>
  );
}

const makeStyles = (t: Theme) =>
  StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: t.surface,
  },
  pressed: {
    opacity: 0.75,
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    shadowColor: '#000',
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  headerIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  logoMark: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: colors.orange,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    fontFamily: 'Lexend_700Bold',
    fontSize: 20,
    color: t.text,
    letterSpacing: 0.5,
  },
  loginPill: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 2,
    borderWidth: 1.5,
    borderColor: colors.blue,
  },
  loginText: {
    fontFamily: 'Lexend_700Bold',
    fontSize: 12,
    color: colors.blue,
  },
  hero: {
    paddingHorizontal: 20,
    paddingBottom: 90,
    overflow: 'hidden',
  },
  heroTitle: {
    fontFamily: 'Lexend_700Bold',
    fontSize: 32,
    lineHeight: 40,
    color: t.text,
  },
  heroAccent: {
    color: colors.blue,
  },
  heroSubtitle: {
    fontFamily: 'Lexend_400Regular',
    fontSize: 16,
    lineHeight: 24,
    color: t.textBody,
    marginTop: 12,
  },
  searchCard: {
    marginTop: 28,
    backgroundColor: t.surface,
    borderRadius: 16,
    shadowColor: t.text,
    shadowOpacity: 0.1,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 16,
    fontFamily: 'Lexend_400Regular',
    fontSize: 14,
    color: t.text,
  },
  searchDivider: {
    height: 1,
    backgroundColor: t.border,
    marginHorizontal: 16,
  },
  searchButton: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 16,
    paddingHorizontal: 22,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: colors.orange,
    shadowColor: colors.orange,
    shadowOpacity: 0.35,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  searchButtonText: {
    fontFamily: 'Lexend_700Bold',
    fontSize: 14,
    color: colors.white,
  },
  grid: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 110,
    overflow: 'hidden',
  },
  gridLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(53,168,223,0.6)',
  },
  gridLineV: {
    position: 'absolute',
    top: -20,
    bottom: -20,
    width: 1,
    backgroundColor: 'rgba(53,168,223,0.25)',
  },
  stats: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginTop: -40,
    backgroundColor: t.navy,
    borderRadius: 18,
    paddingVertical: 18,
  },
  stat: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    borderLeftWidth: 1,
    borderLeftColor: 'rgba(255,255,255,0.12)',
  },
  statValue: {
    fontFamily: 'Lexend_700Bold',
    fontSize: 18,
    color: colors.white,
  },
  statLabel: {
    fontFamily: 'Lexend_400Regular',
    fontSize: 11,
    color: 'rgba(255,255,255,0.65)',
    marginTop: 2,
  },
  section: {
    paddingHorizontal: 20,
    paddingTop: 44,
  },
  eyebrow: {
    fontFamily: 'Lexend_700Bold',
    fontSize: 11,
    letterSpacing: 1.2,
    color: colors.orange,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  sectionTitle: {
    fontFamily: 'Lexend_700Bold',
    fontSize: 22,
    color: t.text,
  },
  centered: {
    textAlign: 'center',
  },
  sectionSubtitle: {
    fontFamily: 'Lexend_400Regular',
    fontSize: 13,
    color: t.textMuted,
    textAlign: 'center',
    marginTop: 6,
  },
  count: {
    fontFamily: 'Lexend_400Regular',
    fontSize: 12,
    color: t.textMuted,
  },
  chipsScroll: {
    marginHorizontal: -20,
    marginTop: 14,
    marginBottom: 16,
  },
  chips: {
    paddingHorizontal: 20,
    gap: 8,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 20,
  },
  chipText: {
    fontFamily: 'Lexend_400Regular',
    fontSize: 13,
  },
  empty: {
    alignItems: 'center',
    paddingVertical: 32,
    gap: 6,
  },
  emptyTitle: {
    fontFamily: 'Lexend_700Bold',
    fontSize: 15,
    color: t.text,
  },
  emptyText: {
    fontFamily: 'Lexend_400Regular',
    fontSize: 13,
    color: t.textMuted,
  },
  seeAll: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: colors.blue,
    backgroundColor: 'rgba(53,168,223,0.06)',
  },
  seeAllText: {
    fontFamily: 'Lexend_700Bold',
    fontSize: 13,
    color: colors.blue,
  },
  trustedSection: {
    paddingTop: 56,
  },
  partnerGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 22,
    marginHorizontal: -5,
  },
  partnerCell: {
    width: '33.333%',
    padding: 5,
  },
  partner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    height: 46,
    paddingHorizontal: 6,
    borderRadius: 12,
    backgroundColor: t.surfaceAlt,
    borderWidth: 1,
    borderColor: t.border,
  },
  partnerName: {
    flexShrink: 1,
    fontFamily: 'Lexend_700Bold',
    fontSize: 11,
  },
  step: {
    alignItems: 'center',
    marginTop: 36,
    paddingHorizontal: 12,
  },
  pulse: {
    width: 104,
    height: 104,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pulseRing: {
    position: 'absolute',
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 2,
  },
  pulseOuter: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pulseInner: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepLabel: {
    fontFamily: 'Lexend_700Bold',
    fontSize: 11,
    letterSpacing: 1.2,
    color: colors.orange,
    marginTop: 16,
  },
  stepTitle: {
    fontFamily: 'Lexend_700Bold',
    fontSize: 18,
    color: t.text,
    marginTop: 4,
  },
  stepText: {
    fontFamily: 'Lexend_400Regular',
    fontSize: 14,
    lineHeight: 21,
    color: t.textBody,
    textAlign: 'center',
    marginTop: 6,
  },
  ctaWrap: {
    marginHorizontal: 20,
    marginTop: 52,
    marginBottom: 48,
  },
  cta: {
    borderRadius: 22,
    padding: 24,
  },
  ctaTitle: {
    fontFamily: 'Lexend_700Bold',
    fontSize: 21,
    lineHeight: 28,
    color: colors.white,
  },
  ctaText: {
    fontFamily: 'Lexend_400Regular',
    fontSize: 14,
    lineHeight: 21,
    color: 'rgba(255,255,255,0.9)',
    marginTop: 8,
  },
  ctaButton: {
    alignSelf: 'flex-start',
    marginTop: 18,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: t.surface,
  },
  ctaButtonText: {
    fontFamily: 'Lexend_700Bold',
    fontSize: 14,
    color: colors.orange,
  },
  footer: {
    backgroundColor: t.navy,
    paddingHorizontal: 24,
    paddingTop: 40,
    gap: 28,
  },
  footerBlurb: {
    fontFamily: 'Lexend_400Regular',
    fontSize: 13,
    lineHeight: 20,
    color: 'rgba(255,255,255,0.75)',
    marginTop: 14,
  },
  socials: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 16,
  },
  social: {
    width: 32,
    height: 32,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  footerColumns: {
    flexDirection: 'row',
  },
  footerColumn: {
    flex: 1,
  },
  footerHeading: {
    fontFamily: 'Lexend_700Bold',
    fontSize: 15,
    color: colors.white,
    marginBottom: 10,
  },
  footerLink: {
    fontFamily: 'Lexend_400Regular',
    fontSize: 13,
    color: 'rgba(255,255,255,0.75)',
    marginBottom: 8,
  },
  copyright: {
    fontFamily: 'Lexend_400Regular',
    fontSize: 11,
    color: 'rgba(255,255,255,0.45)',
    marginTop: 16,
  },
});
