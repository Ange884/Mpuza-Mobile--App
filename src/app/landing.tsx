import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Animated, Pressable, StyleSheet, Text, View, type ScrollViewInstance } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors } from '@/constants/colors';

const HERO_IMAGE = 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=1200&q=80';
const HERO_HEIGHT = 440;

type IconName = keyof typeof Ionicons.glyphMap;
type Lang = 'en' | 'fr' | 'rw';

type Feature = { icon: IconName; title: string; text: string };

type Content = {
  hero: {
    heading: string;
    subtitle: string;
    chips: { icon: IconName; label: string }[];
  };
  explore: {
    title: string;
    intro: string;
    missionLabel: string;
    mission: string;
    featuresTitle: string;
    features: Feature[];
    closing: string;
  };
  actions: { explore: string; account: string };
};

const content: Record<Lang, Content> = {
  en: {
    hero: {
      heading: 'Find your\nnext opportunity',
      subtitle: 'Where talent meets opportunity',
      chips: [
        { icon: 'briefcase-outline', label: 'Find Jobs' },
        { icon: 'business-outline', label: 'Top Employers' },
        { icon: 'list-outline', label: 'Manage Projects' },
        { icon: 'trending-up-outline', label: 'Grow Career' },
      ],
    },
    explore: {
      title: 'About MPUZA',
      intro:
        'MPUZA connects job seekers with employers, making it easier for individuals to discover career opportunities and for companies to find suitable talent.',
      missionLabel: 'OUR MISSION',
      mission:
        'To simplify the connection between talent and opportunity, helping individuals and organizations grow professionally.',
      featuresTitle: 'Beyond recruitment',
      features: [
        {
          icon: 'search-outline',
          title: 'For job seekers',
          text: 'Discover career opportunities that match your skills and goals.',
        },
        {
          icon: 'business-outline',
          title: 'For employers',
          text: 'Find suitable talent and build your team faster.',
        },
        {
          icon: 'clipboard-outline',
          title: 'Project management',
          text: 'Create, manage, and monitor projects directly within the platform.',
        },
      ],
      closing: 'Employment and project management, brought into one integrated experience.',
    },
    actions: { explore: 'Explore', account: 'Account' },
  },
  fr: {
    hero: {
      heading: 'Trouvez votre\nprochaine opportunité',
      subtitle: "Là où le talent rencontre l'opportunité",
      chips: [
        { icon: 'briefcase-outline', label: "Offres d'emploi" },
        { icon: 'business-outline', label: 'Meilleurs employeurs' },
        { icon: 'list-outline', label: 'Gérer les projets' },
        { icon: 'trending-up-outline', label: 'Évoluer' },
      ],
    },
    explore: {
      title: 'À propos de MPUZA',
      intro:
        "MPUZA connecte les chercheurs d'emploi aux employeurs, facilitant la découverte d'opportunités de carrière et la recherche de talents adaptés pour les entreprises.",
      missionLabel: 'NOTRE MISSION',
      mission:
        "Simplifier le lien entre le talent et l'opportunité, pour aider les individus et les organisations à grandir professionnellement.",
      featuresTitle: 'Au-delà du recrutement',
      features: [
        {
          icon: 'search-outline',
          title: 'Pour les candidats',
          text: 'Découvrez des opportunités de carrière adaptées à vos compétences.',
        },
        {
          icon: 'business-outline',
          title: 'Pour les employeurs',
          text: "Trouvez les talents qu'il vous faut et constituez votre équipe plus vite.",
        },
        {
          icon: 'clipboard-outline',
          title: 'Gestion de projets',
          text: 'Créez, gérez et suivez vos projets directement sur la plateforme.',
        },
      ],
      closing: "L'emploi et la gestion de projets, réunis dans une seule expérience intégrée.",
    },
    actions: { explore: 'Explorer', account: 'Compte' },
  },
  rw: {
    hero: {
      heading: 'Shaka akazi\nkakwiye',
      subtitle: 'Aho ubushobozi buhurira n’amahirwe',
      chips: [
        { icon: 'briefcase-outline', label: 'Akazi' },
        { icon: 'business-outline', label: 'Abakoresha' },
        { icon: 'list-outline', label: 'Gucunga imishinga' },
        { icon: 'trending-up-outline', label: 'Kwiyongera' },
      ],
    },
    explore: {
      title: 'Kuri MPUZA',
      intro:
        'MPUZA ihuza abashaka akazi n’abakoresha, bigatuma abantu babona amahirwe y’akazi vuba kandi ibigo bikabona abakozi babikwiye.',
      missionLabel: 'INTEGO YACU',
      mission: 'Koroshya guhuza ubushobozi n’amahirwe, dufashe abantu n’ibigo gukura mu mwuga.',
      featuresTitle: 'Birenze gushaka akazi',
      features: [
        {
          icon: 'search-outline',
          title: 'Ku bashaka akazi',
          text: 'Shakisha amahirwe y’akazi ahuye n’ubushobozi bwawe.',
        },
        {
          icon: 'business-outline',
          title: 'Ku bakoresha',
          text: 'Bona abakozi babikwiye maze wubake itsinda ryawe vuba.',
        },
        {
          icon: 'clipboard-outline',
          title: 'Gucunga imishinga',
          text: 'Kora, cunga kandi ukurikirane imishinga uri ku rubuga.',
        },
      ],
      closing: 'Akazi n’imicungire y’imishinga, byose hamwe ahantu hamwe.',
    },
    actions: { explore: 'Reba byinshi', account: 'Konti' },
  },
};

