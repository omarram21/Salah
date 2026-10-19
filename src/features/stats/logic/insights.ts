import { PRAYERS, type PrayerName } from '@/features/prayer-times';

import { onTimeCount, type CountSummary } from './counts';

export type Insight = { strongest: PrayerName | null; weakest: PrayerName | null };

/**
 * Which prayer is most / least often on time in the period. Needs at least two due prayers
 * per prayer and a real difference, so a quiet week doesn't produce noise.
 */
export function prayerInsight({ byPrayer }: CountSummary): Insight {
  const rates = PRAYERS.map((p) => {
    const c = byPrayer[p];
    const due = c.mosque + c.onTime + c.late + c.missed + c.unmarked;
    return { p, due, rate: due ? onTimeCount(c) / due : 0 };
  }).filter((r) => r.due >= 2);
  if (rates.length < 2) return { strongest: null, weakest: null };
  const sorted = [...rates].sort((a, b) => b.rate - a.rate);
  const best = sorted[0]!;
  const worst = sorted[sorted.length - 1]!;
  if (best.rate - worst.rate < 0.15) return { strongest: null, weakest: null };
  return { strongest: best.p, weakest: worst.rate < 1 ? worst.p : null };
}
