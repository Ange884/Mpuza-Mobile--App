import { colors } from '@/constants/colors';

export type JobCardTone = 'light' | 'deep';

/** Kept for list index props — palette is the same on every card. */
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

/** Reference card: white bg, light-blue accents, deep-blue type — View button always deep blue. */
export function jobCardPalette(_tone: JobCardTone, scheme: 'light' | 'dark'): JobCardPalette {
  const cardBg = scheme === 'dark' ? '#152433' : colors.white;

  return {
    cardBg,
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
