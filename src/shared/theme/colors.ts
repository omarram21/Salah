/**
 * Raw color values for places NativeWind classes can't reach
 * (tab bar, icons, navigation theme). Keep in sync with tailwind.config.js.
 */
export const palette = {
  primary: '#0F766E',
  primaryLight: '#14B8A6',
  light: { background: '#F8FAFC', card: '#FFFFFF', text: '#0F172A', muted: '#64748B', border: '#E2E8F0' },
  dark: { background: '#020617', card: '#0F172A', text: '#F1F5F9', muted: '#94A3B8', border: '#1E293B' },
} as const;
