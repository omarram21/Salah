import { PRAYERS, type PrayerName } from '@/features/prayer-times';
import type { PrayerStatus } from '@/features/tracking';
import type { DateKey } from '@/shared/lib/date-key';

import type { NotificationKind } from './build-schedule';

/** Notification category with the "Prayed" / "In mosque" buttons. */
export const PRAYER_CATEGORY = 'prayer';
export const NOTIFICATION_ACTIONS = ['prayed', 'mosque'] as const;
export type NotificationActionId = (typeof NOTIFICATION_ACTIONS)[number];

/** What every prayer notification carries in `content.data`. */
export type PrayerNotificationData = {
  date: DateKey;
  prayer: PrayerName;
  kind: NotificationKind;
  at: number;
  /** End of the prayer's window (epoch ms): decides "on time" vs "late". */
  end: number;
};

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

/** Validates notification data (it round-trips through the OS, so don't trust its shape). */
export function parsePrayerData(data: unknown): PrayerNotificationData | null {
  if (!data || typeof data !== 'object') return null;
  const d = data as Record<string, unknown>;
  if (typeof d.date !== 'string' || !DATE_RE.test(d.date)) return null;
  if (typeof d.prayer !== 'string' || !(PRAYERS as readonly string[]).includes(d.prayer)) return null;
  if (d.kind !== 'start' && d.kind !== 'reminder') return null;
  if (typeof d.at !== 'number' || typeof d.end !== 'number') return null;
  return { date: d.date, prayer: d.prayer as PrayerName, kind: d.kind, at: d.at, end: d.end };
}

export function isNotificationAction(id: string): id is NotificationActionId {
  return (NOTIFICATION_ACTIONS as readonly string[]).includes(id);
}

/**
 * Status for a button tap: "In mosque" is always mosque; "Prayed" is on time while the
 * prayer's window is open and late after it — the same rule as marking in the app.
 */
export function statusForAction(action: NotificationActionId, end: number, respondedAt: number): PrayerStatus {
  if (action === 'mosque') return 'mosque';
  return respondedAt < end ? 'onTime' : 'late';
}
