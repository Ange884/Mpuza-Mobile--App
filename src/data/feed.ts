// Sample feed data. When Mpuza's API docs arrive, replace these arrays with
// the responses from the jobs / posts endpoints — the screens only rely on the types below.

export type FeedJob = {
  id: string;
  company: string;
  via?: string;
  title: string;
  type: 'Full time' | 'Part time' | 'Contract' | 'Internship';
  workMode: 'Remote' | 'On-site' | 'Hybrid';
  location: string;
  salary: string;
  category: string;
  color: string;
  postedAt: string;
  /** Application deadline as a timestamp (ms). */
  deadline: number;
  skills: string[];
  summary: string;
  responsibilities: string[];
  requirements: string[];
  benefits: string[];
  encouragement: string[];
};

export type FeedPost = {
  id: string;
  company: string;
  title: string;
  image: string;
  category: string;
  likes: number;
  dislikes: number;
};

export const FEED_TABS = ['For you', 'Technology', 'Design', 'Data', 'Marketing', 'Finance'];

export const SKILL_SUGGESTIONS = [
  'React Native',
  'React',
  'TypeScript',
  'JavaScript',
  'Node.js',
  'Swift',
  'Kotlin',
  'Python',
  'SQL',
  'Power BI',
  'Figma',
  'UI/UX',
  'Design systems',
  'Social media',
  'Content writing',
  'SEO',
  'Accounting',
  'Excel',
  'Project management',
  'Communication',
];

export const feedJobs: FeedJob[] = [];

export const feedPosts: FeedPost[] = [
  {
    id: 'p1',
    company: 'Mpuza',
    title: 'Refer a company and earn credits for services',
    image: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=600&q=70',
    category: 'Technology',
    likes: 7,
    dislikes: 0,
  },
  {
    id: 'p2',
    company: 'Umurava Studio',
    title: 'We are opening a design bootcamp this month',
    image: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=600&q=70',
    category: 'Design',
    likes: 12,
    dislikes: 1,
  },
  {
    id: 'p3',
    company: 'Ihuriro Tech',
    title: 'Meet the team building payments for small shops',
    image: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=600&q=70',
    category: 'Technology',
    likes: 5,
    dislikes: 0,
  },
  {
    id: 'p4',
    company: 'Inyange Analytics',
    title: '5 SQL tips every junior analyst should know',
    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&q=70',
    category: 'Data',
    likes: 9,
    dislikes: 0,
  },
];

export function getJob(id: string) {
  return feedJobs.find((job) => job.id === id);
}

/** % of the job's skills the user has. Shown as the "Match" badge. */
export function matchScore(job: FeedJob, userSkills: string[]) {
  if (userSkills.length === 0) return null;
  const mine = new Set(userSkills.map((s) => s.toLowerCase()));
  const hits = job.skills.filter((s) => mine.has(s.toLowerCase())).length;
  return Math.round((hits / job.skills.length) * 100);
}
