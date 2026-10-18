import { getCalendars } from 'expo-localization';
import { useMemo } from 'react';

import type { DayIndex, PrayerName } from '@/features/prayer-times';
import { useTrackingStore } from '@/features/tracking';
import type { DateKey } from '@/shared/lib/date-key';

import { countStatuses } from '../logic/counts';
import { datesBetween, monthStart, weekStart } from '../logic/ranges';
import { bestStreak, currentStreak } from '../logic/streak';

export type StatsPeriod = 'week' | 'month';

function deviceFirstWeekday(): number {
  return getCalendars()[0]?.firstWeekday ?? 1;
}

export function useStats(period: StatsPeriod, index: DayIndex, now: number, today: DateKey) {
  const records = useTrackingStore((s) => s.records);
  const trackingSince = useTrackingStore((s) => s.trackingSince);

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
    };
  }, [period, index, now, today, records, trackingSince]);
}
