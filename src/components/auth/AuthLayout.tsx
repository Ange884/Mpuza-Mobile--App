import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors } from '@/constants/colors';
import { useI18n } from '@/i18n';
import { useStyles, type Theme } from '@/theme';

/** "Text  Link" row used at the bottom of the auth screens. */
export function SwitchLink({ text, link, onPress }: { text: string; link: string; onPress: () => void }) {
  const styles = useStyles(makeStyles);
  return (
    <View style={styles.switchRow}>
      <Text style={styles.switchText}>{text} </Text>
      <Pressable onPress={onPress} hitSlop={8}>
        {({ pressed }) => <Text style={[styles.switchLink, pressed && styles.pressed]}>{link}</Text>}
      </Pressable>
    </View>
  );
}

/** Thin "or" separator between the main and Google buttons. */
export function OrDivider() {
  const { tr } = useI18n();
  const styles = useStyles(makeStyles);
  return (
    <View style={styles.orRow}>
      <View style={styles.orLine} />
      <Text style={styles.orText}>{tr('common.or')}</Text>
      <View style={styles.orLine} />
    </View>
  );
}

const makeStyles = (t: Theme) =>
  StyleSheet.create({
    pressed: {
      opacity: 0.6,
    },
    switchRow: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
    },
    switchText: {
      fontFamily: 'Lexend_400Regular',
      fontSize: 14,
      color: t.textMuted,
    },
    switchLink: {
      fontFamily: 'Lexend_700Bold',
      fontSize: 14,
      color: colors.orange,
    },
    orRow: {
      alignItems: 'center',
      justifyContent: 'center',
      marginVertical: 16,
    },
    orLine: {
      display: 'none',
    },
    orText: {
      fontFamily: 'Lexend_400Regular',
      fontSize: 13,
      color: t.textMuted,
      textTransform: 'capitalize',
    },
  });
