import { addDays } from '@/shared/lib/date-key';

import { PRAYERS, type PrayerDay, type PrayerName } from './types';

const MIN = 60_000;
const DAY = 24 * 60 * MIN;

export type TimeAdjustments = {
  offsets: Record<PrayerName, number>;
  ishaEnd: 'fajr' | 'midnight';
  hijriOffset: number;
};

export function hasAdjustments(a: TimeAdjustments): boolean {
  return a.ishaEnd !== 'fajr' || a.hijriOffset !== 0 || PRAYERS.some((p) => a.offsets[p] !== 0);
}

/** "23:50" + 15 → "00:05" (wall clock, wraps around midnight). */
export function shiftWall(wall: string, minutes: number): string {
  const [h = 0, m = 0] = wall.split(':').map(Number);
  const total = (((h * 60 + m + minutes) % 1440) + 1440) % 1440;
  return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
}

/**
 * Applies the user's corrections to AlAdhan's days (pure; runs on every read, so changes
 * are instant and work offline):
 * - shift each prayer's start by its offset in minutes;
 * - shift the Hijri date by whole days (taken from the neighbouring day when cached);
 * - optionally end Isha at Islamic midnight: halfway from Maghrib to the next Fajr.
 */
export function applyAdjustments(days: readonly PrayerDay[], adj: TimeAdjustments): PrayerDay[] {
  if (!hasAdjustments(adj)) return days as PrayerDay[];
  const original = new Map(days.map((d) => [d.date, d]));

  const shifted = days.map((d): PrayerDay => {
    const times = { ...d.times };
    for (const p of PRAYERS) {
      const off = adj.offsets[p];
      if (off) times[p] = { at: d.times[p].at + off * MIN, wall: shiftWall(d.times[p].wall, off) };
    }
    const hijri = adj.hijriOffset ? (original.get(addDays(d.date, adj.hijriOffset))?.hijri ?? d.hijri) : d.hijri;
    return { ...d, times, hijri };
  });

  if (adj.ishaEnd !== 'midnight') return shifted;
  const byDate = new Map(shifted.map((d) => [d.date, d]));
  return shifted.map((d) => {
    const nextFajr = byDate.get(addDays(d.date, 1))?.times.fajr.at ?? d.times.fajr.at + DAY;
    return { ...d, ishaEndsAt: d.times.maghrib.at + (nextFajr - d.times.maghrib.at) / 2 };
  });
}
