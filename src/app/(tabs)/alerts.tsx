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

function groupAlerts(items: Alert[], now: number) {
  const buckets: Record<SectionKey, Alert[]> = { today: [], yesterday: [], earlier: [] };
  for (const alert of items) buckets[sectionFor(alert.at, now)].push(alert);
  const order: SectionKey[] = ['today', 'yesterday', 'earlier'];
  return order
    .map((key) => ({ key, items: buckets[key] }))
    .filter((section) => section.items.length > 0);
}

function NotificationCard({
  alert,
  read,
  onPress,
  index,
}: {
  alert: Alert;
  read: boolean;
  onPress: () => void;
  index: number;
}) {
  const { tr } = useI18n();
  const t = useTheme();
  const styles = useStyles(makeStyles);
  const scale = useSharedValue(1);
  const pressStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <Animated.View
      entering={FadeInRight.delay(30 + index * 50).springify().damping(18).stiffness(160)}
      exiting={FadeOut.duration(180)}
      layout={LinearTransition.springify().damping(18)}
      style={pressStyle}>
      <Pressable
        onPress={onPress}
        onPressIn={() => scale.set(withSpring(0.98, { damping: 16, stiffness: 320 }))}
        onPressOut={() => scale.set(withSpring(1, { damping: 14, stiffness: 260 }))}
        style={({ pressed }) => [styles.card, pressed && styles.cardPressed, read && styles.cardRead]}
        accessibilityRole="button">
        <View style={[styles.rail, { backgroundColor: alert.accent }]} />
        <View style={styles.cardBody}>
          <View style={styles.statusRow}>
            <Text style={[styles.status, { color: alert.accent }]}>{alert.status}</Text>
            {!read && <View style={[styles.unreadDot, { backgroundColor: alert.accent }]} />}
          </View>
          <Text style={styles.cardTitle} numberOfLines={1}>
            {alert.title}
          </Text>
          <Text style={styles.cardDetail} numberOfLines={2}>
            {alert.detail}
          </Text>
          <View style={styles.meta}>
            <View style={styles.metaItem}>
              <Ionicons name="time-outline" size={14} color={t.textMuted} />
              <Text style={styles.metaText}>{alert.window}</Text>
            </View>
            {alert.applicants != null && (
              <View style={styles.metaItem}>
                <Ionicons name="people-outline" size={14} color={t.textMuted} />
                <Text style={styles.metaText}>{tr('alerts.applicants', { n: alert.applicants })}</Text>
              </View>
            )}
          </View>
        </View>
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
          <Animated.View key={section.key} entering={FadeIn.delay(si * 60).duration(400)} layout={Layout.springify()} style={styles.section}>
            <Text style={styles.sectionLabel}>{sectionTitle(section.key)}</Text>
            <View style={styles.stack}>
              {section.items.map((alert) => {
                const idx = rowIndex++;
                return (
                  <NotificationCard
                    key={alert.id}
                    alert={alert}
                    read={readIds.has(alert.id)}
                    onPress={() => openAlert(alert)}
                    index={idx}
                  />
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
      paddingHorizontal: 16,
      paddingTop: 6,
      paddingBottom: 24,
    },
    section: {
      marginBottom: 8,
    },
    sectionLabel: {
      fontFamily: 'Lexend_700Bold',
      fontSize: 12,
      letterSpacing: 1.1,
      textTransform: 'uppercase',
      color: t.textMuted,
      marginBottom: 10,
      marginTop: 8,
      paddingHorizontal: 4,
    },
    stack: {
      gap: 12,
    },
    card: {
      flexDirection: 'row',
      borderRadius: 7,
      backgroundColor: t.scheme === 'dark' ? t.surface : colors.white,
      borderWidth: 1,
      borderColor: t.scheme === 'dark' ? t.border : 'rgba(53,168,223,0.18)',
      paddingVertical: 16,
      paddingRight: 16,
      paddingLeft: 18,
      shadowColor: colors.dblue,
      shadowOpacity: t.scheme === 'dark' ? 0 : 0.06,
      shadowRadius: 14,
      shadowOffset: { width: 0, height: 6 },
      elevation: 2,
    },
    cardPressed: {
      backgroundColor: t.scheme === 'dark' ? t.surfaceAlt : 'rgba(53,168,223,0.06)',
    },
    cardRead: {
      opacity: 0.72,
    },
    rail: {
      width: 3,
      borderRadius: 2,
      marginRight: 14,
      alignSelf: 'stretch',
    },
    cardBody: {
      flex: 1,
    },
    statusRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    status: {
      fontFamily: 'Lexend_700Bold',
      fontSize: 11,
      letterSpacing: 1.2,
      textTransform: 'uppercase',
    },
    unreadDot: {
      width: 7,
      height: 7,
      borderRadius: 4,
    },
    cardTitle: {
      fontFamily: 'Lexend_700Bold',
      fontSize: 16,
      color: t.scheme === 'dark' ? t.text : colors.dblue,
      marginTop: 6,
    },
    cardDetail: {
      fontFamily: 'Lexend_400Regular',
      fontSize: 13,
      lineHeight: 18,
      color: t.textMuted,
      marginTop: 3,
    },
    meta: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      alignItems: 'center',
      gap: 14,
      marginTop: 12,
    },
    metaItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
    },
    metaText: {
      fontFamily: 'Lexend_400Regular',
      fontSize: 12,
      color: t.textMuted,
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
