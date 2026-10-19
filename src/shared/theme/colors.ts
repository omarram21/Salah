/**
 * Raw color values for places NativeWind classes can't reach (SVG icons, switches,
 * navigation theme). Keep in sync with tailwind.config.js.
 */
export const palette = {
  light: {
    paper: '#FFFFFF',
    ink: '#111111',
    muted: '#6E6E69',
    faint: '#8A8A85',
    line: '#EFEFEC',
    chip: '#F5F5F3',
    well: '#F7F7F5',
    accent: '#C2410C',
    track: '#DADAD5',
  },
  dark: {
    paper: '#0B0B0C',
    ink: '#F2F2F0',
    muted: '#9A9A94',
    faint: '#7A7A74',
    line: '#232326',
    chip: '#18181B',
    well: '#141416',
    accent: '#FB923C',
    track: '#3A3A3E',
  },
  status: {
    mosque: '#2563EB',
    onTime: '#16A34A',
    late: '#D97706',
    missed: '#DC2626',
    unmarked: '#E4E4E0',
  },
} as const;

export type ThemeColors = (typeof palette)['light'] | (typeof palette)['dark'];
