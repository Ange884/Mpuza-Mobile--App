import { StyleSheet, Text, View } from 'react-native';

import { colors } from '@/constants/colors';

export default function Account() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Log in or sign up</Text>
      <Text style={styles.subtitle}>This screen is coming next.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  title: {
    fontFamily: 'Lexend_700Bold',
    fontSize: 20,
    color: '#111',
  },
  subtitle: {
    fontFamily: 'Lexend_400Regular',
    fontSize: 14,
    color: '#666',
  },
});
