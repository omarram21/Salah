import { useMemo } from 'react';

import { paramsKey, type PrayerTimesParams } from '../model/params';
import { indexDays, type DayIndex } from '../model/timeline';
import type { CalculationMethodInfo } from '../model/types';
import { usePrayerTimesStore } from '../store/prayer-times-store';

export type PrayerData = {
  index: DayIndex;
  /** Method AlAdhan actually used (useful when the setting is "auto"). */
  method: CalculationMethodInfo | null;
  timezone: string | null;
};

/** All cached days for the current params, indexed by date. */
export function usePrayerDays(params: PrayerTimesParams | null): PrayerData {
  const months = usePrayerTimesStore((s) => s.months);
  return useMemo(() => {
    if (!params) return { index: new Map(), method: null, timezone: null };
    const pk = `${paramsKey(params)}#`;
    const mine = Object.entries(months)
      .filter(([key]) => key.startsWith(pk))
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([, m]) => m);
    const latest = mine.at(-1);
    return {
      index: indexDays(mine.flatMap((m) => m.days)),
      method: latest?.method ?? null,
      timezone: latest?.timezone ?? null,
    };
  }, [months, params]);
}
