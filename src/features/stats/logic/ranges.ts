import { addDays, weekdayOf, type DateKey } from '@/shared/lib/date-key';

/**
 * First day of the week containing `today`.
 * @param firstWeekday 1 = Sunday … 7 = Saturday (expo-localization's convention).
 */
export function weekStart(today: DateKey, firstWeekday: number): DateKey {
  const startIdx = (((firstWeekday - 1) % 7) + 7) % 7;
  const diff = (weekdayOf(today) - startIdx + 7) % 7;
  return addDays(today, -diff);
}

export function monthStart(today: DateKey): DateKey {
  return `${today.slice(0, 7)}-01`;
}

/** Inclusive list of dates from `from` to `to` (empty if from > to). */
export function datesBetween(from: DateKey, to: DateKey): DateKey[] {
  const out: DateKey[] = [];
  for (let d = from; d <= to; d = addDays(d, 1)) out.push(d);
  return out;
}
