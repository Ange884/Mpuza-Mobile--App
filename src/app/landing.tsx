import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import Animated, {
  Easing,
  Extrapolation,
  FadeIn,
  FadeInDown,
  FadeInLeft,
  interpolate,
  SlideInDown,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
  ZoomIn,
  type SharedValue,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Reveal, ScrollYContext } from '@/components/Reveal';
import { ThemeToggleButton } from '@/components/ThemeSwitcher';
import { colors } from '@/constants/colors';
import { useStyles, useTheme, type Theme } from '@/theme';
import { useI18n } from '@/i18n';

// Bundled with the app, so it shows instantly and works offline. (Photo: Unsplash)
const HERO_IMAGE = require('@/assets/images/landing-hero.jpg');
const HERO_HEIGHT = 380;

type IconName = keyof typeof Ionicons.glyphMap;
type Lang = 'en' | 'fr' | 'rw';

type Content = {
  hero: {
    headingPrefix: string;
    headingAccent: string;
    subtitle: string;
    quickLinks: { icon: IconName; label: string }[];
  };
  trustBadges: { icon: IconName; label: string }[];
  steps: { title: string; text: string }[];
  explore: {
    title: string;
    intro: string;
    missionLabel: string;
    mission: string;
    stepsTitle: string;
    closing: string;
  };
  actions: { explore: string; account: string };
};

const content: Record<Lang, Content> = {
  en: {
    hero: {
      headingPrefix: 'Find your next\n',
      headingAccent: 'opportunity',
      subtitle: 'Where talent meets opportunity',
      quickLinks: [
        { icon: 'briefcase-outline', label: 'Find Jobs' },
        { icon: 'people-outline', label: 'Hire Talent' },
        { icon: 'clipboard-outline', label: 'Manage Projects' },
      ],
    },
    trustBadges: [
      { icon: 'shield-checkmark-outline', label: 'Verified Employers' },
      { icon: 'sparkles-outline', label: 'Smart Matching' },
      { icon: 'layers-outline', label: 'All-in-One Platform' },
    ],
    steps: [
      { title: 'Create your profile', text: 'Tell us about your skills, experience, and goals.' },
      { title: 'Get matched', text: 'Discover roles or candidates that truly fit.' },
      { title: 'Get hired or get it done', text: 'Accept the offer, or launch and manage your project.' },
    ],
    explore: {
      title: 'About MPUZA',
      intro:
        'MPUZA connects job seekers with employers, making it easier for individuals to discover career opportunities and for companies to find suitable talent.',
      missionLabel: 'OUR MISSION',
      mission:
        'To simplify the connection between talent and opportunity, helping individuals and organizations grow professionally.',
      stepsTitle: 'How MPUZA works',
      closing: 'Employment and project management, brought into one integrated experience.',
    },
    actions: { explore: 'Explore', account: 'Account' },
  },
  fr: {
    hero: {
      headingPrefix: 'Trouvez votre\nprochaine ',
      headingAccent: 'opportunité',
      subtitle: "Là où le talent rencontre l'opportunité",
      quickLinks: [
        { icon: 'briefcase-outline', label: "Offres d'emploi" },
        { icon: 'people-outline', label: 'Recruter' },
        { icon: 'clipboard-outline', label: 'Gérer les projets' },
      ],
    },
    trustBadges: [
      { icon: 'shield-checkmark-outline', label: 'Employeurs vérifiés' },
      { icon: 'sparkles-outline', label: 'Mise en relation intelligente' },
      { icon: 'layers-outline', label: 'Plateforme tout-en-un' },
    ],
    steps: [
      { title: 'Créez votre profil', text: 'Parlez-nous de vos compétences et de vos objectifs.' },
      { title: 'Soyez mis en relation', text: 'Découvrez des postes ou des profils qui correspondent vraiment.' },
      { title: 'Soyez recruté ou avancez', text: "Acceptez l'offre, ou lancez et gérez votre projet." },
    ],
    explore: {
      title: 'À propos de MPUZA',
      intro:
        "MPUZA connecte les chercheurs d'emploi aux employeurs, facilitant la découverte d'opportunités de carrière et la recherche de talents adaptés pour les entreprises.",
      missionLabel: 'NOTRE MISSION',
      mission:
        "Simplifier le lien entre le talent et l'opportunité, pour aider les individus et les organisations à grandir professionnellement.",
      stepsTitle: 'Comment fonctionne MPUZA',
      closing: "L'emploi et la gestion de projets, réunis dans une seule expérience intégrée.",
    },
    actions: { explore: 'Explorer', account: 'Compte' },
  },
  rw: {
    hero: {
      headingPrefix: 'Shaka akazi\n',
      headingAccent: 'gakwiye',
      subtitle: 'Aho ubushobozi buhurira n’amahirwe',
      quickLinks: [
        { icon: 'briefcase-outline', label: 'Akazi' },
        { icon: 'people-outline', label: 'Abakozi' },
        { icon: 'clipboard-outline', label: 'Imishinga' },
      ],
    },
    trustBadges: [
      { icon: 'shield-checkmark-outline', label: 'Abakoresha biziwe' },
      { icon: 'sparkles-outline', label: 'Guhuza bwite' },
      { icon: 'layers-outline', label: 'Urubuga rumwe rwose' },
    ],
    steps: [
      { title: 'Kora umwirondoro wawe', text: 'Tubwire ubushobozi n’intego zawe.' },
      { title: 'Uhuzwe n’ibikwiye', text: 'Reba akazi cyangwa abakozi bahuye nawe.' },
      { title: 'Bone akazi cyangwa ukore', text: 'Emera itangwa, cyangwa utangire gucunga umushinga wawe.' },
    ],
    explore: {
      title: 'Kuri MPUZA',
      intro:
        'MPUZA ihuza abashaka akazi n’abakoresha, bigatuma abantu babona amahirwe y’akazi vuba kandi ibigo bikabona abakozi babikwiye.',
      missionLabel: 'INTEGO YACU',
      mission: 'Koroshya guhuza ubushobozi n’amahirwe, dufashe abantu n’ibigo gukura mu mwuga.',
      stepsTitle: 'Uko MPUZA ikora',
      closing: 'Akazi n’imicungire y’imishinga, byose hamwe ahantu hamwe.',
    },
    actions: { explore: 'Reba byinshi', account: 'Konti' },
  },
};
const LANGS: Lang[] = ['en', 'fr', 'rw'];

