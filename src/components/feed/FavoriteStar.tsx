import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet } from 'react-native';
import Animated, {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { colors } from '@/constants/colors';
import { useUserData } from '@/context/userdata';
import { useStyles, useTheme, type Theme } from '@/theme';
import { useI18n } from '@/i18n';

/** Heart toggle with a pop + ring burst when a job is saved. */
export function FavoriteStar({ jobId, size = 22 }: { jobId: string; size?: number }) {
  const { tr } = useI18n();
  const t = useTheme();
  const styles = useStyles(makeStyles);
  const { favorites, toggleFavorite } = useUserData();
  const active = favorites.includes(jobId);
  const scale = useSharedValue(1);
  const burst = useSharedValue(0);

  function onPress() {
    toggleFavorite(jobId);
    scale.set(withSequence(withSpring(active ? 0.8 : 1.35, { damping: 6 }), withSpring(1)));
    if (!active) {
      burst.set(0);
      burst.set(withTiming(1, { duration: 500 }));
    }
  }

  const starStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  const burstStyle = useAnimatedStyle(() => ({
    opacity: interpolate(burst.value, [0, 0.2, 1], [0, 0.6, 0]),
    transform: [{ scale: interpolate(burst.value, [0, 1], [0.6, 1.8]) }],
  }));

  return (
    <Pressable
      onPress={onPress}
      hitSlop={10}
      style={styles.button}
      accessibilityRole="button"
      accessibilityLabel={active ? tr('feed.removeFav') : tr('feed.addFav')}
      accessibilityState={{ selected: active }}>
      <Animated.View style={[styles.burst, { width: size * 1.6, height: size * 1.6, borderRadius: size }, burstStyle]} />
      <Animated.View style={starStyle}>
        <Ionicons name={active ? 'heart' : 'heart-outline'} size={size} color={active ? colors.orange : t.text} />
      </Animated.View>
    </Pressable>
  );
}

const makeStyles = (t: Theme) =>
  StyleSheet.create({
  button: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  burst: {
    position: 'absolute',
    borderWidth: 2,
    borderColor: colors.orange,
  },
});
