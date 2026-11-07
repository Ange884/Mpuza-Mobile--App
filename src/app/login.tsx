import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import Animated, { FadeInDown, FadeOut } from 'react-native-reanimated';

import { AuthInput } from '@/components/auth/AuthInput';
import { AuthLayout, OrDivider, SwitchLink } from '@/components/auth/AuthLayout';
import { finishAuth } from '@/components/auth/finishAuth';
import { PrimaryButton } from '@/components/auth/PrimaryButton';
import { colors } from '@/constants/colors';
import { useAuth } from '@/context/auth';
import { useStyles, type Theme } from '@/theme';
import { useI18n } from '@/i18n';

type Errors = { username?: string; password?: string; form?: string };

export default function Login() {
  const { tr } = useI18n();
  const styles = useStyles(makeStyles);
  const { signIn } = useAuth();
  const { job, email } = useLocalSearchParams<{ job?: string; email?: string }>();

  const [username, setUsername] = useState(email ?? '');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<Errors>({});
  const [attempt, setAttempt] = useState(0);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success'>('idle');
  const [notice, setNotice] = useState<string | null>(null);

  async function submit() {
    const next: Errors = {};
    if (username.trim().length < 3) next.username = tr('login.errUsername');
    if (password.length < 6) next.password = tr('login.errPassword');
    setErrors(next);
    setNotice(null);
    if (next.username || next.password) {
      setAttempt((n) => n + 1);
      return;
    }

    setStatus('loading');
    try {
      await signIn(username.trim(), password);
      setStatus('success');
      setTimeout(finishAuth, 650);
    } catch (error) {
      setStatus('idle');
      setErrors({ form: error instanceof Error ? error.message : tr('common.somethingWrong') });
      setAttempt((n) => n + 1);
    }
  }

  const enter = (i: number) => FadeInDown.delay(280 + i * 80).duration(500);

  return (
    <AuthLayout
      screenTitle={tr('common.signIn')}
      heading={tr('login.heading')}
      subtitle={tr('login.subtitle')}
      footer={
        <SwitchLink
          text={tr('login.noAccount')}
          link={tr('login.createOne')}
          onPress={() => router.replace({ pathname: '/signup', params: job ? { job } : undefined })}
        />
      }>
      <Animated.View entering={enter(0)}>
        <AuthInput
          label={tr('login.username')}
          icon="person-outline"
          placeholder={tr('login.usernamePlaceholder')}
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete="username"
          textContentType="username"
          returnKeyType="next"
          value={username}
          onChangeText={(value) => {
            setUsername(value);
            if (errors.username) setErrors((e) => ({ ...e, username: undefined }));
          }}
          error={errors.username}
          shakeKey={attempt}
        />
      </Animated.View>

      <Animated.View entering={enter(1)}>
        <AuthInput
          label={tr('login.password')}
          placeholder={tr('login.passwordPlaceholder')}
          password
          autoComplete="password"
          textContentType="password"
          returnKeyType="go"
          onSubmitEditing={submit}
          value={password}
          onChangeText={(value) => {
            setPassword(value);
            if (errors.password) setErrors((e) => ({ ...e, password: undefined }));
          }}
          error={errors.password}
          shakeKey={attempt}
        />
      </Animated.View>

      <Animated.View entering={enter(2)}>
        <Pressable
          onPress={() =>
            router.push({ pathname: '/forgot-password', params: username.includes('@') ? { email: username.trim() } : undefined })
          }
          hitSlop={8}
          style={styles.forgot}>
          {({ pressed }) => <Text style={[styles.forgotText, pressed && styles.pressed]}>{tr('login.forgot')}</Text>}
        </Pressable>
      </Animated.View>

      {errors.form ? (
        <Animated.View entering={FadeInDown.duration(250)} exiting={FadeOut} style={styles.formError}>
          <Ionicons name="alert-circle" size={16} color="#c73a3f" />
          <Text style={styles.formErrorText}>{errors.form}</Text>
        </Animated.View>
      ) : null}

      <Animated.View entering={enter(3)}>
        <PrimaryButton
          label={tr('common.signIn')}
          onPress={submit}
          loading={status === 'loading'}
          success={status === 'success'}
        />
      </Animated.View>

      <Animated.View entering={enter(4)}>
        <OrDivider />
        <PrimaryButton
          label={tr('login.google')}
          variant="google"
          onPress={() => setNotice(tr('login.googleSoon'))}
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

const makeStyles = (t: Theme) =>
  StyleSheet.create({
  pressed: {
    opacity: 0.6,
  },
  forgot: {
    alignSelf: 'flex-start',
    marginTop: -6,
    marginBottom: 26,
  },
  forgotText: {
    fontFamily: 'Lexend_700Bold',
    fontSize: 13,
    color: colors.blue,
  },
  formError: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(229,72,77,0.08)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 14,
  },
  formErrorText: {
    flex: 1,
    fontFamily: 'Lexend_400Regular',
    fontSize: 13,
    color: '#c73a3f',
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