const extra: Record<Lang, { scrollHint: string; ctaTitle: string; ctaText: string; ctaButton: string }> = {
  en: {
    scrollHint: 'Scroll to learn more',
    ctaTitle: 'Ready to take the next step?',
    ctaText: 'Browse the jobs hiring right now — no account needed to look around.',
    ctaButton: 'Explore jobs',
  },
  fr: {
    scrollHint: 'Faites défiler pour en savoir plus',
    ctaTitle: 'Prêt à passer à l’étape suivante ?',
    ctaText: 'Parcourez les offres du moment — aucun compte requis pour découvrir.',
    ctaButton: 'Voir les offres',
  },
  rw: {
    scrollHint: 'Manura umenye byinshi',
    ctaTitle: 'Witeguye gutera intambwe?',
    ctaText: 'Reba akazi kari gutangwa ubu — nta konti ukeneye kugira ngo urebe.',
    ctaButton: 'Reba akazi',
  },
};

// Where each quick link goes. Hiring and projects need an account.
const QUICK_LINK_ROUTES = [
  () => router.push('/explore'),
  () => router.push({ pathname: '/account', params: { mode: 'signup' } }),
  () => router.push({ pathname: '/account', params: { mode: 'login' } }),
];

function PressScale({
  children,
  style,
  onPress,
  to = 0.95,
}: {
  children: React.ReactNode;
  style: StyleProp<ViewStyle>;
  onPress: () => void;
  to?: number;
}) {
  const styles = useStyles(makeStyles);
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <Animated.View style={[styles.flex, animatedStyle]}>
      <Pressable
        style={style}
        onPress={onPress}
        onPressIn={() => scale.set(withSpring(to, { damping: 15, stiffness: 320 }))}
        onPressOut={() => scale.set(withSpring(1, { damping: 10, stiffness: 200 }))}>
        {children}
      </Pressable>
    </Animated.View>
  );
}

/** Repeats a 0→1 timing forever unless the user prefers reduced motion. */
function useLoop(duration: number, reverse = true, pauseMs = 0) {
  const reduceMotion = useReducedMotion();
  const value = useSharedValue(0);

  useEffect(() => {
    if (reduceMotion) return;
    const timing = withTiming(1, { duration, easing: Easing.inOut(Easing.sin) });
    value.set(
      pauseMs
        ? withRepeat(withSequence(withDelay(pauseMs, timing), withTiming(0, { duration })), -1, false)
        : withRepeat(timing, -1, reverse)
    );
  }, [value, duration, reverse, pauseMs, reduceMotion]);

  return value;
}

