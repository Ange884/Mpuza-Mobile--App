import { Ionicons } from '@expo/vector-icons';
import { Image, type ImageSource } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Redirect, router, useLocalSearchParams } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn, FadeInDown, FadeInUp, interpolate, useAnimatedStyle, ZoomIn } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { PrimaryButton } from '@/components/auth/PrimaryButton';
import { Sparkle, useFloat } from '@/components/Decor';
import { Logo } from '@/components/Logo';
import { colors } from '@/constants/colors';
import { useAuth } from '@/context/auth';
import { useResponsiveStyles, useTheme, type Theme } from '@/theme';
import type { ResponsiveInfo } from '@/utils/responsive';
import { LanguagePill } from '@/components/LanguageSwitcher';
import { useI18n } from '@/i18n';

const WELCOME_IMAGE = require('@/assets/images/welcome.png') as ImageSource;

export default function Account() {
  const { tr } = useI18n();
  const t = useTheme();
  const styles = useResponsiveStyles(makeStyles);
  const insets = useSafeAreaInsets();
  const { job } = useLocalSearchParams<{ job?: string }>();
  const params = job ? { job } : undefined;

  const float = useFloat(2600);
  const blob = useFloat(4200);

  const illustrationStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: interpolate(float.value, [0, 1], [0, -10]) }],
  }));
  const blobStyle = useAnimatedStyle(() => ({
    transform: [
      { scaleX: interpolate(blob.value, [0, 1], [1, 1.06]) },
      { scaleY: interpolate(blob.value, [0, 1], [1, 0.94]) },
    ],
  }));

  const { user } = useAuth();
  if (user) return <Redirect href="/home" />;

  function goBack() {
    if (router.canGoBack()) router.back();
    else router.replace('/landing');
  }

  return (
    <View style={styles.screen}>
      <LinearGradient colors={t.pageGradient} locations={[0, 0.55, 1]} style={StyleSheet.absoluteFill} />

      <View style={[styles.content, { paddingTop: insets.top + 8, paddingBottom: insets.bottom + 20 }]}>
        <Animated.View entering={FadeIn.duration(400)} style={[styles.topBar, styles.topBarRow]}>
          <Pressable onPress={goBack} hitSlop={10} style={styles.back} accessibilityLabel={tr('common.goBack')}>
            <Ionicons name="arrow-back" size={22} color={t.text} />
          </Pressable>
          <LanguagePill />
        </Animated.View>

        <Animated.View entering={ZoomIn.delay(100).springify().damping(12)} style={styles.logo}>
          <Logo size={22} />
        </Animated.View>

        <Animated.Text entering={FadeInDown.delay(250).duration(600)} style={styles.title}>
          {tr('welcome.title')}{'\n'}
          <Text style={styles.titleAccent}>MPUZA</Text>
        </Animated.Text>
        <Animated.Text entering={FadeInDown.delay(380).duration(600)} style={styles.subtitle}>
          {tr('welcome.subtitle')}
        </Animated.Text>

        <Animated.View entering={FadeIn.delay(500).duration(800)} style={styles.illustrationArea}>
          <Animated.View style={[styles.blob, blobStyle]} />
          <Sparkle top="8%" left="12%" delay={0} color={colors.blue} />
          <Sparkle top="2%" left="70%" delay={500} color={colors.orange} size={10} />
          <Sparkle top="40%" left="88%" delay={900} color={colors.blue} size={8} />
          <Sparkle top="55%" left="4%" delay={1300} color={colors.orange} size={9} />

          <Animated.View style={[styles.illustration, illustrationStyle]}>
            <Image source={WELCOME_IMAGE} style={styles.image} contentFit="contain" transition={300} />
          </Animated.View>
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(650).duration(600)} style={styles.actions}>
          <PrimaryButton
            label={tr('welcome.getStarted')}
            shimmer
            onPress={() => router.push({ pathname: '/signup', params })}
          />
          <View style={styles.signInRow}>
            <Text style={styles.signInText}>{tr('welcome.haveAccount')} </Text>
            <Pressable onPress={() => router.push({ pathname: '/login', params })} hitSlop={8}>
              <Text style={styles.signInLink}>{tr('common.signIn')}</Text>
            </Pressable>
          </View>
        </Animated.View>
      </View>
    </View>
  );
}

const makeStyles = (t: Theme, r: ResponsiveInfo) =>
  StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: t.surface,
    alignItems: 'center',
  },
  content: {
    flex: 1,
    width: '100%',
    maxWidth: r.contentMaxWidth,
    paddingHorizontal: r.gutter,
  },
  topBar: {
    height: 44,
    justifyContent: 'center',
  },
  topBarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  back: {
    width: 40,
    height: 40,
    borderRadius: 7,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: t.surfaceAlt,
  },
  logo: {
    alignSelf: 'center',
    marginTop: 4,
  },
  title: {
    fontFamily: 'Lexend_700Bold',
    fontSize: r.rf(r.isTablet ? 34 : 30),
    lineHeight: r.rf(r.isTablet ? 42 : 38),
    color: t.text,
    textAlign: 'center',
    marginTop: 22,
  },
  titleAccent: {
    color: colors.orange,
  },
  subtitle: {
    fontFamily: 'Lexend_400Regular',
    fontSize: 15,
    lineHeight: 22,
    color: t.textBody,
    textAlign: 'center',
    marginTop: 12,
    paddingHorizontal: 8,
  },
  illustrationArea: {
    flex: 1,
    minHeight: 200,
    marginVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  blob: {
    position: 'absolute',
    bottom: '6%',
    width: '92%',
    height: '45%',
    borderRadius: 7,
    backgroundColor: 'rgba(53,168,223,0.14)',
  },
  illustration: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  placeholder: {
    width: '80%',
    height: '75%',
    borderRadius: 7,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: 'rgba(53,168,223,0.45)',
    backgroundColor: t.surface,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  placeholderText: {
    fontFamily: 'Lexend_400Regular',
    fontSize: 13,
    color: t.textBody,
  },
  actions: {
    gap: 18,
  },
  signInRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  signInText: {
    fontFamily: 'Lexend_400Regular',
    fontSize: 14,
    color: t.textBody,
  },
  signInLink: {
    fontFamily: 'Lexend_700Bold',
    fontSize: 14,
    color: colors.blue,
  },
});
