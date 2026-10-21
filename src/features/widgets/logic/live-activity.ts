import type { PrayerName } from '@/features/prayer-times';
import type { PrayerStatus } from '@/features/tracking';

import type { DayProps } from './widget-data';

/** Lock Screen / Dynamic Island countdown (one activity, content swapped as the day goes on). */
export type LiveProps = {
  key: PrayerName;
  /** Prayer name ("Maghrib"), or "Iftar" / "Suhoor" in Ramadan. */
  name: string;
  title: string;
  subtitle: string;
  time: string;
  /** Countdown runs from `start` to `at`. */
  start: number;
  at: number;
  ramadan: boolean;
  statuses: (PrayerStatus | null)[];
};

/** What the Live Activity should show at the moment `day` was built for, or null when there's nothing to count to. */
export function liveProps(day: DayProps, now: number): LiveProps | null {
  const s = day.season;
  if (s.kind === 'ramadan') {
    const name = s.phase === 'iftar' ? day.t.iftar : day.t.suhoor;
    return {
      key: s.phase === 'iftar' ? 'maghrib' : 'fajr',
      name,
      title: `${name} · ${s.phase === 'iftar' ? s.iftar : s.suhoor}`,
      subtitle: `${day.t.ramadanDay} ${s.day}`,
      time: s.phase === 'iftar' ? s.iftar : s.suhoor,
      start: Math.min(s.start, now),
      at: s.at,
      ramadan: true,
      statuses: day.prayers.map((p) => p.status),
    };
  }
  const next = day.next;
  if (!next) return null;
  return {
    key: next.key,
    name: next.name,
    title: `${next.name} · ${next.time}`,
    subtitle: day.city,
    time: next.time,
    start: Math.min(day.current?.start ?? now, now),
    at: next.at,
    ramadan: false,
    statuses: day.prayers.map((p) => p.status),
  };
}
