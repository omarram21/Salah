import AsyncStorage from '@react-native-async-storage/async-storage';
import { createJSONStorage } from 'zustand/middleware';

/** Shared AsyncStorage adapter for persisted Zustand stores. */
export const zustandStorage = createJSONStorage(() => AsyncStorage);

/**
 * Storage keys live here so they never collide across features.
 * The "salah." prefix predates the app's name (Hayya); keep it, or saved data is lost.
 */
export const STORAGE_KEYS = {
  settings: 'salah.settings.v1',
  location: 'salah.location.v1',
  prayerTimes: 'salah.prayer-times.v1',
  tracking: 'salah.tracking.v1',
} as const;
