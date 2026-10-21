import { getCalendars } from 'expo-localization';
import { useMemo } from 'react';

import type { DayIndex, PrayerName } from '@/features/prayer-times';
import { useOccasions } from '@/features/occasions';
import { useSettingsStore } from '@/features/settings';
import { countExtras, selectExtras, selectRecords, selectTrackingSince, useTrackingStore, witrStreak } from '@/features/tracking';
import { addDays, type DateKey } from '@/shared/lib/date-key';

import { countStatuses } from '../logic/counts';
import { datesBetween, monthStart, weekStart } from '../logic/ranges';
import { bestStreak, currentStreak } from '../logic/streak';

export type StatsPeriod = 'week' | 'month';

function deviceFirstWeekday(): number {
  return getCalendars()[0]?.firstWeekday ?? 1;
}

export function useStats(period: StatsPeriod, index: DayIndex, now: number, today: DateKey) {
  const records = useTrackingStore(selectRecords);
  const trackingSince = useTrackingStore(selectTrackingSince);
  const extras = useTrackingStore(selectExtras);
  const sunnahEnabled = useSettingsStore((s) => s.sunnahEnabled);
  const sunnahItems = useSettingsStore((s) => s.sunnahItems);
  const { isFriday, isRamadan } = useOccasions(index, today);

  return useMemo(() => {
    const periodStart = period === 'week' ? weekStart(today, deviceFirstWeekday()) : monthStart(today);
    // Don't count days before the app was first used as "not marked".
    const from = trackingSince && trackingSince > periodStart ? trackingSince : periodStart;
    const dates = datesBetween(from, today);

    const isDue = (date: DateKey, prayer: PrayerName) => {
      if (date < today) return true;
      const start = index.get(date)?.times[prayer].at;
      return start !== undefined && start <= now;
    };

    return {
      summary: countStatuses(records, dates, isDue),
      current: currentStreak(records, today),
      best: bestStreak(records),
      // Duha has no prayer of its own: it's due once sunrise has passed.
      extras: sunnahEnabled
        ? countExtras(extras, dates, sunnahItems, (date, def) => {
            if (date < today) return true;
            const times = index.get(date)?.times;
            const start = def.prayer ? times?.[def.prayer].at : times?.sunrise.at;
            return start !== undefined && start <= now;
          })
        : null,
      // Al-Kahf: Fridays so far (today counts once marked). Fasting: Ramadan days that have ended (or are marked).
      occasions: {
        kahf: tally(dates.filter((d) => isFriday(d) && (d < today || !!extras[d]?.kahf)), (d) => !!extras[d]?.kahf),
        fast: tally(
          dates.filter((d) => isRamadan(d) && (d < today || !!extras[d]?.fast || (index.get(d)?.times.maghrib.at ?? Infinity) <= now)),
          (d) => !!extras[d]?.fast,
        ),
      },
      witrStreak: sunnahEnabled && sunnahItems.witr ? witrStreak(extras, today, addDays) : null,
    };
  }, [period, index, now, today, records, trackingSince, extras, sunnahEnabled, sunnahItems, isFriday, isRamadan]);
}

function tally(dates: DateKey[], done: (d: DateKey) => boolean) {
  return { done: dates.filter(done).length, due: dates.length };
}
