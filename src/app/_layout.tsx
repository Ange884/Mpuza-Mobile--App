import { Lexend_400Regular, Lexend_700Bold, useFonts } from '@expo-google-fonts/lexend';
import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';

import { AuthProvider } from '@/context/auth';
import { UserDataProvider } from '@/context/userdata';
import { LanguageProvider } from '@/i18n';
import { AppThemeProvider, useTheme } from '@/theme';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Lexend_400Regular,
    Lexend_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <AppThemeProvider>
      <LanguageProvider>
        <AuthProvider>
          <UserDataProvider>
            <RootStack />
          </UserDataProvider>
        </AuthProvider>
      </LanguageProvider>
    </AppThemeProvider>
  );
}

function RootStack() {
  const t = useTheme();
  const base = t.scheme === 'dark' ? DarkTheme : DefaultTheme;
  // Navigation colours follow the app theme so screen transitions never flash white in dark mode.
  const navTheme = { ...base, colors: { ...base.colors, background: t.bg, card: t.surface, text: t.text, border: t.border, primary: t.orange } };

  return (
    <ThemeProvider value={navTheme}>
      <StatusBar style={t.scheme === 'dark' ? 'light' : 'dark'} />
      <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right', contentStyle: { backgroundColor: t.bg } }}>
        <Stack.Screen name="loading" options={{ animation: 'fade' }} />
        <Stack.Screen name="landing" options={{ animation: 'fade' }} />
        <Stack.Screen name="account" options={{ animation: 'fade_from_bottom' }} />
        <Stack.Screen name="(tabs)" options={{ animation: 'fade', gestureEnabled: false }} />
        <Stack.Screen name="job/[id]" options={{ animation: 'slide_from_bottom' }} />
        <Stack.Screen name="skills" options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
      </Stack>
    </ThemeProvider>
  );
}
