import { useColorScheme } from 'nativewind';
import { useEffect } from 'react';

import { palette } from '@/shared/theme/colors';

import { useSettingsStore } from '../store/settings-store';

/** Applies the user's theme preference to NativeWind and returns raw colors. */
export function useAppTheme() {
  const preference = useSettingsStore((s) => s.theme);
  const { colorScheme, setColorScheme } = useColorScheme();

  useEffect(() => {
    setColorScheme(preference);
  }, [preference, setColorScheme]);

  const isDark = colorScheme === 'dark';
  return { isDark, colors: isDark ? palette.dark : palette.light };
}
