import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, RefreshControl, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import Animated, {
  FadeIn,
  FadeInDown,
  FadeInRight,
  FadeOut,
  FadeOutUp,
  LinearTransition,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  ZoomIn,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { FeedJobCard } from '@/components/feed/FeedJobCard';
import { PostCard } from '@/components/feed/PostCard';
import { Logo } from '@/components/Logo';
import { Reveal, ScrollYContext } from '@/components/Reveal';
import { colors } from '@/constants/colors';
import { useAuth } from '@/context/auth';
import { useUserData } from '@/context/userdata';
import { FEED_TABS, feedJobs, feedPosts, matchScore } from '@/data/feed';
import { useAlerts } from '@/hooks/useAlerts';
import { useStyles, useTheme, type Theme } from '@/theme';
import { useI18n } from '@/i18n';

export default function Home() {
  const { tr, trn, cat } = useI18n();
  const t = useTheme();
  const styles = useStyles(makeStyles);
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { skills, skillsBannerClosed, closeSkillsBanner } = useUserData();
  const alerts = useAlerts();

  const scrollY = useSharedValue(0);
  const onScroll = useAnimatedScrollHandler((e) => {
    scrollY.value = e.contentOffset.y;
  });

  const [tab, setTab] = useState(FEED_TABS[0]);
  const [query, setQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const firstName = (user?.name ?? '').split(' ')[0];

  // "For you" = every job ranked by how well it matches the user's skills.
  const jobs = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = feedJobs.filter(
      (job) =>
        (tab === 'For you' || job.category === tab) &&
        (!q ||
          job.title.toLowerCase().includes(q) ||
          job.company.toLowerCase().includes(q) ||
          job.skills.some((s) => s.toLowerCase().includes(q)))
    );
    return list.sort((a, b) => (matchScore(b, skills) ?? 0) - (matchScore(a, skills) ?? 0));
  }, [tab, query, skills]);

  const posts = tab === 'For you' ? feedPosts : feedPosts.filter((p) => p.category === tab);
  const strongMatches = feedJobs.filter((job) => (matchScore(job, skills) ?? 0) >= 50).length;
  const showBanner = !skillsBannerClosed && skills.length < 3;

  function refresh() {
    // Replace with a re-fetch of the jobs feed once the API is wired in.
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 900);
  }

  return (
    <ScrollYContext.Provider value={scrollY}>
      <View style={styles.screen}>
        {/* HEADER */}
        <View style={[styles.header, { paddingTop: insets.top + 6 }]}>
          <Animated.View entering={ZoomIn.springify().damping(12)}>
            <Pressable onPress={() => router.navigate('/profile')} style={styles.avatar} accessibilityLabel={tr('home.profile')}>
              <Text style={styles.avatarText}>{firstName.charAt(0).toUpperCase() || 'M'}</Text>
            </Pressable>
          </Animated.View>
          <Animated.View entering={FadeIn.delay(100)}>
            <Logo size={18} />
          </Animated.View>
          <Pressable onPress={() => router.navigate('/alerts')} style={styles.iconButton} accessibilityLabel={tr('home.alerts')}>
            <Ionicons name="notifications-outline" size={21} color={t.text} />
            {alerts.length > 0 && <View style={styles.bellDot} />}
          </Pressable>
        </View>

        {/* SEARCH */}
        <Animated.View entering={FadeInDown.delay(120).duration(500)} style={styles.search}>
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
            <Ionicons name="options-outline" size={18} color={t.text} />
          )}
        </Animated.View>

        {/* TABS */}
        <Animated.View entering={FadeInDown.delay(180).duration(500)}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabs}>
            {FEED_TABS.map((item) => (
              <FeedTab key={item} label={cat(item)} active={item === tab} onPress={() => setTab(item)} />
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
          {/* HERO */}
          {!query && (
            <Animated.View entering={FadeInDown.delay(240).duration(600)} exiting={FadeOutUp}>
              <LinearGradient colors={[t.navy, t.navy2]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.hero}>
                <View style={styles.heroCircle} />
                <Text style={styles.heroHello}>{tr('home.hi', { name: firstName || tr('verify.there') })}</Text>
                <Text style={styles.heroTitle}>
                  {tr('home.heroTop')}{'\n'}
                  <Text style={styles.heroAccent}>{tr('home.heroBottom')}</Text>
                </Text>
                <Text style={styles.heroText}>
                  {skills.length
                    ? trn('home.matches', strongMatches, { s: skills.length })
                    : tr('home.noSkills')}
                </Text>
              </LinearGradient>
            </Animated.View>
          )}

          {/* SKILLS BANNER */}
          {showBanner && !query && (
            <Animated.View entering={FadeInDown.delay(320).duration(600)} exiting={FadeOut.duration(250)} layout={LinearTransition}>
              <LinearGradient colors={[colors.blue, '#2a8fc4']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.banner}>
                <View style={styles.bannerTop}>
                  <Text style={styles.bannerTitle}>{tr('home.bannerTitle')}</Text>
                  <Pressable onPress={closeSkillsBanner} hitSlop={10} accessibilityLabel={tr('common.close')}>
                    <Ionicons name="close" size={18} color="rgba(255,255,255,0.85)" />
                  </Pressable>
                </View>
                <Text style={styles.bannerText}>{tr('home.bannerText')}</Text>
                <Pressable style={({ pressed }) => [styles.bannerButton, pressed && styles.pressed]} onPress={() => router.push('/skills')}>
                  <Ionicons name="add-circle" size={16} color={colors.blue} />
                  <Text style={styles.bannerButtonText}>{tr('home.addSkills')}</Text>
                </Pressable>
              </LinearGradient>
            </Animated.View>
          )}

          {/* POSTS */}
          {!query && posts.length > 0 && (
            <Animated.View entering={FadeIn.delay(380)} layout={LinearTransition}>
              <SectionTitle title={tr('home.fromCompanies')} />
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.posts} style={styles.postsScroll}>
                {posts.map((post, i) => (
                  <Animated.View key={`${tab}-${post.id}`} entering={FadeInRight.delay(420 + i * 90).springify().damping(16)}>
                    <PostCard post={post} />
                  </Animated.View>
                ))}
              </ScrollView>
            </Animated.View>
          )}

          {/* JOBS */}
          <Animated.View layout={LinearTransition}>
            <SectionTitle
              title={query ? tr('home.searchResults') : tab === 'For you' ? tr('home.forYou') : tr('home.categoryJobs', { tab: cat(tab) })}
              count={jobs.length}
            />
          </Animated.View>
          {jobs.map((job, i) => (
            <Animated.View key={job.id} layout={LinearTransition.springify().damping(18)} exiting={FadeOut.duration(150)} style={styles.jobItem}>
              <Reveal delay={Math.min(i, 3) * 70}>
                <FeedJobCard job={job} />
              </Reveal>
            </Animated.View>
          ))}
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
    </ScrollYContext.Provider>
  );
}

