import '@/global.css';

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

void SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const hydrated = [
    useHydrated(useSettingsStore),
    useHydrated(useLocationStore),
    useHydrated(usePrayerTimesStore),
    useHydrated(useTrackingStore),
  ].every(Boolean);

  useEffect(() => {
    if (hydrated) void SplashScreen.hideAsync();
  }, [hydrated]);

  if (!hydrated) return null;
  return <App />;
}

/** Rendered only after persisted stores have loaded. */
function App() {
  const language = useSettingsStore((s) => s.language);
  const { t, i18n } = useTranslation();
  const { isDark, colors, palette } = useAppTheme();
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
      primary: palette.primary,
      background: colors.background,
      card: colors.card,
      text: colors.text,
      border: colors.border,
    },
  };

  return (
    <LocaleProvider direction={direction}>
      <DirectionProvider direction={direction}>
        <ThemeProvider value={navTheme}>
          <StatusBar style={isDark ? 'light' : 'dark'} />
          <View style={{ flex: 1, direction }}>
            <Stack screenOptions={{ headerShown: false, headerBackButtonDisplayMode: 'minimal' }}>
              <Stack.Screen name="(tabs)" />
              <Stack.Screen
                name="location"
                options={{ presentation: 'modal', headerShown: true, title: t('location.title') }}
              />
              <Stack.Screen
                name="calculation-method"
                options={{ presentation: 'modal', headerShown: true, title: t('settings.calculationMethod') }}
              />
              <Stack.Screen name="day/[date]" options={{ headerShown: true, title: t('tracking.editDayTitle') }} />
            </Stack>
          </View>
        </ThemeProvider>
      </DirectionProvider>
    </LocaleProvider>
  );
}
