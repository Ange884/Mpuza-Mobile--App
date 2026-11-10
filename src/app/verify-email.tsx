import { Ionicons } from '@expo/vector-icons';
import { Image, type ImageSource } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  FadeIn,
  FadeInDown,
  FadeInUp,
  FadeOut,
  interpolate,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withTiming,
  ZoomIn,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { PrimaryButton } from '@/components/auth/PrimaryButton';
import { Sparkle, useFloat } from '@/components/Decor';
import { Logo } from '@/components/Logo';
import { colors } from '@/constants/colors';
import { confirmEmail } from '@/api/mpuza';
import { useAuth } from '@/context/auth';
import { useStyles, useTheme, type Theme } from '@/theme';
import { useI18n } from '@/i18n';


const VERIFY_IMAGE= require('@/assets/images/welcome.png') as ImageSource | number | null;

const RESEND_COOLDOWN = 30;

export default function VerifyEmail() {
  const { tr } = useI18n();
  const t = useTheme();
  const styles = useStyles(makeStyles);
  const insets = useSafeAreaInsets();
  const { resendVerification } = useAuth();
  const { name, email, job, token } = useLocalSearchParams<{ name?: string; email?: string; job?: string; token?: string }>();
  const firstName = (name ?? '').trim().split(' ')[0] || tr('verify.there');

  const [cooldown, setCooldown] = useState(RESEND_COOLDOWN);
  const confirmed = useRef(false);
  const [sending, setSending] = useState(false);
  const [sentAgain, setSentAgain] = useState(0);

  useEffect(() => {
    if (!token || confirmed.current) return;
    confirmed.current = true;
    confirmEmail(token)
      .then(() => goToLogin())
      .catch(() => {});
  }, [token]);

  // Count down the resend timer one second at a time.
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  // Hide the "sent again" banner after a few seconds.
  useEffect(() => {
    if (!sentAgain) return;
    const timer = setTimeout(() => setSentAgain(0), 3500);
    return () => clearTimeout(timer);
  }, [sentAgain]);

  const float = useFloat(2600);
  const blob = useFloat(4200);
  const illustrationStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: interpolate(float.value, [0, 1], [0, -8]) }],
  }));
  const blobStyle = useAnimatedStyle(() => ({
    transform: [
      { scaleX: interpolate(blob.value, [0, 1], [1, 1.06]) },
      { scaleY: interpolate(blob.value, [0, 1], [1, 0.94]) },
    ],
  }));

  async function resend() {
    if (!email || sending || cooldown > 0) return;
    setSending(true);
    try {
      await resendVerification(email);
      setSentAgain((n) => n + 1);
      setCooldown(RESEND_COOLDOWN);
    } finally {
      setSending(false);
    }
  }

  function goToLogin() {
    router.replace({ pathname: '/login', params: { ...(email ? { email } : {}), ...(job ? { job } : {}) } });
  }

  function goBack() {
    if (router.canGoBack()) router.back();
    else router.replace('/account');
  }

  const timer = `0:${String(cooldown).padStart(2, '0')}`;

  return (
    <View style={styles.screen}>
      <LinearGradient colors={t.pageGradient} locations={[0, 0.55, 1]} style={StyleSheet.absoluteFill} />

      <View style={[styles.content, { paddingTop: insets.top + 8, paddingBottom: insets.bottom + 20 }]}>
        <Animated.View entering={FadeIn.duration(400)} style={styles.topBar}>
          <Pressable onPress={goBack} hitSlop={10} style={styles.back} accessibilityLabel={tr('common.goBack')}>
            <Ionicons name="arrow-back" size={22} color={t.text} />
          </Pressable>
        </Animated.View>

        <Animated.View entering={ZoomIn.delay(100).springify().damping(12)} style={styles.logo}>
          <Logo size={22} />
        </Animated.View>

        <Animated.Text entering={FadeInDown.delay(220).duration(600)} style={styles.welcome}>
          {tr('verify.welcome')}<Text style={styles.welcomeName}>{firstName}</Text>
        </Animated.Text>
        <Animated.Text entering={FadeInDown.delay(320).duration(600)} style={styles.title}>
          {tr('verify.title')}
        </Animated.Text>
        <Animated.Text entering={FadeInDown.delay(420).duration(600)} style={styles.body}>
          {tr('verify.sentTo')}
          <Text style={styles.bold}>{email ?? tr('verify.yourInbox')}</Text>
          {tr('verify.openIt')}
          <Text style={styles.bold}>{tr('verify.button')}</Text>
          {tr('verify.after')}
        </Animated.Text>

        {/* IMAGE SLOT */}
        <Animated.View entering={FadeIn.delay(500).duration(800)} style={styles.illustrationArea}>
          <Animated.View style={[styles.blob, blobStyle]} />
          <Sparkle top="10%" left="14%" delay={0} color={colors.blue} />
          <Sparkle top="4%" left="76%" delay={500} color={colors.orange} size={10} />
          <Sparkle top="58%" left="88%" delay={900} color={colors.blue} size={8} />
          <Sparkle top="66%" left="6%" delay={1300} color={colors.orange} size={9} />

          <Animated.View style={[styles.illustration, illustrationStyle]}>
            {VERIFY_IMAGE ? (
              <Image source={VERIFY_IMAGE} style={styles.image} contentFit="contain" transition={300} />
            ) : (
              <MailBadge />
            )}
          </Animated.View>
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(600).duration(500)} style={styles.tip}>
          <Ionicons name="alert-circle-outline" size={16} color={colors.orange} />
          <Text style={styles.tipText}>
            {tr('verify.tip')}
            <Text style={styles.bold}>{tr('verify.spam')}</Text>
            {tr('verify.folder')}
          </Text>
        </Animated.View>

        {sentAgain ? (
          <Animated.View key={sentAgain} entering={FadeInDown.springify().damping(16)} exiting={FadeOut} style={styles.sent}>
            <Ionicons name="checkmark-circle" size={18} color={t.success} />
            <Text style={styles.sentText}>{tr('verify.sentAgain')}</Text>
          </Animated.View>
        ) : null}

        <Animated.View entering={FadeInUp.delay(720).duration(600)} style={styles.actions}>
          <PrimaryButton label={tr('verify.goToLogin')} shimmer onPress={goToLogin} />

          <View style={styles.resendRow}>
            <Text style={styles.resendText}>{tr('verify.noEmail')}</Text>
            {sending ? (
              <ActivityIndicator size="small" color={colors.blue} />
            ) : cooldown > 0 ? (
              <Animated.Text key="wait" entering={FadeIn} style={styles.resendWait}>
                {tr('verify.resendIn', { time: timer })}
              </Animated.Text>
            ) : (
              <Animated.View key="ready" entering={ZoomIn.springify().damping(12)}>
                <Pressable onPress={resend} hitSlop={8} accessibilityRole="button">
                  {({ pressed }) => (
                    <Text style={[styles.resendLink, pressed && styles.pressed]}>{tr('verify.resend')}</Text>
                  )}
                </Pressable>
              </Animated.View>
            )}
          </View>
        </Animated.View>
      </View>
    </View>
  );
}

