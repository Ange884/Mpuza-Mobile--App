import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useState, type ReactNode } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, {
  FadeInDown,
  FadeInUp,
  ZoomIn,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { LanguageSelector } from '@/components/LanguageSwitcher';
import { ThemeSwitcher } from '@/components/ThemeSwitcher';
import { colors } from '@/constants/colors';
import { useAuth } from '@/context/auth';
import { useUserData } from '@/context/userdata';
import { LANG_NAMES, useI18n } from '@/i18n';
import { useStyles, useTheme, useThemeMode, type Theme, type ThemeMode } from '@/theme';

type IconName = keyof typeof Ionicons.glyphMap;

type RowProps = {
  icon: IconName;
  label: string;
  value?: string;
  onPress: () => void;
  danger?: boolean;
  last?: boolean;
};

function SettingsRow({ icon, label, value, onPress, danger, last }: RowProps) {
  const t = useTheme();
  const styles = useStyles(makeStyles);
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.row, pressed && styles.rowPressed, last && styles.rowLast]}
      accessibilityRole="button">
      <View style={[styles.rowIcon, danger && styles.rowIconDanger]}>
        <Ionicons name={icon} size={20} color={danger ? t.danger : t.text} />
      </View>
      <Text style={[styles.rowLabel, danger && styles.rowLabelDanger]}>{label}</Text>
      <View style={styles.rowEnd}>
        {value ? <Text style={styles.rowValue} numberOfLines={1}>{value}</Text> : null}
        {!danger && <Ionicons name="chevron-forward" size={18} color={t.textFaint} />}
      </View>
    </Pressable>
  );
}

function SettingsGroup({ title, children }: { title: string; children: ReactNode }) {
  const styles = useStyles(makeStyles);
  return (
    <View style={styles.group}>
      <Text style={styles.groupTitle}>{title}</Text>
      <View style={styles.groupCard}>{children}</View>
    </View>
  );
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

function EditProfileButton({ label, onPress }: { label: string; onPress: () => void }) {
  const styles = useStyles(makeStyles);
  const scale = useSharedValue(1);
  const lift = useSharedValue(0);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }, { translateY: lift.value }],
  }));

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={() => {
        scale.set(withSpring(0.97, { damping: 14, stiffness: 320 }));
        lift.set(withSpring(1, { damping: 14, stiffness: 320 }));
      }}
      onPressOut={() => {
        scale.set(withSpring(1, { damping: 12, stiffness: 260 }));
        lift.set(withSpring(0, { damping: 12, stiffness: 260 }));
      }}
      style={[styles.editBtnOuter, animStyle]}
      accessibilityRole="button">
      <LinearGradient
        colors={['#f07852', colors.orange]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.editBtn}>
        <View style={styles.editIconChip}>
          <Ionicons name="create-outline" size={17} color={colors.orange} />
        </View>
        <Text style={styles.editBtnText}>{label}</Text>
      </LinearGradient>
    </AnimatedPressable>
  );
}

function SheetModal({
  visible,
  title,
  onClose,
  children,
}: {
  visible: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
}) {
  const t = useTheme();
  const styles = useStyles(makeStyles);
  const insets = useSafeAreaInsets();
  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <Pressable style={styles.sheetBackdrop} onPress={onClose}>
        <Pressable style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, 20) }]} onPress={(e) => e.stopPropagation()}>
          <View style={styles.sheetHandle} />
          <View style={styles.sheetHeader}>
            <Text style={styles.sheetTitle}>{title}</Text>
            <Pressable onPress={onClose} hitSlop={12} accessibilityRole="button" accessibilityLabel="Close">
              <Ionicons name="close" size={22} color={t.textMuted} />
            </Pressable>
          </View>
          {children}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

