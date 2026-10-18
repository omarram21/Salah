import type { PrayerName } from '@/features/prayer-times';
import type { DateKey } from '@/shared/lib/date-key';

export const STATUSES = ['onTime', 'late', 'missed'] as const;
/** "Not marked" is the absence of a record, never a stored status. */
export type PrayerStatus = (typeof STATUSES)[number];

export type PrayerRecord = {
  status: PrayerStatus;
  /** When the user last set this status (epoch ms). */
  updatedAt: number;
};

export type DayRecord = Partial<Record<PrayerName, PrayerRecord>>;

/** Keyed by the date the prayer *belongs to*: Isha prayed at 00:30 is stored under the previous day. */
export type RecordsByDate = Record<DateKey, DayRecord>;
