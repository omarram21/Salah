/**
 * Subset of the AlAdhan API response we rely on.
 * Docs: https://aladhan.com/prayer-times-api
 * We always request `iso8601=true`, so timings are ISO strings with a UTC offset,
 * e.g. "2026-10-01T05:22:00+03:00".
 */
export type AladhanTimingName = 'Fajr' | 'Sunrise' | 'Dhuhr' | 'Asr' | 'Maghrib' | 'Isha';

export type AladhanDay = {
  timings: Record<AladhanTimingName, string>;
  date: {
    gregorian: { date: string }; // "DD-MM-YYYY"
    hijri: {
      day: string;
      year: string;
      month: { number: number; en: string; ar: string };
    };
  };
  meta: {
    latitude?: number;
    longitude?: number;
    timezone: string;
    method: { id: number; name: string };
  };
};

export type AladhanResponse<T> = {
  code: number;
  status: string;
  data: T;
};

/** 0 = Shafi/Maliki/Hanbali (standard), 1 = Hanafi. */
export type AladhanSchool = 0 | 1;
