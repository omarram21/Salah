import { useColorScheme } from 'nativewind';

import { palette } from './colors';

/** Raw colors for the active scheme (for SVG strokes, switches, etc.). */
export function useThemeColors() {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';
  return { isDark, c: isDark ? palette.dark : palette.light, status: palette.status };
}
