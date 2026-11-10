import { colors } from '@/constants/colors';

export type JobCardTone = 'light' | 'deep';

export function jobCardTone(_index: number): JobCardTone {
  return 'light';
}

export type JobCardPalette = {
  cardBg: string;
  cardBorder: string;
  title: string;
  meta: string;
  logoBg: string;
  logoBorder: string;
  logoText: string;
  chipBg: string;
  chipBorder: string;
  chipText: string;
  icon: string;
  salary: string;
  divider: string;
  ctaBg: string;
  heartAccent: string;
};

export function jobCardPalette(_tone: JobCardTone, scheme: 'light' | 'dark'): JobCardPalette {
  if (scheme === 'dark') {
    return {
      cardBg: '#132230',
      cardBorder: 'rgba(53,168,223,0.38)',
      title: '#eef3f8',
      meta: '#8d9cab',
      logoBg: 'rgba(53,168,223,0.2)',
      logoBorder: 'rgba(53,168,223,0.45)',
      logoText: '#a8d9f0',
      chipBg: 'rgba(53,168,223,0.16)',
      chipBorder: 'rgba(53,168,223,0.38)',
      chipText: '#c5e4f5',
      icon: colors.blue,
      salary: '#eef3f8',
      divider: 'rgba(53,168,223,0.3)',
      ctaBg: '#1f4f73',
      heartAccent: colors.blue,
    };
  }

  return {
    cardBg: colors.white,
    cardBorder: 'rgba(53,168,223,0.24)',
    title: colors.dblue,
    meta: 'rgba(14,49,76,0.55)',
    logoBg: 'rgba(53,168,223,0.22)',
    logoBorder: 'rgba(53,168,223,0.38)',
    logoText: colors.dblue,
    chipBg: 'rgba(53,168,223,0.12)',
    chipBorder: 'rgba(53,168,223,0.22)',
    chipText: colors.dblue,
    icon: colors.blue,
    salary: colors.dblue,
    divider: 'rgba(53,168,223,0.18)',
    ctaBg: colors.dblue,
    heartAccent: colors.blue,
  };
}
