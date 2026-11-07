import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

import { en, type TranslationKey } from './en';
import { fr } from './fr';
import { rw } from './rw';

export type Lang = 'en' | 'fr' | 'rw';
export const LANGS: Lang[] = ['en', 'fr', 'rw'];
export const LANG_NAMES: Record<Lang, string> = { en: 'English', fr: 'Français', rw: 'Kinyarwanda' };

const dictionaries: Record<Lang, Record<TranslationKey, string>> = { en, fr, rw };
const STORAGE_KEY = 'mpuza:lang';

type Vars = Record<string, string | number>;

const I18nContext = createContext<{ lang: Lang; setLang: (lang: Lang) => void }>({
  lang: 'en',
  setLang: () => {},
});

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>('en');

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((saved) => {
        if (saved === 'en' || saved === 'fr' || saved === 'rw') setLangState(saved);
      })
      .catch(() => {});
  }, []);

  function setLang(next: Lang) {
    setLangState(next);
    AsyncStorage.setItem(STORAGE_KEY, next).catch(() => {});
  }

  return <I18nContext.Provider value={{ lang, setLang }}>{children}</I18nContext.Provider>;
}

function fill(text: string, vars?: Vars) {
  return vars ? text.replace(/\{(\w+)\}/g, (_, name) => String(vars[name] ?? `{${name}}`)) : text;
}

/**
 * `tr('login.heading')`, `tr('feed.match', { n: 75 })`, `trn('saved.count', 2)`.
 * Named `tr` so it never clashes with the theme's `t`.
 */
export function useI18n() {
  const { lang, setLang } = useContext(I18nContext);
  const dict = dictionaries[lang];

  const tr = (key: TranslationKey, vars?: Vars) => fill(dict[key] ?? en[key], vars);

  /** Plural helper: picks `<base>_one` or `<base>_other` and fills {n}. */
  const trn = (base: string, n: number, vars?: Vars) =>
    tr(`${base}_${n === 1 ? 'one' : 'other'}` as TranslationKey, { n, ...vars });

  /** Translates a category/tab id like "Technology"; unknown ids are shown as-is. */
  const cat = (id: string) => (`cat.${id}` in dict ? dict[`cat.${id}` as TranslationKey] : id);

  return { lang, setLang, tr, trn, cat };
}