const LANGS: Lang[] = ['en', 'fr', 'rw'];

const CHIP_POSITIONS = [
  { top: 130, right: 20 },
  { top: 205, left: 18 },
  { top: 280, right: 26 },
  { top: 355, left: 24 },
];

function useFadeIn(delay: number, distance = 16) {
  const [value] = useState(() => new Animated.Value(0));

  useEffect(() => {
    Animated.timing(value, { toValue: 1, duration: 450, delay, useNativeDriver: true }).start();
  }, [value, delay]);

  return {
    opacity: value,
    transform: [{ translateY: value.interpolate({ inputRange: [0, 1], outputRange: [distance, 0] }) }],
  };
}

function PressScale({
  children,
  style,
  onPress,
}: {
  children: React.ReactNode;
  style: object;
  onPress: () => void;
}) {
  const [scale] = useState(() => new Animated.Value(1));

  const pressIn = () => Animated.spring(scale, { toValue: 0.95, useNativeDriver: true }).start();
  const pressOut = () => Animated.spring(scale, { toValue: 1, useNativeDriver: true }).start();

  return (
    <Animated.View style={{ flex: 1, transform: [{ scale }] }}>
      <Pressable style={style} onPress={onPress} onPressIn={pressIn} onPressOut={pressOut}>
        {children}
      </Pressable>
    </Animated.View>
  );
}

