import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
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
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AuthPromptSheet } from '@/components/explore/AuthPromptSheet';
import { JobCard } from '@/components/explore/JobCard';
import { Logo } from '@/components/Logo';
import { Reveal, ScrollYContext } from '@/components/Reveal';
import { ThemeToggleButton } from '@/components/ThemeSwitcher';
import { colors } from '@/constants/colors';
import { useAuth } from '@/context/auth';
import { categories, jobs, partners, stats, steps, type Job } from '@/data/explore';
import { LANGS, useI18n } from '@/i18n';
import type { TranslationKey } from '@/i18n/en';
import { useStyles, useTheme, type Theme } from '@/theme';

const HERO_IMAGE = require('@/assets/images/landing-hero.jpg');
const SERIF = 'InstrumentSerif_400Regular';
const SERIF_ITALIC = 'InstrumentSerif_400Regular_Italic';

export default function Landing() {
  const { tr, lang, setLang, cat } = useI18n();
  const t = useTheme();
  const styles = useStyles(makeStyles);
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const reduceMotion = useReducedMotion();

  const scrollRef = useAnimatedRef<Animated.ScrollView>();
  const scrollY = useSharedValue(0);
  const float = useSharedValue(0);
  const drift = useSharedValue(0);
  const globeSpin = useSharedValue(0);

  const [query, setQuery] = useState('');
  const [location, setLocation] = useState('');
  const [category, setCategory] = useState('All');
  const [jobsY, setJobsY] = useState(0);
  const [partnersY, setPartnersY] = useState(0);
  const [stepsY, setStepsY] = useState(0);
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
        (!loc || job.location.toLowerCase().includes(loc)),
    );
  }, [query, location, category]);

  useEffect(() => {
    if (reduceMotion) return;
    float.set(withRepeat(withTiming(1, { duration: 3200, easing: Easing.inOut(Easing.sin) }), -1, true));
    drift.set(withRepeat(withTiming(1, { duration: 18000, easing: Easing.inOut(Easing.sin) }), -1, true));
  }, [drift, float, reduceMotion]);

  const onScroll = useAnimatedScrollHandler((event) => {
    scrollY.value = event.contentOffset.y;
  });

  const leftPhoto = useAnimatedStyle(() => ({
    transform: [
      { translateY: interpolate(float.value, [0, 1], [0, -8]) },
      { rotate: '-2.5deg' },
    ],
  }));

  const rightPhoto = useAnimatedStyle(() => ({
    transform: [
      { translateY: interpolate(float.value, [0, 1], [6, -4]) },
      { rotate: '3deg' },
    ],
  }));

  const footerImage = useAnimatedStyle(() => ({
    transform: [
      { scale: interpolate(drift.value, [0, 1], [1.08, 1.16]) },
      { translateX: interpolate(drift.value, [0, 1], [-10, 12]) },
    ],
  }));

  const globeStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${globeSpin.value * 360}deg` }],
  }));

  function switchLanguage() {
    globeSpin.set(withTiming(globeSpin.get() + 1, { duration: 600, easing: Easing.out(Easing.cubic) }));
    setLang(LANGS[(LANGS.indexOf(lang) + 1) % LANGS.length]);
  }

  function scrollTo(y: number) {
    scrollRef.current?.scrollTo({ y: Math.max(0, y - 16), animated: true });
  }

  function footerLink(index: number) {
    if (index === 0) scrollTo(jobsY);
    if (index === 1) scrollTo(partnersY);
    if (index === 2) scrollTo(stepsY);
  }

  function accountLink(index: number) {
    if (index === 0) router.push('/login');
    if (index === 1) router.push('/signup');
    if (index === 2) scrollTo(stepsY);
  }

  return (
    <ScrollYContext.Provider value={scrollY}>
      <View style={styles.screen}>
        <Animated.ScrollView
          ref={scrollRef}
          style={styles.sheet}
          onScroll={onScroll}
          scrollEventThrottle={16}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: insets.bottom }}>
          <View style={[styles.hero, { paddingTop: insets.top + 8 }]}>
            <View style={styles.topBar}>
              <Text style={styles.wordmark}>mpuza</Text>
              <View style={styles.controls}>
                <ThemeToggleButton style={styles.iconButton} color={t.text} />
                <Pressable
                  style={({ pressed }) => [styles.langButton, pressed && styles.pressed]}
                  onPress={switchLanguage}
                  hitSlop={8}
                  accessibilityRole="button"
                  accessibilityLabel={tr('common.language')}>
                  <Animated.View style={globeStyle}>
                    <Ionicons name="globe-outline" size={16} color={t.text} />
                  </Animated.View>
                  <Animated.Text key={lang} entering={FadeInDown.duration(250)} style={styles.langText}>
                    {lang.toUpperCase()}
                  </Animated.Text>
                </Pressable>
              </View>
            </View>

            <Animated.View key={`badge-${lang}`} entering={FadeInDown.delay(80).duration(550)} style={styles.badge}>
              <View style={styles.badgeDot} />
              <Text style={styles.badgeText}>{tr('landing.badge')}</Text>
            </Animated.View>

            <Animated.Text key={`title-${lang}`} entering={FadeInDown.delay(160).duration(700)} style={styles.display}>
              {tr('landing.line1')}
              {'\n'}
              {tr('landing.line2')}
              <Text style={styles.displayItalic}>{tr('landing.accent')}</Text>
            </Animated.Text>

            <Animated.Text key={`sub-${lang}`} entering={FadeInDown.delay(280).duration(650)} style={styles.sub}>
              {tr('landing.sub')}
            </Animated.Text>

            <Animated.View entering={FadeInDown.delay(380).springify().damping(16)}>
              <Pressable
                style={({ pressed }) => [styles.reach, pressed && styles.reachPressed]}
                onPress={() => router.push('/signup')}>
                <Text style={styles.reachText}>{tr('landing.reach')}</Text>
              </Pressable>
            </Animated.View>

            <View style={styles.collage}>
              <Animated.View entering={FadeInDown.delay(460).duration(700)} style={styles.photoLeftSlot}>
                <Animated.View style={[styles.photoLeft, leftPhoto]}>
                  <Image source={HERO_IMAGE} style={StyleSheet.absoluteFill} contentFit="cover" contentPosition="left" />
                </Animated.View>
              </Animated.View>
              <Animated.View entering={FadeInDown.delay(620).duration(750)} style={styles.photoRightSlot}>
                <Animated.View style={[styles.photoRight, rightPhoto]}>
                  <Image source={HERO_IMAGE} style={StyleSheet.absoluteFill} contentFit="cover" contentPosition="right" />
                  <View style={styles.made}>
                    <Ionicons name="leaf" size={12} color={colors.orange} />
                    <Text style={styles.madeText}>{tr('landing.made')}</Text>
                  </View>
                </Animated.View>
              </Animated.View>
            </View>

            <Animated.View entering={FadeInDown.delay(760).duration(650)} style={styles.searchCard}>
              <View style={styles.searchRow}>
                <Ionicons name="search-outline" size={18} color={t.textMuted} />
                <TextInput
                  value={query}
                  onChangeText={setQuery}
                  placeholder={tr('explore.positionPlaceholder')}
                  placeholderTextColor={t.textFaint}
                  style={styles.searchInput}
                  returnKeyType="search"
                  onSubmitEditing={() => scrollTo(jobsY)}
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
                  onSubmitEditing={() => scrollTo(jobsY)}
                />
              </View>
            </Animated.View>

            <Animated.View entering={FadeInDown.delay(860).duration(600)}>
              <Pressable
                style={({ pressed }) => [styles.searchButton, pressed && styles.pressed]}
                onPress={() => scrollTo(jobsY)}>
                <Text style={styles.searchButtonText}>{tr('explore.searchJobs')}</Text>
                <Ionicons name="arrow-forward" size={16} color={colors.white} />
              </Pressable>
            </Animated.View>
          </View>

          <Reveal style={styles.stats}>
            {stats.map((stat, index) => (
              <View key={stat.value} style={[styles.stat, index > 0 && styles.statDivider]}>
                <Text style={styles.statValue}>{stat.value}</Text>
                <Text style={styles.statLabel}>{tr(`explore.stat${index}` as TranslationKey)}</Text>
              </View>
            ))}
          </Reveal>

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

          <View style={[styles.section, styles.trustedSection]} onLayout={(event) => setPartnersY(event.nativeEvent.layout.y)}>
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

          <View style={styles.section} onLayout={(event) => setStepsY(event.nativeEvent.layout.y)}>
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

          <Reveal style={styles.ctaWrap}>
            <LinearGradient colors={[colors.orange, '#f28b5b']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.cta}>
              <Text style={styles.ctaTitle}>{tr('explore.ctaTitle')}</Text>
              <Text style={styles.ctaText}>{tr('explore.ctaText')}</Text>
              <Pressable
                style={({ pressed }) => [styles.ctaButton, pressed && styles.pressed]}
                onPress={() => router.push('/signup')}>
                <Text style={styles.ctaButtonText}>{tr('explore.ctaButton')}</Text>
              </Pressable>
            </LinearGradient>
          </Reveal>

          <View style={[styles.footer, { paddingBottom: insets.bottom + 32 }]}>
            <Animated.View style={[StyleSheet.absoluteFill, footerImage]}>
              <Image source={HERO_IMAGE} style={StyleSheet.absoluteFill} contentFit="cover" contentPosition="center" />
            </Animated.View>
            <LinearGradient
              colors={['rgba(14,49,76,0.5)', 'rgba(8,20,32,0.78)']}
              style={StyleSheet.absoluteFill}
            />
            <Reveal>
              <Logo light />
              <Text style={styles.footerBlurb}>{tr('explore.footerBlurb')}</Text>
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
                onPress={footerLink}
              />
              <FooterColumn
                title={tr('explore.footerAccount')}
                links={[tr('common.logIn'), tr('common.signUp'), tr('explore.footerHelp')]}
                onPress={accountLink}
              />
            </Reveal>

            <Reveal>
              <Text style={styles.footerHeading}>{tr('explore.contact')}</Text>
              <Text style={styles.footerLink}>hello@mpuza.rw</Text>
              <Text style={styles.copyright}>{tr('explore.rights', { year: new Date().getFullYear() })}</Text>
            </Reveal>
          </View>
        </Animated.ScrollView>

        <AuthPromptSheet job={selectedJob} onClose={() => setSelectedJob(null)} />
      </View>
    </ScrollYContext.Provider>
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
      backgroundColor: t.bg,
    },
    sheet: {
      width: '100%',
      maxWidth: 440,
      alignSelf: 'center',
    },
    pressed: {
      opacity: 0.75,
    },
    hero: {
      backgroundColor: t.scheme === 'dark' ? t.bg : '#f4f1eb',
      paddingHorizontal: 24,
      paddingBottom: 28,
    },
    topBar: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      minHeight: 44,
    },
    wordmark: {
      fontFamily: SERIF,
      fontSize: 28,
      color: t.text,
      letterSpacing: -0.4,
    },
    controls: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    iconButton: {
      width: 36,
      height: 36,
      borderRadius: 18,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: t.scheme === 'dark' ? t.border : 'rgba(14,49,76,0.12)',
      backgroundColor: t.scheme === 'dark' ? t.surface : 'rgba(255,255,255,0.55)',
    },
    langButton: {
      height: 36,
      paddingHorizontal: 10,
      borderRadius: 18,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
      borderWidth: 1,
      borderColor: t.scheme === 'dark' ? t.border : 'rgba(14,49,76,0.12)',
      backgroundColor: t.scheme === 'dark' ? t.surface : 'rgba(255,255,255,0.55)',
    },
    langText: {
      fontFamily: 'Lexend_700Bold',
      fontSize: 11,
      letterSpacing: 0.4,
      color: t.text,
    },
    badge: {
      alignSelf: 'flex-start',
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      marginTop: 36,
      paddingHorizontal: 12,
      paddingVertical: 7,
      borderRadius: 999,
      backgroundColor: t.scheme === 'dark' ? t.surface : 'rgba(255,255,255,0.7)',
    },
    badgeDot: {
      width: 7,
      height: 7,
      borderRadius: 4,
      backgroundColor: colors.orange,
    },
    badgeText: {
      fontFamily: 'Lexend_400Regular',
      fontSize: 13,
      color: t.textMuted,
    },
    display: {
      marginTop: 22,
      fontFamily: SERIF,
      fontSize: 52,
      lineHeight: 54,
      letterSpacing: -1.2,
      color: t.text,
    },
    displayItalic: {
      fontFamily: SERIF_ITALIC,
    },
    sub: {
      marginTop: 16,
      maxWidth: 320,
      fontFamily: 'Lexend_400Regular',
      fontSize: 16,
      lineHeight: 24,
      color: t.textBody,
    },
    reach: {
      alignSelf: 'flex-start',
      marginTop: 22,
      paddingHorizontal: 22,
      paddingVertical: 13,
      borderRadius: 999,
      backgroundColor: colors.orange,
    },
    reachPressed: {
      transform: [{ scale: 0.97 }],
      opacity: 0.92,
    },
    reachText: {
      fontFamily: 'Lexend_700Bold',
      fontSize: 15,
      color: colors.white,
    },
    collage: {
      height: 320,
      marginTop: 36,
    },
    photoLeftSlot: {
      position: 'absolute',
      left: 0,
      bottom: 8,
      width: '64%',
      height: 248,
    },
    photoLeft: {
      flex: 1,
      borderRadius: 22,
      overflow: 'hidden',
      backgroundColor: t.surfaceAlt,
      shadowColor: '#0e314c',
      shadowOpacity: 0.16,
      shadowRadius: 16,
      shadowOffset: { width: 0, height: 10 },
      elevation: 6,
    },
    photoRightSlot: {
      position: 'absolute',
      right: 0,
      top: 0,
      width: '52%',
      height: 214,
    },
    photoRight: {
      flex: 1,
      borderRadius: 22,
      overflow: 'hidden',
      borderWidth: 5,
      borderColor: t.scheme === 'dark' ? t.bg : '#f4f1eb',
      backgroundColor: t.surfaceAlt,
      shadowColor: '#0e314c',
      shadowOpacity: 0.2,
      shadowRadius: 18,
      shadowOffset: { width: 0, height: 12 },
      elevation: 8,
    },
    made: {
      position: 'absolute',
      left: 10,
      right: 10,
      bottom: 10,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
      paddingVertical: 7,
      borderRadius: 999,
      backgroundColor: 'rgba(255,255,255,0.92)',
    },
    madeText: {
      fontFamily: 'Lexend_700Bold',
      fontSize: 11,
      color: colors.dblue,
    },
    searchCard: {
      marginTop: 8,
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
    stats: {
      flexDirection: 'row',
      marginHorizontal: 20,
      marginTop: 28,
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
      overflow: 'hidden',
      paddingHorizontal: 24,
      paddingTop: 40,
      gap: 28,
      backgroundColor: colors.dblue,
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
      backgroundColor: 'rgba(255,255,255,0.08)',
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
