import { Ionicons } from '@expo/vector-icons';
import { useCallback, useMemo, useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
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
import { useResponsiveStyles, type Theme } from '@/theme';
import { type ResponsiveInfo, useResponsive } from '@/utils/responsive';

function cardWidthFor(r: ResponsiveInfo): number {
  const column = Math.min(r.width, r.contentMaxWidth);
  const inset = r.gutter * 2;
  const available = Math.max(280, column - inset);
  if (r.width >= 1280) {
    return Math.min(available, Math.round(column * 0.92));
  }
  if (r.isWide) {
    return Math.min(available, Math.round(column * 0.88));
  }
  if (r.isTablet) {
    return Math.min(available, Math.round(column * 0.84));
  }
  return available;
}

type SlideDir = 'next' | 'prev';

function reviewKey(id: ClientReviewId, part: 'Quote' | 'Name' | 'Role'): TranslationKey {
  return `landing.clientReview${id}${part}` as TranslationKey;
}

export function ClientReviewsCarousel() {
  const { tr } = useI18n();
  const r = useResponsive();
  const styles = useResponsiveStyles(makeStyles);
  const cardWidth = useMemo(() => cardWidthFor(r), [r.width, r.contentMaxWidth, r.gutter, r.isTablet, r.isWide]);
  const useSlide = Platform.OS !== 'web' && !r.isWide;

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

  const entering = useSlide
    ? dir === 'next'
      ? SlideInRight.springify().damping(22).stiffness(175).mass(0.85)
      : SlideInLeft.springify().damping(22).stiffness(175).mass(0.85)
    : FadeIn.duration(320);
  const exiting = useSlide
    ? dir === 'next'
      ? SlideOutLeft.duration(300)
      : SlideOutRight.duration(300)
    : undefined;

  return (
    <View style={styles.panel}>
      <View style={[styles.stage, { maxWidth: cardWidth }]}>
        <Animated.View key={reviewId} entering={entering} exiting={exiting} style={[styles.cardSlot, { width: cardWidth }]}>
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
  const r = useResponsive();
  const styles = useResponsiveStyles(makeStyles);
  const quote = tr(reviewKey(id, 'Quote'));
  const name = tr(reviewKey(id, 'Name'));
  const role = tr(reviewKey(id, 'Role'));
  const initials = clientReviewInitials[id];

  return (
    <View style={[styles.card, { width, paddingHorizontal: r.rs(24), paddingTop: r.rs(28), paddingBottom: r.rs(26) }]}>
      <Text style={[styles.quoteMark, { fontSize: r.rf(56), lineHeight: r.rf(56) }]} accessible={false}>
        {'\u201D'}
      </Text>
      <Text style={[styles.quote, { fontSize: r.rf(15), lineHeight: r.rf(24) }]}>{quote}</Text>
      <View style={[styles.author, { marginTop: r.rs(28), gap: r.rs(12) }]}>
        <View style={[styles.avatar, { width: r.rs(46), height: r.rs(46) }]}>
          <Text style={[styles.avatarText, { fontSize: r.rf(13) }]}>{initials}</Text>
        </View>
        <View style={styles.authorText}>
          <Text style={[styles.name, { fontSize: r.rf(15) }]}>{name}</Text>
          <Text style={[styles.role, { fontSize: r.rf(13) }]}>{role}</Text>
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
  const r = useResponsive();
  const styles = useResponsiveStyles(makeStyles);
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
        <Ionicons name={icon} size={r.rf(20)} color={tint} />
      </Animated.View>
    </Pressable>
  );
}

const makeStyles = (t: Theme, r: ResponsiveInfo) =>
  StyleSheet.create({
    panel: {
      width: '100%',
      maxWidth: r.contentMaxWidth,
      alignItems: 'center',
      alignSelf: 'center',
      backgroundColor: 'transparent',
      paddingTop: r.rs(8),
      paddingBottom: r.rs(28),
    },
    stage: {
      width: '100%',
      overflow: 'hidden',
      minHeight: r.rs(200),
      alignSelf: 'center',
      alignItems: 'center',
      justifyContent: 'center',
    },
    cardSlot: {
      alignSelf: 'center',
    },
    card: {
      backgroundColor: t.scheme === 'dark' ? t.surface : colors.white,
      borderRadius: 7,
      borderWidth: 1,
      borderColor: t.scheme === 'dark' ? t.border : 'rgba(14,49,76,0.06)',
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
      color: t.scheme === 'dark' ? t.textBody : colors.dblue,
      opacity: 0.92,
      flexShrink: 1,
      alignSelf: 'stretch',
      maxWidth: '100%',
    },
    author: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    avatar: {
      borderRadius: 7,
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
      gap: r.rs(22),
      marginTop: r.rs(22),
    },
    navBtn: {
      width: r.rs(50),
      height: r.rs(50),
      borderRadius: 7,
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
