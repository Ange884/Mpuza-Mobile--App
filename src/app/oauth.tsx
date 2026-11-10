import { OAuthReturn } from '@/components/auth/OAuthReturn';

/** Deep-link target for a future server redirect: mobileapp://oauth?token= */
export default function OAuth() {
  return <OAuthReturn />;
}
