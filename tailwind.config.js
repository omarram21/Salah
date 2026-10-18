/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{ts,tsx}'],
  presets: [require('nativewind/preset')],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#0F766E',
          light: '#14B8A6',
          dark: '#115E59',
        },
        status: {
          onTime: '#16A34A',
          late: '#EAB308',
          missed: '#DC2626',
          unmarked: '#9CA3AF',
        },
      },
    },
  },
  plugins: [],
};
