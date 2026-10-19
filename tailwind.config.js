/** @type {import('tailwindcss').Config} */
// Design "E": white / near-black, one orange accent, status colors only where they mean something.
// Keep in sync with src/shared/theme/colors.ts (for places classes can't reach).
module.exports = {
  content: ['./src/**/*.{ts,tsx}'],
  presets: [require('nativewind/preset')],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        paper: { DEFAULT: '#FFFFFF', dark: '#0B0B0C' },
        ink: { DEFAULT: '#111111', dark: '#F2F2F0' },
        muted: { DEFAULT: '#6E6E69', dark: '#9A9A94' },
        faint: { DEFAULT: '#8A8A85', dark: '#7A7A74' },
        line: { DEFAULT: '#EFEFEC', dark: '#232326' },
        chip: { DEFAULT: '#F5F5F3', dark: '#18181B' },
        well: { DEFAULT: '#F7F7F5', dark: '#141416' },
        accent: { DEFAULT: '#C2410C', dark: '#FB923C', bright: '#F97316', soft: '#FFF7ED', 'soft-dark': '#2A1A0F' },
        status: {
          mosque: '#2563EB',
          onTime: '#16A34A',
          late: '#D97706',
          missed: '#DC2626',
          unmarked: '#E4E4E0',
        },
      },
    },
  },
  plugins: [],
};
