import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  FadeInDown,
  FadeOut,
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { AuthInput } from '@/components/auth/AuthInput';
import { AuthLayout, OrDivider, SwitchLink } from '@/components/auth/AuthLayout';
import { EMAIL_PATTERN } from '@/components/auth/finishAuth';
import { PrimaryButton } from '@/components/auth/PrimaryButton';
import { colors } from '@/constants/colors';
import { useAuth } from '@/context/auth';
import { useStyles, useTheme, type Theme } from '@/theme';
import { useI18n } from '@/i18n';
import type { TranslationKey } from '@/i18n/en';

type Field = 'name' | 'email' | 'password' | 'terms';
type Errors = Partial<Record<Field, string>>;

const STRENGTH: { key: TranslationKey; color: string }[] = [
  { key: 'signup.strength0', color: '#e5484d' },
  { key: 'signup.strength1', color: '#f0883e' },
  { key: 'signup.strength2', color: '#e8a317' },
  { key: 'signup.strength3', color: '#22a06b' },
];

function passwordScore(password: string) {
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  return Math.min(score, 4);
}

export default function Signup() {
  const { tr } = useI18n();
  const styles = useStyles(makeStyles);
  const { signUp } = useAuth();
  const { job } = useLocalSearchParams<{ job?: string }>();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const [attempt, setAttempt] = useState(0);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success'>('idle');
  const [notice, setNotice] = useState<string | null>(null);

  const nameValid = name.trim().split(/\s+/).length >= 2 && name.trim().length >= 4;
  const emailValid = EMAIL_PATTERN.test(email.trim());

  function update(field: Field, setter: (value: string) => void) {
    return (value: string) => {
      setter(value);
      if (errors[field]) setErrors((e) => ({ ...e, [field]: undefined }));
    };
  }

  async function submit() {
    const next: Errors = {};
    if (name.trim().length < 2) next.name = tr('signup.errName');
    if (!emailValid) next.email = tr('signup.errEmail');
    if (password.length < 8) next.password = tr('signup.errPassword');
    if (!agreed) next.terms = tr('signup.errTerms');
    setErrors(next);
    setNotice(null);
    if (Object.values(next).some(Boolean)) {
      setAttempt((n) => n + 1);
      return;
    }

    setStatus('loading');
    await signUp(name.trim(), email.trim(), password);
    setStatus('success');
    setTimeout(() => {
      router.replace({
        pathname: '/verify-email',
        params: { name: name.trim(), email: email.trim(), ...(job ? { job } : {}) },
      });
    }, 650);
  }

  const enter = (i: number) => FadeInDown.delay(280 + i * 80).duration(500);

  return (
    <AuthLayout
      screenTitle={tr('common.signUp')}
      heading={
        <>
          {tr('signup.heading')}<Text style={styles.brand}>MPUZA</Text>.
        </>
      }
      subtitle={tr('signup.subtitle')}
      footer={
        <SwitchLink
          text={tr('signup.haveAccount')}
          link={tr('common.signIn')}
          onPress={() => router.replace({ pathname: '/login', params: job ? { job } : undefined })}
        />
      }>
      <Animated.View entering={enter(0)}>
        <AuthInput
          label={tr('signup.fullName')}
          icon="person-outline"
          placeholder={tr('signup.fullNamePlaceholder')}
          autoComplete="name"
          textContentType="name"
          returnKeyType="next"
          value={name}
          onChangeText={update('name', setName)}
          valid={nameValid}
          error={errors.name}
          shakeKey={attempt}
        />
      </Animated.View>

      <Animated.View entering={enter(1)}>
        <AuthInput
          label={tr('signup.email')}
          icon="mail-outline"
          placeholder={tr('signup.emailPlaceholder')}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete="email"
          textContentType="emailAddress"
          returnKeyType="next"
          value={email}
          onChangeText={update('email', setEmail)}
          valid={emailValid}
          error={errors.email}
          shakeKey={attempt}
        />
      </Animated.View>

      <Animated.View entering={enter(2)}>
        <AuthInput
          label={tr('login.password')}
          placeholder={tr('signup.passwordPlaceholder')}
          password
          autoComplete="new-password"
          textContentType="newPassword"
          returnKeyType="done"
          value={password}
          onChangeText={update('password', setPassword)}
          error={errors.password}
          shakeKey={attempt}
        />
        {password.length > 0 && !errors.password && <StrengthMeter score={passwordScore(password)} />}
      </Animated.View>

      <Animated.View entering={enter(3)}>
        <Checkbox
          checked={agreed}
          error={!!errors.terms}
          onToggle={() => {
            setAgreed((value) => !value);
            if (errors.terms) setErrors((e) => ({ ...e, terms: undefined }));
          }}
        />
      </Animated.View>

      <Animated.View entering={enter(4)}>
        <PrimaryButton
          label={tr('common.signUp')}
          onPress={submit}
          loading={status === 'loading'}
          success={status === 'success'}
        />
      </Animated.View>

      <Animated.View entering={enter(5)}>
        <OrDivider />
        <PrimaryButton
          label={tr('signup.google')}
          variant="google"
          onPress={() => setNotice(tr('signup.googleSoon'))}
        />
      </Animated.View>

      {notice ? (
        <Animated.View key={notice} entering={FadeInDown.duration(250)} exiting={FadeOut} style={styles.notice}>
          <Ionicons name="information-circle" size={16} color={colors.blue} />
          <Text style={styles.noticeText}>{notice}</Text>
        </Animated.View>
      ) : null}
    </AuthLayout>
  );
}

