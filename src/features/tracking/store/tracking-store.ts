import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import type { PrayerName } from '@/features/prayer-times';
import type { DateKey } from '@/shared/lib/date-key';
import { STORAGE_KEYS, zustandStorage } from '@/shared/lib/storage';

import { generateDemoDataset } from '../demo/generate-demo';
import type { ExtraId } from '../logic/sunnah';
import type { Dataset, PrayerStatus, RecordsByDate } from '../logic/types';

export type DatasetName = 'real' | 'demo';

type PersistedTracking = {
  datasets: { real: Dataset; demo: Dataset | null };
  active: DatasetName;
};

type TrackingState = PersistedTracking & {
  /** All edits apply to the active dataset. */
  setStatus: (date: DateKey, prayer: PrayerName, status: PrayerStatus, now?: number) => void;
  setStatuses: (date: DateKey, prayers: PrayerName[], status: PrayerStatus, now?: number) => void;
  clearStatus: (date: DateKey, prayer: PrayerName) => void;
  /**
   * From a notification button: writes to the REAL records (even in demo mode) and only
   * when the prayer isn't marked yet. Returns whether it saved.
   */
  markRealIfUnmarked: (date: DateKey, prayer: PrayerName, status: PrayerStatus, now?: number) => boolean;
  /** Marks a sunnah / Witr / Duha / Al-Kahf / fast done or not done for a date (active dataset). */
  setExtra: (date: DateKey, id: ExtraId, done: boolean, now?: number) => void;
  /** Records the first-use date of the REAL dataset once. */
  ensureStarted: (today: DateKey) => void;
  /** Switch to demo data (generated on first use, then kept with any edits). */
  enableDemo: (today: DateKey) => void;
  /** Throw away demo edits and generate fresh demo data. */
  resetDemo: (today: DateKey) => void;
  /** Back to real data. Demo data is kept for next time. */
  disableDemo: () => void;
};

const EMPTY: Dataset = { records: {}, trackingSince: null, extras: {} };

/** The dataset screens should show. */
export function selectActive(s: PersistedTracking): Dataset {
  return s.active === 'demo' && s.datasets.demo ? s.datasets.demo : s.datasets.real;
}
export const selectRecords = (s: PersistedTracking) => selectActive(s).records;
export const selectTrackingSince = (s: PersistedTracking) => selectActive(s).trackingSince;
export const selectExtras = (s: PersistedTracking) => selectActive(s).extras;
export const selectIsDemo = (s: PersistedTracking) => s.active === 'demo' && s.datasets.demo !== null;

/** Applies `fn` to the active dataset. */
function updateActive(s: PersistedTracking, fn: (d: Dataset) => Dataset): Partial<PersistedTracking> {
  const name: DatasetName = selectIsDemo(s) ? 'demo' : 'real';
  return { datasets: { ...s.datasets, [name]: fn(selectActive(s)) } };
}

function withRecords(d: Dataset, date: DateKey, records: RecordsByDate): Dataset {
  return {
    ...d,
    records,
    trackingSince: d.trackingSince && d.trackingSince <= date ? d.trackingSince : date,
  };
}

export const useTrackingStore = create<TrackingState>()(
  persist(
    (set, get) => ({
      datasets: { real: EMPTY, demo: null },
      active: 'real',

      setStatus: (date, prayer, status, now = Date.now()) =>
        set((s) =>
          updateActive(s, (d) =>
            withRecords(d, date, {
              ...d.records,
              [date]: { ...d.records[date], [prayer]: { status, updatedAt: now } },
            }),
          ),
        ),

      setStatuses: (date, prayers, status, now = Date.now()) =>
        set((s) =>
          updateActive(s, (d) => {
            const day = { ...d.records[date] };
            for (const p of prayers) day[p] = { status, updatedAt: now };
            return withRecords(d, date, { ...d.records, [date]: day });
          }),
        ),

      clearStatus: (date, prayer) =>
        set((s) =>
          updateActive(s, (d) => {
            const { [prayer]: _removed, ...rest } = d.records[date] ?? {};
            const records = { ...d.records };
            if (Object.keys(rest).length) records[date] = rest;
            else delete records[date];
            return { ...d, records };
          }),
        ),

      markRealIfUnmarked: (date, prayer, status, now = Date.now()) => {
        const real = get().datasets.real;
        if (real.records[date]?.[prayer]) return false;
        set((s) => ({
          datasets: {
            ...s.datasets,
            real: withRecords(s.datasets.real, date, {
              ...s.datasets.real.records,
              [date]: { ...s.datasets.real.records[date], [prayer]: { status, updatedAt: now } },
            }),
          },
        }));
        return true;
      },

      setExtra: (date, id, done, now = Date.now()) =>
        set((s) =>
          updateActive(s, (d) => {
            const day = { ...d.extras[date] };
            if (done) day[id] = now;
            else delete day[id];
            const extras = { ...d.extras };
            if (Object.keys(day).length) extras[date] = day;
            else delete extras[date];
            return { ...d, extras, trackingSince: d.trackingSince && d.trackingSince <= date ? d.trackingSince : date };
          }),
        ),

      ensureStarted: (today) =>
        set((s) =>
          s.datasets.real.trackingSince
            ? s
            : { datasets: { ...s.datasets, real: { ...s.datasets.real, trackingSince: today } } },
        ),

      enableDemo: (today) =>
        set((s) => ({
          active: 'demo',
          datasets: { ...s.datasets, demo: s.datasets.demo ?? generateDemoDataset(today) },
        })),

      resetDemo: (today) =>
        set((s) => ({ active: 'demo', datasets: { ...s.datasets, demo: generateDemoDataset(today) } })),

      disableDemo: () => set({ active: 'real' }),
    }),
    {
      name: STORAGE_KEYS.tracking,
      storage: zustandStorage,
      version: 3,
      partialize: ({ datasets, active }) => ({ datasets, active }),
      migrate: migrateTrackingState,
    },
  ),
);

/**
 * v1 stored `{ records, trackingSince }` at the top level; v2 nested them under
 * `datasets.real` (so demo data can live alongside); v3 adds `extras` (sunnah/Witr).
 */
export function migrateTrackingState(persisted: unknown, version: number): PersistedTracking {
  let state: PersistedTracking;
  if (version < 2) {
    const v1 = (persisted ?? {}) as Partial<Dataset>;
    state = {
      datasets: { real: { records: v1.records ?? {}, trackingSince: v1.trackingSince ?? null, extras: {} }, demo: null },
      active: 'real',
    };
  } else {
    state = persisted as PersistedTracking;
  }
  const withExtras = (d: Dataset | null): Dataset | null => (d ? { ...d, extras: d.extras ?? {} } : d);
  return {
    ...state,
    datasets: { real: withExtras(state.datasets.real) ?? EMPTY, demo: withExtras(state.datasets.demo) },
  };
}
