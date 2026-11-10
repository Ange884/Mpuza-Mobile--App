import { useMemo } from 'react';
import { Platform, useWindowDimensions, type ViewStyle } from 'react-native';

/** Reference width (iPhone 14). Layout scales gently around this. */
export const LAYOUT_GUIDE_WIDTH = 390;

export const BREAKPOINTS = {
  compact: 360,
  tablet: 768,
  wide: 1024,
} as const;

const CONTENT_MAX = {
  phone: 520,
  tablet: 720,
  wide: 960,
} as const;

export type ResponsiveInfo = {
  width: number;
  height: number;
  /** Horizontal inset for page content. */
  gutter: number;
  /** Max width for centered page columns (tablets / web). */
  contentMaxWidth: number;
  isCompact: boolean;
  isTablet: boolean;
  isWide: boolean;
  /** Scale spacing from the layout guide (clamped). */
  rs: (size: number) => number;
  /** Scale type slightly (clamped). */
  rf: (size: number) => number;
  /** Popular jobs grid: 2 on phone, 3 on tablet, 4 on wide. */
  gridColumns: 2 | 3 | 4;
};

export function metricsFor(width: number, height: number): ResponsiveInfo {
  const isCompact = width < BREAKPOINTS.compact;
  const isTablet = width >= BREAKPOINTS.tablet;
  const isWide = width >= BREAKPOINTS.wide;
  const scale = Math.min(1.12, Math.max(0.88, width / LAYOUT_GUIDE_WIDTH));
  const fontScale = Math.min(1.06, Math.max(0.94, width / LAYOUT_GUIDE_WIDTH));

  const gutter = isWide ? 32 : isTablet ? 28 : isCompact ? 16 : 20;
  let contentMaxWidth: number = CONTENT_MAX.phone;
  if (isWide) contentMaxWidth = CONTENT_MAX.wide;
  else if (isTablet) contentMaxWidth = CONTENT_MAX.tablet;

  const gridColumns: ResponsiveInfo['gridColumns'] = isWide ? 4 : isTablet ? 3 : 2;
  const rs = (size: number) => Math.round(size * scale);
  const rf = (size: number) => Math.round(size * fontScale);

  return {
    width,
    height,
    gutter,
    contentMaxWidth,
    isCompact,
    isTablet,
    isWide,
    rs,
    rf,
    gridColumns,
  };
}

export function useResponsive(): ResponsiveInfo {
  const { width, height } = useWindowDimensions();
  return useMemo(() => metricsFor(width, height), [width, height]);
}

/** Centered column used by most screens. */
export function pageColumnStyle(r: ResponsiveInfo): ViewStyle {
  return {
    width: '100%',
    maxWidth: r.contentMaxWidth,
    alignSelf: 'center',
  };
}

/** Minimum touch target — Android / iOS HIG. */
export const MIN_TOUCH = Platform.select({ ios: 44, android: 48, default: 44 });
