import { getCalendars } from 'expo-localization';
import { useMemo } from 'react';

import type { DayIndex, PrayerName } from '@/features/prayer-times';
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
      witrStreak: sunnahEnabled && sunnahItems.witr ? witrStreak(extras, today, addDays) : null,
    };
  }, [period, index, now, today, records, trackingSince, extras, sunnahEnabled, sunnahItems]);
}
