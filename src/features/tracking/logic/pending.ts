import { getPrayerWindow, PRAYERS, type DayIndex, type PrayerName } from '@/features/prayer-times';
import type { DateKey } from '@/shared/lib/date-key';

import { getTiming } from './status';
import type { RecordsByDate } from './types';

/** Prayers of `date` that have started (or ended) but have no status yet. */
export function unmarkedStartedPrayers(
  index: DayIndex,
  records: RecordsByDate,
  date: DateKey,
  now: number,
  today: DateKey,
): PrayerName[] {
  const day = records[date] ?? {};
  return PRAYERS.filter(
    (p) => !day[p] && getTiming(getPrayerWindow(index, date, p), now, date, today) !== 'upcoming',
  );
}
