import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, {
  FadeIn,
  FadeInDown,
  FadeInRight,
  FadeOut,
  Layout,
  LinearTransition,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAlerts, type Alert } from '@/hooks/useAlerts';
import { colors } from '@/constants/colors';
import { useStyles, useTheme, type Theme } from '@/theme';
import { useI18n } from '@/i18n';

type SectionKey = 'today' | 'yesterday' | 'earlier';

function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function sectionFor(at: number, now: number): SectionKey {
  const d = new Date(at);
  const n = new Date(now);
  if (isSameDay(d, n)) return 'today';
  const y = new Date(n);
  y.setDate(y.getDate() - 1);
  if (isSameDay(d, y)) return 'yesterday';
  return 'earlier';
}

function formatTime(
  at: number,
  now: number,
  tr: ReturnType<typeof useI18n>['tr'],
) {
  const diff = Math.max(0, now - at);
  if (diff < 60_000) return tr('alerts.justNow');
  if (diff < 60 * 60_000) return tr('alerts.minutesAgo', { n: Math.floor(diff / 60_000) });
  if (diff < 24 * 60 * 60_000 && isSameDay(new Date(at), new Date(now))) {
    return tr('alerts.hoursAgo', { n: Math.max(1, Math.floor(diff / (60 * 60_000))) });
  }
  return new Date(at).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
}

function groupAlerts(items: Alert[], now: number) {
  const buckets: Record<SectionKey, Alert[]> = { today: [], yesterday: [], earlier: [] };
  for (const alert of items) buckets[sectionFor(alert.at, now)].push(alert);
  const order: SectionKey[] = ['today', 'yesterday', 'earlier'];
  return order
    .map((key) => ({ key, items: buckets[key] }))
    .filter((section) => section.items.length > 0);
}

function NotificationRow({
  alert,
  time,
  read,
  onPress,
  index,
}: {
  alert: Alert;
  time: string;
  read: boolean;
  onPress: () => void;
  index: number;
}) {
  const t = useTheme();
  const styles = useStyles(makeStyles);
  const scale = useSharedValue(1);
  const pressStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <Animated.View
      entering={FadeInRight.delay(40 + index * 45).springify().damping(17)}
      exiting={FadeOut.duration(200)}
      layout={LinearTransition.springify().damping(18)}
      style={pressStyle}>
      <Pressable
        onPress={onPress}
        onPressIn={() => scale.set(withSpring(0.985, { damping: 16, stiffness: 320 }))}
        onPressOut={() => scale.set(withSpring(1, { damping: 14, stiffness: 260 }))}
        style={({ pressed }) => [styles.row, pressed && styles.rowPressed, read && styles.rowRead]}
        accessibilityRole="button">
        <View style={styles.iconWrap}>
          <View style={[styles.iconTile, { backgroundColor: t.scheme === 'dark' ? alert.color + '22' : alert.tile }]}>
            <Ionicons name={alert.icon} size={22} color={alert.color} />
          </View>
          {!read && <View style={styles.unreadDot} />}
        </View>
        <View style={styles.rowBody}>
          <Text style={[styles.rowTitle, read && styles.rowTitleRead]} numberOfLines={1}>
            {alert.title}
          </Text>
          <Text style={styles.rowSubtitle} numberOfLines={2}>
            {alert.subtitle}
          </Text>
        </View>
        <Text style={styles.rowTime}>{time}</Text>
      </Pressable>
    </Animated.View>
  );
}

export default function Alerts() {
  const { tr } = useI18n();
  const t = useTheme();
  const styles = useStyles(makeStyles);
  const insets = useSafeAreaInsets();
  const alerts = useAlerts();
  const [now] = useState(() => Date.now());
  const [readIds, setReadIds] = useState<Set<string>>(() => new Set());

  const sections = useMemo(() => groupAlerts(alerts, now), [alerts, now]);

  const sectionTitle = (key: SectionKey) =>
    key === 'today' ? tr('alerts.today') : key === 'yesterday' ? tr('alerts.yesterday') : tr('alerts.earlier');

  function markAllRead() {
    setReadIds(new Set(alerts.map((a) => a.id)));
  }

  function openAlert(alert: Alert) {
    setReadIds((prev) => new Set(prev).add(alert.id));
    if (alert.jobId) router.push({ pathname: '/job/[id]', params: { id: alert.jobId } });
    else router.push('/skills');
  }

  let rowIndex = 0;

  return (
    <View style={styles.screen}>
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <Animated.View entering={FadeInDown.duration(450)} style={styles.headerRow}>
          <Pressable
            style={({ pressed }) => [styles.backBtn, pressed && styles.pressed]}
            onPress={() => router.navigate('/home')}
            accessibilityRole="button"
            accessibilityLabel={tr('tab.home')}>
            <Ionicons name="arrow-back" size={22} color={t.text} />
          </Pressable>
          <Text style={styles.headerTitle}>{tr('alerts.title')}</Text>
          <Pressable
            onPress={markAllRead}
            disabled={alerts.length === 0}
            style={({ pressed }) => [styles.markRead, pressed && styles.pressed, alerts.length === 0 && styles.markReadDisabled]}
            accessibilityRole="button">
            <Text style={[styles.markReadText, alerts.length === 0 && styles.markReadTextDisabled]}>{tr('alerts.markAllRead')}</Text>
          </Pressable>
        </Animated.View>
      </View>

      <ScrollView contentContainerStyle={[styles.list, { paddingBottom: 40 + insets.bottom }]} showsVerticalScrollIndicator={false}>
        {sections.map((section, si) => (
          <Animated.View key={section.key} entering={FadeIn.delay(si * 60).duration(400)} layout={Layout.springify()}>
            <View style={styles.sectionBar}>
              <Text style={styles.sectionLabel}>{sectionTitle(section.key)}</Text>
            </View>
            <View style={styles.sectionCard}>
              {section.items.map((alert, i) => {
                const idx = rowIndex++;
                const isLast = i === section.items.length - 1;
                return (
                  <View key={alert.id}>
                    <NotificationRow
                      alert={alert}
                      time={formatTime(alert.at, now, tr)}
                      read={readIds.has(alert.id)}
                      onPress={() => openAlert(alert)}
                      index={idx}
                    />
                    {!isLast && <View style={styles.divider} />}
                  </View>
                );
              })}
            </View>
          </Animated.View>
        ))}

        {alerts.length === 0 && (
          <Animated.View entering={FadeInDown.delay(120).springify()} style={styles.empty}>
            <View style={styles.emptyIcon}>
              <Ionicons name="notifications-off-outline" size={30} color={t.textMuted} />
            </View>
            <Text style={styles.emptyText}>{tr('alerts.empty')}</Text>
          </Animated.View>
        )}
      </ScrollView>
    </View>
  );
}

