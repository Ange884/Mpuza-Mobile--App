import type { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';

import { colors } from '@/constants/colors';
import { useUserData } from '@/context/userdata';
import { feedJobs, matchScore } from '@/data/feed';

export type Alert = {
  id: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  title: string;
  text: string;
  jobId?: string;
};

const TWO_DAYS = 2 * 24 * 60 * 60 * 1000;

/**
 * Job alerts built on the device from the user's skills, favourites and applications.
 * (A server push feed can replace this later without changing the Alerts screen.)
 */
export function useAlerts(): Alert[] {
  const { skills, favorites, applied } = useUserData();
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
      title: 'Get matched to the right jobs',
      text: 'Add a few skills and we will show how well each job fits you.',
    });
  }

  for (const job of feedJobs) {
    const left = job.deadline - now;
    if (favorites.includes(job.id) && !applied.includes(job.id) && left > 0 && left < TWO_DAYS) {
      alerts.push({
        id: `closing-${job.id}`,
        icon: 'alarm',
        color: '#e5484d',
        title: 'Closing soon',
        text: `${job.title} at ${job.company} closes in less than 2 days.`,
        jobId: job.id,
      });
    }
    const match = matchScore(job, skills);
    if (match !== null && match >= 50 && !applied.includes(job.id)) {
      alerts.push({
        id: `match-${job.id}`,
        icon: 'flash',
        color: colors.orange,
        title: `${match}% match`,
        text: `${job.title} at ${job.company} fits your skills.`,
        jobId: job.id,
      });
    }
    if (applied.includes(job.id)) {
      alerts.push({
        id: `applied-${job.id}`,
        icon: 'checkmark-circle',
        color: '#22a06b',
        title: 'Application sent',
        text: `Your application to ${job.company} was sent.`,
        jobId: job.id,
      });
    }
  }

  return alerts;
}
