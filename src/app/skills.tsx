import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import Animated, { FadeIn, FadeInDown, LinearTransition, ZoomIn, ZoomOut } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { PrimaryButton } from '@/components/auth/PrimaryButton';
import { colors } from '@/constants/colors';
import { useUserData } from '@/context/userdata';
import { SKILL_SUGGESTIONS } from '@/data/feed';

/** Modal for picking skills. Saved on the device and used to compute job match %. */
export default function Skills() {
  const insets = useSafeAreaInsets();
  const { skills, setSkills } = useUserData();
  const [selected, setSelected] = useState<string[]>(skills);
  const [custom, setCustom] = useState('');

  const suggestions = [...new Set([...SKILL_SUGGESTIONS, ...selected])];

  function toggle(skill: string) {
    setSelected((list) => (list.includes(skill) ? list.filter((s) => s !== skill) : [...list, skill]));
  }

  function addCustom() {
    const skill = custom.trim();
    if (skill && !selected.some((s) => s.toLowerCase() === skill.toLowerCase())) setSelected((l) => [...l, skill]);
    setCustom('');
  }

  function save() {
    setSkills(selected);
    router.back();
  }

  return (
    <KeyboardAvoidingView style={styles.screen} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={[styles.header, { paddingTop: Platform.OS === 'ios' ? 16 : insets.top + 12 }]}>
        <View style={styles.handle} />
        <View style={styles.headerRow}>
          <Text style={styles.title}>Your skills</Text>
          <Pressable onPress={() => router.back()} hitSlop={10} style={styles.close} accessibilityLabel="Close">
            <Ionicons name="close" size={20} color={colors.dblue} />
          </Pressable>
        </View>
        <Text style={styles.subtitle}>Pick what you&apos;re good at. We use it to rank jobs and show your match %.</Text>
      </View>

      <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled">
        <Animated.View entering={FadeInDown.delay(100)} style={styles.inputRow}>
          <TextInput
            value={custom}
            onChangeText={setCustom}
            placeholder="Add another skill…"
            placeholderTextColor="#a3a8b8"
            style={styles.input}
            returnKeyType="done"
            onSubmitEditing={addCustom}
          />
          <Pressable onPress={addCustom} style={styles.addButton} accessibilityLabel="Add skill">
            <Ionicons name="add" size={20} color={colors.white} />
          </Pressable>
        </Animated.View>

        <Text style={styles.count}>{selected.length} selected</Text>

        <View style={styles.chips}>
          {suggestions.map((skill, i) => {
            const on = selected.includes(skill);
            return (
              <Animated.View key={skill} entering={FadeIn.delay(120 + i * 25)} layout={LinearTransition}>
                <Pressable
                  onPress={() => toggle(skill)}
                  style={[styles.chip, on && styles.chipOn]}
                  accessibilityRole="checkbox"
                  accessibilityState={{ checked: on }}>
                  {on && (
                    <Animated.View entering={ZoomIn.springify().damping(12)} exiting={ZoomOut.duration(120)}>
                      <Ionicons name="checkmark" size={14} color={colors.white} />
                    </Animated.View>
                  )}
                  <Text style={[styles.chipText, on && styles.chipTextOn]}>{skill}</Text>
                </Pressable>
              </Animated.View>
            );
          })}
        </View>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 16 }]}>
        <PrimaryButton label={`Save ${selected.length} skill${selected.length === 1 ? '' : 's'}`} onPress={save} />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.white,
  },
  header: {
    paddingHorizontal: 22,
    paddingBottom: 12,
  },
  handle: {
    alignSelf: 'center',
    width: 40,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#e2e6ec',
    marginBottom: 14,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontFamily: 'Lexend_700Bold',
    fontSize: 24,
    color: colors.dblue,
  },
  close: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#f3f5f9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  subtitle: {
    fontFamily: 'Lexend_400Regular',
    fontSize: 13,
    lineHeight: 19,
    color: '#7a8796',
    marginTop: 6,
  },
  body: {
    paddingHorizontal: 22,
    paddingBottom: 24,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 6,
  },
  input: {
    flex: 1,
    height: 48,
    paddingHorizontal: 16,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#e3e6ec',
    fontFamily: 'Lexend_400Regular',
    fontSize: 14,
    color: colors.dblue,
  },
  addButton: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: colors.dblue,
    alignItems: 'center',
    justifyContent: 'center',
  },
  count: {
    fontFamily: 'Lexend_700Bold',
    fontSize: 12,
    color: colors.orange,
    marginTop: 18,
    marginBottom: 10,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 20,
    backgroundColor: '#f3f5f9',
    borderWidth: 1,
    borderColor: '#e8ecf2',
  },
  chipOn: {
    backgroundColor: colors.orange,
    borderColor: colors.orange,
  },
  chipText: {
    fontFamily: 'Lexend_400Regular',
    fontSize: 13,
    color: '#3b4a59',
  },
  chipTextOn: {
    fontFamily: 'Lexend_700Bold',
    color: colors.white,
  },
  footer: {
    paddingHorizontal: 22,
    paddingTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#e3e6ec',
  },
});
