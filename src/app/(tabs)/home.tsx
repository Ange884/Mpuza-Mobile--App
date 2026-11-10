import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Pressable, RefreshControl, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import Animated, {
  FadeIn,
  FadeInDown,
  FadeInRight,
  FadeOut,
  useAnimatedScrollHandler,
  useSharedValue,
  ZoomIn,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { FeedJobCard } from '@/components/feed/FeedJobCard';
import { HomeJobGridCard } from '@/components/feed/HomeJobGridCard';
import { PostCard } from '@/components/feed/PostCard';
import { Reveal, ScrollYContext } from '@/components/Reveal';
import { toFeedJob } from '@/api/mapJob';
import { getAdReactions, getCategoryJobs, getForYouFeed, imageUrl, listAdvertisements, listFavorites } from '@/api/mpuza';
import { colors } from '@/constants/colors';
import { useAuth } from '@/context/auth';
import { useUserData } from '@/context/userdata';
import { FEED_TABS, feedJobs, feedPosts, matchScore, type FeedJob, type FeedPost } from '@/data/feed';
import { useAlerts } from '@/hooks/useAlerts';
import { useI18n } from '@/i18n';
import { useResponsive, useResponsiveStyles, useTheme, type Theme } from '@/theme';
import { pageColumnStyle } from '@/utils/responsive';
import type { ResponsiveInfo } from '@/utils/responsive';

const CAT_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  'For you': 'sparkles',
  Technology: 'code-slash',
  Design: 'color-palette-outline',
  Data: 'bar-chart-outline',
  Marketing: 'megaphone-outline',
  Finance: 'wallet-outline',
};

