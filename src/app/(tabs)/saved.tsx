import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import Animated, { FadeInDown, FadeOut, LinearTransition, ZoomIn } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { SavedJobCard } from '@/components/feed/SavedJobCard';
import { colors } from '@/constants/colors';
import { useUserData } from '@/context/userdata';
import { feedJobs, matchScore, type FeedJob } from '@/data/feed';
import { useI18n } from '@/i18n';
import { useStyles, useTheme, type Theme } from '@/theme';

type SortKey = 'match' | 'title' | 'company';
type WorkFilter = FeedJob['workMode'] | 'All';
type TypeFilter = FeedJob['type'] | 'All';

const SORT_CYCLE: SortKey[] = ['match', 'title', 'company'];
const WORK_MODES: WorkFilter[] = ['All', 'Remote', 'On-site', 'Hybrid'];
const JOB_TYPES: TypeFilter[] = ['All', 'Full time', 'Part time', 'Contract', 'Internship'];

export default function Saved() {
  const { tr, trn } = useI18n();
  const theme = useTheme();
  const styles = useStyles(makeStyles);
  const insets = useSafeAreaInsets();
  const { favorites, skills } = useUserData();

  const [query, setQuery] = useState('');
  const [sort, setSort] = useState<SortKey>('match');
  const [workFilter, setWorkFilter] = useState<WorkFilter>('All');
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('All');
  const [filterOpen, setFilterOpen] = useState(false);

  const jobs = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = feedJobs.filter((job) => favorites.includes(job.id));

    if (q) {
      list = list.filter(
        (job) =>
          job.title.toLowerCase().includes(q) ||
          job.company.toLowerCase().includes(q) ||
          job.location.toLowerCase().includes(q),
      );
    }
    if (workFilter !== 'All') list = list.filter((job) => job.workMode === workFilter);
    if (typeFilter !== 'All') list = list.filter((job) => job.type === typeFilter);

    const sorted = [...list];
    sorted.sort((a, b) => {
      if (sort === 'title') return a.title.localeCompare(b.title);
      if (sort === 'company') return a.company.localeCompare(b.company);
      const ma = matchScore(a, skills) ?? -1;
      const mb = matchScore(b, skills) ?? -1;
      return mb - ma;
    });
    return sorted;
  }, [favorites, query, skills, sort, workFilter, typeFilter]);

  const sortLabel =
    sort === 'match' ? tr('saved.sortMatch') : sort === 'title' ? tr('saved.sortTitle') : tr('saved.sortCompany');

  const filtersActive = workFilter !== 'All' || typeFilter !== 'All';

  return (
    <View style={styles.screen}>
      <View style={[styles.toolbar, { paddingTop: insets.top + 8 }]}>
        <Animated.View entering={FadeInDown.duration(400)} style={styles.toolbarRow}>
          <Pressable
            style={({ pressed }) => [styles.backBtn, pressed && styles.pressed]}
            onPress={() => router.navigate('/home')}
            accessibilityRole="button"
            accessibilityLabel={tr('tab.home')}>
            <Ionicons name="arrow-back" size={22} color={theme.text} />
          </Pressable>
          <View style={styles.searchWrap}>
            <Ionicons name="search-outline" size={18} color={theme.textMuted} />
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder={tr('saved.searchPlaceholder')}
              placeholderTextColor={theme.textFaint}
              style={styles.searchInput}
              returnKeyType="search"
              clearButtonMode="while-editing"
            />
          </View>
          <Pressable
            style={({ pressed }) => [styles.filterBtn, filtersActive && styles.filterBtnActive, pressed && styles.pressed]}
            onPress={() => setFilterOpen(true)}
            accessibilityRole="button"
            accessibilityLabel={tr('saved.filters')}>
            <Ionicons name="options-outline" size={20} color={filtersActive ? colors.white : theme.text} />
          </Pressable>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(80).duration(450)}>
          <Text style={styles.foundCount}>{trn('saved.found', jobs.length)}</Text>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(120).duration(450)} style={styles.sortRow}>
          <View style={styles.sortLine} />
          <Pressable
            onPress={() => setSort(SORT_CYCLE[(SORT_CYCLE.indexOf(sort) + 1) % SORT_CYCLE.length])}
            style={({ pressed }) => [styles.sortBtn, pressed && styles.pressed]}
            accessibilityRole="button"
            accessibilityLabel={tr('saved.sortBy')}>
            <Text style={styles.sortLabel}>{tr('saved.sortBy')}</Text>
            <Text style={styles.sortValue}>{sortLabel}</Text>
            <Ionicons name="funnel-outline" size={16} color={theme.textMuted} />
          </Pressable>
          <View style={styles.sortLine} />
        </Animated.View>
      </View>

      <ScrollView contentContainerStyle={[styles.list, { paddingBottom: 40 + insets.bottom }]} showsVerticalScrollIndicator={false}>
        {jobs.map((job, i) => (
          <Animated.View
            key={job.id}
            entering={FadeInDown.delay(60 + i * 55).springify().damping(16)}
            exiting={FadeOut.duration(220)}
            layout={LinearTransition.springify().damping(18)}
            style={styles.item}>
            <SavedJobCard job={job} index={i} />
          </Animated.View>
        ))}

        {jobs.length === 0 && (
          <Animated.View entering={FadeInDown.delay(150).duration(500)} style={styles.empty}>
            <Animated.View entering={ZoomIn.delay(250).springify().damping(12)} style={styles.emptyIcon}>
              <Ionicons name="heart-outline" size={32} color={colors.orange} />
            </Animated.View>
            <Text style={styles.emptyTitle}>{tr('saved.emptyTitle')}</Text>
            <Text style={styles.emptyText}>
              {tr('saved.emptyBefore')}
              <Text style={styles.bold}>{tr('saved.emptyStar')}</Text>
              {tr('saved.emptyAfter')}
            </Text>
            <Pressable
              style={({ pressed }) => [styles.emptyButton, pressed && styles.pressed]}
              onPress={() => router.navigate('/home')}>
              <Text style={styles.emptyButtonText}>{tr('saved.browse')}</Text>
            </Pressable>
          </Animated.View>
        )}
      </ScrollView>

      <Modal visible={filterOpen} animationType="fade" transparent onRequestClose={() => setFilterOpen(false)}>
        <Pressable style={styles.modalBackdrop} onPress={() => setFilterOpen(false)}>
          <Pressable style={styles.modalCard} onPress={(e) => e.stopPropagation()}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{tr('saved.filterTitle')}</Text>
              <Pressable
                onPress={() => {
                  setWorkFilter('All');
                  setTypeFilter('All');
                }}
                hitSlop={8}>
                <Text style={styles.modalClear}>{tr('saved.clearFilters')}</Text>
              </Pressable>
            </View>

            <Text style={styles.modalSection}>{tr('saved.workMode')}</Text>
            <View style={styles.chips}>
              {WORK_MODES.map((mode) => (
                <Pressable
                  key={mode}
                  onPress={() => setWorkFilter(mode)}
                  style={[styles.chip, workFilter === mode && styles.chipOn]}>
                  <Text style={[styles.chipText, workFilter === mode && styles.chipTextOn]}>{mode}</Text>
                </Pressable>
              ))}
            </View>

            <Text style={[styles.modalSection, styles.modalSectionSpaced]}>{tr('saved.jobType')}</Text>
            <View style={styles.chips}>
              {JOB_TYPES.map((type) => (
                <Pressable
                  key={type}
                  onPress={() => setTypeFilter(type)}
                  style={[styles.chip, typeFilter === type && styles.chipOn]}>
                  <Text style={[styles.chipText, typeFilter === type && styles.chipTextOn]}>{type}</Text>
                </Pressable>
              ))}
            </View>

            <Pressable style={styles.modalDone} onPress={() => setFilterOpen(false)}>
              <Text style={styles.modalDoneText}>{tr('common.done')}</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const makeStyles = (t: Theme) =>
  StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: t.scheme === 'dark' ? t.bgAlt : '#f0ebe4',
    },
    toolbar: {
      paddingHorizontal: 20,
      paddingBottom: 8,
    },
    toolbarRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
    },
    backBtn: {
      width: 44,
      height: 44,
      borderRadius: 14,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: t.scheme === 'dark' ? t.surface : '#faf7f2',
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: t.scheme === 'dark' ? t.border : 'rgba(14,49,76,0.06)',
    },
    searchWrap: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      height: 48,
      paddingHorizontal: 14,
      borderRadius: 16,
      backgroundColor: t.scheme === 'dark' ? t.surface : '#faf7f2',
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: t.scheme === 'dark' ? t.border : 'rgba(14,49,76,0.06)',
    },
    searchInput: {
      flex: 1,
      fontFamily: 'Lexend_400Regular',
      fontSize: 15,
      color: t.text,
      paddingVertical: 0,
    },
    filterBtn: {
      width: 48,
      height: 48,
      borderRadius: 16,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: t.scheme === 'dark' ? t.surface : '#faf7f2',
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: t.scheme === 'dark' ? t.border : 'rgba(14,49,76,0.06)',
    },
    filterBtnActive: {
      backgroundColor: colors.dblue,
      borderColor: colors.dblue,
    },
    pressed: {
      opacity: 0.82,
      transform: [{ scale: 0.98 }],
    },
    foundCount: {
      marginTop: 18,
      fontFamily: 'Lexend_700Bold',
      fontSize: 26,
      letterSpacing: -0.5,
      color: t.scheme === 'dark' ? t.text : '#1a1a1a',
    },
    sortRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 14,
      marginBottom: 6,
      gap: 12,
    },
    sortLine: {
      flex: 1,
      height: StyleSheet.hairlineWidth,
      backgroundColor: t.scheme === 'dark' ? t.border : 'rgba(14,49,76,0.12)',
    },
    sortBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingVertical: 4,
    },
    sortLabel: {
      fontFamily: 'Lexend_400Regular',
      fontSize: 13,
      color: t.textMuted,
    },
    sortValue: {
      fontFamily: 'Lexend_700Bold',
      fontSize: 13,
      color: t.text,
    },
    list: {
      paddingHorizontal: 20,
      paddingTop: 8,
    },
    item: {
      marginBottom: 16,
    },
    empty: {
      alignItems: 'center',
      marginTop: 48,
      paddingHorizontal: 24,
    },
    emptyIcon: {
      width: 76,
      height: 76,
      borderRadius: 22,
      backgroundColor: 'rgba(237,99,60,0.12)',
      alignItems: 'center',
      justifyContent: 'center',
    },
    emptyTitle: {
      fontFamily: 'Lexend_700Bold',
      fontSize: 17,
      color: t.text,
      marginTop: 16,
    },
    emptyText: {
      fontFamily: 'Lexend_400Regular',
      fontSize: 14,
      lineHeight: 21,
      color: t.textBody,
      textAlign: 'center',
      marginTop: 6,
    },
    bold: {
      fontFamily: 'Lexend_700Bold',
      color: t.text,
    },
    emptyButton: {
      marginTop: 20,
      paddingHorizontal: 24,
      paddingVertical: 13,
      borderRadius: 999,
      backgroundColor: colors.orange,
    },
    emptyButtonText: {
      fontFamily: 'Lexend_700Bold',
      fontSize: 14,
      color: colors.white,
    },
    modalBackdrop: {
      flex: 1,
      justifyContent: 'center',
      padding: 24,
      backgroundColor: t.overlay,
    },
    modalCard: {
      borderRadius: 24,
      padding: 20,
      backgroundColor: t.surface,
    },
    modalHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 16,
    },
    modalTitle: {
      fontFamily: 'Lexend_700Bold',
      fontSize: 17,
      color: t.text,
    },
    modalClear: {
      fontFamily: 'Lexend_700Bold',
      fontSize: 13,
      color: colors.blue,
    },
    modalSection: {
      fontFamily: 'Lexend_700Bold',
      fontSize: 12,
      letterSpacing: 0.6,
      textTransform: 'uppercase',
      color: t.textMuted,
    },
    modalSectionSpaced: {
      marginTop: 16,
    },
    chips: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
      marginTop: 10,
    },
    chip: {
      paddingHorizontal: 14,
      paddingVertical: 8,
      borderRadius: 999,
      backgroundColor: t.surfaceAlt,
      borderWidth: 1,
      borderColor: t.border,
    },
    chipOn: {
      borderColor: colors.orange,
      backgroundColor: 'rgba(237,99,60,0.12)',
    },
    chipText: {
      fontFamily: 'Lexend_400Regular',
      fontSize: 13,
      color: t.textBody,
    },
    chipTextOn: {
      fontFamily: 'Lexend_700Bold',
      color: colors.orange,
    },
    modalDone: {
      marginTop: 22,
      paddingVertical: 14,
      borderRadius: 16,
      alignItems: 'center',
      backgroundColor: colors.dblue,
    },
    modalDoneText: {
      fontFamily: 'Lexend_700Bold',
      fontSize: 15,
      color: colors.white,
    },
  });
