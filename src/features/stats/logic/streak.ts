import { PRAYERS } from '@/features/prayer-times';
import { countsAsOnTime, type DayRecord, type RecordsByDate } from '@/features/tracking';
import { addDays, type DateKey } from '@/shared/lib/date-key';

/** All five prayers on time (in the mosque counts as on time). */
export function isPerfectDay(day: DayRecord | undefined): boolean {
  return PRAYERS.every((p) => countsAsOnTime(day?.[p]?.status));
}

/**
 * Consecutive perfect days ending today — or ending yesterday while today is still in progress,
 * so the streak doesn't "break" every morning.
 */
export function currentStreak(records: RecordsByDate, today: DateKey): number {
  let date = isPerfectDay(records[today]) ? today : addDays(today, -1);
  let count = 0;
  while (isPerfectDay(records[date])) {
    count += 1;
    date = addDays(date, -1);
  }
  return count;
}

export function bestStreak(records: RecordsByDate): number {
  const perfect = Object.keys(records)
    .filter((d) => isPerfectDay(records[d]))
    .sort();
  let best = 0;
  let run = 0;
  let prev: DateKey | null = null;
  for (const d of perfect) {
    run = prev && addDays(prev, 1) === d ? run + 1 : 1;
    best = Math.max(best, run);
    prev = d;
  }
  return best;
}
