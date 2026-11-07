import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown, ZoomIn } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemeSwitcher } from '@/components/ThemeSwitcher';
import { colors } from '@/constants/colors';
import { useAuth } from '@/context/auth';
import { useUserData } from '@/context/userdata';
import { useStyles, useTheme, type Theme } from '@/theme';
import { LanguageSelector } from '@/components/LanguageSwitcher';
import { useI18n } from '@/i18n';

const COVER = 'https://images.unsplash.com/photo-1547970810-dc1eac37d174?w=900&q=70';

export default function Profile() {
  const { tr } = useI18n();
  const t = useTheme();
  const styles = useStyles(makeStyles);
  const insets = useSafeAreaInsets();
  const { user, signOut } = useAuth();
  const { skills, favorites, applied } = useUserData();
  const name = user?.name ?? '';
  const initials = name
    .split(' ')
    .map((part) => part.charAt(0))
    .join('')
    .slice(0, 2)
    .toUpperCase();

  function logout() {
    signOut();
    router.replace('/landing');
  }

  const stats = [
    { label: tr('profile.applied'), value: applied.length },
    { label: tr('profile.saved'), value: favorites.length },
    { label: tr('profile.skills'), value: skills.length },
  ];

  return (
    <ScrollView style={styles.screen} contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
      <View>
        <Image source={{ uri: COVER }} style={[styles.cover, { height: 170 + insets.top }]} contentFit="cover" transition={300} />
        <Animated.View entering={ZoomIn.delay(150).springify().damping(12)} style={styles.avatar}>
          <Text style={styles.avatarText}>{initials || 'M'}</Text>
        </Animated.View>
      </View>

      <Animated.View entering={FadeInDown.delay(250).duration(500)} style={styles.identity}>
        <Text style={styles.name}>{name}</Text>
        <Text style={styles.email}>{user?.email}</Text>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(330).duration(500)} style={styles.stats}>
        {stats.map((stat, i) => (
          <View key={stat.label} style={[styles.stat, i > 0 && styles.statDivider]}>
            <Text style={styles.statValue}>{stat.value}</Text>
            <Text style={styles.statLabel}>{stat.label}</Text>
          </View>
        ))}
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(410).duration(500)} style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>{tr('profile.yourSkills')}</Text>
          <Pressable onPress={() => router.push('/skills')} hitSlop={8}>
            <Text style={styles.link}>{skills.length ? tr('profile.edit') : tr('profile.add')}</Text>
          </Pressable>
        </View>
        {skills.length ? (
          <View style={styles.chips}>
            {skills.map((skill, i) => (
              <Animated.View key={skill} entering={ZoomIn.delay(450 + i * 40)} style={styles.chip}>
                <Text style={styles.chipText}>{skill}</Text>
              </Animated.View>
            ))}
          </View>
        ) : (
          <Text style={styles.muted}>{tr('profile.noSkills')}</Text>
        )}
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(450).duration(500)} style={styles.card}>
        <Text style={[styles.cardTitle, styles.cardTitleSpaced]}>{tr('profile.appearance')}</Text>
        <ThemeSwitcher labels={{ system: tr('profile.system'), light: tr('profile.light'), dark: tr('profile.dark') }} />
        <Text style={[styles.cardTitle, styles.cardTitleSpaced, styles.cardTitleTop]}>{tr('common.language')}</Text>
        <LanguageSelector />
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(490).duration(500)}>
        <Pressable style={({ pressed }) => [styles.logout, pressed && { opacity: 0.7 }]} onPress={logout}>
          <Ionicons name="log-out-outline" size={20} color={t.danger} />
          <Text style={styles.logoutText}>{tr('profile.logout')}</Text>
        </Pressable>
      </Animated.View>
    </ScrollView>
  );
}

const makeStyles = (t: Theme) =>
  StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: t.bgAlt,
  },
  cover: {
    width: '100%',
    backgroundColor: t.surfaceAlt,
  },
  avatar: {
    position: 'absolute',
    bottom: -44,
    alignSelf: 'center',
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: colors.orange,
    borderWidth: 4,
    borderColor: t.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontFamily: 'Lexend_700Bold',
    fontSize: 30,
    color: colors.white,
  },
  identity: {
    alignItems: 'center',
    marginTop: 54,
    paddingHorizontal: 24,
  },
  name: {
    fontFamily: 'Lexend_700Bold',
    fontSize: 22,
    color: t.text,
    textAlign: 'center',
  },
  email: {
    fontFamily: 'Lexend_400Regular',
    fontSize: 13,
    color: t.textMuted,
    marginTop: 2,
  },
  stats: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginTop: 20,
    paddingVertical: 16,
    borderRadius: 18,
    backgroundColor: t.navy,
  },
  stat: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    borderLeftWidth: 1,
    borderLeftColor: 'rgba(255,255,255,0.12)',
  },
  statValue: {
    fontFamily: 'Lexend_700Bold',
    fontSize: 20,
    color: colors.white,
  },
  statLabel: {
    fontFamily: 'Lexend_400Regular',
    fontSize: 11,
    color: 'rgba(255,255,255,0.7)',
  },
  card: {
    marginHorizontal: 20,
    marginTop: 16,
    padding: 18,
    borderRadius: 18,
    backgroundColor: t.surface,
    borderWidth: 1,
    borderColor: t.border,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  cardTitleTop: {
    marginTop: 20,
  },
  cardTitleSpaced: {
    marginBottom: 12,
  },
  cardTitle: {
    fontFamily: 'Lexend_700Bold',
    fontSize: 13,
    letterSpacing: 0.8,
    color: t.textBody,
    textTransform: 'uppercase',
  },
  link: {
    fontFamily: 'Lexend_700Bold',
    fontSize: 13,
    color: colors.blue,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: 'rgba(53,168,223,0.12)',
  },
  chipText: {
    fontFamily: 'Lexend_700Bold',
    fontSize: 12,
    color: '#1f86b8',
  },
  muted: {
    fontFamily: 'Lexend_400Regular',
    fontSize: 13,
    color: t.textMuted,
  },
  logout: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginHorizontal: 20,
    marginTop: 16,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: 'rgba(229,72,77,0.08)',
  },
  logoutText: {
    fontFamily: 'Lexend_700Bold',
    fontSize: 14,
    color: t.danger,
  },
});
