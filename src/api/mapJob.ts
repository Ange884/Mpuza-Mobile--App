import { colors } from '@/constants/colors';
import type { Job } from '@/data/explore';
import type { FeedJob } from '@/data/feed';

export type ApiCompany = {
  title?: string | null;
  industry?: string | null;
  logo?: string | null;
  verified?: boolean | null;
};

export type ApiJob = {
  id: string;
  title?: string | null;
  position?: string | null;
  employmentType?: string | null;
  description?: string | null;
  responsibility?: string | null;
  requirements?: string[] | null;
  skillsPreferred?: string[] | null;
  locations?: string[] | null;
  workPlaceType?: string | null;
  deadline?: string | null;
  city?: string | null;
  country?: string | null;
  salaryMin?: number | null;
  salaryMax?: number | null;
  salaryCurrency?: string | null;
  createdAt?: string | null;
  company?: ApiCompany | null;
  sourceName?: string | null;
  match_score?: number | null;
};

const PALETTE = [colors.blue, colors.orange, colors.dblue, '#1f9e89', '#7b61ff'];

function relative(iso?: string | null) {
  if (!iso) return '';
  const diff = Date.now() - new Date(iso).getTime();
  if (Number.isNaN(diff) || diff < 0) return 'Just now';
  const hours = Math.floor(diff / 3_600_000);
  if (hours < 1) return 'Just now';
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

function money(job: ApiJob) {
  if (job.salaryMin == null && job.salaryMax == null) return 'Salary on request';
  const currency = job.salaryCurrency ?? '';
  const low = job.salaryMin ?? job.salaryMax;
  const high = job.salaryMax ?? job.salaryMin;
  if (low === high) return `${currency} ${low}`.trim();
  return `${currency} ${low} – ${high}`.trim();
}

function place(job: ApiJob) {
  return job.city || job.locations?.[0] || job.country || 'Remote';
}

function landingType(job: ApiJob): Job['type'] {
  if ((job.workPlaceType ?? '').toUpperCase() === 'REMOTE') return 'Remote';
  const type = (job.employmentType ?? '').toLowerCase();
  if (type.includes('part')) return 'Part-time';
  if (type.includes('intern')) return 'Internship';
  if (type.includes('contract') || type.includes('freelance') || type.includes('temporary')) return 'Contract';
  return 'Full-time';
}

function feedType(job: ApiJob): FeedJob['type'] {
  const type = (job.employmentType ?? '').toLowerCase();
  if (type.includes('part')) return 'Part time';
  if (type.includes('intern')) return 'Internship';
  if (type.includes('contract') || type.includes('freelance') || type.includes('temporary')) return 'Contract';
  return 'Full time';
}

function workMode(job: ApiJob): FeedJob['workMode'] {
  const mode = (job.workPlaceType ?? '').toUpperCase();
  if (mode === 'REMOTE') return 'Remote';
  if (mode === 'HYBRID') return 'Hybrid';
  return 'On-site';
}

function landingCategory(job: ApiJob) {
  const text = `${job.company?.industry ?? ''} ${job.title ?? ''}`.toLowerCase();
  if (text.includes('design')) return 'Design';
  if (text.includes('data') || text.includes('analyt')) return 'Data';
  if (text.includes('market')) return 'Marketing';
  if (text.includes('financ') || text.includes('account')) return 'Finance';
  if (text.includes('engineer') || text.includes('software') || text.includes('tech')) return 'Engineering';
  return 'All';
}

function feedCategory(job: ApiJob) {
  const text = `${job.company?.industry ?? ''} ${job.title ?? ''}`.toLowerCase();
  if (text.includes('design')) return 'Design';
  if (text.includes('data') || text.includes('analyt')) return 'Data';
  if (text.includes('market')) return 'Marketing';
  if (text.includes('financ') || text.includes('account')) return 'Finance';
  if (text.includes('engineer') || text.includes('software') || text.includes('tech')) return 'Technology';
  return 'For you';
}

export function toLandingJob(job: ApiJob, index: number): Job {
  const skills = job.skillsPreferred ?? [];
  return {
    id: job.id,
    title: job.title || job.position || 'Open role',
    company: job.company?.title || job.sourceName || 'Mpuza',
    location: place(job),
    type: landingType(job),
    salary: money(job),
    posted: relative(job.createdAt),
    category: landingCategory(job),
    tags: skills.slice(0, 3),
    color: PALETTE[index % PALETTE.length],
  };
}

export function toFeedJob(job: ApiJob, index: number, category?: string): FeedJob {
  const skills = job.skillsPreferred?.length ? job.skillsPreferred : ['General'];
  return {
    id: job.id,
    company: job.company?.title || job.sourceName || 'Mpuza',
    title: job.title || job.position || 'Open role',
    type: feedType(job),
    workMode: workMode(job),
    location: place(job),
    salary: money(job),
    category: category ?? feedCategory(job),
    color: PALETTE[index % PALETTE.length],
    postedAt: relative(job.createdAt),
    deadline: job.deadline ? new Date(job.deadline).getTime() : Date.now() + 14 * 24 * 60 * 60 * 1000,
    skills,
    summary: job.description || '',
    responsibilities: job.responsibility ? [job.responsibility] : [],
    requirements: job.requirements ?? [],
  };
}
