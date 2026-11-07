import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown, FadeInRight } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors } from '@/constants/colors';
import { useAlerts, type Alert } from '@/hooks/useAlerts';

export default function Alerts() {
  const insets = useSafeAreaInsets();
  const alerts = useAlerts();

  return (
    <View style={styles.screen}>
      <Animated.View entering={FadeInDown.duration(500)} style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <Text style={styles.title}>Job alerts</Text>
        <Text style={styles.subtitle}>New matches, closing deadlines and your applications</Text>
      </Animated.View>

      <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
        {alerts.map((alert, i) => (
          <Animated.View key={alert.id} entering={FadeInRight.delay(80 + i * 60).springify().damping(18)}>
            <AlertRow alert={alert} />
          </Animated.View>
        ))}
        {alerts.length === 0 && (
          <Animated.View entering={FadeInDown.delay(150)} style={styles.empty}>
            <Ionicons name="notifications-off-outline" size={30} color="#a0a9b5" />
            <Text style={styles.emptyText}>You&apos;re all caught up.</Text>
          </Animated.View>
        )}
      </ScrollView>
    </View>
  );
}

function AlertRow({ alert }: { alert: Alert }) {
  const onPress = () => {
    if (alert.jobId) router.push({ pathname: '/job/[id]', params: { id: alert.jobId } });
    else router.push('/skills');
  };
  return (
    <Pressable style={({ pressed }) => [styles.row, pressed && styles.pressed]} onPress={onPress}>
      <View style={[styles.icon, { backgroundColor: alert.color + '1a' }]}>
        <Ionicons name={alert.icon} size={20} color={alert.color} />
      </View>
      <View style={styles.rowText}>
        <Text style={styles.rowTitle}>{alert.title}</Text>
        <Text style={styles.rowBody}>{alert.text}</Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color="#b5bcc7" />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#f6f8fb',
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 16,
    backgroundColor: colors.white,
  },
  title: {
    fontFamily: 'Lexend_700Bold',
    fontSize: 24,
    color: colors.dblue,
  },
  subtitle: {
    fontFamily: 'Lexend_400Regular',
    fontSize: 13,
    color: '#7a8796',
    marginTop: 4,
  },
  list: {
    padding: 20,
    gap: 10,
    paddingBottom: 40,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderRadius: 16,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: '#edf0f5',
  },
  pressed: {
    opacity: 0.7,
  },
  icon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowText: {
    flex: 1,
  },
  rowTitle: {
    fontFamily: 'Lexend_700Bold',
    fontSize: 14,
    color: colors.dblue,
  },
  rowBody: {
    fontFamily: 'Lexend_400Regular',
    fontSize: 13,
    lineHeight: 18,
    color: '#5b6b7a',
    marginTop: 2,
  },
  empty: {
    alignItems: 'center',
    marginTop: 60,
    gap: 10,
  },
  emptyText: {
    fontFamily: 'Lexend_400Regular',
    fontSize: 14,
    color: '#7a8796',
  },
});
