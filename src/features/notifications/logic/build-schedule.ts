import { getPrayerWindow, PRAYERS, type DayIndex, type PrayerName } from '@/features/prayer-times';
import type { AlarmPrefs } from '@/features/settings';
import type { RecordsByDate } from '@/features/tracking';
import { addDays, type DateKey } from '@/shared/lib/date-key';

/** iOS keeps at most 64 pending local notifications; leave headroom. */
export const MAX_SCHEDULED = 60;
/** Days ahead to schedule (5 prayers × 2 notifications × 6 days = 60). */
export const HORIZON_DAYS = 6;

export type PlannedNotification = {
  id: string;
  kind: 'start' | 'reminder';
  date: DateKey;
  prayer: PrayerName;
  at: number;
  /** End of the prayer's window, so a "Prayed" tap can tell on time from late. */
  end: number;
};

type Input = {
  index: DayIndex;
  records: RecordsByDate;
  prefs: AlarmPrefs;
  now: number;
  today: DateKey;
};

/**
 * Pure: which notifications should exist right now, soonest first, capped for iOS.
 * - "start" at the beginning of each enabled prayer;
 * - "reminder" N minutes before the prayer's time ends, skipped if it's already marked.
 */
export function buildSchedule({ index, records, prefs, now, today }: Input): PlannedNotification[] {
  if (!prefs.enabled) return [];
  const plans: PlannedNotification[] = [];

  // Start from yesterday: its Isha reminder can fall after midnight.
  for (let i = -1; i <= HORIZON_DAYS; i++) {
    const date = addDays(today, i);
    if (!index.has(date)) continue;

    for (const prayer of PRAYERS) {
      if (!prefs.prayers[prayer]) continue;
      const window = getPrayerWindow(index, date, prayer);
      if (!window) continue;

      if (window.start > now) {
        plans.push({ id: `${date}:${prayer}:start`, kind: 'start', date, prayer, at: window.start, end: window.end });
      }

      if (prefs.reminderEnabled && !records[date]?.[prayer]) {
        const at = window.end - prefs.reminderMinutes * 60_000;
        // Skip when the window is shorter than the reminder offset.
        if (at > now && at > window.start) {
          plans.push({ id: `${date}:${prayer}:reminder`, kind: 'reminder', date, prayer, at, end: window.end });
        }
      }
    }
  }

  return plans.sort((a, b) => a.at - b.at).slice(0, MAX_SCHEDULED);
}
