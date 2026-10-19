import '@/global.css';

import { useFonts } from 'expo-font';
import { DarkTheme, DefaultTheme, LocaleProvider, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { useLocationStore } from '@/features/location';
import { useNotificationSync } from '@/features/notifications';
import { usePrayerTimesStore, usePrayerTimesSync } from '@/features/prayer-times';
import { useAppTheme, useSettingsStore } from '@/features/settings';
import { useTrackingStore } from '@/features/tracking';
// Also initialises i18next (side effect of the module).
import { directionOf, DirectionProvider } from '@/shared/i18n';
import { dateKeyAt, deviceUtcOffsetMin } from '@/shared/lib/date-key';
import { useHydrated } from '@/shared/lib/use-hydrated';
import { APP_FONTS } from '@/shared/theme/fonts';

void SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts(APP_FONTS);
  const hydrated = [
    useHydrated(useSettingsStore),
    useHydrated(useLocationStore),
    useHydrated(usePrayerTimesStore),
    useHydrated(useTrackingStore),
  ].every(Boolean);
  // A font failure falls back to the system font rather than blocking the app.
  const ready = hydrated && (fontsLoaded || !!fontError);

  useEffect(() => {
    if (ready) void SplashScreen.hideAsync();
  }, [ready]);

  if (!ready) return null;
  return <App />;
}

/** Rendered only after persisted stores and fonts have loaded. */
function App() {
  const language = useSettingsStore((s) => s.language);
  const { i18n } = useTranslation();
  const { isDark, colors } = useAppTheme();
  const direction = directionOf(language);

  usePrayerTimesSync();
  useNotificationSync();

  useEffect(() => {
    if (i18n.language !== language) void i18n.changeLanguage(language);
  }, [i18n, language]);

  useEffect(() => {
    useTrackingStore.getState().ensureStarted(dateKeyAt(Date.now(), deviceUtcOffsetMin()));
  }, []);

  const base = isDark ? DarkTheme : DefaultTheme;
  const navTheme = {
    ...base,
    colors: {
      ...base.colors,
      primary: colors.accent,
      background: colors.paper,
      card: colors.paper,
      text: colors.ink,
      border: colors.line,
    },
  };

  return (
    <LocaleProvider direction={direction}>
      <DirectionProvider direction={direction}>
        <ThemeProvider value={navTheme}>
          <StatusBar style={isDark ? 'light' : 'dark'} />
          <View style={{ flex: 1, direction }}>
            {/* Every screen draws its own E-style header. */}
            <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.paper } }}>
              <Stack.Screen name="(tabs)" />
              <Stack.Screen name="location" options={{ presentation: 'modal' }} />
            </Stack>
          </View>
        </ThemeProvider>
      </DirectionProvider>
    </LocaleProvider>
  );
}
