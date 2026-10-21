import { getPrayerWindow, PRAYERS, type DayIndex, type PrayerName } from '@/features/prayer-times';
import { kahfEndsAt, wallHourAt } from '@/features/occasions';
import type { AlarmPrefs, FridayPrefs, RamadanPrefs } from '@/features/settings';
import type { ExtrasByDate, RecordsByDate } from '@/features/tracking';
import { addDays, type DateKey } from '@/shared/lib/date-key';

/** iOS keeps at most 64 pending local notifications; leave headroom. */
export const MAX_SCHEDULED = 60;
/** Days ahead to schedule (5 prayers × 2 notifications × 6 days = 60). */
export const HORIZON_DAYS = 6;

/**
 * start / reminder: the prayer alarms (with the Prayed buttons).
 * suhoor: N minutes before Fajr in Ramadan. kahf: Friday morning, until Al-Kahf is marked read.
 */
export type NotificationKind = 'start' | 'reminder' | 'suhoor' | 'kahf';

export type PlannedNotification = {
  id: string;
  kind: NotificationKind;
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
  extras?: ExtrasByDate;
  occasions?: {
    isFriday: (date: DateKey) => boolean;
    isRamadan: (date: DateKey) => boolean;
    friday: FridayPrefs;
    ramadan: RamadanPrefs;
  };
};

/**
 * Pure: which notifications should exist right now, soonest first, capped for iOS.
 * - "start" at the beginning of each enabled prayer;
 * - "reminder" N minutes before the prayer's time ends, skipped if it's already marked.
 */
export function buildSchedule({ index, records, prefs, now, today, extras = {}, occasions }: Input): PlannedNotification[] {
  if (!prefs.enabled) return [];
  const plans: PlannedNotification[] = [];

  // Start from yesterday: its Isha reminder can fall after midnight.
  for (let i = -1; i <= HORIZON_DAYS; i++) {
    const date = addDays(today, i);
    if (!index.has(date)) continue;

    if (occasions) plans.push(...occasionPlans(index, date, now, extras, occasions));

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

function occasionPlans(index: DayIndex, date: DateKey, now: number, extras: ExtrasByDate, o: NonNullable<Input['occasions']>): PlannedNotification[] {
  const day = index.get(date);
  if (!day) return [];
  const out: PlannedNotification[] = [];
  if (o.ramadan.enabled && o.ramadan.suhoorReminder && o.isRamadan(date)) {
    const fajr = day.times.fajr.at;
    const at = fajr - o.ramadan.suhoorMinutes * 60_000;
    if (at > now) out.push({ id: `${date}:suhoor`, kind: 'suhoor', date, prayer: 'fajr', at, end: fajr });
  }
  if (o.friday.kahfReminder && o.isFriday(date) && !extras[date]?.kahf) {
    const at = wallHourAt(day, o.friday.kahfHour);
    const end = kahfEndsAt(index, date) ?? at;
    if (at > now && at < end) out.push({ id: `${date}:kahf`, kind: 'kahf', date, prayer: 'dhuhr', at, end });
  }
  return out;
}
