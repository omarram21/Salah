import {
  SpaceGrotesk_400Regular,
  SpaceGrotesk_500Medium,
  SpaceGrotesk_600SemiBold,
  SpaceGrotesk_700Bold,
} from '@expo-google-fonts/space-grotesk';

/** Passed to expo-font's useFonts() at startup. */
export const APP_FONTS = {
  SpaceGrotesk_400Regular,
  SpaceGrotesk_500Medium,
  SpaceGrotesk_600SemiBold,
  SpaceGrotesk_700Bold,
};

export type FontWeight = 'regular' | 'medium' | 'semibold' | 'bold';

/**
 * Custom fonts need one family per weight (fontWeight alone doesn't pick them).
 * Arabic glyphs aren't in Space Grotesk; the OS falls back to its Arabic font automatically.
 */
export const FONT_FAMILY: Record<FontWeight, string> = {
  regular: 'SpaceGrotesk_400Regular',
  medium: 'SpaceGrotesk_500Medium',
  semibold: 'SpaceGrotesk_600SemiBold',
  bold: 'SpaceGrotesk_700Bold',
};
