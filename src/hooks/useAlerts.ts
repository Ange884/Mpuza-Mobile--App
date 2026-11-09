import type { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';

import { colors } from '@/constants/colors';
import { useUserData } from '@/context/userdata';
import { feedJobs, matchScore } from '@/data/feed';
import { useI18n } from '@/i18n';

export type AlertKind = 'urgent' | 'match' | 'applied' | 'action';

export type Alert = {
  id: string;
  kind: AlertKind;
  /** Short status label, e.g. Urgent / Match / Sent. */
  status: string;
  /** Brand accent for the status and the left rail. */
  accent: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  /** Pastel tile behind the icon (reference notification style). */
  tile: string;
  title: string;
  subtitle: string;
  /** Second line under the title — company and pay, or a short prompt. */
  detail: string;
  /** Clock range shown on the card, e.g. "10:00 AM – 11:00 AM". */
  window: string;
  /** People interested or already in the process. */
  applicants?: number;
  text: string;
  jobId?: string;
  /** When the alert was generated — used for grouping and timestamps. */
  at: number;
};

function clock(ms: number) {
  return new Date(ms).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
}

function timeWindow(start: number) {
  return `${clock(start)} – ${clock(start + HOUR)}`;
}

/** Stable headcount so the same job always shows the same number. */
function applicantsFor(id: string) {
  let n = 0;
  for (let i = 0; i < id.length; i += 1) n += id.charCodeAt(i);
  return 2 + (n % 7);
}

const TWO_DAYS = 2 * 24 * 60 * 60 * 1000;
const HOUR = 60 * 60 * 1000;
const MIN = 60 * 1000;

/**
 * Job alerts built on the device from the user's skills, favourites and applications.
 * (A server push feed can replace this later without changing the Alerts screen.)
 */
export function useAlerts(): Alert[] {
  const { skills, favorites, applied } = useUserData();
  const { tr } = useI18n();
  const [now, setNow] = useState(() => Date.now());
  const alerts: Alert[] = [];

  // Re-check "closing soon" once a minute.
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 60_000);
    return () => clearInterval(timer);
  }, []);

  if (skills.length === 0) {
    alerts.push({
      id: 'add-skills',
      kind: 'action',
      status: tr('alerts.statusAction'),
      accent: colors.orange,
      icon: 'sparkles',
      color: colors.orange,
      tile: '#ffede6',
      title: tr('alerts.skillsTitle'),
      subtitle: 'Mpuza',
      detail: tr('alerts.skillsText'),
      window: timeWindow(now - 4 * MIN),
      text: tr('alerts.skillsText'),
      at: now - 4 * MIN,
    });
  }

  let matchIndex = 0;
  let appliedIndex = 0;

  for (const job of feedJobs) {
    const left = job.deadline - now;
    if (favorites.includes(job.id) && !applied.includes(job.id) && left > 0 && left < TWO_DAYS) {
      alerts.push({
        id: `closing-${job.id}`,
        kind: 'urgent',
        status: tr('alerts.statusUrgent'),
        accent: colors.orange,
        icon: 'alarm',
        color: colors.orange,
        tile: '#ffede6',
        title: job.title,
        subtitle: job.company,
        detail: `${job.company} · ${job.salary}`,
        window: timeWindow(job.deadline - HOUR),
        applicants: applicantsFor(job.id),
        text: tr('alerts.closingText', { title: job.title, company: job.company }),
        jobId: job.id,
        at: now - 2 * HOUR - matchIndex * 15 * MIN,
      });
    }
    const match = matchScore(job, skills);
    if (match !== null && match >= 50 && !applied.includes(job.id)) {
      alerts.push({
        id: `match-${job.id}`,
        kind: 'match',
        status: tr('alerts.statusMatch'),
        accent: colors.blue,
        icon: 'flash',
        color: colors.blue,
        tile: '#e3f2fd',
        title: job.title,
        subtitle: job.company,
        detail: `${job.company} · ${job.salary}`,
        window: timeWindow(now - 35 * MIN - matchIndex * 50 * MIN),
        applicants: applicantsFor(job.id),
        text: tr('alerts.matchText', { title: job.title, company: job.company }),
        jobId: job.id,
        at: now - 35 * MIN - matchIndex * 50 * MIN,
      });
      matchIndex += 1;
    }
    if (applied.includes(job.id)) {
      alerts.push({
        id: `applied-${job.id}`,
        kind: 'applied',
        status: tr('alerts.statusApplied'),
        accent: colors.dblue,
        icon: 'checkmark-circle',
        color: colors.dblue,
        tile: '#e8eef4',
        title: job.title,
        subtitle: job.company,
        detail: `${job.company} · ${job.salary}`,
        window: timeWindow(now - 26 * HOUR - appliedIndex * 3 * HOUR),
        applicants: applicantsFor(job.id),
        text: tr('alerts.appliedText', { company: job.company }),
        jobId: job.id,
        at: now - 26 * HOUR - appliedIndex * 3 * HOUR,
      });
      appliedIndex += 1;
    }
  }

  alerts.sort((a, b) => b.at - a.at);
  return alerts;
}