const makeStyles = (t: Theme) =>
  StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: t.scheme === 'dark' ? t.bgAlt : colors.white,
    },
    header: {
      paddingHorizontal: 16,
      paddingBottom: 12,
      backgroundColor: t.scheme === 'dark' ? t.bgAlt : colors.white,
    },
    headerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    backBtn: {
      width: 44,
      height: 44,
      borderRadius: 7,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: t.scheme === 'dark' ? t.surface : colors.white,
      borderWidth: 1,
      borderColor: t.scheme === 'dark' ? t.border : 'rgba(14,49,76,0.08)',
    },
    headerTitle: {
      flex: 1,
      fontFamily: 'Lexend_700Bold',
      fontSize: 22,
      color: t.text,
      letterSpacing: -0.3,
    },
    markRead: {
      paddingHorizontal: 4,
      paddingVertical: 8,
    },
    markReadDisabled: {
      opacity: 0.45,
    },
    markReadText: {
      fontFamily: 'Lexend_700Bold',
      fontSize: 13,
      color: colors.blue,
    },
    markReadTextDisabled: {
      color: t.textMuted,
    },
    pressed: {
      opacity: 0.75,
    },
    list: {
      paddingBottom: 24,
    },
    sectionBar: {
      paddingHorizontal: 20,
      paddingVertical: 8,
      backgroundColor: t.scheme === 'dark' ? t.surfaceAlt : colors.white,
    },
    sectionLabel: {
      fontFamily: 'Lexend_400Regular',
      fontSize: 13,
      color: t.textMuted,
    },
    sectionCard: {
      backgroundColor: t.scheme === 'dark' ? t.surface : colors.white,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      paddingHorizontal: 18,
      paddingVertical: 14,
      backgroundColor: t.scheme === 'dark' ? t.surface : colors.white,
    },
    rowPressed: {
      backgroundColor: t.scheme === 'dark' ? t.surfaceAlt : 'rgba(14,49,76,0.04)',
    },
    rowRead: {
      opacity: 0.82,
    },
    iconWrap: {
      position: 'relative',
    },
    iconTile: {
      width: 48,
      height: 48,
      borderRadius: 7,
      alignItems: 'center',
      justifyContent: 'center',
    },
    rowBody: {
      flex: 1,
      paddingRight: 6,
    },
    rowTitle: {
      fontFamily: 'Lexend_700Bold',
      fontSize: 15,
      color: t.text,
    },
    rowTitleRead: {
      fontFamily: 'Lexend_400Regular',
    },
    rowSubtitle: {
      fontFamily: 'Lexend_400Regular',
      fontSize: 13,
      lineHeight: 18,
      color: t.textMuted,
      marginTop: 2,
    },
    rowTime: {
      fontFamily: 'Lexend_400Regular',
      fontSize: 11,
      color: t.textFaint,
      minWidth: 52,
      textAlign: 'right',
    },
    unreadDot: {
      position: 'absolute',
      top: -2,
      right: -2,
      width: 9,
      height: 9,
      borderRadius: 5,
      backgroundColor: colors.blue,
      borderWidth: 2,
      borderColor: t.scheme === 'dark' ? t.surface : colors.white,
    },
    divider: {
      height: StyleSheet.hairlineWidth,
      marginLeft: 78,
      backgroundColor: t.scheme === 'dark' ? t.border : 'rgba(14,49,76,0.08)',
    },
    empty: {
      alignItems: 'center',
      marginTop: 64,
      paddingHorizontal: 32,
    },
    emptyIcon: {
      width: 72,
      height: 72,
      borderRadius: 7,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: t.scheme === 'dark' ? t.surfaceAlt : colors.white,
      borderWidth: 1,
      borderColor: t.scheme === 'dark' ? t.border : 'rgba(14,49,76,0.08)',
    },
    emptyText: {
      fontFamily: 'Lexend_400Regular',
      fontSize: 14,
      color: t.textMuted,
      marginTop: 12,
      textAlign: 'center',
    },
  });
