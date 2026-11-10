import * as Linking from 'expo-linking';
import { Platform } from 'react-native';

import { GOOGLE_AUTH_URL } from '@/api/config';

export type OAuthResult =
  | { ok: true; token: string; created: boolean }
  | { ok: false; message: string; code?: string };

function text(value: unknown) {
  const raw = Array.isArray(value) ? value[0] : value;
  if (typeof raw === 'number') return String(raw);
  if (typeof raw !== 'string') return undefined;
  const trimmed = raw.trim().replace(/\+/g, ' ');
  return trimmed.length ? trimmed : undefined;
}

/** Reads the query the API appends after Google: token, status, msg, code. */
export function readOAuthResult(params: Record<string, unknown> | null | undefined): OAuthResult | null {
  if (!params) return null;
  const token = text(params.token);
  const status = text(params.status);
  const msg = text(params.msg);
  const code = text(params.code);
  if (!token && !status && !msg && !code) return null;

  const numeric = Number(status);
  if (token && (!status || numeric === 200 || numeric === 201)) {
    return { ok: true, token, created: numeric === 201 };
  }
  return { ok: false, message: msg || 'Google sign-in could not be completed.', code };
}

function openOnWeb(url: string) {
  if (typeof window === 'undefined') return;
  try {
    if (window.top && window.top !== window) {
      window.top.location.assign(url);
      return;
    }
  } catch {
    const opened = window.open(url, '_blank', 'noopener,noreferrer');
    if (opened) return;
  }
  window.location.assign(url);
}

/** The API answers with a redirect. Follow it only when the browser exposes Location. */
async function googlePageUrl() {
  try {
    const response = await fetch(GOOGLE_AUTH_URL, { method: 'GET', redirect: 'manual' });
    const location = response.headers.get('Location') ?? response.headers.get('location');
    if (location?.startsWith('https://accounts.google.com/')) return location;
  } catch {
    // The phone browser can follow the short API link itself.
  }
  return GOOGLE_AUTH_URL;
}

/**
 * Starts AU-09 in the real browser.
 * The in-app auth sheet on iPhone turns this same link into Google's 400 page.
 */
export async function startGoogleSignIn(): Promise<OAuthResult | 'left' | null> {
  if (Platform.OS === 'web') {
    openOnWeb(GOOGLE_AUTH_URL);
    return 'left';
  }

  const url = await googlePageUrl();
  await Linking.openURL(url);
  return 'left';
}
