import type { DateKey } from '@/shared/lib/date-key';

export const PRAYERS = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'] as const;
export type PrayerName = (typeof PRAYERS)[number];

/** All times we keep for a day: the five prayers plus sunrise (end of Fajr). */
export const TIME_NAMES = ['fajr', 'sunrise', 'dhuhr', 'asr', 'maghrib', 'isha'] as const;
export type TimeName = (typeof TIME_NAMES)[number];

export type PrayerTime = {
  /** Absolute instant, epoch milliseconds. */
  at: number;
  /** Wall-clock time at the location, "HH:mm" (24h). */
  wall: string;
};

export type HijriDate = {
  day: number;
  month: number;
  year: number;
  monthName: { en: string; ar: string };
};

export type PrayerDay = {
  /** Gregorian date at the location. */
  date: DateKey;
  /** Location's UTC offset (minutes) around midday of this date. */
  utcOffsetMin: number;
  times: Record<TimeName, PrayerTime>;
  hijri: HijriDate;
};

export type CalculationMethodInfo = { id: number; name: string };

/** One month of prayer days for one set of calculation inputs. */
export type PrayerMonth = {
  days: PrayerDay[];
  timezone: string;
  method: CalculationMethodInfo;
  fetchedAt: number;
};
