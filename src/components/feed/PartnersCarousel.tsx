import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  SlideInRight,
  SlideOutLeft,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { colors } from '@/constants/colors';
import { partners, type Partner } from '@/data/explore';
import { useI18n } from '@/i18n';
import { useStyles, type Theme } from '@/theme';

const ROTATE_MS = 4600;

type Props = {
  title?: string;
  subtitle?: string;
  onPartnerPress?: (partner: Partner) => void;
};

export function PartnersCarousel({ title, subtitle, onPartnerPress }: Props) {
  const { tr } = useI18n();
  const styles = useStyles(makeStyles);
  const [index, setIndex] = useState(0);
  const partner = partners[index] ?? partners[0];
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const advance = useCallback(() => {
    setIndex((i) => (i + 1) % partners.length);
  }, []);

  const pick = useCallback((i: number) => {
    setIndex(i);
    if (timerRef.current) clearInterval(timerRef.current);
    if (partners.length < 2) return;
    timerRef.current = setInterval(advance, ROTATE_MS);
  }, [advance]);

  useEffect(() => {
    if (partners.length < 2) return;
    timerRef.current = setInterval(advance, ROTATE_MS);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [advance]);

  return (
    <View style={styles.wrap}>
      <Text style={styles.title}>{title ?? tr('explore.trustedTitle')}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}

      <View style={styles.stage}>
        <Animated.View
          key={partner.name}
          entering={SlideInRight.springify().damping(20).stiffness(165).mass(0.9)}
          exiting={SlideOutLeft.duration(340)}
          style={styles.card}>
          <PartnerCard partner={partner} onPress={() => (onPartnerPress ? onPartnerPress(partner) : router.push('/home'))} />
        </Animated.View>
      </View>

      <View style={styles.dots}>
        {partners.map((p, i) => (
          <PagerDot key={p.name} active={i === index} onPress={() => pick(i)} />
        ))}
      </View>
    </View>
  );
}

function PartnerCard({ partner, onPress }: { partner: Partner; onPress: () => void }) {
  const { tr } = useI18n();
  const styles = useStyles(makeStyles);
  const ctaScale = useSharedValue(1);
  const ctaPressStyle = useAnimatedStyle(() => ({ transform: [{ scale: ctaScale.value }] }));

  return (
    <View style={styles.cardInner}>
        <View style={styles.cardTop}>
          <Text style={styles.partnerName} numberOfLines={1}>
            {partner.name}
          </Text>
          <View style={styles.avatar}>
            <Ionicons name={partner.icon} size={22} color={colors.dblue} />
          </View>
        </View>

        <Text style={styles.blurb} numberOfLines={2}>
          {partner.blurb}
        </Text>

        <View style={styles.pills}>
          <Pill icon="location-outline" label={partner.location} />
          <Pill icon="globe-outline" label={tr('home.partnerPublic')} />
          <Pill icon="people-outline" label={tr('home.partnerRoles', { n: partner.openRoles })} />
        </View>

        <View style={styles.divider}>
          {Array.from({ length: 28 }).map((_, i) => (
            <View key={i} style={styles.dash} />
          ))}
        </View>

        <View style={styles.footer}>
          <View style={styles.footerIconRow}>
            <Pressable style={styles.iconBtn} hitSlop={6} accessibilityRole="button" accessibilityLabel={tr('feed.addFav')}>
              <Ionicons name="heart-outline" size={18} color={colors.orange} />
            </Pressable>
            <Pressable style={styles.iconBtn} hitSlop={6} accessibilityRole="button" accessibilityLabel={tr('job.share')}>
              <Ionicons name="share-outline" size={18} color={colors.blue} />
            </Pressable>
          </View>
          <Animated.View style={[styles.ctaWrap, ctaPressStyle]}>
            <Pressable
              onPress={onPress}
              onPressIn={() => ctaScale.set(withSpring(0.96, { damping: 14 }))}
              onPressOut={() => ctaScale.set(withSpring(1, { damping: 12 }))}
              style={styles.cta}
              accessibilityRole="button">
              <Ionicons name="person-add-outline" size={16} color={colors.white} />
              <Text style={styles.ctaText}>{tr('home.partnerJoin')}</Text>
            </Pressable>
          </Animated.View>
        </View>
      </View>
  );
}

