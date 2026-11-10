import type { Ionicons } from '@expo/vector-icons';

import { colors } from '@/constants/colors';

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

export const jobs: Job[] = [];

export type Partner = {
  name: string;
  icon: IconName;
  location: string;
  blurb: string;
  /** Shown on the partner card as hiring activity. */
  openRoles: number;
};

export const partners: Partner[] = [
  {
    name: 'Ihuriro Tech',
    icon: 'code-slash',
    location: 'Kigali',
    blurb: 'Engineering teams shipping mobile and cloud products across East Africa.',
    openRoles: 24,
  },
  {
    name: 'Umurava',
    icon: 'color-palette',
    location: 'Remote',
    blurb: 'Design studio pairing product thinkers with ambitious startups.',
    openRoles: 12,
  },
  {
    name: 'Inyange',
    icon: 'analytics',
    location: 'Kigali',
    blurb: 'Data-driven decisions for retail, fintech, and public-sector partners.',
    openRoles: 18,
  },
  {
    name: 'Kivu Systems',
    icon: 'server',
    location: 'Musanze',
    blurb: 'Infrastructure and backend specialists building reliable platforms.',
    openRoles: 9,
  },
  {
    name: 'Akagera',
    icon: 'megaphone',
    location: 'Kigali',
    blurb: 'Creative agency hiring storytellers, strategists, and content leads.',
    openRoles: 7,
  },
  {
    name: 'Imena',
    icon: 'wallet',
    location: 'Kigali',
    blurb: 'Finance and operations roles for growing regional businesses.',
    openRoles: 11,
  },
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
    color: colors.dblue,
  },
];
