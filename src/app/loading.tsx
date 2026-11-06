import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';

import { colors } from '@/constants/colors';

function Dot({ delay }: { delay: number }) {
  const [scale] = useState(() => new Animated.Value(0.6));

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(scale, { toValue: 1, duration: 300, useNativeDriver: true }),
        Animated.timing(scale, { toValue: 0.6, duration: 300, useNativeDriver: true }),
        Animated.delay(600 - delay),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [delay, scale]);

  return <Animated.View style={[styles.dot, { transform: [{ scale }] }]} />;
}

export default function Loading() {
  useEffect(() => {
    const timer = setTimeout(() => router.replace('/landing'), 1500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.brand}>
        <View style={styles.logo}>
          <Ionicons name="leaf" size={20} color={colors.white} />
        </View>
        <Text style={styles.logoText}>MPUZA</Text>
      </View>

      <View style={styles.dots}>
        <Dot delay={0} />
        <Dot delay={150} />
        <Dot delay={300} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logo: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.orange,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    fontSize: 30,
    fontFamily: 'Lexend_700Bold',
    color: '#111',
  },
  dots: {
    position: 'absolute',
    bottom: 80,
    flexDirection: 'row',
    gap: 10,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.blue,
  },
});
