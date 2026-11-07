import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { colors } from '@/constants/colors';

export function Logo({ size = 20, light }: { size?: number; light?: boolean }) {
  const mark = size * 1.3;
  return (
    <View style={styles.row}>
      <View style={[styles.mark, { width: mark, height: mark, borderRadius: mark / 2 }]}>
        <Ionicons name="leaf" size={size * 0.7} color={colors.white} />
      </View>
      <Text style={[styles.text, { fontSize: size }, light && { color: colors.white }]}>MPUZA</Text>
    </View>
  );
}

const styles = StyleSheet.create({
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
    color: colors.dblue,
    letterSpacing: 0.5,
  },
});
