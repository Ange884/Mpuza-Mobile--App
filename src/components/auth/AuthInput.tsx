import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View, type TextInputProps } from 'react-native';
import Animated, {
  FadeInDown,
  FadeOut,
  interpolate,
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
  ZoomIn,
} from 'react-native-reanimated';

import { colors } from '@/constants/colors';
import { useStyles, useTheme, type Theme } from '@/theme';
import { useI18n } from '@/i18n';

const ERROR = '#e5484d';

type Props = Omit<TextInputProps, 'style'> & {
  label: string;
  /** Icon shown on the right of the field (password fields show the eye toggle instead). */
  icon?: keyof typeof Ionicons.glyphMap;
  error?: string;
  /** Increment to replay the shake animation (e.g. on every failed submit). */
  shakeKey?: number;
  password?: boolean;
  /** Shows a green tick on the right when the value is valid. */
  valid?: boolean;
};

/** Labelled text field: animated focus ring + glow, error shake, show/hide password. */
export function AuthInput({ label, icon, error, shakeKey = 0, password, valid, onFocus, onBlur, ...input }: Props) {
  const { tr } = useI18n();
  const t = useTheme();
  const styles = useStyles(makeStyles);
  const [hidden, setHidden] = useState(true);
  const focus = useSharedValue(0);
  const shake = useSharedValue(0);

  useEffect(() => {
    if (!error || shakeKey === 0) return;
    shake.set(
      withSequence(
        withTiming(-8, { duration: 50 }),
        withTiming(8, { duration: 50 }),
        withTiming(-6, { duration: 50 }),
        withTiming(6, { duration: 50 }),
        withTiming(0, { duration: 50 })
      )
    );
  }, [shakeKey, error, shake]);

  const hasError = !!error;
  const boxStyle = useAnimatedStyle(() => ({
    borderColor: hasError ? ERROR : interpolateColor(focus.value, [0, 1], [t.border, colors.orange]),
    shadowOpacity: interpolate(focus.value, [0, 1], [0, 0.18]),
    transform: [{ translateX: shake.value }],
  }));
  const labelStyle = useAnimatedStyle(() => ({
    color: hasError ? ERROR : interpolateColor(focus.value, [0, 1], [t.navy, colors.orange]),
  }));

  return (
    <View style={styles.wrapper}>
      <Animated.Text style={[styles.label, labelStyle]}>{label}</Animated.Text>
      <Animated.View style={[styles.box, boxStyle]}>
        <TextInput
          {...input}
          secureTextEntry={password && hidden}
          placeholderTextColor={t.textFaint}
          style={styles.input}
          onFocus={(event) => {
            focus.set(withTiming(1, { duration: 220 }));
            onFocus?.(event);
          }}
          onBlur={(event) => {
            focus.set(withTiming(0, { duration: 220 }));
            onBlur?.(event);
          }}
        />
        {password ? (
          <Pressable
            onPress={() => setHidden((value) => !value)}
            hitSlop={10}
            accessibilityLabel={hidden ? tr('common.showPassword') : tr('common.hidePassword')}>
            <Animated.View key={hidden ? 'eye' : 'eye-off'} entering={ZoomIn.duration(180)}>
              <Ionicons name={hidden ? 'eye-outline' : 'eye-off-outline'} size={20} color={t.textMuted} />
            </Animated.View>
          </Pressable>
        ) : valid ? (
          <Animated.View entering={ZoomIn.springify().damping(12)}>
            <Ionicons name="checkmark-circle" size={20} color={t.success} />
          </Animated.View>
        ) : icon ? (
          <Ionicons name={icon} size={20} color={hasError ? ERROR : t.textMuted} />
        ) : null}
      </Animated.View>
      {error ? (
        <Animated.View entering={FadeInDown.duration(200)} exiting={FadeOut.duration(150)} style={styles.errorRow}>
          <Ionicons name="alert-circle" size={13} color={ERROR} />
          <Text style={styles.error}>{error}</Text>
        </Animated.View>
      ) : null}
    </View>
  );
}

const makeStyles = (t: Theme) =>
  StyleSheet.create({
  wrapper: {
    marginBottom: 18,
  },
  label: {
    fontFamily: 'Lexend_700Bold',
    fontSize: 13,
    marginBottom: 8,
  },
  box: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    height: 54,
    paddingHorizontal: 16,
    borderRadius: 14,
    borderWidth: 1.5,
    backgroundColor: t.surface,
    shadowColor: colors.orange,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  input: {
    flex: 1,
    height: '100%',
    fontFamily: 'Lexend_400Regular',
    fontSize: 15,
    color: t.text,
  },
  errorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 6,
    marginLeft: 2,
  },
  error: {
    fontFamily: 'Lexend_400Regular',
    fontSize: 12,
    color: ERROR,
  },
});