function Pill({ icon, label }: { icon: keyof typeof Ionicons.glyphMap; label: string }) {
  const styles = useStyles(makeStyles);
  return (
    <View style={styles.pill}>
      <Ionicons name={icon} size={13} color={colors.blue} />
      <Text style={styles.pillText} numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
}

function PagerDot({ active, onPress }: { active: boolean; onPress: () => void }) {
  const styles = useStyles(makeStyles);
  const width = useSharedValue(active ? 22 : 7);

  useEffect(() => {
    width.set(withTiming(active ? 22 : 7, { duration: 220 }));
  }, [active, width]);

  const style = useAnimatedStyle(() => ({ width: width.value }));

  return (
    <Pressable onPress={onPress} hitSlop={8} accessibilityRole="button">
      <Animated.View style={[styles.dot, active ? styles.dotOn : styles.dotOff, style]} />
    </Pressable>
  );
}

const makeStyles = (t: Theme) =>
  StyleSheet.create({
    wrap: {
      marginTop: 8,
    },
    title: {
      fontFamily: 'Lexend_700Bold',
      fontSize: 18,
      color: t.text,
      textAlign: 'center',
    },
    subtitle: {
      fontFamily: 'Lexend_400Regular',
      fontSize: 13,
      lineHeight: 19,
      color: t.textMuted,
      textAlign: 'center',
      marginTop: 6,
      marginBottom: 4,
      paddingHorizontal: 12,
    },
    stage: {
      marginTop: 14,
      minHeight: 248,
      overflow: 'hidden',
    },
    card: {
      width: '100%',
    },
    cardInner: {
      borderRadius: 7,
      padding: 18,
      backgroundColor: t.scheme === 'dark' ? t.surface : colors.white,
      borderWidth: 1,
      borderColor: 'rgba(53,168,223,0.22)',
      shadowColor: colors.dblue,
      shadowOpacity: 0.08,
      shadowRadius: 18,
      shadowOffset: { width: 0, height: 8 },
      elevation: 4,
    },
    cardTop: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 12,
    },
    partnerName: {
      flex: 1,
      fontFamily: 'Lexend_700Bold',
      fontSize: 18,
      color: colors.dblue,
    },
    avatar: {
      width: 46,
      height: 46,
      borderRadius: 7,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'rgba(53,168,223,0.18)',
      borderWidth: 1,
      borderColor: 'rgba(53,168,223,0.35)',
    },
    blurb: {
      marginTop: 10,
      fontFamily: 'Lexend_400Regular',
      fontSize: 13,
      lineHeight: 19,
      color: t.textBody,
    },
    pills: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
      marginTop: 14,
    },
    pill: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 7,
      backgroundColor: 'rgba(53,168,223,0.1)',
      borderWidth: 1,
      borderColor: 'rgba(53,168,223,0.18)',
      maxWidth: '100%',
    },
    pillText: {
      fontFamily: 'Lexend_400Regular',
      fontSize: 11,
      color: colors.dblue,
    },
    divider: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginTop: 16,
      marginBottom: 14,
      overflow: 'hidden',
    },
    dash: {
      width: 6,
      height: 1,
      backgroundColor: 'rgba(14,49,76,0.14)',
    },
    footer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 10,
    },
    footerIconRow: {
      flexDirection: 'row',
      gap: 8,
    },
    iconBtn: {
      width: 40,
      height: 40,
      borderRadius: 7,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: 'rgba(53,168,223,0.25)',
      backgroundColor: t.scheme === 'dark' ? t.surfaceAlt : colors.white,
    },
    ctaWrap: {
      flex: 1,
    },
    cta: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
      paddingVertical: 12,
      paddingHorizontal: 14,
      borderRadius: 7,
      backgroundColor: colors.dblue,
    },
    ctaText: {
      fontFamily: 'Lexend_700Bold',
      fontSize: 13,
      color: colors.white,
    },
    dots: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
      marginTop: 16,
    },
    dot: {
      height: 7,
      borderRadius: 4,
    },
    dotOn: {
      backgroundColor: colors.orange,
    },
    dotOff: {
      backgroundColor: 'rgba(53,168,223,0.35)',
    },
  });
