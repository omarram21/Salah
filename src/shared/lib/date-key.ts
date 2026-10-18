/**
 * A calendar date with no time or timezone: "YYYY-MM-DD".
 * Used as the stable key for prayer days and tracking records.
 */
export type DateKey = string;

/** "YYYY-MM" */
export type MonthKey = string;

const pad = (n: number) => String(n).padStart(2, '0');

export function makeDateKey(year: number, month: number, day: number): DateKey {
  return `${year}-${pad(month)}-${pad(day)}`;
}

export function parseDateKey(key: DateKey): { year: number; month: number; day: number } {
  const [y, m, d] = key.split('-').map(Number);
  return { year: y ?? 0, month: m ?? 0, day: d ?? 0 };
}

export function monthKeyOf(key: DateKey): MonthKey {
  return key.slice(0, 7);
}

export function makeMonthKey(year: number, month: number): MonthKey {
  return `${year}-${pad(month)}`;
}

export function parseMonthKey(key: MonthKey): { year: number; month: number } {
  const [y, m] = key.split('-').map(Number);
  return { year: y ?? 0, month: m ?? 0 };
}

export function addDays(key: DateKey, days: number): DateKey {
  const { year, month, day } = parseDateKey(key);
  const d = new Date(Date.UTC(year, month - 1, day + days));
  return makeDateKey(d.getUTCFullYear(), d.getUTCMonth() + 1, d.getUTCDate());
}

export function addMonths(key: MonthKey, months: number): MonthKey {
  const { year, month } = parseMonthKey(key);
  const d = new Date(Date.UTC(year, month - 1 + months, 1));
  return makeMonthKey(d.getUTCFullYear(), d.getUTCMonth() + 1);
}

export function daysInMonth(key: MonthKey): number {
  const { year, month } = parseMonthKey(key);
  return new Date(Date.UTC(year, month, 0)).getUTCDate();
}

/** Day of week, 0 = Sunday. */
export function weekdayOf(key: DateKey): number {
  const { year, month, day } = parseDateKey(key);
  return new Date(Date.UTC(year, month - 1, day)).getUTCDay();
}

/** The calendar date at a place whose UTC offset is `utcOffsetMin` at instant `ms`. */
export function dateKeyAt(ms: number, utcOffsetMin: number): DateKey {
  const d = new Date(ms + utcOffsetMin * 60_000);
  return makeDateKey(d.getUTCFullYear(), d.getUTCMonth() + 1, d.getUTCDate());
}

/** The device's current UTC offset in minutes (e.g. +180 for UTC+3). */
export function deviceUtcOffsetMin(ms: number = Date.now()): number {
  return -new Date(ms).getTimezoneOffset();
}
