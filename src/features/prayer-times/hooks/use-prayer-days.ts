import { useMemo } from 'react';

import { useSettingsStore } from '@/features/settings';

import { applyAdjustments } from '../model/adjust';
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

/** All cached days for the current params, with the user's time adjustments applied, indexed by date. */
export function usePrayerDays(params: PrayerTimesParams | null): PrayerData {
  const months = usePrayerTimesStore((s) => s.months);
  const offsets = useSettingsStore((s) => s.timeOffsets);
  const ishaEnd = useSettingsStore((s) => s.ishaEnd);
  const hijriOffset = useSettingsStore((s) => s.hijriOffset);
  return useMemo(() => {
    if (!params) return { index: new Map(), method: null, timezone: null };
    const pk = `${paramsKey(params)}#`;
    const mine = Object.entries(months)
      .filter(([key]) => key.startsWith(pk))
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([, m]) => m);
    const latest = mine.at(-1);
    return {
      index: indexDays(applyAdjustments(mine.flatMap((m) => m.days), { offsets, ishaEnd, hijriOffset })),
      method: latest?.method ?? null,
      timezone: latest?.timezone ?? null,
    };
  }, [months, params, offsets, ishaEnd, hijriOffset]);
}
