import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { ApiError, fetchCalendarByCoordinates, type ApiErrorKind } from '@/shared/api/aladhan';
import { addMonths, dateKeyAt, deviceUtcOffsetMin, monthKeyOf, parseMonthKey, type MonthKey } from '@/shared/lib/date-key';
import { STORAGE_KEYS, zustandStorage } from '@/shared/lib/storage';

import { monthsNeeded } from '../model/fetch-plan';
import { paramsKey, type PrayerTimesParams } from '../model/params';
import { parseMonth } from '../model/parse';
import type { PrayerMonth } from '../model/types';

/** Cache key: `${paramsKey}#${YYYY-MM}` */
const cacheKey = (pk: string, month: MonthKey) => `${pk}#${month}`;

type PrayerTimesState = {
  months: Record<string, PrayerMonth>;
  syncing: boolean;
  /** Last sync error, cleared on the next successful sync. */
  error: ApiErrorKind | null;
  /** Makes sure the months needed for today exist offline. Safe to call often. */
  sync: (params: PrayerTimesParams, now?: number) => Promise<void>;
};

const inFlight = new Map<string, Promise<PrayerMonth>>();

function fetchMonth(params: PrayerTimesParams, month: MonthKey): Promise<PrayerMonth> {
  const key = cacheKey(paramsKey(params), month);
  const existing = inFlight.get(key);
  if (existing) return existing;

  const { year, month: m } = parseMonthKey(month);
  const promise = fetchCalendarByCoordinates({ ...params, year, month: m })
    .then((raw) => {
      try {
        return parseMonth(raw, Date.now());
      } catch (e) {
        throw new ApiError('invalid', e instanceof Error ? e.message : 'Invalid data');
      }
    })
    .finally(() => inFlight.delete(key));
  inFlight.set(key, promise);
  return promise;
}

export const usePrayerTimesStore = create<PrayerTimesState>()(
  persist(
    (set, get) => ({
      months: {},
      syncing: false,
      error: null,

      sync: async (params, now = Date.now()) => {
        const pk = paramsKey(params);
        const today = dateKeyAt(now, deviceUtcOffsetMin(now));
        const needed = monthsNeeded(today);
        const missing = needed.filter((m) => !get().months[cacheKey(pk, m)]);

        if (missing.length === 0) {
          set({ error: null });
          return;
        }

        set({ syncing: true });
        const results = await Promise.allSettled(missing.map((m) => fetchMonth(params, m)));

        const fetched: Record<string, PrayerMonth> = {};
        let error: ApiErrorKind | null = null;
        results.forEach((r, i) => {
          if (r.status === 'fulfilled') fetched[cacheKey(pk, missing[i]!)] = r.value;
          else error ??= r.reason instanceof ApiError ? r.reason.kind : 'network';
        });

        set((s) => ({
          months: prune({ ...s.months, ...fetched }, pk, monthKeyOf(today)),
          syncing: false,
          error,
        }));
      },
    }),
    {
      name: STORAGE_KEYS.prayerTimes,
      storage: zustandStorage,
      version: 1,
      partialize: ({ months }) => ({ months }),
    },
  ),
);

/**
 * Drops months for other locations/settings and months older than last month.
 * Only runs after a sync, so switching settings offline never deletes the only data we have.
 */
function prune(months: Record<string, PrayerMonth>, pk: string, current: MonthKey) {
  const oldest = addMonths(current, -1);
  const hasCurrent = Boolean(months[cacheKey(pk, current)]);
  return Object.fromEntries(
    Object.entries(months).filter(([key]) => {
      const [keyPk, month = ''] = key.split('#');
      if (keyPk !== pk) return !hasCurrent;
      return month >= oldest;
    }),
  );
}

export { cacheKey };
