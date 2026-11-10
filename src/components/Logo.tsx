import { Image } from 'expo-image';
import { StyleSheet, Text, View, type ViewStyle } from 'react-native';

import { colors } from '@/constants/colors';
import { useStyles, useTheme, type Theme } from '@/theme';

const BRAND_LOGO = require('@/assets/images/logo.png');

type Props = {
  size?: number;
  light?: boolean;
  /** Small mark + MPUZA on one row (footer, etc.). */
  withLabel?: boolean;
  style?: ViewStyle;
};

export function Logo({ size = 28, light, withLabel, style }: Props) {
  const t = useTheme();
  const styles = useStyles(makeStyles);

  if (withLabel) {
    const markH = size * 1.2;
    const labelSize = Math.round(size * 0.58);
    return (
      <View style={[styles.row, styles.rowTight, style]} accessibilityLabel="MPUZA">
        <Image source={BRAND_LOGO} style={{ width: markH * 0.92, height: markH }} contentFit="contain" contentPosition="center" />
        <Text
          style={[
            styles.label,
            styles.labelTight,
            { fontSize: labelSize, lineHeight: labelSize + 2 },
            light ? styles.labelLight : { color: t.text },
          ]}>
          MPUZA
        </Text>
      </View>
    );
  }

  const height = size * 1.85;

  return (
    <View style={[styles.wrap, style]} accessibilityLabel="MPUZA">
      <Image
        source={BRAND_LOGO}
        style={[styles.image, { height, width: height * 3.2 }, light && styles.onDark]}
        contentFit="contain"
      />
    </View>
  );
}

const makeStyles = (t: Theme) =>
  StyleSheet.create({
    wrap: {
      alignSelf: 'flex-start',
    },
    image: {
      maxWidth: '100%',
    },
    onDark: {
      opacity: 0.98,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      alignSelf: 'flex-start',
    },
    rowTight: {
      gap: 0,
    },
    label: {
      fontFamily: 'Lexend_700Bold',
      letterSpacing: 0.4,
      includeFontPadding: false,
    },
    labelTight: {
      marginLeft: 6,
      marginTop: 1,
    },
    labelLight: {
      color: colors.white,
    },
  });
