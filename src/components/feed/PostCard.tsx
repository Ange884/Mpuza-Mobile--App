import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSequence, withSpring, ZoomIn } from 'react-native-reanimated';

import { colors } from '@/constants/colors';
import { useUserData } from '@/context/userdata';
import type { FeedPost } from '@/data/feed';
import { useStyles, useTheme, type Theme } from '@/theme';

/** Company post in the horizontal carousel, with 👍 / 👎 reactions saved on the device. */
export function PostCard({ post }: { post: FeedPost }) {
  const styles = useStyles(makeStyles);
  const { reactions, react } = useUserData();
  const mine = reactions[post.id];
  const likes = post.likes + (mine === 'like' ? 1 : 0);
  const dislikes = post.dislikes + (mine === 'dislike' ? 1 : 0);

  return (
    <View style={styles.card}>
      <View>
        <Image source={{ uri: post.image }} style={styles.image} contentFit="cover" transition={300} />
        <View style={styles.tag}>
          <Text style={styles.tagText} numberOfLines={1}>
            {post.company}
          </Text>
        </View>
      </View>
      <Text style={styles.title} numberOfLines={2}>
        {post.title}
      </Text>
      <View style={styles.reactions}>
        <ReactionButton icon="thumbs-up" count={likes} active={mine === 'like'} onPress={() => react(post.id, 'like')} />
        <View style={styles.divider} />
        <ReactionButton
          icon="thumbs-down"
          count={dislikes}
          active={mine === 'dislike'}
          onPress={() => react(post.id, 'dislike')}
        />
      </View>
    </View>
  );
}

function ReactionButton({
  icon,
  count,
  active,
  onPress,
}: {
  icon: 'thumbs-up' | 'thumbs-down';
  count: number;
  active: boolean;
  onPress: () => void;
}) {
  const t = useTheme();
  const styles = useStyles(makeStyles);
  const scale = useSharedValue(1);
  const style = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <Pressable
      style={styles.reaction}
      hitSlop={6}
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      onPress={() => {
        scale.set(withSequence(withSpring(1.4, { damping: 5 }), withSpring(1)));
        onPress();
      }}>
      <Animated.View style={style}>
        <Ionicons name={active ? icon : `${icon}-outline`} size={16} color={active ? colors.orange : t.textBody} />
      </Animated.View>
      <Animated.Text key={count} entering={ZoomIn.duration(200)} style={[styles.count, active && styles.countActive]}>
        {count}
      </Animated.Text>
    </Pressable>
  );
}

const makeStyles = (t: Theme) =>
  StyleSheet.create({
  card: {
    width: 200,
    backgroundColor: t.surface,
    borderRadius: 18,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: t.border,
  },
  image: {
    width: '100%',
    height: 110,
    backgroundColor: t.surfaceAlt,
  },
  tag: {
    position: 'absolute',
    left: 10,
    bottom: 10,
    maxWidth: 160,
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: t.surface,
  },
  tagText: {
    fontFamily: 'Lexend_700Bold',
    fontSize: 10,
    color: colors.blue,
  },
  title: {
    fontFamily: 'Lexend_700Bold',
    fontSize: 13,
    lineHeight: 18,
    color: t.text,
    paddingHorizontal: 12,
    paddingTop: 10,
    minHeight: 46,
  },
  reactions: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 12,
    marginTop: 8,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: t.border,
  },
  reaction: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  divider: {
    width: 1,
    height: 16,
    backgroundColor: t.border,
  },
  count: {
    fontFamily: 'Lexend_700Bold',
    fontSize: 12,
    color: t.textBody,
  },
  countActive: {
    color: colors.orange,
  },
});
