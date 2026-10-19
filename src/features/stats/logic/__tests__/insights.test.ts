import { PRAYERS } from '@/features/prayer-times';

import type { CountSummary, StatusCounts } from '../counts';
import { prayerInsight } from '../insights';

const counts = (onTime: number, late: number): StatusCounts => ({ mosque: 0, onTime, late, missed: 0, unmarked: 0 });
const summary = (perPrayer: StatusCounts[]): CountSummary => ({
  total: counts(0, 0),
  byPrayer: Object.fromEntries(PRAYERS.map((p, i) => [p, perPrayer[i]!])) as CountSummary['byPrayer'],
  due: 0,
});

describe('prayerInsight', () => {
  it('finds the strongest and weakest prayer', () => {
    const s = summary([counts(2, 5), counts(7, 0), counts(6, 1), counts(7, 0), counts(5, 2)]);
    expect(prayerInsight(s)).toEqual({ strongest: 'dhuhr', weakest: 'fajr' });
  });

  it('says nothing when prayers are about equal', () => {
    const s = summary([counts(6, 1), counts(7, 0), counts(6, 1), counts(7, 0), counts(6, 1)]);
    expect(prayerInsight(s)).toEqual({ strongest: null, weakest: null });
  });

  it('needs enough data', () => {
    const s = summary([counts(0, 1), counts(1, 0), counts(0, 0), counts(0, 0), counts(0, 0)]);
    expect(prayerInsight(s)).toEqual({ strongest: null, weakest: null });
  });
});
