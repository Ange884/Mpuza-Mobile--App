import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import type { BottomTabBarProps } from 'expo-router/js-tabs';
import { useEffect } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  interpolate,
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
  ZoomIn,
} from 'react-native-reanimated';

import { colors } from '@/constants/colors';
import { useStyles, useTheme, type Theme } from '@/theme';
import { useI18n } from '@/i18n';
import type { TranslationKey } from '@/i18n/en';

type IconName = keyof typeof Ionicons.glyphMap;

const TABS: Record<string, { label: string; icon: IconName; iconActive: IconName }> = {
  home: { label: 'Home', icon: 'home-outline', iconActive: 'home' },
  saved: { label: 'Saved', icon: 'heart-outline', iconActive: 'heart' },
  alerts: { label: 'Alerts', icon: 'notifications-outline', iconActive: 'notifications' },
  profile: { label: 'Settings', icon: 'settings-outline', iconActive: 'settings' },
};

/** Custom bottom bar: 4 tabs + a raised "Add skills" button in the middle. */
export function TabBar({ state, descriptors, emitter, navigateToTab, insets, badges }: BottomTabBarProps & {
  badges: Record<string, number>;
}) {
  const { tr } = useI18n();
  const styles = useStyles(makeStyles);
  const routes = state.routes.filter((route) => TABS[route.name]);
  const half = Math.ceil(routes.length / 2);

  const renderTab = (route: (typeof routes)[number]) => {
    const index = state.routes.findIndex((r) => r.key === route.key);
    const focused = index === state.index;
    const onPress = () => {
      const event = emitter.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
      if (!focused && !event.defaultPrevented) navigateToTab(route.key);
    };
    return (
      <TabItem
        key={route.key}
        {...TABS[route.name]}
        label={tr(`tab.${route.name}` as TranslationKey)}
        focused={focused}
        badge={badges[route.name] ?? 0}
        onPress={onPress}
        accessibilityLabel={tr(`tab.${route.name}` as TranslationKey)}
      />
    );
  };

  return (
    <View style={[styles.bar, { paddingBottom: Math.max(insets.bottom, 10) }]}>
      {routes.slice(0, half).map(renderTab)}
      <AddButton />
      {routes.slice(half).map(renderTab)}
    </View>
  );
}

function TabItem({
  label,
  icon,
  iconActive,
  focused,
  badge,
  onPress,
  accessibilityLabel,
}: {
  label: string;
  icon: IconName;
  iconActive: IconName;
  focused: boolean;
  badge: number;
  onPress: () => void;
  accessibilityLabel: string;
}) {
  const t = useTheme();
  const styles = useStyles(makeStyles);
  const progress = useSharedValue(focused ? 1 : 0);
  const bounce = useSharedValue(1);

  useEffect(() => {
    progress.set(withTiming(focused ? 1 : 0, { duration: 250 }));
    if (focused) bounce.set(withSequence(withSpring(1.2, { damping: 6 }), withSpring(1)));
  }, [focused, progress, bounce]);

  const iconStyle = useAnimatedStyle(() => ({
    transform: [{ scale: bounce.value }, { translateY: interpolate(progress.value, [0, 1], [0, -2]) }],
  }));
  const dotStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [{ scaleX: interpolate(progress.value, [0, 1], [0.2, 1]) }],
  }));
  const labelStyle = useAnimatedStyle(() => ({
    color: interpolateColor(progress.value, [0, 1], [t.textMuted, colors.orange]),
  }));

  return (
    <Pressable
      style={styles.tab}
      onPress={onPress}
      accessibilityRole="tab"
      accessibilityState={{ selected: focused }}
      accessibilityLabel={accessibilityLabel}>
      <Animated.View style={iconStyle}>
        <Ionicons name={focused ? iconActive : icon} size={23} color={focused ? colors.orange : t.textMuted} />
        {badge > 0 && (
          <Animated.View key={badge} entering={ZoomIn.springify().damping(10)} style={styles.badge}>
            <Text style={styles.badgeText}>{badge > 9 ? '9+' : badge}</Text>
          </Animated.View>
        )}
      </Animated.View>
      <Animated.Text style={[styles.label, labelStyle]}>{label}</Animated.Text>
      <Animated.View style={[styles.dot, dotStyle]} />
    </Pressable>
  );
}

function AddButton() {
  const { tr } = useI18n();
  const styles = useStyles(makeStyles);
  const scale = useSharedValue(1);
  const style = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <View style={styles.tab}>
      <Animated.View style={[styles.addWrap, style]}>
        <Pressable
          style={styles.add}
          onPress={() => router.push('/skills')}
          onPressIn={() => scale.set(withSpring(0.9))}
          onPressOut={() => scale.set(withSpring(1, { damping: 8 }))}
          accessibilityRole="button"
          accessibilityLabel={tr('home.addSkills')}>
          <Ionicons name="add" size={30} color={colors.white} />
        </Pressable>
      </Animated.View>
    </View>
  );
}

const makeStyles = (t: Theme) =>
  StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingTop: 8,
    width: '100%',
    backgroundColor: t.surface,
    borderTopLeftRadius: 7,
    borderTopRightRadius: 7,
    shadowColor: '#0e314c',
    shadowOpacity: 0.08,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: -4 },
    elevation: 12,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    gap: 3,
  },
  label: {
    fontFamily: 'Lexend_400Regular',
    fontSize: 11,
  },
  dot: {
    width: 18,
    height: 3,
    borderRadius: 2,
    backgroundColor: colors.orange,
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -10,
    minWidth: 18,
    height: 18,
    paddingHorizontal: 4,
    borderRadius: 7,
    backgroundColor: t.danger,
    borderWidth: 2,
    borderColor: t.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    fontFamily: 'Lexend_700Bold',
    fontSize: 9,
    color: colors.white,
  },
  addWrap: {
    marginTop: -26,
    marginBottom: 14,
    borderRadius: 7,
    padding: 5,
    backgroundColor: t.surface,
  },
  add: {
    width: 54,
    height: 54,
    borderRadius: 7,
    backgroundColor: colors.orange,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.orange,
    shadowOpacity: 0.45,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  },
});
