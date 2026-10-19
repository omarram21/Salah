import {
  addMonths,
  daysInMonth,
  makeDateKey,
  parseMonthKey,
  weekdayOf,
  type DateKey,
  type MonthKey,
} from '@/shared/lib/date-key';

/**
 * Weekday indexes (0 = Sunday) in display order.
 * @param firstWeekday 1 = Sunday … 7 = Saturday (expo-localization's convention).
 */
export function weekdayOrder(firstWeekday: number): number[] {
  const start = (((firstWeekday - 1) % 7) + 7) % 7;
  return Array.from({ length: 7 }, (_, i) => (start + i) % 7);
}

/** Calendar cells for a month: leading/trailing nulls pad it to whole weeks. */
export function monthGrid(month: MonthKey, firstWeekday: number): (DateKey | null)[] {
  const { year, month: m } = parseMonthKey(month);
  const first = makeDateKey(year, m, 1);
  const order = weekdayOrder(firstWeekday);
  const lead = order.indexOf(weekdayOf(first));
  const cells: (DateKey | null)[] = Array.from({ length: lead }, () => null);
  for (let d = 1; d <= daysInMonth(month); d++) cells.push(makeDateKey(year, m, d));
  while (cells.length % 7) cells.push(null);
  return cells;
}

/** Months the user can browse: from the first tracked month up to the current one. */
export function monthBounds(trackingSince: DateKey | null, today: DateKey) {
  const last = today.slice(0, 7);
  const first = trackingSince && trackingSince < today ? trackingSince.slice(0, 7) : last;
  return {
    first,
    last,
    canGoBack: (month: MonthKey) => month > first,
    canGoForward: (month: MonthKey) => month < last,
    clamp: (month: MonthKey) => (month < first ? first : month > last ? last : month),
    prev: (month: MonthKey) => addMonths(month, -1),
    next: (month: MonthKey) => addMonths(month, 1),
  };
}
