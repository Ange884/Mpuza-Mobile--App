import { StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { colors } from '@/constants/colors';
import { useCountdown } from '@/hooks/useCountdown';

const pad = (n: number) => String(n).padStart(2, '0');

/** "03 Days 23 Hours 23 Minutes 52 Seconds" — the seconds digit rolls in every tick. */
export function Countdown({ deadline, compact }: { deadline: number; compact?: boolean }) {
  const { days, hours, minutes, seconds, expired, urgent } = useCountdown(deadline);

  if (expired) return <Text style={styles.closed}>Applications closed</Text>;

  const color = urgent ? '#e5484d' : colors.orange;
  const units = [
    { value: days, label: 'Days' },
    { value: hours, label: 'Hours' },
    { value: minutes, label: compact ? 'Min' : 'Minutes' },
    { value: seconds, label: compact ? 'Sec' : 'Seconds', roll: true },
  ];

  return (
    <View style={styles.row}>
      {units.map((unit) => (
        <View key={unit.label} style={styles.unit}>
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

const styles = StyleSheet.create({
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
    color: '#8a95a3',
  },
});
