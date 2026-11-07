import { createContext, useContext, type ReactNode } from 'react';
import { useWindowDimensions, type StyleProp, type ViewStyle } from 'react-native';
import Animated, {
  Easing,
  interpolate,
  measure,
  useAnimatedReaction,
  useAnimatedRef,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';

export const ScrollYContext = createContext<SharedValue<number> | null>(null);

type Props = {
  children: ReactNode;
  delay?: number;
  distance?: number;
  style?: StyleProp<ViewStyle>;
};

/**
 * Fades + slides its children in the first time they scroll into view.
 * Must be rendered inside a ScrollYContext provider.
 */
export function Reveal({ children, delay = 0, distance = 28, style }: Props) {
  const scrollY = useContext(ScrollYContext);
  const reduceMotion = useReducedMotion();
  const { height } = useWindowDimensions();
  const ref = useAnimatedRef<Animated.View>();
  const progress = useSharedValue(reduceMotion ? 1 : 0);
  const triggered = useSharedValue(reduceMotion);
  const laidOut = useSharedValue(0);

  useAnimatedReaction(
    () => (scrollY ? scrollY.value : 0) + laidOut.value,
    () => {
      if (triggered.value || laidOut.value === 0) return;
      const box = measure(ref);
      if (!box) return;
      if (box.pageY < height * 0.92) {
        triggered.value = true;
        progress.value = withDelay(
          delay,
          withTiming(1, { duration: 650, easing: Easing.out(Easing.cubic) })
        );
      }
    }
  );

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [
      { translateY: interpolate(progress.value, [0, 1], [distance, 0]) },
      { scale: interpolate(progress.value, [0, 1], [0.97, 1]) },
    ],
  }));

  return (
    <Animated.View
      ref={ref}
      style={[style, animatedStyle]}
      onLayout={() => {
        laidOut.set((count) => count + 1);
      }}>
      {children}
    </Animated.View>
  );
}
