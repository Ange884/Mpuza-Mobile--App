import AsyncStorage from '@react-native-async-storage/async-storage';

import { TOKEN_KEY } from '@/api/config';

export type SessionUser = {
  id: string;
  name: string;
  email: string;
};

type JwtPayload = {
  id?: string;
  firstname?: string;
  lastname?: string;
  email?: string;
  exp?: number;
};

function decodePayload(token: string): JwtPayload | null {
  try {
    const segment = token.split('.')[1];
    if (!segment) return null;
    const padded = segment.replace(/-/g, '+').replace(/_/g, '/').padEnd(Math.ceil(segment.length / 4) * 4, '=');
    const json = globalThis.atob(padded);
    return JSON.parse(json) as JwtPayload;
  } catch {
    return null;
  }
}

export function userFromToken(token: string): SessionUser | null {
  const payload = decodePayload(token);
  if (!payload?.id || !payload.email) return null;
  if (payload.exp && payload.exp * 1000 < Date.now()) return null;
  const name = [payload.firstname, payload.lastname].filter(Boolean).join(' ').trim();
  return { id: payload.id, name: name || payload.email.split('@')[0], email: payload.email };
}

export async function getToken() {
  return AsyncStorage.getItem(TOKEN_KEY);
}

export async function saveToken(token: string) {
  await AsyncStorage.setItem(TOKEN_KEY, token);
}

export async function clearToken() {
  await AsyncStorage.removeItem(TOKEN_KEY);
}
