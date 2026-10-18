import {
  addMonths,
  daysInMonth,
  monthKeyOf,
  parseDateKey,
  type DateKey,
  type MonthKey,
} from '@/shared/lib/date-key';

/** Fetch next month once fewer than this many days remain in the current one. */
export const PREFETCH_DAYS_BEFORE_MONTH_END = 7;

/**
 * Months that must be available offline for `today`:
 * - the current month;
 * - the next month near the end of the month (tomorrow's Fajr ends tonight's Isha, and alarms
 *   are scheduled days ahead);
 * - the previous month on the 1st (last night's Isha may still be running).
 */
export function monthsNeeded(today: DateKey): MonthKey[] {
  const current = monthKeyOf(today);
  const { day } = parseDateKey(today);
  const months: MonthKey[] = [current];
  if (day === 1) months.unshift(addMonths(current, -1));
  if (daysInMonth(current) - day < PREFETCH_DAYS_BEFORE_MONTH_END) months.push(addMonths(current, 1));
  return months;
}
