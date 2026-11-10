import { Redirect, useLocalSearchParams } from 'expo-router';

import { readOAuthResult } from '@/api/googleAuth';
import { OAuthReturn } from '@/components/auth/OAuthReturn';

export default function Index() {
  const params = useLocalSearchParams();
  if (readOAuthResult(params)) return <OAuthReturn />;
  return <Redirect href="/loading" />;
}