export default function Home() {
  const { tr, trn, cat } = useI18n();
  const t = useTheme();
  const styles = useResponsiveStyles(makeStyles);
  const r = useResponsive();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { skills, skillsBannerClosed, closeSkillsBanner, replaceFavorites } = useUserData();
  const alerts = useAlerts();

  const scrollY = useSharedValue(0);
  const onScroll = useAnimatedScrollHandler((e) => {
    scrollY.value = e.contentOffset.y;
  });

  const [tab, setTab] = useState(FEED_TABS[0]);
  const [query, setQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [liveJobs, setLiveJobs] = useState<FeedJob[] | null>(null);
  const [tabJobs, setTabJobs] = useState<FeedJob[] | null>(null);
  const [livePosts, setLivePosts] = useState<FeedPost[] | null>(null);

  const firstName = (user?.name ?? '').split(' ')[0];

  const jobs = useMemo(() => {
    const q = query.trim().toLowerCase();
    const source = tab !== 'For you' && tabJobs && tabJobs.length > 0 ? tabJobs : (liveJobs ?? feedJobs);
    const list = source.filter(
      (job) =>
        (tab === 'For you' || job.category === tab) &&
        (!q ||
          job.title.toLowerCase().includes(q) ||
          job.company.toLowerCase().includes(q) ||
          job.skills.some((s) => s.toLowerCase().includes(q))),
    );
    return list.sort((a, b) => (matchScore(b, skills) ?? 0) - (matchScore(a, skills) ?? 0));
  }, [tab, query, skills, liveJobs, tabJobs]);

  const postSource = livePosts ?? feedPosts;
  const posts = tab === 'For you' ? postSource : postSource.filter((p) => p.category === tab);

  useEffect(() => {
    if (!user?.id) {
      setLiveJobs(null);
      return;
    }
    let cancelled = false;
    getForYouFeed()
      .then((rows) => {
        if (!cancelled && rows.length) setLiveJobs(rows.map((job, index) => toFeedJob(job, index)));
      })
      .catch(() => {});
    listFavorites(user.id)
      .then((rows) => {
        if (!cancelled && rows.length) replaceFavorites(rows.map((job) => job.id));
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [user?.id, replaceFavorites]);

  useEffect(() => {
    if (!user || tab === 'For you') {
      setTabJobs(null);
      return;
    }
    let cancelled = false;
    getCategoryJobs(tab)
      .then((rows) => {
        if (!cancelled) setTabJobs(rows.map((job, index) => toFeedJob(job, index, tab)));
      })
      .catch(() => {
        if (!cancelled) setTabJobs(null);
      });
    return () => {
      cancelled = true;
    };
  }, [user, tab]);

  useEffect(() => {
    let cancelled = false;
    listAdvertisements()
      .then(async (ads) => {
        if (cancelled || ads.length === 0) return;
        let reactions: Awaited<ReturnType<typeof getAdReactions>> = {};
        if (user) {
          try {
            reactions = await getAdReactions(ads.map((ad) => ad.id));
          } catch {
            reactions = {};
          }
        }
        if (cancelled) return;
        setLivePosts(
          ads.map((ad) => ({
            id: ad.id,
            company: ad.name,
            title: ad.caption,
            image: imageUrl(ad.image),
            category: 'For you',
            likes: reactions[ad.id]?.likes ?? 0,
            dislikes: reactions[ad.id]?.dislikes ?? 0,
          })),
        );
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [user]);
  const strongMatches = (liveJobs ?? feedJobs).filter((job) => (matchScore(job, skills) ?? 0) >= 50).length;
  const showBanner = !skillsBannerClosed && skills.length < 3;
  const popular = jobs.slice(0, 4);
  const recommended = jobs.slice(4);
  const listMode = query.length > 0;

  function refresh() {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 900);
  }

  return (
    <ScrollYContext.Provider value={scrollY}>
      <View style={styles.screen}>
        <View style={[pageColumnStyle(r), styles.page]}>
        <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
          <Pressable
            onPress={() => router.push('/skills')}
            hitSlop={8}
            style={({ pressed }) => [styles.headerIcon, pressed && styles.pressed]}
            accessibilityLabel={tr('home.addSkills')}>
            <Ionicons name="grid-outline" size={20} color={t.text} />
          </Pressable>
          <Text style={styles.headerTitle}>{tr('home.title')}</Text>
          <Pressable
            onPress={() => router.navigate('/profile')}
            style={styles.avatar}
            accessibilityLabel={tr('home.profile')}>
            <Text style={styles.avatarText}>{firstName.charAt(0).toUpperCase() || 'M'}</Text>
          </Pressable>
        </View>

        <Animated.View entering={FadeInDown.delay(80).duration(500)} style={styles.searchWrap}>
          <Ionicons name="search-outline" size={18} color={t.textMuted} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder={tr('home.search')}
            placeholderTextColor={t.textFaint}
            style={styles.searchInput}
            returnKeyType="search"
          />
          {query ? (
            <Pressable onPress={() => setQuery('')} hitSlop={8} accessibilityLabel={tr('home.clear')}>
              <Ionicons name="close-circle" size={18} color={t.textFaint} />
            </Pressable>
          ) : (
            <View style={styles.filterChip}>
              <Ionicons name="options-outline" size={16} color={colors.blue} />
            </View>
          )}
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(140).duration(500)}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categories}>
            {FEED_TABS.map((item, index) => (
              <CategoryTile
                key={item}
                label={cat(item)}
                icon={CAT_ICONS[item] ?? 'briefcase-outline'}
                active={item === tab}
                delay={index * 40}
                onPress={() => setTab(item)}
              />
            ))}
          </ScrollView>
        </Animated.View>

        <Animated.ScrollView
          onScroll={onScroll}
          scrollEventThrottle={16}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.feed}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={colors.orange} colors={[colors.orange]} />}>
          {!listMode && (
            <Animated.View entering={FadeInDown.delay(200).duration(550)} style={styles.greet}>
              <Text style={styles.greetHi}>{tr('home.hi', { name: firstName || tr('verify.there') })}</Text>
              <Text style={styles.greetText}>
                {skills.length
                  ? trn('home.matches', strongMatches, { s: skills.length })
                  : tr('home.noSkills')}
              </Text>
            </Animated.View>
          )}

          {showBanner && !listMode && (
            <Animated.View entering={FadeInDown.delay(260).duration(550)} exiting={FadeOut.duration(250)}>
              <View style={styles.banner}>
                <View style={styles.bannerTop}>
                  <Text style={styles.bannerTitle}>{tr('home.bannerTitle')}</Text>
                  <Pressable onPress={closeSkillsBanner} hitSlop={10} accessibilityLabel={tr('common.close')}>
                    <Ionicons name="close" size={18} color={t.textMuted} />
                  </Pressable>
                </View>
                <Text style={styles.bannerText}>{tr('home.bannerText')}</Text>
                <Pressable style={({ pressed }) => [styles.bannerButton, pressed && styles.pressed]} onPress={() => router.push('/skills')}>
                  <Ionicons name="add-circle" size={16} color={colors.orange} />
                  <Text style={styles.bannerButtonText}>{tr('home.addSkills')}</Text>
                </Pressable>
              </View>
            </Animated.View>
          )}

          {!listMode && posts.length > 0 && (
            <Animated.View entering={FadeIn.delay(300)}>
              <SectionHeader title={tr('home.fromCompanies')} />
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.posts} style={styles.postsScroll}>
                {posts.map((post, i) => (
                  <Animated.View key={`${tab}-${post.id}`} entering={FadeInRight.delay(340 + i * 90).springify().damping(16)}>
                    <PostCard post={post} />
                  </Animated.View>
                ))}
              </ScrollView>
            </Animated.View>
          )}

          {!listMode && popular.length > 0 && (
            <View>
              <SectionHeader
                title={tr('home.popular')}
                action={tr('home.viewAll')}
                onAction={() => setQuery('')}
              />
              <View style={styles.grid}>
                {popular.map((job, i) => (
                  <View key={job.id} style={styles.gridCell}>
                    <HomeJobGridCard job={job} index={i} />
                  </View>
                ))}
              </View>
            </View>
          )}

          {(listMode || recommended.length > 0) && (
            <View>
              <SectionHeader
                title={listMode ? tr('home.searchResults') : tr('home.recommendations')}
                count={listMode ? jobs.length : recommended.length}
              />
              {(listMode ? jobs : recommended).map((job, i) => (
                <View key={job.id} style={styles.jobItem}>
                  <Reveal delay={Math.min(i, 3) * 70}>
                    <FeedJobCard job={job} index={i} />
                  </Reveal>
                </View>
              ))}
            </View>
          )}

          {jobs.length === 0 && (
            <Animated.View entering={FadeInDown} style={styles.empty}>
              <View style={styles.emptyIcon}>
                <Ionicons name="search" size={24} color={colors.blue} />
              </View>
              <Text style={styles.emptyTitle}>{tr('home.emptyTitle')}</Text>
              <Text style={styles.emptyText}>{tr('home.emptyText')}</Text>
            </Animated.View>
          )}
        </Animated.ScrollView>
        </View>
      </View>
    </ScrollYContext.Provider>
  );
}

function SectionHeader({
  title,
  count,
  action,
  onAction,
}: {
  title: string;
  count?: number;
  action?: string;
  onAction?: () => void;
}) {
  const styles = useResponsiveStyles(makeStyles);
  return (
    <View style={styles.sectionHeader}>
      <View style={styles.sectionLeft}>
        <Text style={styles.sectionTitle}>{title}</Text>
        {count !== undefined ? <Text style={styles.sectionCount}>{count}</Text> : null}
      </View>
      {action ? (
        <Pressable onPress={onAction} hitSlop={8}>
          <Text style={styles.viewAll}>{action}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

function CategoryTile({
  label,
  icon,
  active,
  delay,
  onPress,
}: {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  active: boolean;
  delay: number;
  onPress: () => void;
}) {
  const styles = useResponsiveStyles(makeStyles);

  return (
    <Animated.View entering={ZoomIn.delay(delay).springify().damping(14)}>
      <Pressable onPress={onPress} style={styles.catItem} accessibilityRole="tab" accessibilityState={{ selected: active }}>
        <View style={[styles.catBox, active && styles.catBoxActive]}>
          <Ionicons name={icon} size={22} color={active ? colors.orange : colors.dblue} />
        </View>
        <Text style={[styles.catLabel, active && styles.catLabelActive]} numberOfLines={1}>
          {label}
        </Text>
      </Pressable>
    </Animated.View>
  );
}

const makeStyles = (t: Theme, r: ResponsiveInfo) =>
  StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: t.scheme === 'dark' ? t.bg : colors.white,
      alignItems: 'center',
    },
    page: {
      flex: 1,
      paddingHorizontal: r.gutter,
    },
    pressed: {
      opacity: 0.75,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingBottom: 12,
      backgroundColor: t.scheme === 'dark' ? t.bg : colors.white,
    },
    headerIcon: {
      width: 42,
      height: 42,
      borderRadius: 7,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: t.surfaceAlt,
    },
    headerTitle: {
      fontFamily: 'Lexend_700Bold',
      fontSize: 18,
      color: t.text,
    },
    avatar: {
      width: 42,
      height: 42,
      borderRadius: 7,
      backgroundColor: colors.orange,
      alignItems: 'center',
      justifyContent: 'center',
    },
    avatarText: {
      fontFamily: 'Lexend_700Bold',
      fontSize: 16,
      color: colors.white,
    },
    searchWrap: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      paddingHorizontal: 16,
      height: 50,
      borderRadius: 7,
      backgroundColor: t.surface,
      borderWidth: 1,
      borderColor: t.border,
      shadowColor: '#0e314c',
      shadowOpacity: 0.06,
      shadowRadius: 14,
      shadowOffset: { width: 0, height: 6 },
      elevation: 2,
    },
    searchInput: {
      flex: 1,
      height: '100%',
      fontFamily: 'Lexend_400Regular',
      fontSize: 14,
      color: t.text,
    },
    filterChip: {
      width: 34,
      height: 34,
      borderRadius: 7,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'rgba(53,168,223,0.1)',
    },
    categories: {
      paddingHorizontal: 16,
      paddingTop: 14,
      paddingBottom: 6,
      gap: 14,
    },
    catItem: {
      width: 72,
      alignItems: 'center',
    },
    catBox: {
      width: 64,
      height: 64,
      borderRadius: 7,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: t.surfaceAlt,
      borderWidth: 1.5,
      borderColor: 'transparent',
    },
    catBoxActive: {
      backgroundColor: 'rgba(237,99,60,0.08)',
      borderColor: colors.orange,
    },
    catLabel: {
      marginTop: 6,
      fontFamily: 'Lexend_400Regular',
      fontSize: 11,
      color: t.textMuted,
      textAlign: 'center',
    },
    catLabelActive: {
      fontFamily: 'Lexend_700Bold',
      color: colors.orange,
    },
    feed: {
      paddingBottom: 40,
    },
    greet: {
      marginTop: 8,
      padding: 16,
      borderRadius: 7,
      backgroundColor: t.surface,
      borderWidth: 1,
      borderColor: t.border,
    },
    greetHi: {
      fontFamily: 'Lexend_700Bold',
      fontSize: 16,
      color: t.text,
    },
    greetText: {
      fontFamily: 'Lexend_400Regular',
      fontSize: 13,
      lineHeight: 19,
      color: t.textBody,
      marginTop: 4,
    },
    banner: {
      marginTop: 14,
      padding: 16,
      borderRadius: 7,
      backgroundColor: t.surface,
      borderWidth: 1,
      borderColor: 'rgba(237,99,60,0.25)',
    },
    bannerTop: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: 10,
    },
    bannerTitle: {
      flex: 1,
      fontFamily: 'Lexend_700Bold',
      fontSize: 15,
      lineHeight: 21,
      color: t.text,
    },
    bannerText: {
      fontFamily: 'Lexend_400Regular',
      fontSize: 13,
      lineHeight: 19,
      color: t.textBody,
      marginTop: 6,
    },
    bannerButton: {
      alignSelf: 'flex-start',
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      marginTop: 12,
      paddingHorizontal: 14,
      paddingVertical: 9,
      borderRadius: 7,
      backgroundColor: 'rgba(237,99,60,0.1)',
    },
    bannerButtonText: {
      fontFamily: 'Lexend_700Bold',
      fontSize: 13,
      color: colors.orange,
    },
    sectionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginTop: 22,
      marginBottom: 12,
    },
    sectionLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      flex: 1,
    },
    sectionTitle: {
      fontFamily: 'Lexend_700Bold',
      fontSize: 17,
      color: t.text,
    },
    sectionCount: {
      fontFamily: 'Lexend_700Bold',
      fontSize: 11,
      color: colors.blue,
      backgroundColor: 'rgba(53,168,223,0.12)',
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: 7,
    },
    viewAll: {
      fontFamily: 'Lexend_700Bold',
      fontSize: 13,
      color: colors.blue,
    },
    postsScroll: {
      marginHorizontal: -r.gutter,
    },
    posts: {
      paddingHorizontal: r.gutter,
      gap: 12,
    },
    grid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      marginHorizontal: -6,
    },
    gridCell: {
      width: `${100 / r.gridColumns}%` as `${number}%`,
      padding: 6,
    },
    jobItem: {
      marginBottom: 14,
    },
    empty: {
      alignItems: 'center',
      paddingVertical: 36,
      gap: 6,
    },
    emptyIcon: {
      width: 56,
      height: 56,
      borderRadius: 7,
      backgroundColor: 'rgba(53,168,223,0.12)',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 6,
    },
    emptyTitle: {
      fontFamily: 'Lexend_700Bold',
      fontSize: 15,
      color: t.text,
    },
    emptyText: {
      fontFamily: 'Lexend_400Regular',
      fontSize: 13,
      color: t.textMuted,
    },
  });
