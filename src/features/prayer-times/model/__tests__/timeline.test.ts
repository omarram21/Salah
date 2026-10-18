import { addDays } from '@/shared/lib/date-key';

import { getCurrentPrayer, getNextPrayer, getPrayerWindow, indexDays } from '../timeline';
import { locationToday } from '../today';
import { cairo, cairoIndex, cairoOctTail } from '../__fixtures__/cairo';

describe('getPrayerWindow', () => {
  it('ends Fajr at sunrise, Dhuhr at Asr, Asr at Maghrib, Maghrib at Isha', () => {
    const day = cairoIndex.get('2026-10-31')!;
    expect(getPrayerWindow(cairoIndex, day.date, 'fajr')!.end).toBe(day.times.sunrise.at);
    expect(getPrayerWindow(cairoIndex, day.date, 'dhuhr')!.end).toBe(day.times.asr.at);
    expect(getPrayerWindow(cairoIndex, day.date, 'asr')!.end).toBe(day.times.maghrib.at);
    expect(getPrayerWindow(cairoIndex, day.date, 'maghrib')!.end).toBe(day.times.isha.at);
  });

  it('ends Isha at the NEXT day’s Fajr, across a month boundary', () => {
    const w = getPrayerWindow(cairoIndex, '2026-10-31', 'isha')!;
    expect(w.end).toBe(cairoIndex.get('2026-11-01')!.times.fajr.at);
    expect(w.estimatedEnd).toBe(false);
  });

  it('estimates the Isha end when the next day is not cached yet', () => {
    const octOnly = indexDays(cairoOctTail.days);
    const w = getPrayerWindow(octOnly, '2026-10-31', 'isha')!;
    expect(w.estimatedEnd).toBe(true);
    expect(w.end).toBe(octOnly.get('2026-10-31')!.times.fajr.at + 86_400_000);
  });

  it('returns null for a day that is not cached', () => {
    expect(getPrayerWindow(cairoIndex, '2026-12-25', 'fajr')).toBeNull();
  });
});

describe('getCurrentPrayer', () => {
  it('finds yesterday’s Isha after midnight', () => {
    const now = cairo('2026-11-01T01:30', 2); // 01:30 on 1 Nov
    const w = getCurrentPrayer(cairoIndex, now, '2026-11-01');
    expect(w).toMatchObject({ date: '2026-10-31', prayer: 'isha' });
  });

  it('returns null between sunrise and Dhuhr', () => {
    expect(getCurrentPrayer(cairoIndex, cairo('2026-10-31T09:00', 2), '2026-10-31')).toBeNull();
  });

  it('finds Asr in the afternoon', () => {
    expect(getCurrentPrayer(cairoIndex, cairo('2026-10-31T15:30', 2), '2026-10-31')?.prayer).toBe('asr');
  });
});

describe('getNextPrayer', () => {
  it('after Isha, the next prayer is tomorrow’s Fajr (across months)', () => {
    const next = getNextPrayer(cairoIndex, cairo('2026-10-31T22:00', 2), '2026-10-31');
    expect(next).toMatchObject({ date: '2026-11-01', prayer: 'fajr' });
  });

  it('after midnight, the next prayer is today’s Fajr', () => {
    const next = getNextPrayer(cairoIndex, cairo('2026-11-01T01:00', 2), '2026-11-01');
    expect(next).toMatchObject({ date: '2026-11-01', prayer: 'fajr' });
  });

  it('is strictly after now (at exactly Dhuhr, next is Asr)', () => {
    const day = cairoIndex.get('2026-10-31')!;
    expect(getNextPrayer(cairoIndex, day.times.dhuhr.at, day.date)?.prayer).toBe('asr');
  });

  it('returns null when nothing ahead is cached', () => {
    const last = cairoIndex.get('2026-11-02')!;
    expect(getNextPrayer(cairoIndex, last.times.isha.at + 1, addDays(last.date, 0))).toBeNull();
  });
});

describe('locationToday', () => {
  it('uses the location offset, not the device offset', () => {
    // 23:30 UTC on 31 Oct = 01:30 on 1 Nov in Cairo (+2). Device is UTC-5.
    const now = Date.UTC(2026, 9, 31, 23, 30);
    expect(locationToday(cairoIndex, now, -300)).toBe('2026-11-01');
  });

  it('falls back to the device offset with no data', () => {
    expect(locationToday(new Map(), Date.UTC(2026, 9, 31, 23, 30), 0)).toBe('2026-10-31');
  });
});
