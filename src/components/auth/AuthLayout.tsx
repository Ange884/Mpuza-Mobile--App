import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { type ReactNode } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn, FadeInDown, FadeInUp } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors } from '@/constants/colors';

type Props = {
  /** Small centred title in the top bar, e.g. "Sign in". */
  screenTitle: string;
  heading: ReactNode;
  subtitle: string;
  children: ReactNode;
  footer: ReactNode;
};

/** Shared shell for the login and sign-up screens: top bar, big heading, form, footer link. */
export function AuthLayout({ screenTitle, heading, subtitle, children, footer }: Props) {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.screen}>
      {/* TOP BAR */}
      <Animated.View entering={FadeIn.duration(350)} style={[styles.topBar, { paddingTop: insets.top }]}>
        <Pressable
          onPress={() => (router.canGoBack() ? router.back() : router.replace('/account'))}
          hitSlop={12}
          style={({ pressed }) => [styles.back, pressed && styles.pressed]}
          accessibilityLabel="Go back">
          <Ionicons name="chevron-back" size={24} color={colors.dblue} />
        </Pressable>
        <Text style={styles.screenTitle}>{screenTitle}</Text>
        <View style={styles.back} />
      </Animated.View>

      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 20 }]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          <Animated.Text entering={FadeInDown.delay(120).duration(550)} style={styles.heading}>
            {heading}
          </Animated.Text>
          <Animated.Text entering={FadeInDown.delay(200).duration(550)} style={styles.subtitle}>
            {subtitle}
          </Animated.Text>

          <View style={styles.form}>{children}</View>

          <Animated.View entering={FadeInUp.delay(750).duration(500)} style={styles.footer}>
            {footer}
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

/** "Text  Link" row used at the bottom of the auth screens. */
export function SwitchLink({ text, link, onPress }: { text: string; link: string; onPress: () => void }) {
  return (
    <View style={styles.switchRow}>
      <Text style={styles.switchText}>{text} </Text>
      <Pressable onPress={onPress} hitSlop={8}>
        {({ pressed }) => <Text style={[styles.switchLink, pressed && styles.pressed]}>{link}</Text>}
      </Pressable>
    </View>
  );
}

/** Thin "or" separator between the main and Google buttons. */
export function OrDivider() {
  return (
    <View style={styles.orRow}>
      <View style={styles.orLine} />
      <Text style={styles.orText}>or</Text>
      <View style={styles.orLine} />
    </View>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  pressed: {
    opacity: 0.6,
  },
  screen: {
    flex: 1,
    backgroundColor: colors.white,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingBottom: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e3e6ec',
    backgroundColor: colors.white,
  },
  back: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  screenTitle: {
    fontFamily: 'Lexend_700Bold',
    fontSize: 16,
    color: colors.dblue,
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 28,
  },
  heading: {
    fontFamily: 'Lexend_700Bold',
    fontSize: 28,
    lineHeight: 36,
    color: colors.dblue,
  },
  subtitle: {
    fontFamily: 'Lexend_400Regular',
    fontSize: 14,
    lineHeight: 21,
    color: '#7a8796',
    marginTop: 6,
  },
  form: {
    marginTop: 32,
  },
  footer: {
    marginTop: 'auto',
    paddingTop: 28,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  switchText: {
    fontFamily: 'Lexend_400Regular',
    fontSize: 14,
    color: '#8a95a3',
  },
  switchLink: {
    fontFamily: 'Lexend_700Bold',
    fontSize: 14,
    color: colors.blue,
  },
  orRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginVertical: 18,
  },
  orLine: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#dfe3ea',
  },
  orText: {
    fontFamily: 'Lexend_400Regular',
    fontSize: 12,
    color: '#a0a9b5',
  },
});
