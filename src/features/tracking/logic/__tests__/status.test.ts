import { getPrayerWindow, indexDays } from '@/features/prayer-times';
import { cairo, cairoIndex, cairoOctTail } from '@/features/prayer-times/model/__fixtures__/cairo';

import { unmarkedStartedPrayers } from '../pending';
import { getTiming, resolveTap, suggestStatus } from '../status';

const timingAt = (date: string, prayer: Parameters<typeof getPrayerWindow>[2], now: number, today: string) =>
  getTiming(getPrayerWindow(cairoIndex, date, prayer), now, date, today);

describe('getTiming', () => {
  it('Fajr: in time before sunrise, ended after', () => {
    expect(timingAt('2026-10-31', 'fajr', cairo('2026-10-31T05:00', 2), '2026-10-31')).toBe('inTime');
    expect(timingAt('2026-10-31', 'fajr', cairo('2026-10-31T07:00', 2), '2026-10-31')).toBe('ended');
  });

  it('upcoming before the prayer starts', () => {
    expect(timingAt('2026-10-31', 'asr', cairo('2026-10-31T12:00', 2), '2026-10-31')).toBe('upcoming');
  });

  it('Dhuhr ends exactly when Asr starts', () => {
    const asrStart = cairoIndex.get('2026-10-31')!.times.asr.at;
    expect(timingAt('2026-10-31', 'dhuhr', asrStart - 1, '2026-10-31')).toBe('inTime');
    expect(timingAt('2026-10-31', 'dhuhr', asrStart, '2026-10-31')).toBe('ended');
  });

  describe('Isha after midnight', () => {
    it('is still in time at 23:59 the same day', () => {
      expect(timingAt('2026-10-30', 'isha', cairo('2026-10-30T23:59', 2), '2026-10-30')).toBe('inTime');
    });

    it('is still in time at 01:30 the next day (belongs to the previous date)', () => {
      expect(timingAt('2026-10-30', 'isha', cairo('2026-10-31T01:30', 2), '2026-10-31')).toBe('inTime');
    });

    it('is in time one minute before the next Fajr and ended at Fajr', () => {
      const nextFajr = cairoIndex.get('2026-10-31')!.times.fajr.at;
      expect(timingAt('2026-10-30', 'isha', nextFajr - 60_000, '2026-10-31')).toBe('inTime');
      expect(timingAt('2026-10-30', 'isha', nextFajr, '2026-10-31')).toBe('ended');
    });

    it('works across a month boundary (31 Oct Isha → 1 Nov Fajr)', () => {
      expect(timingAt('2026-10-31', 'isha', cairo('2026-11-01T03:00', 2), '2026-11-01')).toBe('inTime');
      expect(timingAt('2026-10-31', 'isha', cairo('2026-11-01T05:00', 2), '2026-11-01')).toBe('ended');
    });

    it('works across the DST change night (29→30 Oct, +3 → +2)', () => {
      // Isha of 29 Oct (19:29 +03:00) runs until Fajr of 30 Oct (04:40 +02:00).
      expect(timingAt('2026-10-29', 'isha', cairo('2026-10-30T04:39', 2), '2026-10-30')).toBe('inTime');
      expect(timingAt('2026-10-29', 'isha', cairo('2026-10-30T04:40', 2), '2026-10-30')).toBe('ended');
    });

    it('uses an estimated end when next month is not cached', () => {
      const octOnly = indexDays(cairoOctTail.days);
      const w = getPrayerWindow(octOnly, '2026-10-31', 'isha');
      expect(getTiming(w, cairo('2026-11-01T02:00', 2), '2026-10-31', '2026-11-01')).toBe('inTime');
    });
  });

  it('treats a past day with no cached times as ended', () => {
    expect(getTiming(null, Date.now(), '2026-01-01', '2026-10-31')).toBe('ended');
  });

  it('treats today/future with no cached times as upcoming', () => {
    expect(getTiming(null, Date.now(), '2026-10-31', '2026-10-31')).toBe('upcoming');
  });
});

describe('suggestStatus', () => {
  it('in time → on time, ended → late, upcoming → none', () => {
    expect(suggestStatus('inTime')).toBe('onTime');
    expect(suggestStatus('ended')).toBe('late');
    expect(suggestStatus('upcoming')).toBeNull();
  });
});

describe('resolveTap', () => {
  const rec = { status: 'late' as const, updatedAt: 0 };

  it('one tap marks "on time" during the window', () => {
    expect(resolveTap(undefined, 'inTime')).toEqual({ kind: 'mark', status: 'onTime' });
  });

  it('after the window it asks, suggesting "late" (never auto-marks)', () => {
    expect(resolveTap(undefined, 'ended')).toEqual({ kind: 'choose', suggested: 'late' });
  });

  it('cannot mark a prayer that has not started', () => {
    expect(resolveTap(undefined, 'upcoming')).toEqual({ kind: 'disabled' });
  });

  it('a marked prayer opens the picker to change it', () => {
    expect(resolveTap(rec, 'inTime')).toEqual({ kind: 'choose', suggested: 'onTime' });
    expect(resolveTap(rec, 'ended')).toEqual({ kind: 'choose', suggested: 'late' });
  });

  it('never produces "missed" by itself', () => {
    for (const timing of ['upcoming', 'inTime', 'ended'] as const) {
      const a = resolveTap(undefined, timing);
      expect(a.kind === 'mark' && a.status === 'missed').toBe(false);
      expect(a.kind === 'choose' && a.suggested === 'missed').toBe(false);
    }
  });
});

describe('unmarkedStartedPrayers', () => {
  it('lists started, unmarked prayers only', () => {
    const now = cairo('2026-10-31T15:30', 2); // during Asr
    const records = { '2026-10-31': { fajr: { status: 'onTime' as const, updatedAt: 0 } } };
    expect(unmarkedStartedPrayers(cairoIndex, records, '2026-10-31', now, '2026-10-31')).toEqual([
      'dhuhr',
      'asr',
    ]);
  });

  it('includes yesterday’s Isha after midnight', () => {
    const now = cairo('2026-11-01T01:00', 2);
    expect(unmarkedStartedPrayers(cairoIndex, {}, '2026-10-31', now, '2026-11-01')).toContain('isha');
  });
});
