import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown, FadeOut, LinearTransition, ZoomIn } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { FeedJobCard } from '@/components/feed/FeedJobCard';
import { colors } from '@/constants/colors';
import { useUserData } from '@/context/userdata';
import { feedJobs } from '@/data/feed';

export default function Saved() {
  const insets = useSafeAreaInsets();
  const { favorites } = useUserData();
  const jobs = feedJobs.filter((job) => favorites.includes(job.id));

  return (
    <View style={styles.screen}>
      <Animated.View entering={FadeInDown.duration(500)} style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <View style={styles.headerIcon}>
          <Ionicons name="star" size={20} color={colors.white} />
        </View>
        <View>
          <Text style={styles.title}>Favourited Jobs</Text>
          <Text style={styles.subtitle}>
            {jobs.length} saved role{jobs.length === 1 ? '' : 's'}
          </Text>
        </View>
      </Animated.View>

      <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
        {jobs.map((job, i) => (
          <Animated.View
            key={job.id}
            entering={FadeInDown.delay(100 + i * 70).duration(450)}
            exiting={FadeOut.duration(200)}
            layout={LinearTransition.springify().damping(18)}
            style={styles.item}>
            <FeedJobCard job={job} />
          </Animated.View>
        ))}

        {jobs.length === 0 && (
          <Animated.View entering={FadeInDown.delay(150).duration(500)} style={styles.empty}>
            <Animated.View entering={ZoomIn.delay(300).springify().damping(10)} style={styles.emptyIcon}>
              <Ionicons name="star-outline" size={30} color={colors.blue} />
            </Animated.View>
            <Text style={styles.emptyTitle}>No saved jobs yet</Text>
            <Text style={styles.emptyText}>
              Tap the <Text style={styles.bold}>Favourite</Text> star on any job to save it here for quick access.
            </Text>
            <Pressable
              style={({ pressed }) => [styles.emptyButton, pressed && { opacity: 0.75 }]}
              onPress={() => router.navigate('/home')}>
              <Text style={styles.emptyButtonText}>Browse jobs</Text>
            </Pressable>
          </Animated.View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#f6f8fb',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 20,
    paddingBottom: 16,
    backgroundColor: colors.blue,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerIcon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.22)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontFamily: 'Lexend_700Bold',
    fontSize: 20,
    color: colors.white,
  },
  subtitle: {
    fontFamily: 'Lexend_400Regular',
    fontSize: 12,
    color: 'rgba(255,255,255,0.85)',
  },
  list: {
    padding: 20,
    paddingBottom: 40,
  },
  item: {
    marginBottom: 14,
  },
  empty: {
    alignItems: 'center',
    marginTop: 60,
    paddingHorizontal: 24,
  },
  emptyIcon: {
    width: 72,
    height: 72,
    borderRadius: 20,
    backgroundColor: 'rgba(53,168,223,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    fontFamily: 'Lexend_700Bold',
    fontSize: 17,
    color: colors.dblue,
    marginTop: 16,
  },
  emptyText: {
    fontFamily: 'Lexend_400Regular',
    fontSize: 14,
    lineHeight: 21,
    color: '#5b6b7a',
    textAlign: 'center',
    marginTop: 6,
  },
  bold: {
    fontFamily: 'Lexend_700Bold',
    color: colors.dblue,
  },
  emptyButton: {
    marginTop: 20,
    paddingHorizontal: 22,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: colors.orange,
  },
  emptyButtonText: {
    fontFamily: 'Lexend_700Bold',
    fontSize: 14,
    color: colors.white,
  },
});
