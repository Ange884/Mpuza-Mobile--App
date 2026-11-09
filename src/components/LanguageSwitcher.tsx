import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text } from 'react-native';
import Animated, { FadeInDown, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

import { LANGS, useI18n } from '@/i18n';
import { useStyles, useTheme, type Theme } from '@/theme';

/** Small pill that cycles EN → FR → RW, with a spinning globe. `light` = white style for dark/photo backgrounds. */
export function LanguagePill({ light, style }: { light?: boolean; style?: object }) {
  const t = useTheme();
  const styles = useStyles(makeStyles);
  const { lang, setLang, tr } = useI18n();
  const spin = useSharedValue(0);
  const globeStyle = useAnimatedStyle(() => ({ transform: [{ rotate: `${spin.value * 360}deg` }] }));
  const color = light ? '#fff' : t.text;

  return (
    <Pressable
      onPress={() => {
        spin.set(withTiming(spin.get() + 1, { duration: 600 }));
        setLang(LANGS[(LANGS.indexOf(lang) + 1) % LANGS.length]);
      }}
      hitSlop={8}
      style={({ pressed }) => [styles.pill, light ? styles.pillLight : styles.pillPlain, pressed && styles.pressed, style]}
      accessibilityRole="button"
      accessibilityLabel={tr('common.language')}>
      <Animated.View style={globeStyle}>
        <Ionicons name="globe-outline" size={14} color={color} />
      </Animated.View>
      <Animated.Text key={lang} entering={FadeInDown.duration(250)} style={[styles.text, { color }]}>
        {lang.toUpperCase()}
      </Animated.Text>
    </Pressable>
  );
}

/** Three-button EN / FR / RW selector used on the Profile screen. */
export function LanguageSelector() {
  const styles = useStyles(makeStyles);
  const { lang, setLang } = useI18n();
  return (
    <Animated.View style={styles.row}>
      {LANGS.map((code) => {
        const active = code === lang;
        return (
          <Pressable
            key={code}
            onPress={() => setLang(code)}
            style={[styles.option, active && styles.optionActive]}
            accessibilityRole="radio"
            accessibilityState={{ checked: active }}>
            <Text style={[styles.optionCode, active && styles.optionTextActive]}>{code.toUpperCase()}</Text>
          </Pressable>
        );
      })}
    </Animated.View>
  );
}

const makeStyles = (t: Theme) =>
  StyleSheet.create({
    pill: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingHorizontal: 12,
      paddingVertical: 7,
      borderRadius: 7,
      overflow: 'hidden',
    },
    pillLight: {
      backgroundColor: 'rgba(255,255,255,0.25)',
    },
    pillPlain: {
      backgroundColor: t.surfaceAlt,
    },
    pressed: {
      opacity: 0.7,
    },
    text: {
      fontFamily: 'Lexend_700Bold',
      fontSize: 12,
    },
    row: {
      flexDirection: 'row',
      gap: 8,
    },
    option: {
      flex: 1,
      alignItems: 'center',
      paddingVertical: 10,
      borderRadius: 7,
      borderWidth: 1.5,
      borderColor: t.border,
    },
    optionActive: {
      borderColor: t.orange,
      backgroundColor: 'rgba(237,99,60,0.1)',
    },
    optionCode: {
      fontFamily: 'Lexend_700Bold',
      fontSize: 13,
      color: t.textMuted,
    },
    optionTextActive: {
      color: t.orange,
    },
  });
