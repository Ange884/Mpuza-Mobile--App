import { router } from 'expo-router';

/** After a successful login/sign-up: clear the auth screens from history and open Home. */
export function finishAuth() {
  if (router.canDismiss()) router.dismissAll();
  router.replace('/home');
}

export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
