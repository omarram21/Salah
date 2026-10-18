import { addDays, type DateKey } from '@/shared/lib/date-key';

import { PRAYERS, type PrayerDay, type PrayerName } from './types';

const DAY_MS = 24 * 60 * 60 * 1000;

/** Lookup of prayer days by date. Build once per render with `indexDays`. */
export type DayIndex = ReadonlyMap<DateKey, PrayerDay>;

export function indexDays(days: Iterable<PrayerDay>): DayIndex {
  const map = new Map<DateKey, PrayerDay>();
  for (const d of days) map.set(d.date, d);
  return map;
}

export type PrayerWindow = {
  date: DateKey;
  prayer: PrayerName;
  start: number;
  /** Exclusive end. */
  end: number;
  /** True when `end` was estimated because the next day's data is missing. */
  estimatedEnd: boolean;
};

/**
 * Time window during which a prayer counts as "on time":
 * Fajr → sunrise, Dhuhr → Asr, Asr → Maghrib, Maghrib → Isha, Isha → next day's Fajr.
 */
export function getPrayerWindow(index: DayIndex, date: DateKey, prayer: PrayerName): PrayerWindow | null {
  const day = index.get(date);
  if (!day) return null;
  const { times } = day;
  const start = times[prayer].at;

  switch (prayer) {
    case 'fajr':
      return { date, prayer, start, end: times.sunrise.at, estimatedEnd: false };
    case 'dhuhr':
      return { date, prayer, start, end: times.asr.at, estimatedEnd: false };
    case 'asr':
      return { date, prayer, start, end: times.maghrib.at, estimatedEnd: false };
    case 'maghrib':
      return { date, prayer, start, end: times.isha.at, estimatedEnd: false };
    case 'isha': {
      const next = index.get(addDays(date, 1));
      return next
        ? { date, prayer, start, end: next.times.fajr.at, estimatedEnd: false }
        : // Fajr moves only a minute or two per day, so today's Fajr + 24h is a safe estimate.
          { date, prayer, start, end: times.fajr.at + DAY_MS, estimatedEnd: true };
    }
  }
}

/** The prayer whose window contains `now`, if any (e.g. none between sunrise and Dhuhr). */
export function getCurrentPrayer(index: DayIndex, now: number, today: DateKey): PrayerWindow | null {
  // Yesterday's Isha can still be running after midnight.
  for (const date of [addDays(today, -1), today]) {
    for (const prayer of PRAYERS) {
      const w = getPrayerWindow(index, date, prayer);
      if (w && w.start <= now && now < w.end) return w;
    }
  }
  return null;
}

export type UpcomingPrayer = { date: DateKey; prayer: PrayerName; at: number };

/** The next prayer start strictly after `now`, looking at today and tomorrow. */
export function getNextPrayer(index: DayIndex, now: number, today: DateKey): UpcomingPrayer | null {
  for (const date of [addDays(today, -1), today, addDays(today, 1)]) {
    const day = index.get(date);
    if (!day) continue;
    for (const prayer of PRAYERS) {
      const at = day.times[prayer].at;
      if (at > now) return { date, prayer, at };
    }
  }
  return null;
}