export default function Landing() {
  const styles = useStyles(makeStyles);
  const insets = useSafeAreaInsets();
  const { height: viewport } = useWindowDimensions();
  const { lang, setLang } = useI18n();
  const t = content[lang];
  const theme = useTheme();
  const x = extra[lang];

  const scrollY = useSharedValue(0);
  const onScroll = useAnimatedScrollHandler((event) => {
    scrollY.value = event.contentOffset.y;
  });

  const kenBurns = useLoop(14000);
  const bounce = useLoop(900);
  const wiggle = useLoop(350, false, 2600);
  const globeSpin = useSharedValue(0);

  const [exploreY, setExploreY] = useState(0);
  const [stepRows, setStepRows] = useState<{ y: number; h: number }[]>([]);

  // Slow zoom + drift on the photo, stretch on pull-down, parallax on scroll.
  const heroImageStyle = useAnimatedStyle(() => ({
    transform: [
      {
        scale:
          interpolate(scrollY.value, [-150, 0], [1.3, 1], Extrapolation.CLAMP) *
          interpolate(kenBurns.value, [0, 1], [1, 1.1]),
      },
      { translateX: interpolate(kenBurns.value, [0, 1], [0, -14]) },
      { translateY: interpolate(scrollY.value, [0, 200], [0, -50], Extrapolation.CLAMP) },
    ],
  }));

  const heroTextStyle = useAnimatedStyle(() => ({
    opacity: interpolate(scrollY.value, [0, 220], [1, 0], Extrapolation.CLAMP),
    transform: [{ translateY: interpolate(scrollY.value, [0, 220], [0, 60], Extrapolation.CLAMP) }],
  }));

  const scrollHintStyle = useAnimatedStyle(() => ({
    opacity: interpolate(scrollY.value, [0, 80], [1, 0], Extrapolation.CLAMP),
    transform: [{ translateY: interpolate(bounce.value, [0, 1], [0, 6]) }],
  }));

  const compassStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${interpolate(wiggle.value, [0, 0.25, 0.75, 1], [0, -25, 25, 0])}deg` }],
  }));

  const globeStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${globeSpin.value * 360}deg` }],
  }));

  function switchLanguage() {
    globeSpin.set(withTiming(globeSpin.get() + 1, { duration: 600, easing: Easing.out(Easing.cubic) }));
    setLang(LANGS[(LANGS.indexOf(lang) + 1) % LANGS.length]);
  }

  return (
    <ScrollYContext.Provider value={scrollY}>
      <View style={styles.screen}>
        <Animated.ScrollView
          onScroll={onScroll}
          scrollEventThrottle={16}
          contentContainerStyle={{ paddingBottom: insets.bottom + 120 }}
          showsVerticalScrollIndicator={false}>
          {/* HERO */}
          <Animated.View
            entering={FadeIn.duration(700)}
            style={[styles.hero, { marginTop: insets.top + 10, height: HERO_HEIGHT }]}>
            <Animated.View style={[StyleSheet.absoluteFill, heroImageStyle]}>
              <Image source={HERO_IMAGE} style={StyleSheet.absoluteFill} contentFit="cover" transition={400} />
            </Animated.View>
            <LinearGradient colors={['rgba(0,0,0,0.65)', 'rgba(0,0,0,0)']} style={styles.heroShade} />
            <LinearGradient colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.35)']} style={styles.heroShadeBottom} />

            {/* pointerEvents="none" so this full-width text block never swallows taps meant for the buttons */}
            <Animated.View pointerEvents="none" style={[styles.heroText, heroTextStyle]}>
              {/* key={lang} re-runs the entrance when the language changes */}
              <Animated.Text key={`h-${lang}`} entering={FadeInDown.delay(150).duration(650)} style={styles.heading}>
                {t.hero.headingPrefix}
                <Text style={styles.headingAccent}>{t.hero.headingAccent}</Text>
              </Animated.Text>
              <Animated.View
                key={`u-${lang}`}
                entering={FadeInLeft.delay(600).duration(500)}
                style={styles.accentBar}
              />
              <Animated.Text key={`s-${lang}`} entering={FadeInDown.delay(300).duration(650)} style={styles.subtitle}>
                {t.hero.subtitle}
              </Animated.Text>
            </Animated.View>

            {/* Rendered last so the controls sit on top of everything else in the hero. */}
            <View style={styles.heroControls}>
              <ThemeToggleButton style={styles.themeButton} />
              <Pressable
                style={({ pressed }) => [styles.langButton, pressed && styles.pressed]}
                onPress={switchLanguage}
                hitSlop={8}
                accessibilityRole="button"
                accessibilityLabel="Change language">
                <Animated.View style={globeStyle}>
                  <Ionicons name="globe-outline" size={14} color={colors.white} />
                </Animated.View>
                <Animated.Text key={lang} entering={FadeInDown.duration(250)} style={styles.langText}>
                  {lang.toUpperCase()}
                </Animated.Text>
              </Pressable>
            </View>
          </Animated.View>

          {/* QUICK LINKS */}
          <Animated.View entering={FadeInDown.delay(450).duration(650)} style={styles.quickCard}>
            {t.hero.quickLinks.map((item, index) => (
              <Animated.View
                key={`${lang}-${item.label}`}
                entering={ZoomIn.delay(550 + index * 110).springify().damping(14)}
                style={[styles.flex, index < t.hero.quickLinks.length - 1 && styles.quickItemDivider]}>
                <PressScale style={styles.quickItem} onPress={QUICK_LINK_ROUTES[index]} to={0.9}>
                  <View style={[styles.quickIcon, index === 1 && styles.quickIconBlue]}>
                    <Ionicons name={item.icon} size={20} color={index === 1 ? colors.blue : colors.orange} />
                  </View>
                  <Text style={styles.quickLabel}>{item.label}</Text>
                </PressScale>
              </Animated.View>
            ))}
          </Animated.View>

          <Animated.View entering={FadeIn.delay(1100)} style={[styles.scrollHint, scrollHintStyle]}>
            <Text style={styles.scrollHintText}>{x.scrollHint}</Text>
            <Ionicons name="chevron-down" size={16} color={theme.textMuted} />
          </Animated.View>

          {/* ABOUT */}
          <View style={styles.explore} onLayout={(event) => setExploreY(event.nativeEvent.layout.y)}>
            <Reveal key={`about-${lang}`}>
              <Text style={styles.exploreTitle}>{t.explore.title}</Text>
              <Text style={styles.exploreIntro}>{t.explore.intro}</Text>
            </Reveal>

            <Reveal key={`mission-${lang}`} delay={100}>
              <LinearGradient
                colors={['rgba(53,168,223,0.16)', 'rgba(53,168,223,0.04)']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.missionCard}>
                <View style={styles.missionHeader}>
                  <Ionicons name="flag" size={14} color={colors.blue} />
                  <Text style={styles.missionLabel}>{t.explore.missionLabel}</Text>
                </View>
                <Text style={styles.missionText}>{t.explore.mission}</Text>
              </LinearGradient>
            </Reveal>

            <View style={styles.trustStrip}>
              {t.trustBadges.map((badge, index) => (
                <Reveal key={`${lang}-${badge.label}`} delay={index * 90} distance={14}>
                  <View style={styles.trustBadge}>
                    <Ionicons name={badge.icon} size={16} color={colors.blue} />
                    <Text style={styles.trustLabel}>{badge.label}</Text>
                  </View>
                </Reveal>
              ))}
            </View>

            <Reveal key={`steps-${lang}`}>
              <Text style={styles.stepsTitle}>{t.explore.stepsTitle}</Text>
            </Reveal>

            {t.steps.map((step, index) => (
              <View
                key={`${lang}-${step.title}`}
                onLayout={(event) => {
                  const { y, height } = event.nativeEvent.layout;
                  setStepRows((rows) => {
                    const next = [...rows];
                    next[index] = { y, h: height };
                    return next;
                  });
                }}>
                <Reveal delay={60} distance={20} style={styles.stepRow}>
                  <View style={styles.stepIndicator}>
                    <View
                      style={[styles.stepCircle, { backgroundColor: index % 2 === 0 ? colors.orange : colors.blue }]}>
                      <Text style={styles.stepNumber}>{index + 1}</Text>
                    </View>
                    {index < t.steps.length - 1 && (
                      <StepLine
                        scrollY={scrollY}
                        start={exploreY + (stepRows[index]?.y ?? 0)}
                        length={stepRows[index]?.h ?? 1}
                        viewport={viewport}
                        color={index % 2 === 0 ? colors.orange : colors.blue}
                      />
                    )}
                  </View>
                  <View style={styles.stepCopy}>
                    <Text style={styles.stepTitle}>{step.title}</Text>
                    <Text style={styles.stepText}>{step.text}</Text>
                  </View>
                </Reveal>
              </View>
            ))}

            <Reveal key={`cta-${lang}`} style={styles.ctaWrap}>
              <LinearGradient
                colors={[colors.blue, theme.navy]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.cta}>
                <Text style={styles.ctaTitle}>{x.ctaTitle}</Text>
                <Text style={styles.ctaText}>{x.ctaText}</Text>
                <Pressable
                  style={({ pressed }) => [styles.ctaButton, pressed && styles.pressed]}
                  onPress={() => router.push('/explore')}>
                  <Text style={styles.ctaButtonText}>{x.ctaButton}</Text>
                  <Ionicons name="arrow-forward" size={15} color={colors.blue} />
                </Pressable>
              </LinearGradient>
            </Reveal>

            <Reveal key={`closing-${lang}`}>
              <Text style={styles.closing}>{t.explore.closing}</Text>
            </Reveal>
          </View>
        </Animated.ScrollView>

        <Animated.View
          entering={SlideInDown.delay(700).springify().damping(16)}
          style={[styles.bottomBarWrap, { bottom: insets.bottom + 10 }]}>
          <BlurView intensity={60} tint={theme.scheme} style={styles.bottomBar}>
            <PressScale style={styles.exploreButton} onPress={() => router.push('/explore')}>
              <Animated.View style={compassStyle}>
                <Ionicons name="compass-outline" size={18} color={colors.blue} />
              </Animated.View>
              <Animated.Text key={`e-${lang}`} entering={FadeIn.duration(300)} style={styles.exploreText}>
                {t.actions.explore}
              </Animated.Text>
            </PressScale>

            <PressScale style={styles.accountButton} onPress={() => router.push('/account')}>
              <Ionicons name="person-outline" size={18} color={colors.white} />
              <Animated.Text key={`a-${lang}`} entering={FadeIn.duration(300)} style={styles.accountText}>
                {t.actions.account}
              </Animated.Text>
            </PressScale>
          </BlurView>
        </Animated.View>
      </View>
    </ScrollYContext.Provider>
  );
}

