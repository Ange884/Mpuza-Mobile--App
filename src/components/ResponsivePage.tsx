import type { ReactNode } from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';

import { pageColumnStyle, useResponsive } from '@/utils/responsive';

type Props = {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  /** Use for headers/sections that should span edge-to-edge inside the column. */
  inset?: boolean;
};

/** Centers content and caps width on tablets; keeps gutters on small phones. */
export function ResponsivePage({ children, style, inset = true }: Props) {
  const r = useResponsive();
  return (
    <View
      style={[
        pageColumnStyle(r),
        inset ? { paddingHorizontal: r.gutter } : null,
        style,
      ]}>
      {children}
    </View>
  );
}
