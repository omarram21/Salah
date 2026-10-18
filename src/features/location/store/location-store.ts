import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { STORAGE_KEYS, zustandStorage } from '@/shared/lib/storage';

import type { AppLocation } from '../model/types';

type LocationState = {
  location: AppLocation | null;
  /** Last time a GPS fix was taken (for throttling silent refreshes). */
  gpsCheckedAt: number | null;
  setLocation: (location: AppLocation) => void;
  markGpsChecked: (at: number) => void;
};

export const useLocationStore = create<LocationState>()(
  persist(
    (set) => ({
      location: null,
      gpsCheckedAt: null,
      setLocation: (location) =>
        set({ location, gpsCheckedAt: location.source === 'gps' ? Date.now() : null }),
      markGpsChecked: (gpsCheckedAt) => set({ gpsCheckedAt }),
    }),
    {
      name: STORAGE_KEYS.location,
      storage: zustandStorage,
      version: 1,
      partialize: ({ location, gpsCheckedAt }) => ({ location, gpsCheckedAt }),
    },
  ),
);