function SectionTitle({ title, count }: { title: string; count?: number }) {
  const styles = useStyles(makeStyles);
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {count !== undefined && <Text style={styles.sectionCount}>{count}</Text>}
    </View>
  );
}

function FeedTab({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  const styles = useStyles(makeStyles);
  const style = useAnimatedStyle(() => ({
    transform: [{ scaleX: withSpring(active ? 1 : 0, { damping: 15 }) }],
  }));
  return (
    <Pressable onPress={onPress} style={styles.tab} accessibilityRole="tab" accessibilityState={{ selected: active }}>
      <Text style={[styles.tabText, active && styles.tabTextActive]}>{label}</Text>
      <Animated.View style={[styles.tabLine, style]} />
    </Pressable>
  );
}

const makeStyles = (t: Theme) =>
  StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: t.bgAlt,
  },
  pressed: {
    opacity: 0.75,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 10,
    backgroundColor: t.surface,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.orange,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontFamily: 'Lexend_700Bold',
    fontSize: 16,
    color: colors.white,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: t.surfaceAlt,
  },
  bellDot: {
    position: 'absolute',
    top: 9,
    right: 10,
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: t.danger,
    borderWidth: 2,
    borderColor: t.surfaceAlt,
  },
  search: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    marginHorizontal: 20,
    marginTop: 4,
    height: 48,
    borderRadius: 14,
    backgroundColor: t.surfaceAlt,
  },
  searchInput: {
    flex: 1,
    height: '100%',
    fontFamily: 'Lexend_400Regular',
    fontSize: 14,
    color: t.text,
  },
  tabs: {
    paddingHorizontal: 14,
    paddingTop: 6,
  },
  tab: {
    paddingHorizontal: 10,
    paddingTop: 10,
    alignItems: 'center',
  },
  tabText: {
    fontFamily: 'Lexend_400Regular',
    fontSize: 14,
    color: t.textMuted,
    paddingBottom: 8,
  },
  tabTextActive: {
    fontFamily: 'Lexend_700Bold',
    color: t.text,
  },
  tabLine: {
    height: 3,
    width: '100%',
    borderRadius: 2,
    backgroundColor: colors.orange,
  },
  feed: {
    padding: 20,
    paddingBottom: 40,
  },
  hero: {
    borderRadius: 24,
    padding: 22,
    overflow: 'hidden',
  },
  heroCircle: {
    position: 'absolute',
    right: -50,
    top: -50,
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: 'rgba(237,99,60,0.25)',
  },
  heroHello: {
    fontFamily: 'Lexend_400Regular',
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
  },
  heroTitle: {
    fontFamily: 'Lexend_700Bold',
    fontSize: 34,
    lineHeight: 38,
    color: colors.white,
    marginTop: 6,
    letterSpacing: 0.5,
  },
  heroAccent: {
    color: colors.orange,
  },
  heroText: {
    fontFamily: 'Lexend_400Regular',
    fontSize: 13,
    color: 'rgba(255,255,255,0.85)',
    marginTop: 10,
  },
  banner: {
    borderRadius: 20,
    padding: 18,
    marginTop: 16,
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
    color: colors.white,
  },
  bannerText: {
    fontFamily: 'Lexend_400Regular',
    fontSize: 13,
    lineHeight: 19,
    color: 'rgba(255,255,255,0.9)',
    marginTop: 6,
  },
  bannerButton: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 14,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: t.surface,
  },
  bannerButtonText: {
    fontFamily: 'Lexend_700Bold',
    fontSize: 13,
    color: colors.blue,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 26,
    marginBottom: 12,
  },
  sectionTitle: {
    fontFamily: 'Lexend_700Bold',
    fontSize: 18,
    color: t.text,
  },
  sectionCount: {
    fontFamily: 'Lexend_700Bold',
    fontSize: 11,
    color: colors.orange,
    backgroundColor: 'rgba(237,99,60,0.12)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    overflow: 'hidden',
  },
  postsScroll: {
    marginHorizontal: -20,
  },
  posts: {
    paddingHorizontal: 20,
    gap: 12,
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
    borderRadius: 28,
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