/** Animated envelope shown until a custom image is added. */
function MailBadge() {
  const styles = useStyles(makeStyles);
  const reduceMotion = useReducedMotion();
  const ring = useSharedValue(0);

  useEffect(() => {
    if (reduceMotion) return;
    ring.set(withRepeat(withTiming(1, { duration: 2200, easing: Easing.out(Easing.quad) }), -1, false));
  }, [ring, reduceMotion]);

  const ringA = useAnimatedStyle(() => ({
    opacity: interpolate(ring.value, [0, 1], [0.5, 0]),
    transform: [{ scale: interpolate(ring.value, [0, 1], [1, 1.7]) }],
  }));
  const ringB = useAnimatedStyle(() => {
    const t = (ring.value + 0.5) % 1;
    return {
      opacity: interpolate(t, [0, 1], [0.5, 0]),
      transform: [{ scale: interpolate(t, [0, 1], [1, 1.7]) }],
    };
  });

  return (
    <View style={styles.badgeWrap}>
      <Animated.View style={[styles.ring, ringA]} />
      <Animated.View style={[styles.ring, ringB]} />
      <Animated.View entering={ZoomIn.delay(400).springify().damping(10)} style={styles.badge}>
        <Ionicons name="mail-open" size={44} color={colors.white} />
      </Animated.View>
      <Animated.View entering={ZoomIn.delay(900).springify().damping(8)} style={styles.badgeDot}>
        <Text style={styles.badgeDotText}>1</Text>
      </Animated.View>
      <Animated.View entering={FadeIn.delay(1100).duration(600)} style={styles.plane}>
        <PaperPlane />
      </Animated.View>
    </View>
  );
}

