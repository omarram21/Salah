import { dateKeyAt, type DateKey } from '@/shared/lib/date-key';

import type { DayIndex } from './timeline';

/**
 * The current date *at the prayer location*. This can differ from the device date
 * when the user picked a city in another timezone.
 */
export function locationToday(index: DayIndex, now: number, deviceOffsetMin: number): DateKey {
  // Guess with any cached day's offset (same place, so ±1h at most for DST),
  // then refine with the matching day's exact offset.
  const anyDay = index.values().next().value;
  const guess = dateKeyAt(now, anyDay?.utcOffsetMin ?? deviceOffsetMin);
  const day = index.get(guess);
  return day ? dateKeyAt(now, day.utcOffsetMin) : guess;
}
