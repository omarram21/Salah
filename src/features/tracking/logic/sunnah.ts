import type { PrayerName } from '@/features/prayer-times/model/types';

/**
 * Voluntary prayers tracked alongside the five (done / not done, no on-time rule):
 * the regular sunnahs (rawatib), Witr and Duha.
 */
export const SUNNAH_IDS = ['fajrBefore', 'duha', 'dhuhrBefore', 'dhuhrAfter', 'maghribAfter', 'ishaAfter', 'witr'] as const;
export type SunnahId = (typeof SUNNAH_IDS)[number];

export type SunnahDef = {
  id: SunnahId;
  /** The prayer it's shown with; Duha stands on its own between sunrise and Dhuhr. */
  prayer: PrayerName | null;
  placement: 'before' | 'after' | 'witr' | 'duha';
  rakahs: number;
};

export const SUNNAH: Record<SunnahId, SunnahDef> = {
  fajrBefore: { id: 'fajrBefore', prayer: 'fajr', placement: 'before', rakahs: 2 },
  duha: { id: 'duha', prayer: null, placement: 'duha', rakahs: 2 },
  dhuhrBefore: { id: 'dhuhrBefore', prayer: 'dhuhr', placement: 'before', rakahs: 4 },
  dhuhrAfter: { id: 'dhuhrAfter', prayer: 'dhuhr', placement: 'after', rakahs: 2 },
  maghribAfter: { id: 'maghribAfter', prayer: 'maghrib', placement: 'after', rakahs: 2 },
  ishaAfter: { id: 'ishaAfter', prayer: 'isha', placement: 'after', rakahs: 2 },
  witr: { id: 'witr', prayer: 'isha', placement: 'witr', rakahs: 1 },
};

/** The 10/12 regular sunnahs + Witr on; Duha off. */
export const DEFAULT_SUNNAH_ITEMS: Record<SunnahId, boolean> = {
  fajrBefore: true,
  duha: false,
  dhuhrBefore: true,
  dhuhrAfter: true,
  maghribAfter: true,
  ishaAfter: true,
  witr: true,
};

/** Done extras per day (value = when it was marked). Keyed like prayers: Witr after midnight → previous date. */
export type ExtrasByDate = Record<string, Partial<Record<SunnahId, number>>>;

export function enabledSunnah(items: Record<SunnahId, boolean>): SunnahDef[] {
  return SUNNAH_IDS.filter((id) => items[id]).map((id) => SUNNAH[id]);
}

/** Enabled extras shown with a given prayer, in display order (before → after → Witr). */
export function sunnahFor(prayer: PrayerName, items: Record<SunnahId, boolean>): SunnahDef[] {
  return enabledSunnah(items).filter((s) => s.prayer === prayer);
}

export type ExtrasCount = { done: number; due: number; byId: Partial<Record<SunnahId, { done: number; due: number }>> };

/**
 * Counts extras over `dates`. `isDue(date, def)` decides whether an item counts yet
 * (e.g. today's Isha sunnah before Isha starts doesn't).
 */
export function countExtras(
  extras: ExtrasByDate,
  dates: readonly string[],
  items: Record<SunnahId, boolean>,
  isDue: (date: string, def: SunnahDef) => boolean,
): ExtrasCount {
  const result: ExtrasCount = { done: 0, due: 0, byId: {} };
  for (const def of enabledSunnah(items)) {
    const row = { done: 0, due: 0 };
    for (const date of dates) {
      if (!isDue(date, def)) continue;
      row.due += 1;
      if (extras[date]?.[def.id]) row.done += 1;
    }
    result.byId[def.id] = row;
    result.done += row.done;
    result.due += row.due;
  }
  return result;
}

/** Consecutive nights with Witr, ending today — or yesterday while tonight is still ahead. */
export function witrStreak(extras: ExtrasByDate, today: string, addDays: (d: string, n: number) => string): number {
  let date = extras[today]?.witr ? today : addDays(today, -1);
  let n = 0;
  while (extras[date]?.witr) {
    n += 1;
    date = addDays(date, -1);
  }
  return n;
}
