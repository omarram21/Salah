import type { PrayerName } from '@/features/prayer-times';
import type { DateKey } from '@/shared/lib/date-key';

import type { ExtrasByDate } from './sunnah';

/** Best → worst. Order is used by pickers, legends and stats. */
export const STATUSES = ['mosque', 'onTime', 'late', 'missed'] as const;
/** "Not marked" is the absence of a record, never a stored status. */
export type PrayerStatus = (typeof STATUSES)[number];

/** Praying in the mosque is the best case of "on time" (streaks, on-time %). */
export function countsAsOnTime(status: PrayerStatus | undefined): boolean {
  return status === 'mosque' || status === 'onTime';
}

export type PrayerRecord = {
  status: PrayerStatus;
  /** When the user last set this status (epoch ms). */
  updatedAt: number;
};

export type DayRecord = Partial<Record<PrayerName, PrayerRecord>>;

/** Keyed by the date the prayer *belongs to*: Isha prayed at 00:30 is stored under the previous day. */
export type RecordsByDate = Record<DateKey, DayRecord>;

/** One independent set of records (the user's real data, or demo data). */
export type Dataset = {
  records: RecordsByDate;
  /** First day tracked; history and stats start here. */
  trackingSince: DateKey | null;
  /** Sunnah / Witr / Duha marked done, by date. */
  extras: ExtrasByDate;
};
