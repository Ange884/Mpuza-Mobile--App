import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  FadeIn,
  FadeInDown,
  interpolate,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Circle, Defs, LinearGradient as SvgGradient, Stop } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useFloat } from '@/components/Decor';
import { colors } from '@/constants/colors';
import { useI18n } from '@/i18n';
import { useStyles, useTheme, type Theme } from '@/theme';

/** Swap for your own: `require('@/assets/images/loading-person.png')` */
const PERSON_IMAGE = require('@/assets/images/welcome.png');

const RING = 212;
const STROKE = 15;
const RADIUS = (RING - STROKE) / 2;
const CENTER = RING / 2;
const ARC = 2 * Math.PI * RADIUS;
const DASH = ARC * 0.72;

const ORANGE_LIGHT = '#fbd5c8';
const ORANGE_DEEP = '#c94f2e';

export default function Loading() {
  const { tr } = useI18n();
  const t = useTheme();
  const styles = useStyles(makeStyles);
  const insets = useSafeAreaInsets();
  const reduceMotion = useReducedMotion();
  const spin = useSharedValue(0);
  const breathe = useSharedValue(0);
  const float = useFloat(2600, 200);

  useEffect(() => {
    if (reduceMotion) return;
    spin.set(withRepeat(withTiming(1, { duration: 1400, easing: Easing.linear }), -1, false));
    breathe.set(withRepeat(withTiming(1, { duration: 2200, easing: Easing.inOut(Easing.sin) }), -1, true));
  }, [breathe, reduceMotion, spin]);

  useEffect(() => {
    const timer = setTimeout(() => router.replace('/landing'), 2400);
    return () => clearTimeout(timer);
  }, []);

  const ringStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${spin.value * 360}deg` }],
  }));

  const haloStyle = useAnimatedStyle(() => ({
    opacity: interpolate(breathe.value, [0, 1], [0.3, 0.55]),
    transform: [{ scale: interpolate(breathe.value, [0, 1], [0.95, 1.05]) }],
  }));

  const portraitStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: interpolate(float.value, [0, 1], [4, -6]) }],
  }));

  const pageBg = t.scheme === 'dark' ? t.bg : colors.white;

  return (
    <View style={[styles.screen, { backgroundColor: pageBg, paddingTop: insets.top + 28, paddingBottom: insets.bottom + 24 }]}>
      <Animated.Text entering={FadeInDown.delay(80).duration(600)} style={styles.title}>
        MPUZA
      </Animated.Text>

      <Animated.View entering={FadeIn.delay(160).duration(700)} style={styles.loaderWrap}>
        <Animated.View style={[styles.halo, haloStyle]} />
        <Animated.View style={ringStyle}>
          <Svg width={RING} height={RING}>
            <Defs>
              <SvgGradient id="mpuzaRing" x1="0%" y1="0%" x2="100%" y2="100%">
                <Stop offset="0%" stopColor={ORANGE_LIGHT} />
                <Stop offset="55%" stopColor={colors.orange} />
                <Stop offset="100%" stopColor={ORANGE_DEEP} />
              </SvgGradient>
            </Defs>
            <Circle
              cx={CENTER}
              cy={CENTER}
              r={RADIUS}
              stroke="rgba(237,99,60,0.16)"
              strokeWidth={STROKE}
              fill="none"
            />
            <Circle
              cx={CENTER}
              cy={CENTER}
              r={RADIUS}
              stroke="url(#mpuzaRing)"
              strokeWidth={STROKE}
              strokeLinecap="round"
              strokeDasharray={`${DASH} ${ARC}`}
              fill="none"
              rotation={-90}
              origin={`${CENTER}, ${CENTER}`}
            />
          </Svg>
        </Animated.View>

        <Animated.View style={[styles.portrait, portraitStyle]}>
          <View style={styles.portraitRing}>
            <Image source={PERSON_IMAGE} style={styles.portraitImg} contentFit="cover" />
          </View>
        </Animated.View>
      </Animated.View>

      <Animated.Text entering={FadeInDown.delay(280).duration(650)} style={styles.hint}>
        {tr('loading.hint')}
      </Animated.Text>

      <View style={styles.brand}>
        <View style={styles.brandMark}>
          <Ionicons name="leaf" size={14} color={colors.white} />
        </View>
        <Text style={styles.brandText}>MPUZA</Text>
      </View>
    </View>
  );
}

const makeStyles = (t: Theme) =>
  StyleSheet.create({
    screen: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 28,
    },
    title: {
      position: 'absolute',
      top: '18%',
      fontFamily: 'Lexend_700Bold',
      fontSize: 26,
      color: t.text,
      textAlign: 'center',
    },
    loaderWrap: {
      width: RING,
      height: RING,
      alignItems: 'center',
      justifyContent: 'center',
    },
    halo: {
      position: 'absolute',
      width: RING + 36,
      height: RING + 36,
      borderRadius: (RING + 36) / 2,
      backgroundColor: 'rgba(237,99,60,0.12)',
    },
    portrait: {
      position: 'absolute',
      alignItems: 'center',
      justifyContent: 'center',
    },
    portraitRing: {
      width: 86,
      height: 86,
      borderRadius: 43,
      padding: 4,
      backgroundColor: t.scheme === 'dark' ? t.surface : colors.white,
      borderWidth: 2,
      borderColor: 'rgba(237,99,60,0.22)',
      shadowColor: colors.orange,
      shadowOpacity: 0.2,
      shadowRadius: 12,
      shadowOffset: { width: 0, height: 6 },
      elevation: 6,
      overflow: 'hidden',
    },
    portraitImg: {
      width: '100%',
      height: '100%',
      borderRadius: 39,
    },
    hint: {
      position: 'absolute',
      bottom: '22%',
      fontFamily: 'Lexend_700Bold',
      fontSize: 13,
      lineHeight: 20,
      color: t.textBody,
      textAlign: 'center',
      maxWidth: 280,
    },
    brand: {
      position: 'absolute',
      bottom: 36,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      opacity: 0.85,
    },
    brandMark: {
      width: 28,
      height: 28,
      borderRadius: 14,
      backgroundColor: colors.orange,
      alignItems: 'center',
      justifyContent: 'center',
    },
    brandText: {
      fontFamily: 'Lexend_700Bold',
      fontSize: 16,
      letterSpacing: 0.6,
      color: t.text,
    },
  });
