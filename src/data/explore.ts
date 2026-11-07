import type { Ionicons } from '@expo/vector-icons';

type IconName = keyof typeof Ionicons.glyphMap;

// NOTE: Sample content. Replace with data from the API once the jobs backend exists.

export type Job = {
  id: string;
  title: string;
  company: string;
  location: string;
  type: 'Full-time' | 'Part-time' | 'Contract' | 'Internship' | 'Remote';
  salary: string;
  posted: string;
  category: string;
  tags: string[];
  color: string;
};

export const categories = ['All', 'Engineering', 'Design', 'Data', 'Marketing', 'Finance'];

export const jobs: Job[] = [
  {
    id: 'j1',
    title: 'Senior React Native Developer',
    company: 'Ihuriro Tech',
    location: 'Kigali',
    type: 'Full-time',
    salary: 'RWF 1.8M – 2.4M',
    posted: '2d ago',
    category: 'Engineering',
    tags: ['React Native', 'TypeScript'],
    color: '#35a8df',
  },
  {
    id: 'j2',
    title: 'Product Designer (UI/UX)',
    company: 'Umurava Studio',
    location: 'Remote',
    type: 'Remote',
    salary: 'RWF 1.2M – 1.6M',
    posted: '1d ago',
    category: 'Design',
    tags: ['Figma', 'Design systems'],
    color: '#ed633c',
  },
  {
    id: 'j3',
    title: 'Data Analyst',
    company: 'Inyange Analytics',
    location: 'Kigali',
    type: 'Full-time',
    salary: 'RWF 900K – 1.3M',
    posted: '3d ago',
    category: 'Data',
    tags: ['SQL', 'Power BI'],
    color: '#7b61ff',
  },
  {
    id: 'j4',
    title: 'Backend Engineer (Node.js)',
    company: 'Kivu Systems',
    location: 'Musanze',
    type: 'Contract',
    salary: 'RWF 1.5M – 2M',
    posted: '5h ago',
    category: 'Engineering',
    tags: ['Node.js', 'PostgreSQL'],
    color: '#1f9e89',
  },
  {
    id: 'j5',
    title: 'Digital Marketing Intern',
    company: 'Akagera Media',
    location: 'Kigali',
    type: 'Internship',
    salary: 'RWF 250K stipend',
    posted: 'Today',
    category: 'Marketing',
    tags: ['Social media', 'Content'],
    color: '#e8a317',
  },
  {
    id: 'j6',
    title: 'Junior Accountant',
    company: 'Imena Finance',
    location: 'Huye',
    type: 'Part-time',
    salary: 'RWF 600K – 800K',
    posted: '4d ago',
    category: 'Finance',
    tags: ['QuickBooks', 'IFRS'],
    color: '#d6457a',
  },
];

export const partners: { name: string; icon: IconName; color: string }[] = [
  { name: 'Ihuriro Tech', icon: 'code-slash', color: '#35a8df' },
  { name: 'Umurava', icon: 'color-palette', color: '#ed633c' },
  { name: 'Inyange', icon: 'analytics', color: '#7b61ff' },
  { name: 'Kivu Systems', icon: 'server', color: '#1f9e89' },
  { name: 'Akagera', icon: 'megaphone', color: '#e8a317' },
  { name: 'Imena', icon: 'wallet', color: '#d6457a' },
  { name: 'Gorilla Labs', icon: 'flask', color: '#3c8d40' },
  { name: 'Nyungwe', icon: 'leaf', color: '#2b9a66' },
  { name: 'Agaciro', icon: 'diamond', color: '#4a6cf7' },
  { name: 'Ubumwe', icon: 'people', color: '#c4572e' },
  { name: 'Karisimbi', icon: 'triangle', color: '#5b6474' },
  { name: 'Iriba', icon: 'water', color: '#1e88c7' },
];

export const stats = [
  { value: '1,200+', label: 'Open roles' },
  { value: '300+', label: 'Companies' },
  { value: '8,500+', label: 'Hires made' },
];

export const steps: { icon: IconName; title: string; text: string; color: string }[] = [
  {
    icon: 'document-text',
    title: 'Complete your profile',
    text: 'Once you are approved, we showcase you to leading companies across Rwanda.',
    color: '#35a8df',
  },
  {
    icon: 'card',
    title: 'Receive job offers',
    text: 'Companies start sending interview requests. Talk only to the ones you like.',
    color: '#ed633c',
  },
  {
    icon: 'rocket',
    title: 'Accept your dream job',
    text: 'Compare your offers and accept the best one. Hired!',
    color: '#1f9e89',
  },
];