/** Connector between steps that fills in as the user scrolls past it. */
function StepLine({
  scrollY,
  start,
  length,
  viewport,
  color,
}: {
  scrollY: SharedValue<number>;
  start: number;
  length: number;
  viewport: number;
  color: string;
}) {
  const styles = useStyles(makeStyles);
  const fillStyle = useAnimatedStyle(() => {
    // 0 when the row reaches 70% down the screen, 1 when it has moved up by its own height.
    const trigger = start - viewport * 0.7;
    return {
      transform: [{ scaleY: interpolate(scrollY.value, [trigger, trigger + length], [0, 1], Extrapolation.CLAMP) }],
    };
  });

  return (
    <View style={styles.stepLine}>
      <Animated.View style={[styles.stepLineFill, { backgroundColor: color }, fillStyle]} />
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
    backgroundColor: t.surface,
  },
  pressed: {
    opacity: 0.7,
  },
  hero: {
    marginHorizontal: 12,
    borderRadius: 22,
    overflow: 'hidden',
    backgroundColor: t.surfaceAlt,
  },
  heroShade: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 200,
  },
  heroShadeBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 120,
  },
  heroControls: {
    position: 'absolute',
    top: 18,
    right: 18,
    zIndex: 2,
    elevation: 2,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  langButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    height: 34,
    backgroundColor: 'rgba(255,255,255,0.25)',
    paddingHorizontal: 12,
    borderRadius: 12,
    overflow: 'hidden',
  },
  themeButton: {
    width: 34,
    height: 34,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.25)',
  },
  langText: {
    color: colors.white,
    fontFamily: 'Lexend_700Bold',
    fontSize: 12,
  },
  heroText: {
    paddingTop: 56,
    paddingHorizontal: 22,
  },
  heading: {
    color: colors.white,
    fontFamily: 'Lexend_700Bold',
    fontSize: 30,
    lineHeight: 37,
  },
  headingAccent: {
    color: colors.orange,
  },
  accentBar: {
    width: 56,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.orange,
    marginTop: 12,
  },
  subtitle: {
    color: 'rgba(255,255,255,0.92)',
    fontFamily: 'Lexend_400Regular',
    fontSize: 15,
    marginTop: 12,
  },
  quickCard: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginTop: -34,
    backgroundColor: t.surface,
    borderRadius: 20,
    paddingVertical: 14,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
  quickItem: {
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 6,
    paddingVertical: 4,
  },
  quickIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(237,99,60,0.12)',
  },
  quickIconBlue: {
    backgroundColor: 'rgba(53,168,223,0.12)',
  },
  quickItemDivider: {
    borderRightWidth: 1,
    borderRightColor: t.border,
  },
  quickLabel: {
    fontFamily: 'Lexend_400Regular',
    fontSize: 11,
    color: t.text,
    textAlign: 'center',
  },
  scrollHint: {
    alignItems: 'center',
    marginTop: 18,
    gap: 2,
  },
  scrollHintText: {
    fontFamily: 'Lexend_400Regular',
    fontSize: 11,
    color: t.textMuted,
  },
  explore: {
    paddingHorizontal: 22,
    paddingTop: 24,
  },
  exploreTitle: {
    fontFamily: 'Lexend_700Bold',
    fontSize: 22,
    color: t.text,
  },
  exploreIntro: {
    fontFamily: 'Lexend_400Regular',
    fontSize: 14,
    lineHeight: 22,
    color: t.textBody,
    marginTop: 10,
  },
  missionCard: {
    marginTop: 20,
    padding: 18,
    borderRadius: 16,
    borderLeftWidth: 3,
    borderLeftColor: colors.blue,
  },
  missionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  missionLabel: {
    fontFamily: 'Lexend_700Bold',
    fontSize: 11,
    letterSpacing: 1,
    color: colors.blue,
  },
  missionText: {
    fontFamily: 'Lexend_400Regular',
    fontSize: 15,
    lineHeight: 23,
    color: t.text,
    marginTop: 8,
  },
  trustStrip: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 24,
  },
  trustBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(53,168,223,0.08)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  trustLabel: {
    fontFamily: 'Lexend_400Regular',
    fontSize: 11,
    color: t.text,
  },
  stepsTitle: {
    fontFamily: 'Lexend_700Bold',
    fontSize: 18,
    color: t.text,
    marginTop: 34,
    marginBottom: 6,
  },
  stepRow: {
    flexDirection: 'row',
    gap: 14,
  },
  stepIndicator: {
    alignItems: 'center',
  },
  stepCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 18,
  },
  stepNumber: {
    fontFamily: 'Lexend_700Bold',
    fontSize: 14,
    color: colors.white,
  },
  stepLine: {
    flex: 1,
    width: 3,
    borderRadius: 2,
    backgroundColor: t.surfaceAlt,
    marginVertical: 4,
    overflow: 'hidden',
  },
  stepLineFill: {
    flex: 1,
    transformOrigin: 'top',
  },
  stepCopy: {
    flex: 1,
    paddingTop: 18,
    paddingBottom: 24,
  },
  stepTitle: {
    fontFamily: 'Lexend_700Bold',
    fontSize: 15,
    color: t.text,
  },
  stepText: {
    fontFamily: 'Lexend_400Regular',
    fontSize: 13,
    lineHeight: 19,
    color: t.textBody,
    marginTop: 3,
  },
  ctaWrap: {
    marginTop: 20,
  },
  cta: {
    borderRadius: 20,
    padding: 22,
  },
  ctaTitle: {
    fontFamily: 'Lexend_700Bold',
    fontSize: 19,
    color: colors.white,
  },
  ctaText: {
    fontFamily: 'Lexend_400Regular',
    fontSize: 13,
    lineHeight: 20,
    color: 'rgba(255,255,255,0.9)',
    marginTop: 6,
  },
  ctaButton: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 16,
    paddingHorizontal: 18,
    paddingVertical: 11,
    borderRadius: 12,
    backgroundColor: t.surface,
  },
  ctaButtonText: {
    fontFamily: 'Lexend_700Bold',
    fontSize: 14,
    color: colors.blue,
  },
  closing: {
    fontFamily: 'Lexend_400Regular',
    fontSize: 13,
    fontStyle: 'italic',
    color: t.textMuted,
    textAlign: 'center',
    marginTop: 24,
  },
  bottomBarWrap: {
    position: 'absolute',
    left: 16,
    right: 16,
    borderRadius: 18,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  },
  bottomBar: {
    flexDirection: 'row',
    gap: 12,
    borderRadius: 18,
    padding: 8,
    overflow: 'hidden',
  },
  exploreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: colors.blue,
    backgroundColor: t.surface,
  },
  exploreText: {
    fontFamily: 'Lexend_700Bold',
    fontSize: 14,
    color: colors.blue,
  },
  accountButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: colors.orange,
  },
  accountText: {
    fontFamily: 'Lexend_700Bold',
    fontSize: 14,
    color: colors.white,
  },
});
