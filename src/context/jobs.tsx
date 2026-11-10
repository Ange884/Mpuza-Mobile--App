import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

import { toFeedJob, toLandingJob } from '@/api/mapJob';
import { listActiveJobs } from '@/api/mpuza';
import type { Job } from '@/data/explore';
import type { FeedJob } from '@/data/feed';

type Catalog = {
  feedJobs: FeedJob[];
  landingJobs: Job[];
  ready: boolean;
  refresh: () => Promise<void>;
  remember: (jobs: FeedJob[]) => void;
  jobById: (id: string | undefined) => FeedJob | undefined;
};

const JobCatalogContext = createContext<Catalog | null>(null);

function byNewest<T extends { createdAt?: string | null }>(rows: T[]) {
  return [...rows].sort((a, b) => new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime());
}

export function JobCatalogProvider({ children }: { children: ReactNode }) {
  const [feedJobs, setFeedJobs] = useState<FeedJob[]>([]);
  const [landingJobs, setLandingJobs] = useState<Job[]>([]);
  const [ready, setReady] = useState(false);

  const refresh = useCallback(async () => {
    try {
      const rows = byNewest(await listActiveJobs());
      setFeedJobs(rows.map((job, index) => toFeedJob(job, index)));
      setLandingJobs(rows.map((job, index) => toLandingJob(job, index)));
    } catch {
      // Keep the last successful list so a blip does not wipe the screen.
    } finally {
      setReady(true);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const remember = useCallback((jobs: FeedJob[]) => {
    if (!jobs.length) return;
    setFeedJobs((current) => {
      const map = new Map(current.map((job) => [job.id, job]));
      for (const job of jobs) map.set(job.id, job);
      return [...map.values()];
    });
  }, []);

  const jobById = useCallback((id: string | undefined) => (id ? feedJobs.find((job) => job.id === id) : undefined), [feedJobs]);

  const value = useMemo(
    () => ({ feedJobs, landingJobs, ready, refresh, remember, jobById }),
    [feedJobs, landingJobs, ready, refresh, remember, jobById],
  );

  return <JobCatalogContext.Provider value={value}>{children}</JobCatalogContext.Provider>;
}

export function useJobCatalog() {
  const value = useContext(JobCatalogContext);
  if (!value) throw new Error('useJobCatalog must be used inside <JobCatalogProvider>');
  return value;
}
