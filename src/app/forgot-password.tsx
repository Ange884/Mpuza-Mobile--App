import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  FadeIn,
  FadeInDown,
  FadeOut,
  interpolate,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withTiming,
  ZoomIn,
} from 'react-native-reanimated';

import { AuthInput } from '@/components/auth/AuthInput';
import { AuthLayout, SwitchLink } from '@/components/auth/AuthLayout';
import { EMAIL_PATTERN } from '@/components/auth/finishAuth';
import { PrimaryButton } from '@/components/auth/PrimaryButton';
import { useAuth } from '@/context/auth';
import { useI18n } from '@/i18n';
import { useStyles, useTheme, type Theme } from '@/theme';

const RESEND_COOLDOWN = 30;

/** Two steps on one screen: enter email → "check your email" with resend timer. */
export default function ForgotPassword() {
  const styles = useStyles(makeStyles);
  const { tr } = useI18n();
  const { requestPasswordReset } = useAuth();
  const params = useLocalSearchParams<{ email?: string }>();

  const [email, setEmail] = useState(params.email ?? '');
  const [error, setError] = useState<string>();
  const [attempt, setAttempt] = useState(0);
  const [status, setStatus] = useState<'idle' | 'loading' | 'sent'>('idle');
  const [cooldown, setCooldown] = useState(0);
  const [resending, setResending] = useState(false);
  const [sentAgain, setSentAgain] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  useEffect(() => {
    if (!sentAgain) return;
    const timer = setTimeout(() => setSentAgain(0), 3500);
    return () => clearTimeout(timer);
  }, [sentAgain]);

  async function send() {
    if (!EMAIL_PATTERN.test(email.trim())) {
      setError(tr('signup.errEmail'));
      setAttempt((n) => n + 1);
      return;
    }
    setStatus('loading');
    await requestPasswordReset(email.trim());
    setStatus('sent');
    setCooldown(RESEND_COOLDOWN);
  }

  async function resend() {
    if (resending || cooldown > 0) return;
    setResending(true);
    try {
      await requestPasswordReset(email.trim());
      setSentAgain((n) => n + 1);
      setCooldown(RESEND_COOLDOWN);
    } finally {
      setResending(false);
    }
  }

  const backToLogin = () => router.replace({ pathname: '/login', params: { email: email.trim() } });
  const timer = `0:${String(cooldown).padStart(2, '0')}`;

  if (status === 'sent') {
    return (
      <AuthLayout
        screenTitle={tr('forgot.screenTitle')}
        heading={tr('forgot.sentTitle')}
        subtitle=""
        footer={null}>
        <Animated.View entering={FadeIn.duration(400)} style={styles.sent}>
          <KeyBadge />
          <Animated.Text entering={FadeInDown.delay(200).duration(500)} style={styles.sentText}>
            {tr('forgot.sentBefore')}
            <Text style={styles.bold}>{email.trim()}</Text>
            {tr('forgot.sentAfter')}
          </Animated.Text>
          <Animated.View entering={FadeInDown.delay(320).duration(500)} style={styles.tip}>
            <Ionicons name="time-outline" size={16} color="#ed633c" />
            <Text style={styles.tipText}>{tr('forgot.tip')}</Text>
          </Animated.View>
        </Animated.View>

        {sentAgain ? (
          <Animated.View key={sentAgain} entering={FadeInDown.springify().damping(16)} exiting={FadeOut} style={styles.sentAgain}>
            <Ionicons name="checkmark-circle" size={18} color="#22a06b" />
            <Text style={styles.sentAgainText}>{tr('forgot.sentAgain')}</Text>
          </Animated.View>
        ) : null}

        <Animated.View entering={FadeInDown.delay(420).duration(500)} style={styles.actions}>
          <PrimaryButton label={tr('forgot.backToLogin')} shimmer onPress={backToLogin} />
          <View style={styles.resendRow}>
            <Text style={styles.resendText}>{tr('forgot.noEmail')}</Text>
            {resending ? (
              <ActivityIndicator size="small" color="#35a8df" />
            ) : cooldown > 0 ? (
              <Animated.Text key="wait" entering={FadeIn} style={styles.resendWait}>
                {tr('forgot.resendIn', { time: timer })}
              </Animated.Text>
            ) : (
              <Animated.View key="ready" entering={ZoomIn.springify().damping(12)}>
                <Pressable onPress={resend} hitSlop={8} accessibilityRole="button">
                  <Text style={styles.resendLink}>{tr('forgot.resend')}</Text>
                </Pressable>
              </Animated.View>
            )}
          </View>
        </Animated.View>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      screenTitle={tr('forgot.screenTitle')}
      heading={tr('forgot.heading')}
      subtitle={tr('forgot.subtitle')}
      footer={<SwitchLink text={tr('forgot.remembered')} link={tr('common.signIn')} onPress={backToLogin} />}>
      <Animated.View entering={FadeInDown.delay(280).duration(500)}>
        <AuthInput
          label={tr('forgot.email')}
          icon="mail-outline"
          placeholder={tr('signup.emailPlaceholder')}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete="email"
          textContentType="emailAddress"
          returnKeyType="send"
          onSubmitEditing={send}
          value={email}
          onChangeText={(value) => {
            setEmail(value);
            if (error) setError(undefined);
          }}
          valid={EMAIL_PATTERN.test(email.trim())}
          error={error}
          shakeKey={attempt}
        />
      </Animated.View>
      <Animated.View entering={FadeInDown.delay(360).duration(500)} style={styles.button}>
        <PrimaryButton label={tr('forgot.send')} onPress={send} loading={status === 'loading'} />
      </Animated.View>
    </AuthLayout>
  );
}

/** Orange key badge with pulsing ring. */
function KeyBadge() {
  const t = useTheme();
  const styles = useStyles(makeStyles);
  const reduceMotion = useReducedMotion();
  const ring = useSharedValue(0);

  useEffect(() => {
    if (reduceMotion) return;
    ring.set(withRepeat(withTiming(1, { duration: 2000, easing: Easing.out(Easing.quad) }), -1, false));
  }, [ring, reduceMotion]);

  const ringStyle = useAnimatedStyle(() => ({
    opacity: interpolate(ring.value, [0, 1], [0.5, 0]),
    transform: [{ scale: interpolate(ring.value, [0, 1], [1, 1.6]) }],
  }));

  return (
    <View style={styles.badgeWrap}>
      <Animated.View style={[styles.ring, { borderColor: t.orange }, ringStyle]} />
      <Animated.View entering={ZoomIn.delay(150).springify().damping(10)} style={[styles.badge, { backgroundColor: t.orange }]}>
        <Ionicons name="key" size={36} color="#fff" />
      </Animated.View>
    </View>
  );
}

const makeStyles = (t: Theme) =>
  StyleSheet.create({
    button: {
      marginTop: 6,
    },
    sent: {
      alignItems: 'center',
    },
    badgeWrap: {
      width: 120,
      height: 120,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 16,
    },
    ring: {
      position: 'absolute',
      width: 88,
      height: 88,
      borderRadius: 44,
      borderWidth: 2,
    },
    badge: {
      width: 88,
      height: 88,
      borderRadius: 44,
      alignItems: 'center',
      justifyContent: 'center',
    },
    sentText: {
      fontFamily: 'Lexend_400Regular',
      fontSize: 15,
      lineHeight: 23,
      color: t.textBody,
      textAlign: 'center',
    },
    bold: {
      fontFamily: 'Lexend_700Bold',
      color: t.text,
    },
    tip: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      marginTop: 18,
      paddingHorizontal: 14,
      paddingVertical: 10,
      borderRadius: 14,
      backgroundColor: 'rgba(237,99,60,0.1)',
    },
    tipText: {
      flexShrink: 1,
      fontFamily: 'Lexend_400Regular',
      fontSize: 12,
      color: t.textBody,
    },
    sentAgain: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      paddingVertical: 10,
      borderRadius: 12,
      backgroundColor: 'rgba(34,160,107,0.12)',
      marginTop: 18,
    },
    sentAgainText: {
      fontFamily: 'Lexend_700Bold',
      fontSize: 13,
      color: t.successText,
    },
    actions: {
      gap: 18,
      marginTop: 28,
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
      color: t.textMuted,
    },
    resendWait: {
      fontFamily: 'Lexend_700Bold',
      fontSize: 14,
      color: t.textFaint,
    },
    resendLink: {
      fontFamily: 'Lexend_700Bold',
      fontSize: 14,
      color: t.blue,
    },
  });
