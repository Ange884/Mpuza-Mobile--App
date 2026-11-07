import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

import type { Job } from '@/data/explore';

type Props = {
  job: Job;
  onPress: (job: Job) => void;
  /** Guest view shows a lock; signed-in users don't see it. */
  locked?: boolean;
  applied?: boolean;
};

export function JobCard({ job, onPress, locked = true, applied = false }: Props) {
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <Animated.View style={[styles.wrapper, animatedStyle]}>
      <Pressable
        style={styles.card}
        onPress={() => onPress(job)}
        onPressIn={() => {
          scale.set(withSpring(0.97, { damping: 15, stiffness: 300 }));
        }}
        onPressOut={() => {
          scale.set(withSpring(1, { damping: 12, stiffness: 220 }));
        }}
        accessibilityRole="button"
        accessibilityLabel={`${job.title} at ${job.company}`}>
        <View style={styles.top}>
          <View style={[styles.logo, { backgroundColor: job.color + '1f' }]}>
            <Text style={[styles.logoText, { color: job.color }]}>
              {job.company
                .split(' ')
                .map((word) => word[0])
                .join('')
                .slice(0, 2)}
            </Text>
          </View>
          <View style={styles.headline}>
            <Text style={styles.title} numberOfLines={2}>
              {job.title}
            </Text>
            <Text style={styles.company}>{job.company}</Text>
          </View>
          {locked && <Ionicons name="lock-closed" size={16} color="#b5b5c3" />}
        </View>

        <View style={styles.meta}>
          <Meta icon="location-outline" text={job.location} />
          <Meta icon="briefcase-outline" text={job.type} />
          <Meta icon="time-outline" text={job.posted} />
        </View>

        <View style={styles.bottom}>
          <View style={styles.tags}>
            {job.tags.map((tag) => (
              <View key={tag} style={styles.tag}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.salary}>{job.salary}</Text>
          <View style={[styles.applyPill, { backgroundColor: applied ? '#22a06b' : job.color }]}>
            <Text style={styles.applyText}>{applied ? 'Applied' : locked ? 'View' : 'Apply'}</Text>
            <Ionicons name={applied ? 'checkmark' : 'arrow-forward'} size={13} color="#fff" />
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
}

function Meta({ icon, text }: { icon: keyof typeof Ionicons.glyphMap; text: string }) {
  return (
    <View style={styles.metaItem}>
      <Ionicons name={icon} size={13} color="#8a8a99" />
      <Text style={styles.metaText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 14,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#efeff5',
    shadowColor: '#1b1b3a',
    shadowOpacity: 0.07,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
  top: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  logo: {
    width: 46,
    height: 46,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    fontFamily: 'Lexend_700Bold',
    fontSize: 15,
  },
  headline: {
    flex: 1,
  },
  title: {
    fontFamily: 'Lexend_700Bold',
    fontSize: 15,
    color: '#15152b',
    lineHeight: 20,
  },
  company: {
    fontFamily: 'Lexend_400Regular',
    fontSize: 12,
    color: '#7a7a8c',
    marginTop: 2,
  },
  meta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 14,
    marginTop: 14,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontFamily: 'Lexend_400Regular',
    fontSize: 12,
    color: '#6b6b7b',
  },
  bottom: {
    marginTop: 12,
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  tag: {
    backgroundColor: '#f4f4f9',
    borderRadius: 8,
    paddingHorizontal: 9,
    paddingVertical: 4,
  },
  tagText: {
    fontFamily: 'Lexend_400Regular',
    fontSize: 11,
    color: '#4a4a5c',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f1f1f6',
  },
  salary: {
    fontFamily: 'Lexend_700Bold',
    fontSize: 13,
    color: '#15152b',
  },
  applyPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  applyText: {
    fontFamily: 'Lexend_700Bold',
    fontSize: 12,
    color: '#fff',
  },
});