function PaperPlane() {
  const drift = useFloat(1800, 200);
  const style = useAnimatedStyle(() => ({
    transform: [
      { translateX: interpolate(drift.value, [0, 1], [0, 8]) },
      { translateY: interpolate(drift.value, [0, 1], [0, -6]) },
      { rotate: '-20deg' },
    ],
  }));
  return (
    <Animated.View style={style}>
      <Ionicons name="paper-plane" size={22} color={colors.blue} />
    </Animated.View>
  );
}

const makeStyles = (t: Theme) =>
  StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: t.surface,
  },
  pressed: {
    opacity: 0.6,
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
    borderRadius: 7,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: t.surfaceAlt,
  },
  logo: {
    alignSelf: 'center',
    marginTop: 4,
  },
  welcome: {
    fontFamily: 'Lexend_400Regular',
    fontSize: 16,
    color: t.textBody,
    textAlign: 'center',
    marginTop: 22,
  },
  welcomeName: {
    fontFamily: 'Lexend_700Bold',
    color: colors.orange,
  },
  title: {
    fontFamily: 'Lexend_700Bold',
    fontSize: 28,
    lineHeight: 36,
    color: t.text,
    textAlign: 'center',
    marginTop: 6,
  },
  body: {
    fontFamily: 'Lexend_400Regular',
    fontSize: 14,
    lineHeight: 22,
    color: t.textBody,
    textAlign: 'center',
    marginTop: 10,
    paddingHorizontal: 4,
  },
  bold: {
    fontFamily: 'Lexend_700Bold',
    color: t.text,
  },
  illustrationArea: {
    flex: 1,
    minHeight: 170,
    maxHeight: 260,
    marginVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  blob: {
    position: 'absolute',
    bottom: '8%',
    width: '80%',
    height: '42%',
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
  badgeWrap: {
    width: 150,
    height: 150,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ring: {
    position: 'absolute',
    width: 104,
    height: 104,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: colors.orange,
  },
  badge: {
    width: 104,
    height: 104,
    borderRadius: 7,
    backgroundColor: colors.orange,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.orange,
    shadowOpacity: 0.4,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 8,
  },
  badgeDot: {
    position: 'absolute',
    top: 22,
    right: 26,
    width: 28,
    height: 28,
    borderRadius: 7,
    backgroundColor: colors.blue,
    borderWidth: 3,
    borderColor: t.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeDotText: {
    fontFamily: 'Lexend_700Bold',
    fontSize: 12,
    color: colors.white,
  },
  plane: {
    position: 'absolute',
    bottom: 18,
    left: 4,
  },
  tip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    alignSelf: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 7,
    backgroundColor: 'rgba(237,99,60,0.08)',
    marginBottom: 14,
  },
  tipText: {
    flexShrink: 1,
    fontFamily: 'Lexend_400Regular',
    fontSize: 12,
    color: t.textBody,
  },
  sent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 10,
    borderRadius: 7,
    backgroundColor: 'rgba(34,160,107,0.1)',
    marginBottom: 14,
  },
  sentText: {
    fontFamily: 'Lexend_700Bold',
    fontSize: 13,
    color: t.successText,
  },
  actions: {
    gap: 18,
  },
  resendRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    flexWrap: 'wrap',
    minHeight: 22,
  },
  resendText: {
    fontFamily: 'Lexend_400Regular',
    fontSize: 14,
    color: t.textBody,
  },
  resendWait: {
    fontFamily: 'Lexend_700Bold',
    fontSize: 14,
    color: t.textMuted,
  },
  resendLink: {
    fontFamily: 'Lexend_700Bold',
    fontSize: 14,
    color: colors.blue,
  },
});
