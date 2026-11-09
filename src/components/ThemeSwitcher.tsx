import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, withSpring, withSequence, withTiming, useSharedValue } from 'react-native-reanimated';

import { useStyles, useTheme, useThemeMode, type Theme, type ThemeMode } from '@/theme';

type IconName = keyof typeof Ionicons.glyphMap;

const OPTIONS: { mode: ThemeMode; icon: IconName }[] = [
  { mode: 'system', icon: 'phone-portrait-outline' },
  { mode: 'light', icon: 'sunny-outline' },
  { mode: 'dark', icon: 'moon-outline' },
];

/** Segmented System / Light / Dark control with a sliding pill. */
export function ThemeSwitcher({ labels }: { labels: Record<ThemeMode, string> }) {
  const t = useTheme();
  const styles = useStyles(makeStyles);
  const { mode, setMode } = useThemeMode();
  const [width, setWidth] = useState(0);
  const index = OPTIONS.findIndex((o) => o.mode === mode);
  const segment = width / OPTIONS.length;

  const pillStyle = useAnimatedStyle(() => ({
    width: segment,
    transform: [{ translateX: withSpring(index * segment, { damping: 18, stiffness: 180 }) }],
  }));

  return (
    <View style={styles.track} onLayout={(e) => setWidth(e.nativeEvent.layout.width - 8)}>
      {width > 0 && <Animated.View style={[styles.pill, pillStyle]} />}
      {OPTIONS.map((option) => {
        const active = option.mode === mode;
        return (
          <Pressable
            key={option.mode}
            style={styles.option}
            onPress={() => setMode(option.mode)}
            accessibilityRole="radio"
            accessibilityState={{ checked: active }}>
            <Ionicons name={option.icon} size={16} color={active ? t.orange : t.textMuted} />
            <Text style={[styles.label, active && styles.labelActive]}>{labels[option.mode]}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

/** Round sun/moon button that flips between light and dark (used on the landing hero). */
export function ThemeToggleButton({ style, color = '#fff' }: { style?: object; color?: string }) {
  const t = useTheme();
  const { setMode } = useThemeMode();
  const spin = useSharedValue(0);
  const dark = t.scheme === 'dark';

  const iconStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${spin.value * 360}deg` }, { scale: 1 - Math.sin(spin.value * Math.PI) * 0.3 }],
  }));

  return (
    <Pressable
      style={style}
      hitSlop={8}
      accessibilityRole="button"
      accessibilityLabel={dark ? 'Switch to light mode' : 'Switch to dark mode'}
      onPress={() => {
        spin.set(withSequence(withTiming(0, { duration: 0 }), withTiming(1, { duration: 500 })));
        setMode(dark ? 'light' : 'dark');
      }}>
      <Animated.View style={iconStyle}>
        <Ionicons name={dark ? 'sunny' : 'moon'} size={16} color={color} />
      </Animated.View>
    </Pressable>
  );
}

const makeStyles = (t: Theme) =>
  StyleSheet.create({
    track: {
      flexDirection: 'row',
      padding: 4,
      borderRadius: 7,
      backgroundColor: t.surfaceAlt,
    },
    pill: {
      position: 'absolute',
      top: 4,
      bottom: 4,
      left: 4,
      borderRadius: 7,
      backgroundColor: t.surface,
      shadowColor: '#000',
      shadowOpacity: 0.08,
      shadowRadius: 6,
      shadowOffset: { width: 0, height: 2 },
      elevation: 2,
    },
    option: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
      paddingVertical: 10,
    },
    label: {
      fontFamily: 'Lexend_400Regular',
      fontSize: 13,
      color: t.textMuted,
    },
    labelActive: {
      fontFamily: 'Lexend_700Bold',
      color: t.text,
    },
  });
