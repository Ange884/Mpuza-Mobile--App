import { Ionicons } from '@expo/vector-icons';
import { useCallback, useState } from 'react';
import { Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import Animated, {
  FadeIn,
  SlideInLeft,
  SlideInRight,
  SlideOutLeft,
  SlideOutRight,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

import { colors } from '@/constants/colors';
import { clientReviewIds, clientReviewInitials, type ClientReviewId } from '@/data/clientReviews';
import { useI18n } from '@/i18n';
import type { TranslationKey } from '@/i18n/en';
import { useStyles, type Theme } from '@/theme';

const H_PADDING = 20;

type SlideDir = 'next' | 'prev';

function reviewKey(id: ClientReviewId, part: 'Quote' | 'Name' | 'Role'): TranslationKey {
  return `landing.clientReview${id}${part}` as TranslationKey;
}

export function ClientReviewsCarousel() {
  const { tr } = useI18n();
  const { width } = useWindowDimensions();
  const styles = useStyles(makeStyles);
  const cardWidth = width - H_PADDING * 2;

  const [index, setIndex] = useState(0);
  const [dir, setDir] = useState<SlideDir>('next');
  const reviewId = clientReviewIds[index] ?? clientReviewIds[0];
  const total = clientReviewIds.length;

  const go = useCallback(
    (delta: number) => {
      if (total < 2) return;
      setDir(delta > 0 ? 'next' : 'prev');
      setIndex((i) => (i + delta + total) % total);
    },
    [total],
  );

  const entering =
    dir === 'next'
      ? SlideInRight.springify().damping(22).stiffness(175).mass(0.85)
      : SlideInLeft.springify().damping(22).stiffness(175).mass(0.85);
  const exiting = dir === 'next' ? SlideOutLeft.duration(300) : SlideOutRight.duration(300);

  return (
    <View style={styles.panel}>
      <View style={[styles.stage, { width: cardWidth }]}>
        <Animated.View key={reviewId} entering={entering} exiting={exiting} style={styles.cardSlot}>
          <ReviewCard id={reviewId} width={cardWidth} />
        </Animated.View>
      </View>

      <View style={styles.nav}>
        <NavArrow
          variant="ghost"
          icon="arrow-back"
          label={tr('landing.clientReviewsPrev')}
          onPress={() => go(-1)}
          disabled={total < 2}
        />
        <Animated.View entering={FadeIn.duration(280)} key={index}>
          <Text style={styles.pager}>
            {index + 1} / {total}
          </Text>
        </Animated.View>
        <NavArrow
          variant="filled"
          icon="arrow-forward"
          label={tr('landing.clientReviewsNext')}
          onPress={() => go(1)}
          disabled={total < 2}
        />
      </View>
    </View>
  );
}

function ReviewCard({ id, width }: { id: ClientReviewId; width: number }) {
  const { tr } = useI18n();
  const styles = useStyles(makeStyles);
  const quote = tr(reviewKey(id, 'Quote'));
  const name = tr(reviewKey(id, 'Name'));
  const role = tr(reviewKey(id, 'Role'));
  const initials = clientReviewInitials[id];

  return (
    <View style={[styles.card, { width }]}>
      <Text style={styles.quoteMark} accessible={false}>
        {'\u201D'}
      </Text>
      <Text style={styles.quote}>{quote}</Text>
      <View style={styles.author}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initials}</Text>
        </View>
        <View style={styles.authorText}>
          <Text style={styles.name}>{name}</Text>
          <Text style={styles.role}>{role}</Text>
        </View>
      </View>
    </View>
  );
}

function NavArrow({
  variant,
  icon,
  label,
  onPress,
  disabled,
}: {
  variant: 'ghost' | 'filled';
  icon: 'arrow-back' | 'arrow-forward';
  label: string;
  onPress: () => void;
  disabled?: boolean;
}) {
  const styles = useStyles(makeStyles);
  const scale = useSharedValue(1);
  const anim = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  const filled = variant === 'filled';
  const tint = disabled ? 'rgba(237,99,60,0.35)' : filled ? colors.white : colors.orange;

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      onPressIn={() => scale.set(withSpring(0.92, { damping: 16 }))}
      onPressOut={() => scale.set(withSpring(1, { damping: 14 }))}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={[
        styles.navBtn,
        filled ? styles.navBtnFilled : styles.navBtnGhost,
        disabled && styles.navBtnDisabled,
      ]}>
      <Animated.View style={anim}>
        <Ionicons name={icon} size={20} color={tint} />
      </Animated.View>
    </Pressable>
  );
}

const makeStyles = (t: Theme) =>
  StyleSheet.create({
    panel: {
      width: '100%',
      alignItems: 'center',
      backgroundColor: 'transparent',
      paddingTop: 8,
      paddingBottom: 28,
    },
    stage: {
      overflow: 'hidden',
      minHeight: 300,
      alignSelf: 'center',
    },
    cardSlot: {
      width: '100%',
    },
    card: {
      backgroundColor: t.scheme === 'dark' ? t.surface : colors.cream,
      borderRadius: 26,
      paddingHorizontal: 24,
      paddingTop: 28,
      paddingBottom: 26,
      borderWidth: 1,
      borderColor: 'rgba(14,49,76,0.06)',
      shadowColor: colors.dblue,
      shadowOpacity: 0.06,
      shadowRadius: 20,
      shadowOffset: { width: 0, height: 10 },
      elevation: 3,
    },
    quoteMark: {
      fontFamily: 'InstrumentSerif_400Regular',
      fontSize: 56,
      lineHeight: 56,
      color: colors.orange,
      marginBottom: 4,
    },
    quote: {
      fontFamily: 'Lexend_400Regular',
      fontSize: 15,
      lineHeight: 24,
      color: t.scheme === 'dark' ? t.textBody : colors.dblue,
      opacity: 0.92,
    },
    author: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      marginTop: 28,
    },
    avatar: {
      width: 46,
      height: 46,
      borderRadius: 23,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'rgba(237,99,60,0.14)',
      borderWidth: 2,
      borderColor: 'rgba(237,99,60,0.35)',
    },
    avatarText: {
      fontFamily: 'Lexend_700Bold',
      fontSize: 13,
      color: colors.orange,
    },
    authorText: {
      flex: 1,
    },
    name: {
      fontFamily: 'Lexend_700Bold',
      fontSize: 15,
      color: t.text,
    },
    role: {
      fontFamily: 'Lexend_400Regular',
      fontSize: 13,
      color: t.textMuted,
      marginTop: 2,
    },
    nav: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 22,
      marginTop: 22,
    },
    navBtn: {
      width: 50,
      height: 50,
      borderRadius: 25,
      alignItems: 'center',
      justifyContent: 'center',
    },
    navBtnGhost: {
      backgroundColor: t.scheme === 'dark' ? t.surfaceAlt : colors.white,
      borderWidth: 1,
      borderColor: 'rgba(14,49,76,0.08)',
    },
    navBtnFilled: {
      backgroundColor: colors.orange,
      shadowColor: colors.orange,
      shadowOpacity: 0.35,
      shadowRadius: 12,
      shadowOffset: { width: 0, height: 6 },
      elevation: 4,
    },
    navBtnDisabled: {
      opacity: 0.5,
    },
    pager: {
      fontFamily: 'Lexend_400Regular',
      fontSize: 12,
      color: t.textMuted,
      minWidth: 44,
      textAlign: 'center',
    },
  });
