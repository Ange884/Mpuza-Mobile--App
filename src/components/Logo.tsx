import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { colors } from '@/constants/colors';
import { useStyles, type Theme } from '@/theme';

export function Logo({ size = 20, light }: { size?: number; light?: boolean }) {
  const styles = useStyles(makeStyles);
  const mark = size * 1.3;
  return (
    <View style={styles.row}>
      <View style={[styles.mark, { width: mark, height: mark, borderRadius: 7 }]}>
        <Ionicons name="leaf" size={size * 0.7} color={colors.white} />
      </View>
      <Text style={[styles.text, { fontSize: size }, light && { color: colors.white }]}>MPUZA</Text>
    </View>
  );
}

const makeStyles = (t: Theme) =>
  StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  mark: {
    backgroundColor: colors.orange,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontFamily: 'Lexend_700Bold',
    color: t.text,
    letterSpacing: 0.5,
  },
});
