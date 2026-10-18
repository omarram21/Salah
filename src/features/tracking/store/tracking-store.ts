import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import type { PrayerName } from '@/features/prayer-times';
import type { DateKey } from '@/shared/lib/date-key';
import { STORAGE_KEYS, zustandStorage } from '@/shared/lib/storage';

import type { PrayerStatus, RecordsByDate } from '../logic/types';

type TrackingState = {
  records: RecordsByDate;
  /** First day the app was used; history and stats start here. */
  trackingSince: DateKey | null;
  setStatus: (date: DateKey, prayer: PrayerName, status: PrayerStatus, now?: number) => void;
  setStatuses: (date: DateKey, prayers: PrayerName[], status: PrayerStatus, now?: number) => void;
  clearStatus: (date: DateKey, prayer: PrayerName) => void;
  /** Records the first-use date once. */
  ensureStarted: (today: DateKey) => void;
};

export const useTrackingStore = create<TrackingState>()(
  persist(
    (set) => ({
      records: {},
      trackingSince: null,

      setStatus: (date, prayer, status, now = Date.now()) =>
        set((s) => ({
          records: { ...s.records, [date]: { ...s.records[date], [prayer]: { status, updatedAt: now } } },
          trackingSince: s.trackingSince && s.trackingSince <= date ? s.trackingSince : date,
        })),

      setStatuses: (date, prayers, status, now = Date.now()) =>
        set((s) => {
          const day = { ...s.records[date] };
          for (const p of prayers) day[p] = { status, updatedAt: now };
          return {
            records: { ...s.records, [date]: day },
            trackingSince: s.trackingSince && s.trackingSince <= date ? s.trackingSince : date,
          };
        }),

      clearStatus: (date, prayer) =>
        set((s) => {
          const { [prayer]: _removed, ...rest } = s.records[date] ?? {};
          const records = { ...s.records };
          if (Object.keys(rest).length) records[date] = rest;
          else delete records[date];
          return { records };
        }),

      ensureStarted: (today) => set((s) => (s.trackingSince ? s : { trackingSince: today })),
    }),
    {
      name: STORAGE_KEYS.tracking,
      storage: zustandStorage,
      version: 1,
      partialize: ({ records, trackingSince }) => ({ records, trackingSince }),
    },
  ),
);
