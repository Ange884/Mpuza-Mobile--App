import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useRef } from 'react';
import { ActivityIndicator, View } from 'react-native';

import { readOAuthResult } from '@/api/googleAuth';
import { finishAuth } from '@/components/auth/finishAuth';
import { colors } from '@/constants/colors';
import { useAuth } from '@/context/auth';
import { useI18n } from '@/i18n';
import { useTheme } from '@/theme';

/** Stores the Google session when the API redirects back into this app. */
export function OAuthReturn() {
  const params = useLocalSearchParams();
  const { adoptToken } = useAuth();
  const { tr } = useI18n();
  const t = useTheme();
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    const result = readOAuthResult(params);
    if (!result) return;
    started.current = true;

    if (!result.ok) {
      router.replace({ pathname: '/login', params: { notice: result.message } });
      return;
    }

    adoptToken(result.token)
      .then(() => finishAuth())
      .catch(() => router.replace({ pathname: '/login', params: { notice: tr('common.somethingWrong') } }));
  }, [adoptToken, params, tr]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!started.current) router.replace('/login');
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: t.bg }}>
      <ActivityIndicator size="large" color={colors.dblue} />
    </View>
  );
}
