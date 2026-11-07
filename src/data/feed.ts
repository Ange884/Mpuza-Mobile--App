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

const HOUR = 60 * 60 * 1000;
const now = Date.now();

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

export const feedJobs: FeedJob[] = [
  {
    id: 'mozilla-ios',
    company: 'Mozilla',
    via: 'Greenhouse',
    title: 'iOS Software Engineer',
    type: 'Full time',
    workMode: 'Remote',
    location: 'Worldwide',
    salary: '$70k – $95k',
    category: 'Technology',
    color: '#35a8df',
    postedAt: '2h ago',
    deadline: now + 3 * 24 * HOUR + 23 * HOUR,
    skills: ['Swift', 'iOS', 'TypeScript', 'Communication'],
    summary:
      'Join the Firefox for iOS team and help millions of people browse privately. You will ship features end to end, from design review to App Store release.',
    responsibilities: [
      'Build and maintain features in the Firefox iOS app',
      'Collaborate with designers and product managers on new experiences',
      'Write tests and review code from teammates',
    ],
    requirements: ['3+ years building iOS apps with Swift', 'Experience with UIKit or SwiftUI', 'Clear written communication'],
  },
  {
    id: 'ihuriro-rn',
    company: 'Ihuriro Tech',
    title: 'React Native Developer',
    type: 'Full time',
    workMode: 'Hybrid',
    location: 'Kigali',
    salary: 'RWF 1.8M – 2.4M',
    category: 'Technology',
    color: '#ed633c',
    postedAt: '5h ago',
    deadline: now + 6 * 24 * HOUR,
    skills: ['React Native', 'TypeScript', 'React', 'Node.js'],
    summary:
      'Ihuriro is building the payments app used by thousands of small shops across Rwanda. We need a mobile engineer who cares about speed and polish.',
    responsibilities: [
      'Own features in our React Native app from idea to release',
      'Improve app performance and offline support',
      'Mentor junior developers',
    ],
    requirements: ['2+ years with React Native', 'Strong TypeScript skills', 'Experience publishing to the stores'],
  },
  {
    id: 'umurava-design',
    company: 'Umurava Studio',
    title: 'Product Designer (UI/UX)',
    type: 'Contract',
    workMode: 'Remote',
    location: 'Remote · Africa',
    salary: 'RWF 1.2M – 1.6M',
    category: 'Design',
    color: '#7b61ff',
    postedAt: '1d ago',
    deadline: now + 2 * 24 * HOUR + 5 * HOUR,
    skills: ['Figma', 'UI/UX', 'Design systems', 'Communication'],
    summary:
      'Design delightful mobile and web products for clients across East Africa, working closely with engineers in short sprints.',
    responsibilities: ['Run quick user interviews', 'Design flows and high-fidelity screens in Figma', 'Maintain our design system'],
    requirements: ['A portfolio of shipped products', 'Strong Figma skills', 'Comfortable presenting your work'],
  },
  {
    id: 'inyange-data',
    company: 'Inyange Analytics',
    title: 'Data Analyst',
    type: 'Full time',
    workMode: 'On-site',
    location: 'Kigali',
    salary: 'RWF 900K – 1.3M',
    category: 'Data',
    color: '#1f9e89',
    postedAt: '1d ago',
    deadline: now + 9 * 24 * HOUR,
    skills: ['SQL', 'Power BI', 'Excel', 'Python'],
    summary: 'Turn sales and supply data into dashboards that help managers make better decisions every week.',
    responsibilities: ['Build Power BI dashboards', 'Write SQL to clean and join data', 'Present insights to the leadership team'],
    requirements: ['Good SQL', 'Experience with Power BI or Tableau', 'Attention to detail'],
  },
  {
    id: 'akagera-marketing',
    company: 'Akagera Media',
    title: 'Digital Marketing Intern',
    type: 'Internship',
    workMode: 'Hybrid',
    location: 'Kigali',
    salary: 'RWF 250K stipend',
    category: 'Marketing',
    color: '#e8a317',
    postedAt: '3h ago',
    deadline: now + 20 * HOUR,
    skills: ['Social media', 'Content writing', 'SEO'],
    summary: 'Learn digital marketing by running real campaigns for tourism and hospitality brands.',
    responsibilities: ['Plan and post social content', 'Track campaign results', 'Write short blog posts'],
    requirements: ['Final-year student or recent graduate', 'Good writing in English', 'Curious and organised'],
  },
  {
    id: 'imena-accountant',
    company: 'Imena Finance',
    title: 'Junior Accountant',
    type: 'Part time',
    workMode: 'On-site',
    location: 'Huye',
    salary: 'RWF 600K – 800K',
    category: 'Finance',
    color: '#d6457a',
    postedAt: '2d ago',
    deadline: now + 4 * 24 * HOUR,
    skills: ['Accounting', 'Excel', 'Communication'],
    summary: 'Support our finance team with bookkeeping, reconciliations and monthly reports.',
    responsibilities: ['Record daily transactions', 'Prepare monthly reconciliations', 'Help with audits'],
    requirements: ['Degree in accounting or finance', 'Good Excel skills', 'QuickBooks is a plus'],
  },
];

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
