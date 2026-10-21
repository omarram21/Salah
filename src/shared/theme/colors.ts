/**
 * Raw color values for places NativeWind classes can't reach (SVG icons, switches,
 * navigation theme). Keep in sync with tailwind.config.js.
 */
export const palette = {
  light: {
    paper: '#FFFFFF',
    ink: '#111111',
    muted: '#6E6E69',
    faint: '#71716B',
    line: '#EFEFEC',
    chip: '#F5F5F3',
    well: '#F7F7F5',
    accent: '#C2410C',
    track: '#DADAD5',
    // Semantic text colors, each readable (≥4.5:1) on this theme's surfaces.
    success: '#15803D',
    warning: '#B45309',
    danger: '#DC2626',
    demo: '#9A3412',
    chevron: '#B4B4AF',
    disabled: '#C9C9C4',
    suggestBg: '#FDE7C8',
    suggestFg: '#8A4B00',
  },
  dark: {
    paper: '#0B0B0C',
    ink: '#F2F2F0',
    muted: '#9A9A94',
    faint: '#85857F',
    line: '#232326',
    chip: '#18181B',
    well: '#141416',
    accent: '#FB923C',
    track: '#3A3A3E',
    success: '#4ADE80',
    warning: '#FBBF24',
    danger: '#F87171',
    demo: '#FDBA74',
    chevron: '#5A5A60',
    disabled: '#3A3A3E',
    suggestBg: '#3A2A14',
    suggestFg: '#FBBF24',
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
