import { useState } from 'react';

import { startGoogleSignIn } from '@/api/googleAuth';
import { finishAuth } from '@/components/auth/finishAuth';
import { useAuth } from '@/context/auth';
import { useI18n } from '@/i18n';

/** Same Google flow for sign-in and sign-up. The server creates the account on first use. */
export function useGoogleSignIn(onMessage: (message: string | null) => void) {
  const { adoptToken } = useAuth();
  const { tr } = useI18n();
  const [googleBusy, setGoogleBusy] = useState(false);

  async function continueWithGoogle() {
    if (googleBusy) return;
    setGoogleBusy(true);
    onMessage(null);
    try {
      const result = await startGoogleSignIn();
      if (result === 'left' || !result) {
        if (!result) onMessage(tr('auth.googleAway'));
        return;
      }
      if (!result.ok) {
        onMessage(result.message);
        return;
      }
      await adoptToken(result.token);
      finishAuth();
    } catch (error) {
      onMessage(error instanceof Error ? error.message : tr('common.somethingWrong'));
    } finally {
      setGoogleBusy(false);
    }
  }

  return { continueWithGoogle, googleBusy };
}
