import type { PrayerWindow } from '@/features/prayer-times';
import type { DateKey } from '@/shared/lib/date-key';

import type { PrayerRecord, PrayerStatus } from './types';

/** Where `now` falls relative to a prayer's window. */
export type PrayerTiming = 'upcoming' | 'inTime' | 'ended';

/**
 * @param window The prayer's window, or null if its times aren't cached (e.g. an old day).
 * @param date   The date the prayer belongs to.
 * @param today  The current date at the prayer location.
 */
export function getTiming(
  window: PrayerWindow | null,
  now: number,
  date: DateKey,
  today: DateKey,
): PrayerTiming {
  if (window) {
    if (now < window.start) return 'upcoming';
    return now < window.end ? 'inTime' : 'ended';
  }
  // No times: a past day is over; today/future can't be judged yet.
  return date < today ? 'ended' : 'upcoming';
}

/** Marking during the window means "on time"; after it, we suggest "late". */
export function suggestStatus(timing: PrayerTiming): PrayerStatus | null {
  switch (timing) {
    case 'inTime':
      return 'onTime';
    case 'ended':
      return 'late';
    case 'upcoming':
      return null;
  }
}

export type TapAction =
  /** Save immediately, no questions. */
  | { kind: 'mark'; status: PrayerStatus }
  /** Open the picker with an optional suggestion. */
  | { kind: 'choose'; suggested: PrayerStatus | null }
  | { kind: 'disabled' };

/**
 * What one tap on a prayer's status button does:
 * - unmarked, in its time  → mark "on time" right away;
 * - unmarked, time ended   → ask, suggesting "late";
 * - already marked         → ask (to change or clear);
 * - not started yet        → nothing.
 * We never set "not prayed" on our own.
 */
export function resolveTap(record: PrayerRecord | undefined, timing: PrayerTiming): TapAction {
  if (record) return { kind: 'choose', suggested: suggestStatus(timing) };
  if (timing === 'upcoming') return { kind: 'disabled' };
  if (timing === 'inTime') return { kind: 'mark', status: 'onTime' };
  return { kind: 'choose', suggested: 'late' };
}