function StrengthMeter({ score }: { score: number }) {
  const { tr } = useI18n();
  const styles = useStyles(makeStyles);
  const level = STRENGTH[Math.max(score - 1, 0)];
  return (
    <Animated.View entering={FadeInDown.duration(250)} style={styles.meter}>
      <View style={styles.meterBars}>
        {[0, 1, 2, 3].map((i) => (
          <MeterBar key={i} active={i < Math.max(score, 1)} color={level.color} />
        ))}
      </View>
      <Text style={[styles.meterLabel, { color: level.color }]}>{tr(level.key)}</Text>
    </Animated.View>
  );
}

function MeterBar({ active, color }: { active: boolean; color: string }) {
  const styles = useStyles(makeStyles);
  const fill = useSharedValue(active ? 1 : 0);
  useEffect(() => {
    fill.set(withTiming(active ? 1 : 0, { duration: 300 }));
  }, [active, fill]);

  const style = useAnimatedStyle(() => ({
    backgroundColor: color,
    transform: [{ scaleX: fill.value }],
  }));

  return (
    <View style={styles.meterTrack}>
      <Animated.View style={[styles.meterFill, style]} />
    </View>
  );
}

function Checkbox({ checked, error, onToggle }: { checked: boolean; error: boolean; onToggle: () => void }) {
  const { tr } = useI18n();
  const t = useTheme();
  const styles = useStyles(makeStyles);
  const progress = useSharedValue(checked ? 1 : 0);
  const pop = useSharedValue(1);
  const shake = useSharedValue(0);

  useEffect(() => {
    progress.set(withTiming(checked ? 1 : 0, { duration: 200 }));
    if (checked) pop.set(withSequence(withSpring(1.25, { damping: 6 }), withSpring(1)));
  }, [checked, progress, pop]);

  useEffect(() => {
    if (!error) return;
    shake.set(
      withSequence(
        withTiming(-6, { duration: 50 }),
        withTiming(6, { duration: 50 }),
        withTiming(-4, { duration: 50 }),
        withTiming(0, { duration: 50 })
      )
    );
  }, [error, shake]);

  const rowStyle = useAnimatedStyle(() => ({ transform: [{ translateX: shake.value }] }));
  const boxStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(progress.value, [0, 1], [t.surface, colors.orange]),
    borderColor: error ? t.danger : interpolateColor(progress.value, [0, 1], [t.border, colors.orange]),
    transform: [{ scale: pop.value }],
  }));
  const tickStyle = useAnimatedStyle(() => ({ opacity: progress.value, transform: [{ scale: progress.value }] }));

  return (
    <Animated.View style={rowStyle}>
      <Pressable
        style={styles.checkRow}
        onPress={onToggle}
        accessibilityRole="checkbox"
        accessibilityState={{ checked }}>
        <Animated.View style={[styles.checkbox, boxStyle]}>
          <Animated.View style={tickStyle}>
            <Ionicons name="checkmark" size={15} color={colors.white} />
          </Animated.View>
        </Animated.View>
        <Text style={[styles.checkText, error && styles.checkTextError]}>
          {tr('signup.agree')}
          <Text style={styles.checkLink}>{tr('signup.terms')}</Text>
          {tr('signup.and')}
          <Text style={styles.checkLink}>{tr('signup.privacy')}</Text>.
        </Text>
      </Pressable>
    </Animated.View>
  );
}

const makeStyles = (t: Theme) =>
  StyleSheet.create({
  brand: {
    color: colors.orange,
  },
  meter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: -8,
    marginBottom: 18,
  },
  meterBars: {
    flex: 1,
    flexDirection: 'row',
    gap: 6,
  },
  meterTrack: {
    flex: 1,
    height: 5,
    borderRadius: 3,
    backgroundColor: t.surfaceAlt,
    overflow: 'hidden',
  },
  meterFill: {
    flex: 1,
    transformOrigin: 'left',
  },
  meterLabel: {
    fontFamily: 'Lexend_700Bold',
    fontSize: 11,
    width: 60,
    textAlign: 'right',
  },
  checkRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginTop: 2,
    marginBottom: 26,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 7,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  checkText: {
    flex: 1,
    fontFamily: 'Lexend_400Regular',
    fontSize: 13,
    lineHeight: 19,
    color: t.textMuted,
  },
  checkTextError: {
    color: t.danger,
  },
  checkLink: {
    fontFamily: 'Lexend_700Bold',
    color: colors.blue,
  },
  notice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 14,
    padding: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(53,168,223,0.1)',
  },
  noticeText: {
    flex: 1,
    fontFamily: 'Lexend_400Regular',
    fontSize: 12,
    lineHeight: 18,
    color: t.text,
  },
});
