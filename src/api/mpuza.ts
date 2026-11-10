import { api } from '@/api/client';
import { API_ROOT } from '@/api/config';
import type { ApiJob } from '@/api/mapJob';

export type SignInResult = {
  id: string;
  firstname: string;
  lastname: string;
  email: string;
  token: string;
};

type FeedPayload = { jobs?: ApiJob[]; cold_start?: boolean };
type Ad = { id: string; name: string; caption: string; image: string };
type ReactionMap = Record<string, { likes: number; dislikes: number; myReaction: 'like' | 'dislike' | null }>;

export function imageUrl(path?: string | null) {
  if (!path) return '';
  if (/^https?:\/\//i.test(path)) return path;
  return `${API_ROOT}/profile/profiles?p=${encodeURIComponent(path.replace(/\\/g, '/'))}`;
}

export async function listActiveJobs() {
  const body = await api<ApiJob[]>('/jobs?limit=24&page=0', { auth: false });
  const rows = body.data;
  return Array.isArray(rows) ? rows : [];
}

export async function suggestJobs(query: string) {
  const body = await api<{ suggestions?: { text: string; type?: string; jobId?: string; company?: string }[] }>(
    `/jobs/suggestions?q=${encodeURIComponent(query)}&limit=8`,
    { auth: false },
  );
  return body.data?.suggestions ?? [];
}

export async function getJobDetails(id: string) {
  const body = await api<ApiJob>(`/jobs/${encodeURIComponent(id)}`);
  return body.data ?? null;
}

export async function signUpAccount(input: { firstname: string; lastname: string; email: string; password: string }) {
  await api('/auth/signup', { method: 'POST', auth: false, body: JSON.stringify(input) });
}

export async function resendVerificationEmail(email: string) {
  await api(`/auth/email-verification/${encodeURIComponent(email)}`, { auth: false });
}

export async function confirmEmail(token: string) {
  await api(`/auth/confirm/${encodeURIComponent(token)}`, { auth: false });
}

export async function signInAccount(email: string, password: string) {
  const body = await api<SignInResult>('/auth/signin', {
    method: 'POST',
    auth: false,
    body: JSON.stringify({ email, password }),
  });
  if (!body.data?.token) throw new Error('Sign in did not return a session.');
  return body.data;
}

export async function forgotPassword(email: string) {
  await api(`/auth/forgot-password/${encodeURIComponent(email)}`, { auth: false });
}

export async function getForYouFeed() {
  const body = await api<FeedPayload>('/feed?top_n=50&page=1');
  return body.data?.jobs ?? [];
}

export async function getCategoryJobs(category: string) {
  const keywords = category.toLowerCase();
  const query = new URLSearchParams({ ml: 'false', category, keywords, semantic: 'true' });
  const body = await api<ApiJob[]>(`/jobs/all/with-stars?${query.toString()}`);
  return body.data ?? [];
}

export async function listFavorites(userId: string) {
  const body = await api<ApiJob[]>(`/jobs/favorites/${encodeURIComponent(userId)}`);
  return body.data ?? [];
}

export async function toggleStar(jobId: string) {
  await api(`/jobs/star/${encodeURIComponent(jobId)}`, { method: 'PATCH' });
}

export async function startApplication(jobId: string) {
  const body = await api<{ alreadySubmitted?: boolean; canApply?: boolean }>(
    `/jobs/${encodeURIComponent(jobId)}/application-start`,
    { method: 'POST' },
  );
  return body.data ?? {};
}

export async function submitApplication(jobId: string) {
  await api(`/jobs/${encodeURIComponent(jobId)}/apply`, { method: 'POST', body: JSON.stringify({}) });
}

export async function listAdvertisements() {
  const body = await api<Ad[]>('/advertisements', { auth: false });
  return body.data ?? [];
}

export async function getAdReactions(ids: string[]) {
  if (!ids.length) return {} as ReactionMap;
  const query = new URLSearchParams({ targetType: 'home_ad', targetIds: ids.join(',') });
  const body = await api<ReactionMap>(`/reactions?${query.toString()}`);
  return body.data ?? {};
}

export async function setAdReaction(targetId: string, reaction: 'like' | 'dislike') {
  await api('/reactions', {
    method: 'POST',
    body: JSON.stringify({ targetType: 'home_ad', targetId, reaction }),
  });
}
