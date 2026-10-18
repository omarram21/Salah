import { monthsNeeded } from '../fetch-plan';

describe('monthsNeeded', () => {
  it('mid-month needs only the current month', () => {
    expect(monthsNeeded('2026-10-15')).toEqual(['2026-10']);
  });

  it('prefetches next month in the last week', () => {
    expect(monthsNeeded('2026-10-24')).toEqual(['2026-10']);
    expect(monthsNeeded('2026-10-25')).toEqual(['2026-10', '2026-11']);
    expect(monthsNeeded('2026-12-31')).toEqual(['2026-12', '2027-01']);
  });

  it('keeps the previous month on the 1st (for last night’s Isha)', () => {
    expect(monthsNeeded('2026-11-01')).toEqual(['2026-10', '2026-11']);
  });

  it('handles February', () => {
    expect(monthsNeeded('2026-02-22')).toEqual(['2026-02', '2026-03']);
    expect(monthsNeeded('2026-02-21')).toEqual(['2026-02']);
  });
});
