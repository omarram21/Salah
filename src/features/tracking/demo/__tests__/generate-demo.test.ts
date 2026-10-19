import { PRAYERS } from '@/features/prayer-times';
import { bestStreak, currentStreak } from '@/features/stats';
import { addDays, weekdayOf } from '@/shared/lib/date-key';

import { STATUSES } from '../../logic/types';
import { DEMO_DAYS, generateDemoDataset } from '../generate-demo';

const TODAY = '2026-10-19';
const demo = generateDemoDataset(TODAY);

describe('generateDemoDataset', () => {
  it('is deterministic for the same seed', () => {
    expect(generateDemoDataset(TODAY)).toEqual(demo);
    expect(generateDemoDataset(TODAY, { seed: 7 })).not.toEqual(demo);
  });

  it('covers the last 90 days and leaves today empty', () => {
    expect(demo.trackingSince).toBe(addDays(TODAY, -DEMO_DAYS));
    expect(demo.records[TODAY]).toBeUndefined();
    expect(Object.keys(demo.records).every((d) => d < TODAY)).toBe(true);
  });

  it('uses every status at least a few times', () => {
    const all = Object.values(demo.records).flatMap((d) => Object.values(d).map((r) => r.status));
    for (const status of STATUSES) {
      expect(all.filter((s) => s === status).length).toBeGreaterThan(5);
    }
  });

  it('has unmarked prayers and a 3-day gap', () => {
    const partial = Object.values(demo.records).some((d) => Object.keys(d).length < PRAYERS.length);
    expect(partial).toBe(true);
    for (const daysAgo of [58, 59, 60]) expect(demo.records[addDays(TODAY, -daysAgo)]).toBeUndefined();
  });

  it('has a current streak of 6 and a best streak of 12', () => {
    expect(currentStreak(demo.records, TODAY)).toBe(6);
    expect(bestStreak(demo.records)).toBe(12);
  });

  it('Friday Dhuhr (Jumu’ah) is mostly in the mosque', () => {
    const fridays = Object.entries(demo.records).filter(([d]) => weekdayOf(d) === 5);
    const mosque = fridays.filter(([, day]) => day.dhuhr?.status === 'mosque').length;
    expect(mosque / fridays.length).toBeGreaterThan(0.6);
  });
});