export default function Profile() {
  const { tr, lang } = useI18n();
  const theme = useTheme();
  const styles = useStyles(makeStyles);
  const insets = useSafeAreaInsets();
  const { user, signOut } = useAuth();
  const { skills } = useUserData();
  const { mode } = useThemeMode();
  const [languageOpen, setLanguageOpen] = useState(false);
  const [themeOpen, setThemeOpen] = useState(false);

  const name = user?.name ?? tr('settings.guest');
  const initials = name
    .split(' ')
    .map((part) => part.charAt(0))
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const roleLine = skills.length > 0 ? skills[0] : tr('settings.jobSeeker');
  const themeLabel = tr(`profile.${mode === 'system' ? 'system' : mode}` as 'profile.system' | 'profile.light' | 'profile.dark');

  const heroColors =
    theme.scheme === 'dark'
      ? (['#16181c', '#121820', theme.bgAlt] as const)
      : (['#fff9f6', '#f4f6f9', theme.bgAlt] as const);

  function logout() {
    signOut();
    router.replace('/landing');
  }

  const themeLabels: Record<ThemeMode, string> = {
    system: tr('profile.system'),
    light: tr('profile.light'),
    dark: tr('profile.dark'),
  };

  return (
    <View style={styles.screen}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 + insets.bottom }}>
        <View style={styles.hero}>
          <LinearGradient colors={heroColors} locations={[0, 0.45, 1]} style={StyleSheet.absoluteFill} />
          <View style={[styles.heroTop, { paddingTop: insets.top + 10 }]}>
            <Animated.View entering={FadeInDown.duration(420)}>
              <Pressable
                style={({ pressed }) => [styles.backBtn, pressed && styles.backBtnPressed]}
                onPress={() => router.navigate('/home')}
                accessibilityRole="button"
                accessibilityLabel={tr('tab.home')}>
                <Ionicons name="chevron-back" size={22} color={theme.text} />
              </Pressable>
            </Animated.View>
            <Animated.Text entering={FadeInDown.delay(60).duration(500)} style={styles.heroTitle}>
              {tr('settings.title')}
            </Animated.Text>
          </View>

          <Animated.View
            entering={FadeInDown.delay(120).springify().damping(16).stiffness(120)}
            style={styles.profileCard}>
            <Animated.View entering={ZoomIn.delay(220).springify().damping(12)} style={styles.avatarRing}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{initials || 'M'}</Text>
              </View>
            </Animated.View>

            <Animated.Text entering={FadeInDown.delay(280).duration(400)} style={styles.name} numberOfLines={1}>
              {name}
            </Animated.Text>
            <Animated.Text entering={FadeInDown.delay(320).duration(400)} style={styles.email} numberOfLines={1}>
              {user?.email ?? '—'}
            </Animated.Text>

            <Animated.View entering={FadeInDown.delay(360).duration(400)} style={styles.metaRow}>
              <Text style={styles.metaText} numberOfLines={1}>
                {roleLine}
              </Text>
              <Text style={styles.metaDot}> • </Text>
              <Ionicons name="location-outline" size={14} color={theme.textMuted} />
              <Text style={styles.metaText} numberOfLines={1}>
                {tr('settings.locationDefault')}
              </Text>
            </Animated.View>

            <Animated.View entering={FadeInUp.delay(420).springify().damping(14)} style={styles.editBtnSlot}>
              <EditProfileButton label={tr('settings.editProfile')} onPress={() => router.push('/skills')} />
            </Animated.View>
          </Animated.View>
        </View>

        <View style={styles.body}>
          <Animated.View entering={FadeInDown.delay(180).duration(450)}>
            <SettingsGroup title={tr('settings.sectionAccount')}>
              <SettingsRow icon="person-outline" label={tr('settings.manageProfile')} onPress={() => router.push('/skills')} />
              <SettingsRow icon="lock-closed-outline" label={tr('settings.password')} onPress={() => router.push('/forgot-password')} />
              <SettingsRow icon="notifications-outline" label={tr('settings.notifications')} onPress={() => router.navigate('/alerts')} />
              <SettingsRow
                icon="language-outline"
                label={tr('common.language')}
                value={LANG_NAMES[lang]}
                onPress={() => setLanguageOpen(true)}
                last
              />
            </SettingsGroup>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(240).duration(450)}>
            <SettingsGroup title={tr('settings.sectionPreferences')}>
              <SettingsRow icon="information-circle-outline" label={tr('settings.about')} onPress={() => router.push('/explore')} />
              <SettingsRow icon="contrast-outline" label={tr('settings.theme')} value={themeLabel} onPress={() => setThemeOpen(true)} />
              <SettingsRow
                icon="ribbon-outline"
                label={tr('settings.mySkills')}
                value={skills.length ? String(skills.length) : tr('settings.addSkills')}
                onPress={() => router.push('/skills')}
                last
              />
            </SettingsGroup>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(300).duration(450)}>
            <SettingsGroup title={tr('settings.sectionSupport')}>
              <SettingsRow icon="help-circle-outline" label={tr('settings.help')} onPress={() => router.push('/explore')} last />
            </SettingsGroup>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(360).duration(450)} style={styles.group}>
            <View style={styles.groupCard}>
              <SettingsRow icon="log-out-outline" label={tr('profile.logout')} onPress={logout} danger last />
            </View>
          </Animated.View>
        </View>
      </ScrollView>

      <SheetModal visible={languageOpen} title={tr('common.language')} onClose={() => setLanguageOpen(false)}>
        <LanguageSelector />
      </SheetModal>

      <SheetModal visible={themeOpen} title={tr('settings.theme')} onClose={() => setThemeOpen(false)}>
        <ThemeSwitcher labels={themeLabels} />
      </SheetModal>
    </View>
  );
}

