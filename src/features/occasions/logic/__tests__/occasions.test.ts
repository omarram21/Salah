import { cairo, cairoIndex } from '@/features/prayer-times/model/__fixtures__/cairo';
import type { PrayerDay } from '@/features/prayer-times';

import { eidOf, fastPhase, isFriday, prayerNameKey, wallHourAt } from '../occasions';

const day31 = cairoIndex.get('2026-10-31')!;
const day1 = cairoIndex.get('2026-11-01')!;
const always = () => true;

describe('Friday', () => {
  it('30 Oct 2026 is a Friday, 31 Oct is not', () => {
    expect(isFriday('2026-10-30')).toBe(true);
    expect(isFriday('2026-10-31')).toBe(false);
  });

  it("calls Dhuhr Jumu'ah only on Friday", () => {
    expect(prayerNameKey('dhuhr', true)).toBe('prayers.jumuah');
    expect(prayerNameKey('asr', true)).toBe('prayers.asr');
    expect(prayerNameKey('dhuhr', false)).toBe('prayers.dhuhr');
  });

  it('turns a location wall-clock hour into an instant', () => {
    expect(wallHourAt(day31, 10)).toBe(cairo('2026-10-31T10:00', 2));
  });
});

describe('fastPhase', () => {
  it('before Fajr counts down to the end of Suhoor', () => {
    expect(fastPhase(cairoIndex, cairo('2026-10-31T03:00', 2), '2026-10-31', always)).toEqual({ phase: 'suhoor', at: day31.times.fajr.at, date: '2026-10-31' });
  });

  it('during the day counts down to Iftar at Maghrib', () => {
    expect(fastPhase(cairoIndex, cairo('2026-10-31T12:00', 2), '2026-10-31', always)).toEqual({ phase: 'iftar', at: day31.times.maghrib.at, date: '2026-10-31' });
  });

  it("after Maghrib counts down to tomorrow's Suhoor (across months)", () => {
    expect(fastPhase(cairoIndex, cairo('2026-10-31T20:00', 2), '2026-10-31', always)).toEqual({ phase: 'suhoor', at: day1.times.fajr.at, date: '2026-11-01' });
  });

  it('the night before the first fast already shows Suhoor; after the last Iftar shows nothing', () => {
    const firstIsTomorrow = (d: string) => d === '2026-11-01';
    expect(fastPhase(cairoIndex, cairo('2026-10-31T12:00', 2), '2026-10-31', firstIsTomorrow)).toBeNull();
    expect(fastPhase(cairoIndex, cairo('2026-10-31T20:00', 2), '2026-10-31', firstIsTomorrow)?.phase).toBe('suhoor');
    const lastIsToday = (d: string) => d === '2026-10-31';
    expect(fastPhase(cairoIndex, cairo('2026-10-31T20:00', 2), '2026-10-31', lastIsToday)).toBeNull();
  });
});

describe('eidOf', () => {
  const withHijri = (month: number, d: number) => ({ ...day31, hijri: { ...day31.hijri, month, day: d } }) as PrayerDay;
  it('1 Shawwal and 10 Dhul-Hijjah', () => {
    expect(eidOf(withHijri(10, 1))).toBe('fitr');
    expect(eidOf(withHijri(12, 10))).toBe('adha');
    expect(eidOf(withHijri(9, 1))).toBeNull();
  });
});
