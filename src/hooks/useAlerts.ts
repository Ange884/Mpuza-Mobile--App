import type { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';

import { colors } from '@/constants/colors';
import { useUserData } from '@/context/userdata';
import { feedJobs, matchScore } from '@/data/feed';
import { useI18n } from '@/i18n';

export type Alert = {
  id: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  /** Pastel tile behind the icon (reference notification style). */
  tile: string;
  title: string;
  subtitle: string;
  text: string;
  jobId?: string;
  /** When the alert was generated — used for grouping and timestamps. */
  at: number;
};

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
      icon: 'sparkles',
      color: colors.blue,
      tile: '#e3f2fd',
      title: tr('alerts.skillsTitle'),
      subtitle: 'Mpuza',
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
        icon: 'alarm',
        color: '#e5484d',
        tile: '#ffe8e8',
        title: tr('alerts.closingTitle'),
        subtitle: job.company,
        text: tr('alerts.closingText', { title: job.title, company: job.company }),
        jobId: job.id,
        at: now - 2 * HOUR - matchIndex * 15 * MIN,
      });
    }
    const match = matchScore(job, skills);
    if (match !== null && match >= 50 && !applied.includes(job.id)) {
      alerts.push({
        id: `match-${job.id}`,
        icon: 'flash',
        color: colors.orange,
        tile: '#ffede6',
        title: job.title,
        subtitle: job.company,
        text: tr('alerts.matchText', { title: job.title, company: job.company }),
        jobId: job.id,
        at: now - 35 * MIN - matchIndex * 50 * MIN,
      });
      matchIndex += 1;
    }
    if (applied.includes(job.id)) {
      alerts.push({
        id: `applied-${job.id}`,
        icon: 'checkmark-circle',
        color: '#22a06b',
        tile: '#e3f7ed',
        title: tr('alerts.appliedTitle'),
        subtitle: job.company,
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
