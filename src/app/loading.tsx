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

import { Sparkle } from '@/components/Decor';
import { Logo } from '@/components/Logo';
import { colors } from '@/constants/colors';
import { useI18n } from '@/i18n';
import { useStyles, useTheme, type Theme } from '@/theme';

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
    opacity: interpolate(breathe.value, [0, 1], [0.28, 0.48]),
    transform: [{ scale: interpolate(breathe.value, [0, 1], [0.96, 1.04]) }],
  }));

  const pageBg = t.scheme === 'dark' ? t.bg : colors.white;

  return (
    <View style={[styles.screen, { backgroundColor: pageBg, paddingTop: insets.top + 28, paddingBottom: insets.bottom + 24 }]}>
      <Sparkle top="20%" left="12%" delay={0} color={colors.orange} size={7} />
      <Sparkle top="18%" left="80%" delay={450} color={colors.blue} size={7} />
      <Sparkle top="70%" left="78%" delay={900} color={colors.dblue} size={6} />

      <Animated.View entering={FadeInDown.delay(80).duration(600)} style={styles.topBrand}>
        <Logo size={20} />
      </Animated.View>

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
            <Circle cx={CENTER} cy={CENTER} r={RADIUS} stroke="rgba(237,99,60,0.14)" strokeWidth={STROKE} fill="none" />
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

        <View style={styles.center}>
          <View style={styles.centerPlate}>
            <Text style={styles.centerText}>MPUZA</Text>
          </View>
        </View>
      </Animated.View>

      <Animated.Text entering={FadeInDown.delay(280).duration(650)} style={styles.hint}>
        {tr('loading.hint')}
      </Animated.Text>

      <View style={styles.bottomBrand}>
        <Logo size={18} />
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
    topBrand: {
      position: 'absolute',
      top: '18%',
      alignItems: 'center',
    },
    loaderWrap: {
      width: RING,
      height: RING,
      alignItems: 'center',
      justifyContent: 'center',
    },
    halo: {
      position: 'absolute',
      width: RING + 28,
      height: RING + 28,
      borderRadius: (RING + 28) / 2,
      backgroundColor: 'rgba(237,99,60,0.08)',
    },
    center: {
      position: 'absolute',
      alignItems: 'center',
      justifyContent: 'center',
    },
    centerPlate: {
      width: 88,
      height: 88,
      borderRadius: 44,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: t.scheme === 'dark' ? t.surface : colors.white,
      borderWidth: 1,
      borderColor: 'rgba(237,99,60,0.18)',
    },
    centerText: {
      fontFamily: 'Lexend_700Bold',
      fontSize: 15,
      letterSpacing: 1,
      color: t.scheme === 'dark' ? t.text : colors.dblue,
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
    bottomBrand: {
      position: 'absolute',
      bottom: 36,
      alignItems: 'center',
      opacity: 0.88,
    },
  });
