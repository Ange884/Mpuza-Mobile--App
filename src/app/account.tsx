import { Ionicons } from '@expo/vector-icons';
import { Image, type ImageSource } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Redirect, router, useLocalSearchParams } from 'expo-router';
import { useEffect } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  FadeIn,
  FadeInDown,
  FadeInUp,
  interpolate,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withRepeat,
  withTiming,
  ZoomIn,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { PrimaryButton } from '@/components/auth/PrimaryButton';
import { Logo } from '@/components/Logo';
import { colors } from '@/constants/colors';
import { useAuth } from '@/context/auth';

/**
 * YOUR ILLUSTRATION GOES HERE.
 * 1. Save the image as  assets/images/welcome.png  (a transparent PNG around 600×500 works best).
 * 2. Replace `null` below with:  require('@/assets/images/welcome.png')
 * Until then an animated placeholder is shown in the same spot.
 */
const WELCOME_IMAGE = require('@/assets/images/welcome.png') as ImageSource | null;

function useFloat(duration: number, delay = 0) {
  const reduceMotion = useReducedMotion();
  const value = useSharedValue(0);
  useEffect(() => {
    if (reduceMotion) return;
    value.set(
      withDelay(delay, withRepeat(withTiming(1, { duration, easing: Easing.inOut(Easing.sin) }), -1, true))
    );
  }, [value, duration, delay, reduceMotion]);
  return value;
}

export default function Account() {
  const insets = useSafeAreaInsets();
  // A job id may be passed from Explore so we can return the user to it after auth.
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
      <LinearGradient colors={['#ffffff', '#f2f9fd', '#fdf3ef']} locations={[0, 0.55, 1]} style={StyleSheet.absoluteFill} />

      <View style={[styles.content, { paddingTop: insets.top + 8, paddingBottom: insets.bottom + 20 }]}>
        <Animated.View entering={FadeIn.duration(400)} style={styles.topBar}>
          <Pressable onPress={goBack} hitSlop={10} style={styles.back} accessibilityLabel="Go back">
            <Ionicons name="arrow-back" size={22} color={colors.dblue} />
          </Pressable>
        </Animated.View>

        <Animated.View entering={ZoomIn.delay(100).springify().damping(12)} style={styles.logo}>
          <Logo size={22} />
        </Animated.View>

        <Animated.Text entering={FadeInDown.delay(250).duration(600)} style={styles.title}>
          Welcome to{'\n'}
          <Text style={styles.titleAccent}>MPUZA</Text>
        </Animated.Text>
        <Animated.Text entering={FadeInDown.delay(380).duration(600)} style={styles.subtitle}>
          Where talent meets opportunity. Find jobs, hire talent and manage projects in one place.
        </Animated.Text>

        {/* ILLUSTRATION SLOT */}
        <Animated.View entering={FadeIn.delay(500).duration(800)} style={styles.illustrationArea}>
          <Animated.View style={[styles.blob, blobStyle]} />
          <Sparkle top="8%" left="12%" delay={0} color={colors.blue} />
          <Sparkle top="2%" left="70%" delay={500} color={colors.orange} size={10} />
          <Sparkle top="40%" left="88%" delay={900} color={colors.blue} size={8} />
          <Sparkle top="55%" left="4%" delay={1300} color={colors.orange} size={9} />

          <Animated.View style={[styles.illustration, illustrationStyle]}>
            {WELCOME_IMAGE ? (
              <Image source={WELCOME_IMAGE} style={styles.image} contentFit="contain" transition={300} />
            ) : (
              <View style={styles.placeholder}>
                <Ionicons name="image-outline" size={34} color={colors.blue} />
                <Text style={styles.placeholderText}>Your illustration goes here</Text>
              </View>
            )}
          </Animated.View>
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(650).duration(600)} style={styles.actions}>
          <PrimaryButton
            label="Get Started"
            shimmer
            onPress={() => router.push({ pathname: '/signup', params })}
          />
          <View style={styles.signInRow}>
            <Text style={styles.signInText}>Already have an account? </Text>
            <Pressable onPress={() => router.push({ pathname: '/login', params })} hitSlop={8}>
              <Text style={styles.signInLink}>Sign in</Text>
            </Pressable>
          </View>
        </Animated.View>
      </View>
    </View>
  );
}

function Sparkle({
  top,
  left,
  delay,
  color,
  size = 12,
}: {
  top: `${number}%`;
  left: `${number}%`;
  delay: number;
  color: string;
  size?: number;
}) {
  const twinkle = useFloat(1400, delay);
  const style = useAnimatedStyle(() => ({
    opacity: interpolate(twinkle.value, [0, 1], [0.25, 1]),
    transform: [{ scale: interpolate(twinkle.value, [0, 1], [0.6, 1.15]) }, { rotate: '45deg' }],
  }));
  return (
    <Animated.View
      pointerEvents="none"
      style={[{ position: 'absolute', top, left, width: size, height: size, borderRadius: 2, backgroundColor: color }, style]}
    />
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.white,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  topBar: {
    height: 44,
    justifyContent: 'center',
  },
  back: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(14,49,76,0.06)',
  },
  logo: {
    alignSelf: 'center',
    marginTop: 4,
  },
  title: {
    fontFamily: 'Lexend_700Bold',
    fontSize: 30,
    lineHeight: 38,
    color: colors.dblue,
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
    color: '#5b6b7a',
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
    borderRadius: 200,
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
    borderRadius: 24,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: 'rgba(53,168,223,0.45)',
    backgroundColor: 'rgba(255,255,255,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  placeholderText: {
    fontFamily: 'Lexend_400Regular',
    fontSize: 13,
    color: '#5b6b7a',
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
    color: '#5b6b7a',
  },
  signInLink: {
    fontFamily: 'Lexend_700Bold',
    fontSize: 14,
    color: colors.blue,
  },
});
