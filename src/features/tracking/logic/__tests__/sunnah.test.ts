import { addDays } from '@/shared/lib/date-key';

import { countExtras, DEFAULT_SUNNAH_ITEMS, enabledSunnah, sunnahFor, witrStreak } from '../sunnah';

describe('sunnah definitions', () => {
  it('defaults to the regular sunnahs + Witr (12 rak’ahs of rawatib), Duha off', () => {
    const on = enabledSunnah(DEFAULT_SUNNAH_ITEMS);
    expect(on.map((s) => s.id)).toEqual(['fajrBefore', 'dhuhrBefore', 'dhuhrAfter', 'maghribAfter', 'ishaAfter', 'witr']);
    expect(on.filter((s) => s.id !== 'witr').reduce((n, s) => n + s.rakahs, 0)).toBe(12);
  });

  it('groups extras under their prayer in order', () => {
    expect(sunnahFor('dhuhr', DEFAULT_SUNNAH_ITEMS).map((s) => s.id)).toEqual(['dhuhrBefore', 'dhuhrAfter']);
    expect(sunnahFor('isha', DEFAULT_SUNNAH_ITEMS).map((s) => s.id)).toEqual(['ishaAfter', 'witr']);
    expect(sunnahFor('asr', DEFAULT_SUNNAH_ITEMS)).toEqual([]);
  });

  it('respects switched-off items', () => {
    expect(sunnahFor('isha', { ...DEFAULT_SUNNAH_ITEMS, witr: false }).map((s) => s.id)).toEqual(['ishaAfter']);
  });
});

describe('countExtras', () => {
  it('counts done vs due per item, skipping items not due yet', () => {
    const extras = { '2026-10-30': { fajrBefore: 1, witr: 1 }, '2026-10-31': { fajrBefore: 1 } };
    const isDue = (date: string, def: { prayer: string | null }) => date < '2026-10-31' || def.prayer === 'fajr';
    const c = countExtras(extras, ['2026-10-30', '2026-10-31'], DEFAULT_SUNNAH_ITEMS, isDue);
    expect(c.byId.fajrBefore).toEqual({ done: 2, due: 2 });
    expect(c.byId.witr).toEqual({ done: 1, due: 1 });
    expect(c.due).toBe(7); // 6 items on the 30th + Fajr's on the 31st
    expect(c.done).toBe(3);
  });
});

describe('witrStreak', () => {
  it('counts nights in a row, not breaking before tonight’s Witr', () => {
    const extras = { '2026-10-28': { witr: 1 }, '2026-10-29': { witr: 1 }, '2026-10-30': { witr: 1 } };
    expect(witrStreak(extras, '2026-10-31', addDays)).toBe(3);
    expect(witrStreak({ ...extras, '2026-10-31': { witr: 1 } }, '2026-10-31', addDays)).toBe(4);
    expect(witrStreak({ '2026-10-28': { witr: 1 } }, '2026-10-31', addDays)).toBe(0);
  });
});
