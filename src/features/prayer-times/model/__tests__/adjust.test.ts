import { cairoIndex, cairoNovHead, cairoOctTail } from '../__fixtures__/cairo';
import { applyAdjustments, shiftWall, type TimeAdjustments } from '../adjust';
import { getPrayerWindow, indexDays } from '../timeline';

const NONE: TimeAdjustments = { offsets: { fajr: 0, dhuhr: 0, asr: 0, maghrib: 0, isha: 0 }, ishaEnd: 'fajr', hijriOffset: 0 };
const days = [...cairoOctTail.days, ...cairoNovHead.days];

describe('shiftWall', () => {
  it('adds minutes and wraps around midnight', () => {
    expect(shiftWall('04:40', 2)).toBe('04:42');
    expect(shiftWall('23:50', 15)).toBe('00:05');
    expect(shiftWall('00:05', -10)).toBe('23:55');
  });
});

describe('applyAdjustments', () => {
  it('returns the same days when nothing is adjusted', () => {
    expect(applyAdjustments(days, NONE)).toBe(days);
  });

  it('shifts a prayer’s start (and only that prayer)', () => {
    const adj = applyAdjustments(days, { ...NONE, offsets: { ...NONE.offsets, isha: 5 } });
    const before = cairoIndex.get('2026-10-31')!;
    const after = indexDays(adj).get('2026-10-31')!;
    expect(after.times.isha.at - before.times.isha.at).toBe(5 * 60_000);
    expect(after.times.isha.wall).toBe('18:33');
    expect(after.times.maghrib).toEqual(before.times.maghrib);
  });

  it('moving Asr also moves the end of Dhuhr (windows follow the adjusted times)', () => {
    const idx = indexDays(applyAdjustments(days, { ...NONE, offsets: { ...NONE.offsets, asr: 10 } }));
    const w = getPrayerWindow(idx, '2026-10-31', 'dhuhr')!;
    expect(w.end).toBe(cairoIndex.get('2026-10-31')!.times.asr.at + 10 * 60_000);
  });

  it('shifts the Hijri date by whole days', () => {
    const idx = indexDays(applyAdjustments(days, { ...NONE, hijriOffset: 1 }));
    expect(idx.get('2026-10-30')!.hijri).toEqual(cairoIndex.get('2026-10-31')!.hijri);
  });

  it('can end Isha at Islamic midnight (halfway from Maghrib to next Fajr)', () => {
    const idx = indexDays(applyAdjustments(days, { ...NONE, ishaEnd: 'midnight' }));
    const d = cairoIndex.get('2026-10-31')!;
    const nextFajr = cairoIndex.get('2026-11-01')!.times.fajr.at;
    const w = getPrayerWindow(idx, '2026-10-31', 'isha')!;
    expect(w.end).toBe(d.times.maghrib.at + (nextFajr - d.times.maghrib.at) / 2);
    expect(w.end).toBeLessThan(nextFajr);
  });
});
