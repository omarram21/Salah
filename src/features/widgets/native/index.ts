import { requireOptionalNativeModule } from 'expo';
import { Platform } from 'react-native';

type Native = typeof import('./layouts');
let cached: Native | null | undefined;

/**
 * The widget layouts, or null where widgets can't exist (Android, Expo Go, tests).
 * Loaded lazily so Expo Go never touches the missing native module.
 */
export function nativeWidgets(): Native | null {
  if (cached !== undefined) return cached;
  cached = null;
  if (Platform.OS === 'ios' && requireOptionalNativeModule('ExpoWidgets')) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      cached = require('./layouts') as Native;
    } catch (e) {
      console.warn('Widgets unavailable', e);
    }
  }
  return cached;
}

export const widgetsSupported = () => nativeWidgets() !== null;
