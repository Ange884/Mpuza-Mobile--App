import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn, FadeOut, SlideInDown, SlideOutDown, ZoomIn } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors } from '@/constants/colors';
import type { Job } from '@/data/explore';

type Props = {
  job: Job | null;
  onClose: () => void;
};

/** Bottom sheet that asks guests to log in or sign up before opening a job. */
export function AuthPromptSheet({ job, onClose }: Props) {
  const insets = useSafeAreaInsets();

  function goTo(mode: 'login' | 'signup', jobId: string) {
    onClose();
    router.push({ pathname: '/account', params: { mode, job: jobId } });
  }

  // The wrapper stays mounted so the exiting animations can play.
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
      {job && (
      <Animated.View entering={FadeIn.duration(220)} exiting={FadeOut.duration(200)} style={styles.backdrop}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} accessibilityLabel="Close" />
      </Animated.View>
      )}

      {job && (
      <Animated.View
        entering={SlideInDown.springify().damping(18).stiffness(160)}
        exiting={SlideOutDown.duration(220)}
        style={[styles.sheet, { paddingBottom: insets.bottom + 20 }]}>
        <View style={styles.handle} />

        <Pressable style={styles.close} onPress={onClose} hitSlop={10} accessibilityLabel="Close">
          <Ionicons name="close" size={20} color="#6b6b7b" />
        </Pressable>

        <Animated.View entering={ZoomIn.delay(150).springify()} style={styles.iconWrap}>
          <Ionicons name="lock-closed" size={26} color={colors.white} />
        </Animated.View>

        <Text style={styles.title}>Sign in to continue</Text>
        <Text style={styles.text}>
          Create a free MPUZA account or log in to view the full details and apply for{' '}
          <Text style={styles.highlight}>{job.title}</Text> at {job.company}.
        </Text>

        <View style={styles.perks}>
          {['Apply in one tap', 'Save jobs and get alerts', 'Track your applications'].map((perk) => (
            <View key={perk} style={styles.perk}>
              <Ionicons name="checkmark-circle" size={16} color={colors.blue} />
              <Text style={styles.perkText}>{perk}</Text>
            </View>
          ))}
        </View>

        <Pressable
          style={({ pressed }) => [styles.primary, pressed && styles.pressed]}
          onPress={() => goTo('signup', job.id)}>
          <Text style={styles.primaryText}>Sign up — it&apos;s free</Text>
        </Pressable>
        <Pressable
          style={({ pressed }) => [styles.secondary, pressed && styles.pressed]}
          onPress={() => goTo('login', job.id)}>
          <Text style={styles.secondaryText}>I already have an account</Text>
        </Pressable>
      </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(12,12,30,0.5)',
  },
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.white,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 24,
    paddingTop: 10,
    alignItems: 'center',
  },
  handle: {
    width: 42,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#e2e2ea',
    marginBottom: 18,
  },
  close: {
    position: 'absolute',
    top: 16,
    right: 18,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f3f3f7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.orange,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.orange,
    shadowOpacity: 0.4,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  title: {
    fontFamily: 'Lexend_700Bold',
    fontSize: 20,
    color: '#15152b',
    marginTop: 16,
  },
  text: {
    fontFamily: 'Lexend_400Regular',
    fontSize: 14,
    lineHeight: 21,
    color: '#5f5f70',
    textAlign: 'center',
    marginTop: 8,
  },
  highlight: {
    fontFamily: 'Lexend_700Bold',
    color: '#15152b',
  },
  perks: {
    alignSelf: 'stretch',
    gap: 8,
    marginTop: 18,
    marginBottom: 22,
    padding: 14,
    borderRadius: 14,
    backgroundColor: 'rgba(53,168,223,0.08)',
  },
  perk: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  perkText: {
    fontFamily: 'Lexend_400Regular',
    fontSize: 13,
    color: '#2a2a3c',
  },
  primary: {
    alignSelf: 'stretch',
    alignItems: 'center',
    paddingVertical: 15,
    borderRadius: 14,
    backgroundColor: colors.orange,
  },
  primaryText: {
    fontFamily: 'Lexend_700Bold',
    fontSize: 15,
    color: colors.white,
  },
  secondary: {
    alignSelf: 'stretch',
    alignItems: 'center',
    paddingVertical: 14,
    marginTop: 10,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: colors.blue,
  },
  secondaryText: {
    fontFamily: 'Lexend_700Bold',
    fontSize: 14,
    color: colors.blue,
  },
  pressed: {
    opacity: 0.75,
  },
});
