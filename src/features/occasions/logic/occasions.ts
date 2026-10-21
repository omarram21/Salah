import { getPrayerWindow, type DayIndex, type PrayerDay, type PrayerName } from '@/features/prayer-times';
import { addDays, parseDateKey, weekdayOf, type DateKey } from '@/shared/lib/date-key';

/** Hijri month numbers. */
const RAMADAN = 9;
const SHAWWAL = 10;
const DHUL_HIJJAH = 12;

export const isFriday = (date: DateKey) => weekdayOf(date) === 5;

/** From the (adjusted) Hijri date AlAdhan gives for the day. */
export const isRamadanDay = (day: PrayerDay | undefined) => day?.hijri.month === RAMADAN;

export type Eid = 'fitr' | 'adha';
export function eidOf(day: PrayerDay | undefined): Eid | null {
  if (!day) return null;
  const { month, day: d } = day.hijri;
  if (month === SHAWWAL && d === 1) return 'fitr';
  if (month === DHUL_HIJJAH && d === 10) return 'adha';
  return null;
}

/** Translation key for a prayer's name on a date ("Jumu'ah" for Dhuhr on Friday). */
export function prayerNameKey(prayer: PrayerName, friday: boolean): `prayers.${PrayerName | 'jumuah'}` {
  return friday && prayer === 'dhuhr' ? 'prayers.jumuah' : `prayers.${prayer}`;
}

export type FastPhase = {
  /** Before Fajr: the meal before the fast ends; in the day: breaking the fast at Maghrib. */
  phase: 'suhoor' | 'iftar';
  at: number;
  /** The fasting day this belongs to. */
  date: DateKey;
};

/**
 * What a fasting person counts down to right now:
 * Suhoor (ends at Fajr) before dawn and after the previous Maghrib, Iftar (Maghrib) during the day.
 */
export function fastPhase(index: DayIndex, now: number, today: DateKey, isRamadan: (date: DateKey) => boolean): FastPhase | null {
  const day = index.get(today);
  if (day && isRamadan(today)) {
    if (now < day.times.fajr.at) return { phase: 'suhoor', at: day.times.fajr.at, date: today };
    if (now < day.times.maghrib.at) return { phase: 'iftar', at: day.times.maghrib.at, date: today };
  }
  const tomorrow = addDays(today, 1);
  const next = index.get(tomorrow);
  if (next && isRamadan(tomorrow) && (!day || now >= day.times.maghrib.at)) {
    return { phase: 'suhoor', at: next.times.fajr.at, date: tomorrow };
  }
  return null;
}

/** Instant of a wall-clock hour at the location on `day`. */
export function wallHourAt(day: PrayerDay, hour: number): number {
  const { year, month, day: d } = parseDateKey(day.date);
  return Date.UTC(year, month - 1, d, hour) - day.utcOffsetMin * 60_000;
}

/** Al-Kahf can be read until Friday's Maghrib. */
export function kahfEndsAt(index: DayIndex, date: DateKey): number | null {
  return getPrayerWindow(index, date, 'maghrib')?.start ?? null;
}
