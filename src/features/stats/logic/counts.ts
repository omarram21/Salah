import { PRAYERS, type PrayerName } from '@/features/prayer-times';
import type { PrayerStatus, RecordsByDate } from '@/features/tracking';
import type { DateKey } from '@/shared/lib/date-key';

export type StatusKey = PrayerStatus | 'unmarked';
export type StatusCounts = Record<StatusKey, number>;

const empty = (): StatusCounts => ({ mosque: 0, onTime: 0, late: 0, missed: 0, unmarked: 0 });

/** Prayed on time, including in the mosque. */
export const onTimeCount = (c: StatusCounts) => c.mosque + c.onTime;

export type CountSummary = {
  total: StatusCounts;
  byPrayer: Record<PrayerName, StatusCounts>;
  /** Number of prayers counted (those that were due). */
  due: number;
};

/**
 * Counts statuses over `dates`. `isDue` decides whether a prayer should be counted at all
 * (e.g. today's Isha before it starts isn't "not marked" yet).
 */
export function countStatuses(
  records: RecordsByDate,
  dates: readonly DateKey[],
  isDue: (date: DateKey, prayer: PrayerName) => boolean,
): CountSummary {
  const total = empty();
  const byPrayer = Object.fromEntries(PRAYERS.map((p) => [p, empty()])) as Record<PrayerName, StatusCounts>;
  let due = 0;

  for (const date of dates) {
    for (const prayer of PRAYERS) {
      if (!isDue(date, prayer)) continue;
      const key: StatusKey = records[date]?.[prayer]?.status ?? 'unmarked';
      total[key] += 1;
      byPrayer[prayer][key] += 1;
      due += 1;
    }
  }
  return { total, byPrayer, due };
}
