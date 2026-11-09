import { Ionicons } from '@expo/vector-icons';
import { useEffect } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  FadeIn,
  interpolate,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
  ZoomIn,
} from 'react-native-reanimated';

import { GoogleG } from '@/components/icons/GoogleG';
import { colors } from '@/constants/colors';
import { useStyles, type Theme } from '@/theme';

type Props = {
  label: string;
  onPress: () => void;
  loading?: boolean;
  success?: boolean;
  shimmer?: boolean;
  variant?: 'solid' | 'outline' | 'google';
  /** Fully rounded pill, matching the sign-in reference. */
  pill?: boolean;
  /** Arrow sitting on the right edge of a solid button. */
  arrow?: boolean;
};

/** Big rounded button with press spring, optional shimmer, loading spinner and success tick. */
export function PrimaryButton({ label, onPress, loading, success, shimmer, variant = 'solid', pill, arrow }: Props) {
  const styles = useStyles(makeStyles);
  const reduceMotion = useReducedMotion();
  const scale = useSharedValue(1);
  const sweep = useSharedValue(0);

  useEffect(() => {
    if (!shimmer || reduceMotion) return;
    sweep.set(
      withRepeat(
        withSequence(
          withDelay(1800, withTiming(1, { duration: 900, easing: Easing.inOut(Easing.quad) })),
          withTiming(0, { duration: 0 })
        ),
        -1,
        false
      )
    );
  }, [shimmer, reduceMotion, sweep]);

  const pressStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  const sweepStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: interpolate(sweep.value, [0, 1], [-120, 420]) }, { rotate: '20deg' }],
  }));

  const outline = variant === 'outline';
  const google = variant === 'google';
  const busy = loading || success;

  return (
    <Animated.View style={pressStyle}>
      <Pressable
        disabled={busy}
        onPress={onPress}
        onPressIn={() => scale.set(withSpring(0.96, { damping: 15, stiffness: 320 }))}
        onPressOut={() => scale.set(withSpring(1, { damping: 10, stiffness: 200 }))}
        accessibilityRole="button"
        accessibilityState={{ busy: !!busy }}
        style={[styles.button, pill && styles.pill, google ? styles.google : outline ? styles.outline : styles.solid, success && styles.success]}>
        {shimmer && variant === 'solid' && <Animated.View pointerEvents="none" style={[styles.sweep, sweepStyle]} />}
        <View style={styles.content}>
          {success ? (
            <Animated.View entering={ZoomIn.springify()}>
              <Ionicons name="checkmark" size={24} color={colors.white} />
            </Animated.View>
          ) : loading ? (
            <Animated.View entering={FadeIn}>
              <ActivityIndicator color={outline ? colors.orange : colors.white} />
            </Animated.View>
          ) : google ? (
            <View style={styles.googleRow}>
              <GoogleG size={22} />
              <Text style={[styles.label, styles.googleLabel]}>{label}</Text>
            </View>
          ) : (
            <View style={styles.labelRow}>
              <Text style={[styles.label, outline && styles.outlineLabel]}>{label}</Text>
              {arrow ? <Ionicons name="arrow-forward" size={18} color={colors.white} style={styles.arrow} /> : null}
            </View>
          )}
        </View>
      </Pressable>
    </Animated.View>
  );
}

const makeStyles = (t: Theme) =>
  StyleSheet.create({
  button: {
    height: 56,
    borderRadius: 16,
    overflow: 'hidden',
    justifyContent: 'center',
  },
  pill: {
    borderRadius: 28,
  },
  solid: {
    backgroundColor: colors.orange,
    shadowColor: colors.orange,
    shadowOpacity: 0.35,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 5,
  },
  success: {
    backgroundColor: t.success,
    shadowColor: t.success,
  },
  outline: {
    borderWidth: 1.5,
    borderColor: colors.orange,
    backgroundColor: t.surface,
  },
  content: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  labelRow: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  arrow: {
    position: 'absolute',
    right: 22,
  },
  label: {
    fontFamily: 'Lexend_700Bold',
    fontSize: 16,
    color: colors.white,
  },
  outlineLabel: {
    color: colors.orange,
  },
  google: {
    borderWidth: 1.5,
    borderColor: t.border,
    backgroundColor: t.surface,
  },
  googleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  googleLabel: {
    color: t.text,
    fontSize: 15,
  },
  sweep: {
    position: 'absolute',
    top: -20,
    bottom: -20,
    width: 50,
    backgroundColor: 'rgba(255,255,255,0.28)',
  },
});
