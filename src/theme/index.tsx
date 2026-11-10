import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { useColorScheme } from 'react-native';

import { colors as brand } from '@/constants/colors';
import { type ResponsiveInfo, useResponsive } from '@/utils/responsive';

export { useResponsive, type ResponsiveInfo } from '@/utils/responsive';

/** Semantic colour roles. Screens use these instead of hex codes so they work in light and dark. */
const light = {
  ...brand,
  scheme: 'light' as 'light' | 'dark',
  bg: '#ffffff',
  bgAlt: '#f6f8fb',
  surface: '#ffffff',
  surfaceAlt: '#f3f5f9',
  border: '#e8ecf2',
  text: '#0e314c',
  textBody: '#4a5866',
  textMuted: '#7a8796',
  textFaint: '#a3a8b8',
  navy: '#0e314c',
  navy2: '#1d5a85',
  success: '#22a06b',
  successText: '#1b7f55',
  danger: '#e5484d',
  overlay: 'rgba(12,12,30,0.5)',
  pageGradient: ['#ffffff', '#f2f9fd', '#fdf3ef'] as readonly [string, string, string],
  heroOverlay: 'rgba(0,0,0,0.6)',
};

export type Theme = typeof light;

const dark: Theme = {
  ...light,
  scheme: 'dark',
  bg: '#0b1620',
  bgAlt: '#0b1620',
  surface: '#132230',
  surfaceAlt: '#1b2c3b',
  border: '#24384a',
  text: '#eef3f8',
  textBody: '#c3cdd6',
  textMuted: '#8d9cab',
  textFaint: '#5f7080',
  navy: '#17344d',
  navy2: '#1f4f73',
  successText: '#4cd38a',
  overlay: 'rgba(0,0,0,0.65)',
  pageGradient: ['#0b1620', '#0e2230', '#1d1a1c'] as const,
  heroOverlay: 'rgba(0,0,0,0.7)',
};

export type ThemeMode = 'system' | 'light' | 'dark';

const STORAGE_KEY = 'mpuza:theme-mode';

const ThemeContext = createContext<{ theme: Theme; mode: ThemeMode; setMode: (mode: ThemeMode) => void }>({
  theme: light,
  mode: 'system',
  setMode: () => {},
});

export function AppThemeProvider({ children }: { children: ReactNode }) {
  const system = useColorScheme();
  const [mode, setModeState] = useState<ThemeMode>('system');

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((saved) => {
        if (saved === 'light' || saved === 'dark' || saved === 'system') setModeState(saved);
      })
      .catch(() => {});
  }, []);

  function setMode(next: ThemeMode) {
    setModeState(next);
    AsyncStorage.setItem(STORAGE_KEY, next).catch(() => {});
  }

  const scheme = mode === 'system' ? (system === 'dark' ? 'dark' : 'light') : mode;
  const theme = scheme === 'dark' ? dark : light;

  return <ThemeContext.Provider value={{ theme, mode, setMode }}>{children}</ThemeContext.Provider>;
}

/** Current colour roles. */
export function useTheme() {
  return useContext(ThemeContext).theme;
}

/** Current mode ('system' | 'light' | 'dark') and a setter (saved on the device). */
export function useThemeMode() {
  const { mode, setMode } = useContext(ThemeContext);
  return { mode, setMode };
}

const styleCache = new WeakMap<object, Map<Theme, unknown>>();

/** Builds a StyleSheet from the current theme (cached per theme): `const styles = useStyles(makeStyles)`. */
export function useStyles<T>(factory: (t: Theme) => T): T {
  const theme = useTheme();
  let byTheme = styleCache.get(factory);
  if (!byTheme) {
    byTheme = new Map();
    styleCache.set(factory, byTheme);
  }
  if (!byTheme.has(theme)) byTheme.set(theme, factory(theme));
  return byTheme.get(theme) as T;
}

const responsiveCache = new WeakMap<object, Map<string, unknown>>();

/** Theme + screen size: `const styles = useResponsiveStyles(makeStyles)`. */
export function useResponsiveStyles<T>(factory: (t: Theme, r: ResponsiveInfo) => T): T {
  const theme = useTheme();
  const r = useResponsive();
  const bucket = r.isWide ? 'wide' : r.isTablet ? 'tablet' : r.isCompact ? 'compact' : 'phone';
  const cacheKey = `${theme.scheme}-${bucket}`;

  let byKey = responsiveCache.get(factory);
  if (!byKey) {
    byKey = new Map();
    responsiveCache.set(factory, byKey);
  }
  if (!byKey.has(cacheKey)) byKey.set(cacheKey, factory(theme, r));
  return byKey.get(cacheKey) as T;
}
