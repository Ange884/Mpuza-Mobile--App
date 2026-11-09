import { StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { colors } from '@/constants/colors';
import { useCountdown } from '@/hooks/useCountdown';
import { useI18n } from '@/i18n';
import { useStyles, useTheme, type Theme } from '@/theme';

const pad = (n: number) => String(n).padStart(2, '0');

/** "03 Days 23 Hours 23 Minutes 52 Seconds" — the seconds digit rolls in every tick. */
export function Countdown({ deadline, compact }: { deadline: number; compact?: boolean }) {
  const { tr } = useI18n();
  const t = useTheme();
  const styles = useStyles(makeStyles);
  const { days, hours, minutes, seconds, expired, urgent } = useCountdown(deadline);

  if (expired) return <Text style={styles.closed}>{tr('time.closed')}</Text>;

  const color = brandBlue ? (urgent ? colors.dblue : colors.blue) : urgent ? t.danger : colors.orange;
  const units = [
    { value: days, label: tr('time.days') },
    { value: hours, label: tr('time.hours') },
    { value: minutes, label: compact ? tr('time.min') : tr('time.minutes') },
    { value: seconds, label: compact ? tr('time.sec') : tr('time.seconds'), roll: true },
  ];

  return (
    <View style={styles.row}>
      {units.map((unit) => (
        <View key={unit.roll ? 'sec' : unit.label} style={styles.unit}>
          <View style={styles.valueBox}>
            {unit.roll ? (
              <Animated.Text key={unit.value} entering={FadeInDown.duration(250)} style={[styles.value, { color }]}>
                {pad(unit.value)}
              </Animated.Text>
            ) : (
              <Text style={[styles.value, { color }]}>{pad(unit.value)}</Text>
            )}
          </View>
          <Text style={[styles.label, { color }]}>{unit.label}</Text>
        </View>
      ))}
    </View>
  );
}

const makeStyles = (t: Theme) =>
  StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 14,
  },
  unit: {
    alignItems: 'center',
  },
  valueBox: {
    height: 24,
    overflow: 'hidden',
    justifyContent: 'center',
  },
  value: {
    fontFamily: 'Lexend_700Bold',
    fontSize: 17,
    fontVariant: ['tabular-nums'],
  },
  label: {
    fontFamily: 'Lexend_400Regular',
    fontSize: 10,
  },
  closed: {
    fontFamily: 'Lexend_700Bold',
    fontSize: 12,
    color: t.textMuted,
  },
});
