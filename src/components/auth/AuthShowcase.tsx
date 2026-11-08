import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useEffect, useState, type ReactNode } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn, FadeInDown, FadeOut, interpolate, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Sparkle, useFloat } from '@/components/Decor';
import { LanguagePill } from '@/components/LanguageSwitcher';
import { Logo } from '@/components/Logo';
import { colors } from '@/constants/colors';
import { useI18n } from '@/i18n';
import { useStyles, useTheme, type Theme } from '@/theme';

export type ShowcaseSlide = { title: string; text: string };

type Props = {
  kicker: string;
  accent: string;
  subtitle: string;
  slides: ShowcaseSlide[];
  children: ReactNode;
  footer: ReactNode;
};

const HERO = require('@/assets/images/welcome.png');

/** Centered sign-in shell: logo, headline, floating illustration, form. */
export function AuthShowcase({ kicker, accent, subtitle, slides, children, footer }: Props) {
  const { tr } = useI18n();
  const t = useTheme();
  const styles = useStyles(makeStyles);
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.screen}>
      <Animated.View entering={FadeIn.duration(350)} style={[styles.topBar, { paddingTop: insets.top + 4 }]}>
        <Pressable
          onPress={() => (router.canGoBack() ? router.back() : router.replace('/account'))}
          hitSlop={12}
          style={({ pressed }) => [styles.back, pressed && styles.pressed]}
          accessibilityLabel={tr('common.goBack')}>
          <Ionicons name="chevron-back" size={22} color={t.text} />
        </Pressable>
        <LanguagePill />
      </Animated.View>

      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 24 }]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          <Animated.View entering={FadeInDown.delay(60).duration(500)} style={styles.logo}>
            <Logo size={22} />
          </Animated.View>

          <Animated.Text entering={FadeInDown.delay(140).duration(520)} style={styles.heading}>
            {kicker}
            {'\n'}
            <Text style={styles.accent}>{accent}</Text>
          </Animated.Text>
          <Animated.Text entering={FadeInDown.delay(220).duration(520)} style={styles.subtitle}>
            {subtitle}
          </Animated.Text>

          <Hero slides={slides} />
          <View style={styles.form}>{children}</View>
          <View style={styles.footer}>{footer}</View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

function Hero({ slides }: { slides: ShowcaseSlide[] }) {
  const styles = useStyles(makeStyles);
  const [index, setIndex] = useState(0);
  const float = useFloat(2800);
  const drift = useFloat(3600, 400);
  const slide = slides[index] ?? slides[0];

  useEffect(() => {
    if (slides.length < 2) return;
    const timer = setInterval(() => setIndex((current) => (current + 1) % slides.length), 3400);
    return () => clearInterval(timer);
  }, [slides.length]);

  const artStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: interpolate(float.value, [0, 1], [6, -8]) }],
  }));
  const chipA = useAnimatedStyle(() => ({
    transform: [{ translateY: interpolate(drift.value, [0, 1], [0, -8]) }],
  }));
  const chipB = useAnimatedStyle(() => ({
    transform: [{ translateY: interpolate(float.value, [0, 1], [-4, 8]) }],
  }));

  return (
    <Animated.View entering={FadeIn.delay(300).duration(700)} style={styles.hero}>
      <View style={styles.stage}>
        <Sparkle top="12%" left="8%" delay={0} color={colors.orange} size={8} />
        <Sparkle top="6%" left="78%" delay={500} color={colors.blue} size={7} />
        <Sparkle top="62%" left="6%" delay={900} color={colors.blue} size={6} />
        <Animated.View style={[styles.chip, styles.chipLeft, chipA]}>
          <Ionicons name="briefcase" size={14} color={colors.orange} />
        </Animated.View>
        <Animated.View style={[styles.chip, styles.chipRight, chipB]}>
          <Ionicons name="star" size={14} color={colors.blue} />
        </Animated.View>
        <Animated.View style={artStyle}>
          <Image source={HERO} style={styles.art} contentFit="contain" />
        </Animated.View>
      </View>

      <View style={styles.caption}>
        <Animated.View key={index} entering={FadeIn.duration(280)} exiting={FadeOut.duration(160)} style={styles.captionInner}>
          <Text style={styles.captionTitle}>{slide.title}</Text>
          <Text style={styles.captionText}>{slide.text}</Text>
        </Animated.View>
      </View>

      <View style={styles.dots}>
        {slides.map((item, dot) => (
          <Dot key={item.title} active={dot === index} onPress={() => setIndex(dot)} />
        ))}
      </View>
    </Animated.View>
  );
}

function Dot({ active, onPress }: { active: boolean; onPress: () => void }) {
  const styles = useStyles(makeStyles);
  const width = useSharedValue(active ? 18 : 6);

  useEffect(() => {
    width.set(withTiming(active ? 18 : 6, { duration: 240 }));
  }, [active, width]);

  const style = useAnimatedStyle(() => ({ width: width.value }));

  return (
    <Pressable onPress={onPress} hitSlop={8} accessibilityRole="button">
      <Animated.View style={[styles.dot, active && styles.dotActive, style]} />
    </Pressable>
  );
}

const makeStyles = (t: Theme) =>
  StyleSheet.create({
    flex: { flex: 1 },
    pressed: { opacity: 0.55 },
    screen: {
      flex: 1,
      backgroundColor: t.surface,
    },
    topBar: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 12,
      paddingBottom: 2,
    },
    back: {
      width: 40,
      height: 40,
      alignItems: 'center',
      justifyContent: 'center',
    },
    content: {
      flexGrow: 1,
      paddingHorizontal: 24,
    },
    logo: {
      alignSelf: 'center',
      marginTop: 4,
    },
    heading: {
      marginTop: 18,
      textAlign: 'center',
      fontFamily: 'Lexend_700Bold',
      fontSize: 28,
      lineHeight: 36,
      color: t.text,
    },
    accent: {
      color: colors.orange,
    },
    subtitle: {
      marginTop: 8,
      textAlign: 'center',
      fontFamily: 'Lexend_400Regular',
      fontSize: 14,
      lineHeight: 20,
      color: t.textMuted,
    },
    hero: {
      marginTop: 8,
      marginBottom: 8,
      alignItems: 'center',
    },
    stage: {
      width: '100%',
      height: 176,
      alignItems: 'center',
      justifyContent: 'center',
    },
    art: {
      width: 230,
      height: 150,
    },
    chip: {
      position: 'absolute',
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: t.surface,
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: colors.dblue,
      shadowOpacity: 0.12,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: 4 },
      elevation: 3,
      zIndex: 2,
    },
    chipLeft: {
      top: 28,
      left: 28,
    },
    chipRight: {
      top: 46,
      right: 24,
    },
    caption: {
      minHeight: 52,
      alignItems: 'center',
      justifyContent: 'center',
    },
    captionInner: {
      alignItems: 'center',
    },
    captionTitle: {
      textAlign: 'center',
      fontFamily: 'Lexend_700Bold',
      fontSize: 15,
      color: t.text,
    },
    captionText: {
      marginTop: 2,
      textAlign: 'center',
      fontFamily: 'Lexend_400Regular',
      fontSize: 12,
      lineHeight: 17,
      color: t.textMuted,
    },
    dots: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      marginTop: 10,
      marginBottom: 16,
    },
    dot: {
      height: 6,
      borderRadius: 3,
      backgroundColor: t.border,
    },
    dotActive: {
      backgroundColor: colors.orange,
    },
    form: {
      marginTop: 4,
    },
    footer: {
      marginTop: 22,
      paddingBottom: 8,
    },
  });