const makeStyles = (t: Theme) =>
  StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: t.bgAlt,
    },
    hero: {
      paddingBottom: 8,
      overflow: 'hidden',
    },
    heroTop: {
      paddingHorizontal: 20,
      paddingBottom: 16,
    },
    backBtn: {
      width: 40,
      height: 40,
      borderRadius: 7,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: t.scheme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.72)',
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: t.scheme === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(14,49,76,0.06)',
    },
    backBtnPressed: {
      opacity: 0.75,
      transform: [{ scale: 0.96 }],
    },
    heroTitle: {
      marginTop: 14,
      fontFamily: 'Lexend_700Bold',
      fontSize: 28,
      color: t.text,
      letterSpacing: -0.3,
    },
    profileCard: {
      marginHorizontal: 20,
      marginTop: 4,
      paddingTop: 52,
      paddingBottom: 22,
      paddingHorizontal: 20,
      borderRadius: 7,
      backgroundColor: t.surface,
      alignItems: 'center',
      shadowColor: '#0e314c',
      shadowOpacity: t.scheme === 'dark' ? 0.35 : 0.1,
      shadowRadius: 20,
      shadowOffset: { width: 0, height: 10 },
      elevation: 8,
    },
    avatarRing: {
      position: 'absolute',
      top: -44,
      padding: 4,
      borderRadius: 7,
      backgroundColor: t.surface,
      shadowColor: '#0e314c',
      shadowOpacity: 0.12,
      shadowRadius: 10,
      shadowOffset: { width: 0, height: 4 },
      elevation: 4,
    },
    avatar: {
      width: 84,
      height: 84,
      borderRadius: 7,
      backgroundColor: colors.orange,
      alignItems: 'center',
      justifyContent: 'center',
    },
    avatarText: {
      fontFamily: 'Lexend_700Bold',
      fontSize: 28,
      color: colors.white,
    },
    name: {
      fontFamily: 'Lexend_700Bold',
      fontSize: 20,
      color: t.text,
      textAlign: 'center',
    },
    email: {
      fontFamily: 'Lexend_400Regular',
      fontSize: 13,
      color: t.textMuted,
      marginTop: 4,
      textAlign: 'center',
    },
    metaRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 10,
      paddingHorizontal: 8,
      flexWrap: 'wrap',
      gap: 2,
    },
    metaText: {
      fontFamily: 'Lexend_400Regular',
      fontSize: 13,
      color: t.textMuted,
      maxWidth: '46%',
    },
    metaDot: {
      fontFamily: 'Lexend_400Regular',
      fontSize: 13,
      color: t.textFaint,
    },
    editBtnSlot: {
      marginTop: 18,
      width: '100%',
      alignItems: 'center',
    },
    editBtnOuter: {
      maxWidth: '100%',
      borderRadius: 7,
      shadowColor: colors.orange,
      shadowOpacity: 0.22,
      shadowRadius: 14,
      shadowOffset: { width: 0, height: 8 },
      elevation: 5,
    },
    editBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 10,
      paddingVertical: 13,
      paddingHorizontal: 26,
      borderRadius: 7,
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.22)',
    },
    editIconChip: {
      width: 34,
      height: 34,
      borderRadius: 7,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'rgba(255,255,255,0.92)',
    },
    editBtnText: {
      fontFamily: 'Lexend_700Bold',
      fontSize: 15,
      color: colors.white,
      flexShrink: 1,
      paddingRight: 4,
    },
    body: {
      paddingHorizontal: 20,
      paddingTop: 18,
    },
    group: {
      marginBottom: 22,
    },
    groupTitle: {
      fontFamily: 'Lexend_400Regular',
      fontSize: 13,
      color: t.textMuted,
      marginBottom: 8,
      marginLeft: 4,
    },
    groupCard: {
      borderRadius: 7,
      backgroundColor: t.surface,
      overflow: 'hidden',
      shadowColor: '#0e314c',
      shadowOpacity: t.scheme === 'dark' ? 0.18 : 0.05,
      shadowRadius: 10,
      shadowOffset: { width: 0, height: 3 },
      elevation: 2,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      paddingVertical: 14,
      paddingHorizontal: 16,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: t.border,
    },
    rowLast: {
      borderBottomWidth: 0,
    },
    rowPressed: {
      backgroundColor: t.surfaceAlt,
    },
    rowIcon: {
      width: 36,
      height: 36,
      borderRadius: 7,
      backgroundColor: t.surfaceAlt,
      alignItems: 'center',
      justifyContent: 'center',
    },
    rowIconDanger: {
      backgroundColor: 'rgba(229,72,77,0.1)',
    },
    rowLabel: {
      flex: 1,
      fontFamily: 'Lexend_400Regular',
      fontSize: 15,
      color: t.text,
    },
    rowLabelDanger: {
      color: t.danger,
      fontFamily: 'Lexend_700Bold',
    },
    rowEnd: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      maxWidth: '42%',
    },
    rowValue: {
      fontFamily: 'Lexend_400Regular',
      fontSize: 14,
      color: t.textMuted,
    },
    sheetBackdrop: {
      flex: 1,
      justifyContent: 'flex-end',
      backgroundColor: t.overlay,
    },
    sheet: {
      borderTopLeftRadius: 7,
      borderTopRightRadius: 7,
      backgroundColor: t.surface,
      paddingHorizontal: 20,
      paddingTop: 10,
    },
    sheetHandle: {
      alignSelf: 'center',
      width: 40,
      height: 4,
      borderRadius: 2,
      backgroundColor: t.border,
      marginBottom: 14,
    },
    sheetHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 16,
    },
    sheetTitle: {
      fontFamily: 'Lexend_700Bold',
      fontSize: 17,
      color: t.text,
    },
  });