export default function Landing() {
  const insets = useSafeAreaInsets();
  const [lang, setLang] = useState<Lang>('en');
  const scrollRef = useRef<ScrollViewInstance>(null);
  const [scrollY] = useState(() => new Animated.Value(0));
  const [aboutY, setAboutY] = useState(0);
  const t = content[lang];

  const heading = useFadeIn(80);
  const subtitle = useFadeIn(200);
  const chip0 = useFadeIn(360);
  const chip1 = useFadeIn(440);
  const chip2 = useFadeIn(520);
  const chip3 = useFadeIn(600);
  const chipAnims = [chip0, chip1, chip2, chip3];

  const exploreIntro = useFadeIn(80);
  const feature0 = useFadeIn(160);
  const feature1 = useFadeIn(240);
  const feature2 = useFadeIn(320);
  const featureAnims = [feature0, feature1, feature2];
  const closing = useFadeIn(400);

  const heroScale = scrollY.interpolate({
    inputRange: [-150, 0],
    outputRange: [1.3, 1],
    extrapolate: 'clamp',
  });
  const heroShift = scrollY.interpolate({
    inputRange: [0, 150],
    outputRange: [0, -30],
    extrapolate: 'clamp',
  });

  function switchLanguage() {
    setLang(LANGS[(LANGS.indexOf(lang) + 1) % LANGS.length]);
  }

  function scrollToExplore() {
    scrollRef.current?.scrollTo({ y: aboutY - 16, animated: true });
  }

  return (
    <View style={styles.screen}>
      <Animated.ScrollView
        ref={scrollRef}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], {
          useNativeDriver: true,
        })}
        scrollEventThrottle={16}
        contentContainerStyle={{ paddingBottom: insets.bottom + 120 }}
        showsVerticalScrollIndicator={false}>
        <View style={[styles.hero, { marginTop: insets.top + 10, height: HERO_HEIGHT }]}>
          <Animated.View
            style={[
              StyleSheet.absoluteFill,
              { transform: [{ scale: heroScale }, { translateY: heroShift }] },
            ]}>
            <Image source={{ uri: HERO_IMAGE }} style={StyleSheet.absoluteFill} contentFit="cover" />
          </Animated.View>
          <LinearGradient colors={['rgba(0,0,0,0.6)', 'rgba(0,0,0,0)']} style={styles.heroShade} />

          <Pressable
            style={({ pressed }) => [styles.langButton, pressed && styles.pressed]}
            onPress={switchLanguage}>
            <Ionicons name="globe-outline" size={14} color={colors.white} />
            <Text style={styles.langText}>{lang.toUpperCase()}</Text>
          </Pressable>

          <View style={styles.heroText}>
            <Animated.Text style={[styles.heading, heading]}>{t.hero.heading}</Animated.Text>
            <Animated.Text style={[styles.subtitle, subtitle]}>{t.hero.subtitle}</Animated.Text>
          </View>

          {t.hero.chips.map((chip, index) => (
            <Animated.View key={chip.label} style={[styles.chip, CHIP_POSITIONS[index], chipAnims[index]]}>
              <View style={styles.chipIcon}>
                <Ionicons name={chip.icon} size={15} color={colors.white} />
              </View>
              <Text style={styles.chipText}>{chip.label}</Text>
            </Animated.View>
          ))}
        </View>

        <View style={styles.explore} onLayout={(event) => setAboutY(event.nativeEvent.layout.y)}>
          <Animated.View style={exploreIntro}>
            <Text style={styles.exploreTitle}>{t.explore.title}</Text>
            <Text style={styles.exploreIntro}>{t.explore.intro}</Text>

            <View style={styles.missionCard}>
              <Text style={styles.missionLabel}>{t.explore.missionLabel}</Text>
              <Text style={styles.missionText}>{t.explore.mission}</Text>
            </View>

            <Text style={styles.featuresTitle}>{t.explore.featuresTitle}</Text>
          </Animated.View>

          {t.explore.features.map((feature, index) => (
            <Animated.View key={feature.title} style={[styles.featureRow, featureAnims[index]]}>
              <View style={styles.featureIcon}>
                <Ionicons name={feature.icon} size={18} color={colors.orange} />
              </View>
              <View style={styles.featureCopy}>
                <Text style={styles.featureTitle}>{feature.title}</Text>
                <Text style={styles.featureText}>{feature.text}</Text>
              </View>
            </Animated.View>
          ))}

          <Animated.Text style={[styles.closing, closing]}>{t.explore.closing}</Animated.Text>
        </View>
      </Animated.ScrollView>

      <BlurView intensity={60} tint="light" style={[styles.bottomBar, { paddingBottom: insets.bottom + 10 }]}>
        <PressScale style={styles.exploreButton} onPress={scrollToExplore}>
          <Ionicons name="compass-outline" size={18} color={colors.blue} />
          <Text style={styles.exploreText}>{t.actions.explore}</Text>
        </PressScale>

        <PressScale style={styles.accountButton} onPress={() => router.push('/account')}>
          <Ionicons name="person-outline" size={18} color={colors.white} />
          <Text style={styles.accountText}>{t.actions.account}</Text>
        </PressScale>
      </BlurView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.white,
  },
  pressed: {
    opacity: 0.7,
  },
  hero: {
    marginHorizontal: 12,
    borderRadius: 28,
    overflow: 'hidden',
    backgroundColor: '#ddd',
  },
  heroShade: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 200,
  },
  langButton: {
    position: 'absolute',
    top: 18,
    right: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.25)',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
  },
  langText: {
    color: colors.white,
    fontFamily: 'Lexend_700Bold',
    fontSize: 12,
  },
  heroText: {
    paddingTop: 64,
    paddingHorizontal: 22,
  },
  heading: {
    color: colors.white,
    fontFamily: 'Lexend_700Bold',
    fontSize: 28,
    lineHeight: 34,
  },
  subtitle: {
    color: 'rgba(255,255,255,0.9)',
    fontFamily: 'Lexend_400Regular',
    fontSize: 14,
    marginTop: 8,
  },
  chip: {
    position: 'absolute',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.92)',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 18,
    gap: 6,
    maxWidth: 120,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4,
  },
  chipIcon: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: colors.orange,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipText: {
    fontFamily: 'Lexend_400Regular',
    fontSize: 11,
    color: '#222',
    textAlign: 'center',
  },
  explore: {
    paddingHorizontal: 22,
    paddingTop: 28,
  },
  exploreTitle: {
    fontFamily: 'Lexend_700Bold',
    fontSize: 20,
    color: '#111',
  },
  exploreIntro: {
    fontFamily: 'Lexend_400Regular',
    fontSize: 14,
    lineHeight: 21,
    color: '#555',
    marginTop: 10,
  },
  missionCard: {
    marginTop: 20,
    padding: 18,
    borderRadius: 20,
    backgroundColor: 'rgba(53,168,223,0.1)',
    borderLeftWidth: 3,
    borderLeftColor: colors.blue,
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
    lineHeight: 22,
    color: '#1c1c1c',
    marginTop: 8,
  },
  featuresTitle: {
    fontFamily: 'Lexend_700Bold',
    fontSize: 16,
    color: '#111',
    marginTop: 28,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginTop: 18,
  },
  featureIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(237,99,60,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureCopy: {
    flex: 1,
  },
  featureTitle: {
    fontFamily: 'Lexend_700Bold',
    fontSize: 14,
    color: '#111',
  },
  featureText: {
    fontFamily: 'Lexend_400Regular',
    fontSize: 13,
    color: '#666',
    marginTop: 2,
  },
  closing: {
    fontFamily: 'Lexend_400Regular',
    fontSize: 13,
    fontStyle: 'italic',
    color: '#888',
    textAlign: 'center',
    marginTop: 30,
  },
  bottomBar: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 0,
    flexDirection: 'row',
    gap: 12,
    borderRadius: 24,
    padding: 8,
    paddingTop: 10,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  },
  exploreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: colors.blue,
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
    borderRadius: 18,
    backgroundColor: colors.orange,
  },
  accountText: {
    fontFamily: 'Lexend_700Bold',
    fontSize: 14,
    color: colors.white,
  },
});
