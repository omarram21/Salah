import { PRAYERS, type PrayerName } from '@/features/prayer-times';
import { addDays, parseDateKey, weekdayOf, type DateKey } from '@/shared/lib/date-key';

import type { Dataset, DayRecord, PrayerStatus, RecordsByDate } from '../logic/types';
import { pickWeighted, seededRandom } from './random';

export const DEMO_DAYS = 90;
export const DEMO_SEED = 1448;

type Outcome = PrayerStatus | 'unmarked';
type Weights = Record<Outcome, number>;

/** Typical habits: Fajr is hardest, Maghrib is often in the mosque. */
const BASE: Record<PrayerName, Weights> = {
  fajr: { mosque: 5, onTime: 45, late: 25, missed: 15, unmarked: 10 },
  dhuhr: { mosque: 15, onTime: 60, late: 12, missed: 5, unmarked: 8 },
  asr: { mosque: 10, onTime: 60, late: 15, missed: 7, unmarked: 8 },
  maghrib: { mosque: 35, onTime: 50, late: 7, missed: 3, unmarked: 5 },
  isha: { mosque: 25, onTime: 50, late: 12, missed: 6, unmarked: 7 },
};

const JUMUAH: Weights = { mosque: 85, onTime: 10, late: 3, missed: 2, unmarked: 0 };

/**
 * Story arcs (in "days ago") so every screen has something to show:
 * - 1–6: perfect days → current streak of 6;
 * - 20–31: perfect days → best streak of 12;
 * - 38–44: a bad week;
 * - 58–60: nothing marked (app not opened);
 * - "breaker" days sit next to the perfect runs so random luck can't extend them.
 */
type Phase = 'perfect' | 'breaker' | 'bad' | 'gap' | 'normal';

function phaseOf(daysAgo: number): Phase {
  if (daysAgo <= 6) return 'perfect';
  if (daysAgo === 7 || daysAgo === 19 || daysAgo === 32) return 'breaker';
  if (daysAgo >= 20 && daysAgo <= 31) return 'perfect';
  if (daysAgo >= 38 && daysAgo <= 44) return 'bad';
  if (daysAgo >= 58 && daysAgo <= 60) return 'gap';
  return 'normal';
}

function weightsFor(prayer: PrayerName, date: DateKey, phase: Phase): Weights {
  const isFriday = weekdayOf(date) === 5;
  const base = prayer === 'dhuhr' && isFriday ? JUMUAH : BASE[prayer];
  if (phase !== 'bad') return base;
  return { ...base, mosque: base.mosque * 0.3, late: base.late * 1.5, missed: base.missed * 3 };
}

function noonUtc(date: DateKey) {
  const { year, month, day } = parseDateKey(date);
  return Date.UTC(year, month - 1, day, 12);
}

/**
 * Deterministic fake history for the `DEMO_DAYS` days before `today`.
 * Today is left empty so the marking flow can be tried by hand.
 */
export function generateDemoDataset(
  today: DateKey,
  { days = DEMO_DAYS, seed = DEMO_SEED }: { days?: number; seed?: number } = {},
): Dataset {
  const rand = seededRandom(seed);
  const records: RecordsByDate = {};

  for (let daysAgo = days; daysAgo >= 1; daysAgo--) {
    const date = addDays(today, -daysAgo);
    const phase = phaseOf(daysAgo);
    if (phase === 'gap') continue;

    const day: DayRecord = {};
    for (const prayer of PRAYERS) {
      let outcome: Outcome;
      if (phase === 'perfect') {
        outcome = rand() < (prayer === 'maghrib' ? 0.5 : 0.2) ? 'mosque' : 'onTime';
      } else if (phase === 'breaker' && prayer === 'fajr') {
        outcome = 'late';
      } else {
        outcome = pickWeighted(weightsFor(prayer, date, phase), rand);
      }
      if (outcome !== 'unmarked') day[prayer] = { status: outcome, updatedAt: noonUtc(date) };
    }
    if (Object.keys(day).length > 0) records[date] = day;
  }

  return { records, trackingSince: addDays(today, -days) };
}
