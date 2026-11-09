import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSequence, withSpring } from 'react-native-reanimated';

import { colors } from '@/constants/colors';
import { useUserData } from '@/context/userdata';
import { useStyles, useTheme, type Theme } from '@/theme';
import { useI18n } from '@/i18n';

/** Save / Saved pill with heart — styled for the saved jobs list (reference layout). */
export function SavedHeartPill({ jobId, onToggle }: { jobId: string; onToggle?: () => void }) {
  const { tr } = useI18n();
  const t = useTheme();
  const styles = useStyles(makeStyles);
  const { favorites, toggleFavorite } = useUserData();
  const active = favorites.includes(jobId);
  const scale = useSharedValue(1);

  const animStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  function onPress() {
    toggleFavorite(jobId);
    scale.set(withSequence(withSpring(0.92, { damping: 8 }), withSpring(1, { damping: 12 })));
    onToggle?.();
  }

  return (
    <Pressable
      onPress={onPress}
      hitSlop={6}
      accessibilityRole="button"
      accessibilityLabel={active ? tr('feed.removeFav') : tr('feed.addFav')}
      accessibilityState={{ selected: active }}>
      <Animated.View style={[styles.pill, active ? styles.pillOn : styles.pillOff, animStyle]}>
        <Ionicons
          name={active ? 'heart' : 'heart-outline'}
          size={15}
          color={active ? colors.white : t.text}
        />
        <Text style={[styles.label, active ? styles.labelOn : styles.labelOff]}>
          {active ? tr('saved.savedLabel') : tr('saved.save')}
        </Text>
      </Animated.View>
    </Pressable>
  );
}

const makeStyles = (t: Theme) =>
  StyleSheet.create({
    pill: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingHorizontal: 14,
      paddingVertical: 8,
      borderRadius: 999,
    },
    pillOff: {
      backgroundColor: t.scheme === 'dark' ? t.surfaceAlt : '#ebe6df',
    },
    pillOn: {
      backgroundColor: t.scheme === 'dark' ? '#eef3f8' : colors.dblue,
    },
    label: {
      fontFamily: 'Lexend_700Bold',
      fontSize: 12,
    },
    labelOff: {
      color: t.text,
    },
    labelOn: {
      color: t.scheme === 'dark' ? colors.dblue : colors.white,
    },
  });
    },
  });
