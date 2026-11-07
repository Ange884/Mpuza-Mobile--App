import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Redirect, router } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import Animated, {
  Easing,
  FadeIn,
  FadeInDown,
  FadeInUp,
  FadeOut,
  FadeOutDown,
  interpolateColor,
  LinearTransition,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
  ZoomIn,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { JobCard } from '@/components/explore/JobCard';
import { Reveal, ScrollYContext } from '@/components/Reveal';
import { colors } from '@/constants/colors';
import { useAuth } from '@/context/auth';
import { categories, jobs, type Job } from '@/data/explore';

const PROFILE_COMPLETE = 0.4; // TODO: compute from the real profile

function greeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

export default function Home() {
  const { user, signOut } = useAuth();
  const insets = useSafeAreaInsets();
  const scrollY = useSharedValue(0);
  const onScroll = useAnimatedScrollHandler((event) => {
    scrollY.value = event.contentOffset.y;
  });

  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All');
  const [applied, setApplied] = useState<string[]>([]);
  const saved = 0; // TODO: saved jobs
  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
  }, []);

  const visibleJobs = useMemo(() => {
    const q = query.trim().toLowerCase();
    return jobs.filter(
      (job) =>
        (category === 'All' || job.category === category) &&
        (!q || job.title.toLowerCase().includes(q) || job.company.toLowerCase().includes(q))
    );
  }, [query, category]);

  const headerStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(scrollY.value, [0, 60], ['rgba(255,255,255,0)', 'rgba(255,255,255,1)']),
    borderBottomColor: interpolateColor(scrollY.value, [0, 60], ['rgba(0,0,0,0)', 'rgba(0,0,0,0.06)']),
  }));

  if (!user) return <Redirect href="/account" />;

  function showToast(message: string) {
    setToast(message);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 2200);
  }

  function apply(job: Job) {
    if (applied.includes(job.id)) {
      showToast(`You already applied to ${job.company}`);
      return;
    }
    setApplied((ids) => [...ids, job.id]);
    showToast(`Application sent to ${job.company}`);
  }

  function logout() {
    signOut();
    router.replace('/landing');
  }

  const firstName = user.name.split(' ')[0];

  return (
    <ScrollYContext.Provider value={scrollY}>
      <View style={styles.screen}>
        <Animated.ScrollView
          onScroll={onScroll}
          scrollEventThrottle={16}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingTop: insets.top + 76, paddingBottom: insets.bottom + 40 }}>
          {/* SEARCH */}
          <Animated.View entering={FadeInDown.delay(150).duration(550)} style={styles.search}>
            <Ionicons name="search-outline" size={18} color="#8a8fa3" />
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder="Search jobs or companies"
              placeholderTextColor="#a3a8b8"
              style={styles.searchInput}
              returnKeyType="search"
            />
            {query.length > 0 && (
              <Animated.View entering={ZoomIn} exiting={FadeOut}>
                <Pressable onPress={() => setQuery('')} hitSlop={8} accessibilityLabel="Clear search">
                  <Ionicons name="close-circle" size={18} color="#a3a8b8" />
                </Pressable>
              </Animated.View>
            )}
          </Animated.View>

          {/* PROFILE CARD */}
          <Animated.View entering={FadeInDown.delay(250).duration(600)} style={styles.section}>
            <LinearGradient
              colors={[colors.dblue, '#1d5a85']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.profileCard}>
              <View style={styles.profileTop}>
                <View style={styles.flex}>
                  <Text style={styles.profileTitle}>Complete your profile</Text>
                  <Text style={styles.profileText}>Add your skills and CV to get better job matches.</Text>
                </View>
                <Text style={styles.profilePercent}>{Math.round(PROFILE_COMPLETE * 100)}%</Text>
              </View>
              <ProgressBar value={PROFILE_COMPLETE} />
            </LinearGradient>
          </Animated.View>

          {/* STATS */}
          <View style={[styles.section, styles.stats]}>
            <StatTile index={0} icon="paper-plane" label="Applied" value={applied.length} color={colors.orange} />
            <StatTile index={1} icon="bookmark" label="Saved" value={saved} color={colors.blue} />
            <StatTile index={2} icon="calendar" label="Interviews" value={0} color="#22a06b" />
          </View>

          {/* CATEGORIES */}
          <Animated.View entering={FadeInDown.delay(550).duration(500)}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.chips}
              style={styles.chipsScroll}>
              {categories.map((item) => {
                const active = item === category;
                return (
                  <Pressable
                    key={item}
                    onPress={() => setCategory(item)}
                    style={[styles.chip, active && styles.chipActive]}>
                    <Text style={[styles.chipText, active && styles.chipTextActive]}>{item}</Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          </Animated.View>

          {/* JOBS */}
          <View style={styles.section}>
            <Animated.View entering={FadeIn.delay(600)} style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Recommended for you</Text>
              <Text style={styles.count}>{visibleJobs.length} jobs</Text>
            </Animated.View>

            {visibleJobs.map((job, index) => (
              <Animated.View
                key={job.id}
                layout={LinearTransition.springify().damping(18)}
                exiting={FadeOut.duration(180)}>
                <Reveal delay={Math.min(index, 3) * 80}>
                  <JobCard job={job} onPress={apply} locked={false} applied={applied.includes(job.id)} />
                </Reveal>
              </Animated.View>
            ))}

            {visibleJobs.length === 0 && (
              <Animated.View entering={FadeInDown} style={styles.empty}>
                <Ionicons name="search" size={26} color="#b5b5c3" />
                <Text style={styles.emptyText}>No jobs match your search.</Text>
              </Animated.View>
            )}
          </View>
        </Animated.ScrollView>

        {/* HEADER */}
        <Animated.View style={[styles.header, { paddingTop: insets.top + 8 }, headerStyle]}>
          <Animated.View entering={ZoomIn.springify().damping(12)} style={styles.avatar}>
            <Text style={styles.avatarText}>{firstName.charAt(0).toUpperCase()}</Text>
          </Animated.View>
          <Animated.View entering={FadeInDown.delay(80).duration(500)} style={styles.flex}>
            <Text style={styles.greeting}>{greeting()},</Text>
            <Text style={styles.name} numberOfLines={1}>
              {firstName}
            </Text>
          </Animated.View>
          <Pressable onPress={logout} hitSlop={8} style={styles.iconButton} accessibilityLabel="Log out">
            <Ionicons name="log-out-outline" size={22} color={colors.dblue} />
          </Pressable>
        </Animated.View>

        {toast && (
          <Animated.View
            key={toast}
            entering={FadeInUp.springify().damping(16)}
            exiting={FadeOutDown.duration(200)}
            style={[styles.toast, { bottom: insets.bottom + 24 }]}>
            <Ionicons name="checkmark-circle" size={20} color="#4cd38a" />
            <Text style={styles.toastText}>{toast}</Text>
          </Animated.View>
        )}
      </View>
    </ScrollYContext.Provider>
  );
}

function ProgressBar({ value }: { value: number }) {
  const progress = useSharedValue(0);
  useEffect(() => {
    progress.set(withDelay(600, withTiming(value, { duration: 1000, easing: Easing.out(Easing.cubic) })));
  }, [progress, value]);
  const style = useAnimatedStyle(() => ({ transform: [{ scaleX: progress.value }] }));
  return (
    <View style={styles.progressTrack}>
      <Animated.View style={[styles.progressFill, style]} />
    </View>
  );
}

function StatTile({
  index,
  icon,
  label,
  value,
  color,
}: {
  index: number;
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: number;
  color: string;
}) {
  return (
    <Animated.View entering={FadeInDown.delay(350 + index * 80).duration(500)} style={styles.stat}>
      <View style={[styles.statIcon, { backgroundColor: color + '1f' }]}>
        <Ionicons name={icon} size={16} color={color} />
      </View>
      {/* key={value} pops the number each time it changes */}
      <Animated.Text key={value} entering={ZoomIn.springify().damping(10)} style={styles.statValue}>
        {value}
      </Animated.Text>
      <Text style={styles.statLabel}>{label}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  screen: {
    flex: 1,
    backgroundColor: '#f7f9fc',
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 20,
    paddingBottom: 10,
    borderBottomWidth: 1,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.orange,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontFamily: 'Lexend_700Bold',
    fontSize: 18,
    color: colors.white,
  },
  greeting: {
    fontFamily: 'Lexend_400Regular',
    fontSize: 12,
    color: '#7a8796',
  },
  name: {
    fontFamily: 'Lexend_700Bold',
    fontSize: 18,
    color: colors.dblue,
  },
  iconButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: '#eceff4',
  },
  search: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginHorizontal: 20,
    paddingHorizontal: 16,
    height: 52,
    borderRadius: 16,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: '#eceff4',
  },
  searchInput: {
    flex: 1,
    height: '100%',
    fontFamily: 'Lexend_400Regular',
    fontSize: 14,
    color: colors.dblue,
  },
  section: {
    marginHorizontal: 20,
    marginTop: 20,
  },
  profileCard: {
    borderRadius: 20,
    padding: 20,
  },
  profileTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  profileTitle: {
    fontFamily: 'Lexend_700Bold',
    fontSize: 17,
    color: colors.white,
  },
  profileText: {
    fontFamily: 'Lexend_400Regular',
    fontSize: 13,
    lineHeight: 19,
    color: 'rgba(255,255,255,0.75)',
    marginTop: 4,
  },
  profilePercent: {
    fontFamily: 'Lexend_700Bold',
    fontSize: 22,
    color: colors.orange,
  },
  progressTrack: {
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.15)',
    marginTop: 16,
    overflow: 'hidden',
  },
  progressFill: {
    flex: 1,
    borderRadius: 4,
    backgroundColor: colors.orange,
    transformOrigin: 'left',
  },
  stats: {
    flexDirection: 'row',
    gap: 10,
  },
  stat: {
    flex: 1,
    padding: 14,
    borderRadius: 16,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: '#eceff4',
  },
  statIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statValue: {
    fontFamily: 'Lexend_700Bold',
    fontSize: 22,
    color: colors.dblue,
    marginTop: 10,
  },
  statLabel: {
    fontFamily: 'Lexend_400Regular',
    fontSize: 12,
    color: '#7a8796',
  },
  chipsScroll: {
    marginTop: 22,
  },
  chips: {
    paddingHorizontal: 20,
    gap: 8,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 20,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: '#eceff4',
  },
  chipActive: {
    backgroundColor: colors.dblue,
    borderColor: colors.dblue,
  },
  chipText: {
    fontFamily: 'Lexend_400Regular',
    fontSize: 13,
    color: '#4a5866',
  },
  chipTextActive: {
    color: colors.white,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  sectionTitle: {
    fontFamily: 'Lexend_700Bold',
    fontSize: 18,
    color: colors.dblue,
  },
  count: {
    fontFamily: 'Lexend_400Regular',
    fontSize: 12,
    color: '#7a8796',
  },
  empty: {
    alignItems: 'center',
    gap: 8,
    paddingVertical: 30,
  },
  emptyText: {
    fontFamily: 'Lexend_400Regular',
    fontSize: 13,
    color: '#7a8796',
  },
  toast: {
    position: 'absolute',
    left: 20,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: colors.dblue,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  },
  toastText: {
    flex: 1,
    fontFamily: 'Lexend_400Regular',
    fontSize: 13,
    color: colors.white,
  },
});
