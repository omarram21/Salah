import type { AladhanDay, AladhanTimingName } from '@/shared/api/aladhan';
import { makeDateKey } from '@/shared/lib/date-key';

import type { PrayerDay, PrayerMonth, PrayerTime, TimeName } from './types';

const TIMING_KEYS: Record<TimeName, AladhanTimingName> = {
  fajr: 'Fajr',
  sunrise: 'Sunrise',
  dhuhr: 'Dhuhr',
  asr: 'Asr',
  maghrib: 'Maghrib',
  isha: 'Isha',
};

const ISO_RE = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2}))?(Z|([+-])(\d{2}):?(\d{2}))$/;

/** Parses "2026-10-01T05:22:00+03:00" without relying on the JS engine's Date.parse. */
export function parseIsoTime(iso: string): PrayerTime & { utcOffsetMin: number } {
  const m = ISO_RE.exec(iso.trim());
  if (!m) throw new Error(`Unexpected time format: "${iso}"`);
  const [, y, mo, d, h, mi, s, z, sign, oh, om] = m;
  const utcOffsetMin = z === 'Z' ? 0 : (sign === '-' ? -1 : 1) * (Number(oh) * 60 + Number(om));
  const wallUtc = Date.UTC(Number(y), Number(mo) - 1, Number(d), Number(h), Number(mi), Number(s ?? 0));
  return { at: wallUtc - utcOffsetMin * 60_000, wall: `${h}:${mi}`, utcOffsetMin };
}

/** "DD-MM-YYYY" → "YYYY-MM-DD" */
function gregorianToKey(date: string) {
  const [d, m, y] = date.split('-').map(Number);
  if (!d || !m || !y) throw new Error(`Unexpected date format: "${date}"`);
  return makeDateKey(y, m, d);
}

export function parseDay(raw: AladhanDay): PrayerDay {
  const entries = Object.entries(TIMING_KEYS).map(([name, key]) => {
    const value = raw.timings[key];
    if (typeof value !== 'string') throw new Error(`Missing ${key} time`);
    return [name, parseIsoTime(value)] as const;
  });
  const parsed = Object.fromEntries(entries) as Record<TimeName, ReturnType<typeof parseIsoTime>>;

  const times = Object.fromEntries(
    entries.map(([name, { at, wall }]) => [name, { at, wall }]),
  ) as Record<TimeName, PrayerTime>;

  return {
    date: gregorianToKey(raw.date.gregorian.date),
    utcOffsetMin: parsed.dhuhr.utcOffsetMin,
    times,
    hijri: {
      day: Number(raw.date.hijri.day),
      month: raw.date.hijri.month.number,
      year: Number(raw.date.hijri.year),
      monthName: { en: raw.date.hijri.month.en, ar: raw.date.hijri.month.ar },
    },
  };
}

export function parseMonth(raw: AladhanDay[], fetchedAt: number): PrayerMonth {
  const first = raw[0];
  if (!first) throw new Error('Empty month');
  return {
    days: raw.map(parseDay).sort((a, b) => a.date.localeCompare(b.date)),
    timezone: first.meta.timezone,
    method: { id: first.meta.method.id, name: first.meta.method.name },
    fetchedAt,
  };
}
