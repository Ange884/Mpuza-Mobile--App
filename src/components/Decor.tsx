import { useEffect } from 'react';
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

/** A 0↔1 value that loops forever (off when the user prefers reduced motion). */
export function useFloat(duration: number, delay = 0) {
  const reduceMotion = useReducedMotion();
  const value = useSharedValue(0);
  useEffect(() => {
    if (reduceMotion) return;
    value.set(
      withDelay(delay, withRepeat(withTiming(1, { duration, easing: Easing.inOut(Easing.sin) }), -1, true))
    );
  }, [value, duration, delay, reduceMotion]);
  return value;
}

/** Small twinkling diamond used around illustrations. */
export function Sparkle({
  top,
  left,
  delay,
  color,
  size = 12,
}: {
  top: `${number}%`;
  left: `${number}%`;
  delay: number;
  color: string;
  size?: number;
}) {
  const twinkle = useFloat(1400, delay);
  const style = useAnimatedStyle(() => ({
    opacity: interpolate(twinkle.value, [0, 1], [0.25, 1]),
    transform: [{ scale: interpolate(twinkle.value, [0, 1], [0.6, 1.15]) }, { rotate: '45deg' }],
  }));
  return (
    <Animated.View
      pointerEvents="none"
      style={[{ position: 'absolute', top, left, width: size, height: size, borderRadius: 2, backgroundColor: color }, style]}
    />
  );
}
