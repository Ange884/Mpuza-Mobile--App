import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn, FadeInDown, FadeOut, ZoomIn } from 'react-native-reanimated';

import { AuthInput } from '@/components/auth/AuthInput';
import { AuthShowcase } from '@/components/auth/AuthShowcase';
import { SwitchLink } from '@/components/auth/AuthLayout';
import { EMAIL_PATTERN } from '@/components/auth/finishAuth';
import { PrimaryButton } from '@/components/auth/PrimaryButton';
import { colors } from '@/constants/colors';
import { useAuth } from '@/context/auth';
import { useI18n } from '@/i18n';
import { useStyles, useTheme, type Theme } from '@/theme';

const RESEND_COOLDOWN = 30;

/** Enter email → “check your email” confirmation, same shell as login / sign-up. */
export default function ForgotPassword() {
  const styles = useStyles(makeStyles);
  const t = useTheme();
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

  const slides = [
    { title: tr('login.slide0Title'), text: tr('login.slide0Text') },
    { title: tr('login.slide1Title'), text: tr('login.slide1Text') },
    { title: tr('login.slide2Title'), text: tr('login.slide2Text') },
  ];

  const enter = (i: number) => FadeInDown.delay(280 + i * 80).duration(500);

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
      <AuthShowcase
        kicker={tr('forgot.sentKicker')}
        accent={tr('forgot.sentAccent')}
        subtitle={tr('forgot.sentSubtitle')}
        slides={slides}
        footer={null}>
        <Animated.View entering={enter(0)} style={styles.sentCard}>
          <View style={styles.mailBadge}>
            <Ionicons name="mail-open-outline" size={22} color={colors.orange} />
          </View>
          <Text style={styles.sentText}>
            {tr('forgot.sentBefore')}
            <Text style={styles.bold}>{email.trim()}</Text>
            {tr('forgot.sentAfter')}
          </Text>
          <View style={styles.tip}>
            <Ionicons name="time-outline" size={16} color={colors.orange} />
            <Text style={styles.tipText}>{tr('forgot.tip')}</Text>
          </View>
        </Animated.View>

        {sentAgain ? (
          <Animated.View key={sentAgain} entering={FadeInDown.springify().damping(16)} exiting={FadeOut} style={styles.sentAgain}>
            <Ionicons name="checkmark-circle" size={18} color={t.successText} />
            <Text style={styles.sentAgainText}>{tr('forgot.sentAgain')}</Text>
          </Animated.View>
        ) : null}

        <Animated.View entering={enter(1)}>
          <PrimaryButton pill arrow label={tr('forgot.backToLogin')} shimmer onPress={backToLogin} />
        </Animated.View>

        <Animated.View entering={enter(2)} style={styles.resendRow}>
          <Text style={styles.resendText}>{tr('forgot.noEmail')}</Text>
          {resending ? (
            <ActivityIndicator size="small" color={colors.blue} />
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
        </Animated.View>
      </AuthShowcase>
    );
  }

  return (
    <AuthShowcase
      kicker={tr('forgot.kicker')}
      accent={tr('forgot.accent')}
      subtitle={tr('forgot.subtitle')}
      slides={slides}
      footer={<SwitchLink text={tr('forgot.remembered')} link={tr('common.signIn')} onPress={backToLogin} />}>
      <Animated.View entering={enter(0)}>
        <AuthInput
          pill
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
      <Animated.View entering={enter(1)}>
        <PrimaryButton pill arrow label={tr('forgot.send')} onPress={send} loading={status === 'loading'} />
      </Animated.View>
    </AuthShowcase>
  );
}

const makeStyles = (t: Theme) =>
  StyleSheet.create({
    sentCard: {
      alignItems: 'center',
      paddingHorizontal: 8,
      paddingVertical: 6,
      marginBottom: 4,
    },
    mailBadge: {
      width: 52,
      height: 52,
      borderRadius: 7,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'rgba(237,99,60,0.12)',
      marginBottom: 14,
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
      marginTop: 16,
      paddingHorizontal: 14,
      paddingVertical: 10,
      borderRadius: 7,
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
      paddingHorizontal: 12,
      borderRadius: 7,
      backgroundColor: 'rgba(34,160,107,0.12)',
      marginBottom: 12,
    },
    sentAgainText: {
      fontFamily: 'Lexend_700Bold',
      fontSize: 13,
      color: t.successText,
    },
    resendRow: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      flexWrap: 'wrap',
      minHeight: 28,
      marginTop: 16,
      gap: 4,
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
      color: colors.blue,
    },
  });
