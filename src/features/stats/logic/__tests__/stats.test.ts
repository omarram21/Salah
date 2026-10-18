import type { DayRecord, PrayerStatus, RecordsByDate } from '@/features/tracking';

import { countStatuses } from '../counts';
import { datesBetween, monthStart, weekStart } from '../ranges';
import { bestStreak, currentStreak, isPerfectDay } from '../streak';

const day = (...s: (PrayerStatus | null)[]): DayRecord => {
  const names = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'] as const;
  return Object.fromEntries(
    names.flatMap((n, i) => (s[i] ? [[n, { status: s[i], updatedAt: 0 }]] : [])),
  ) as DayRecord;
};
const perfect = () => day('onTime', 'onTime', 'onTime', 'onTime', 'onTime');

describe('ranges', () => {
  // 2026-10-18 is a Sunday.
  it('week starting Sunday / Monday / Saturday', () => {
    expect(weekStart('2026-10-18', 1)).toBe('2026-10-18');
    expect(weekStart('2026-10-18', 2)).toBe('2026-10-12');
    expect(weekStart('2026-10-18', 7)).toBe('2026-10-17');
    expect(weekStart('2026-10-16', 7)).toBe('2026-10-10'); // Friday → previous Saturday
  });

  it('month start and inclusive date lists', () => {
    expect(monthStart('2026-10-18')).toBe('2026-10-01');
    expect(datesBetween('2026-10-30', '2026-11-02')).toEqual([
      '2026-10-30',
      '2026-10-31',
      '2026-11-01',
      '2026-11-02',
    ]);
    expect(datesBetween('2026-10-02', '2026-10-01')).toEqual([]);
  });
});

describe('countStatuses', () => {
  it('counts each status and unmarked, per prayer', () => {
    const records: RecordsByDate = {
      '2026-10-17': day('onTime', 'late', 'missed', null, 'onTime'),
      '2026-10-18': day('onTime'),
    };
    const isDue = (date: string, prayer: string) => date < '2026-10-18' || prayer === 'fajr';
    const { total, byPrayer, due } = countStatuses(records, ['2026-10-17', '2026-10-18'], isDue);

    expect(total).toEqual({ onTime: 3, late: 1, missed: 1, unmarked: 1 });
    expect(due).toBe(6);
    expect(byPrayer.fajr.onTime).toBe(2);
    expect(byPrayer.maghrib.unmarked).toBe(1);
    expect(byPrayer.isha).toEqual({ onTime: 1, late: 0, missed: 0, unmarked: 0 });
  });
});

describe('streaks', () => {
  it('a day is perfect only with all five on time', () => {
    expect(isPerfectDay(perfect())).toBe(true);
    expect(isPerfectDay(day('onTime', 'onTime', 'onTime', 'onTime', 'late'))).toBe(false);
    expect(isPerfectDay(day('onTime', 'onTime', 'onTime', 'onTime'))).toBe(false);
    expect(isPerfectDay(undefined)).toBe(false);
  });

  it('counts back from today when today is complete', () => {
    const r = { '2026-10-16': perfect(), '2026-10-17': perfect(), '2026-10-18': perfect() };
    expect(currentStreak(r, '2026-10-18')).toBe(3);
  });

  it('does not break while today is still in progress', () => {
    const r = { '2026-10-16': perfect(), '2026-10-17': perfect(), '2026-10-18': day('onTime') };
    expect(currentStreak(r, '2026-10-18')).toBe(2);
  });

  it('breaks on a late prayer or a gap', () => {
    const r = {
      '2026-10-14': perfect(),
      '2026-10-15': perfect(),
      '2026-10-16': day('onTime', 'late', 'onTime', 'onTime', 'onTime'),
      '2026-10-17': perfect(),
    };
    expect(currentStreak(r, '2026-10-18')).toBe(1);
    expect(currentStreak({ '2026-10-15': perfect() }, '2026-10-18')).toBe(0);
  });

  it('best streak finds the longest run, across months', () => {
    const r = {
      '2026-09-29': perfect(),
      '2026-09-30': perfect(),
      '2026-10-01': perfect(),
      '2026-10-02': day('late'),
      '2026-10-10': perfect(),
    };
    expect(bestStreak(r)).toBe(3);
    expect(bestStreak({})).toBe(0);
  });
});
