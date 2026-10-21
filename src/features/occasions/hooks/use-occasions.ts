import { useCallback } from 'react';

import type { DayIndex } from '@/features/prayer-times';
import { useSettingsStore } from '@/features/settings';
import type { DateKey } from '@/shared/lib/date-key';

import { isFriday, isRamadanDay } from '../logic/occasions';

/**
 * Friday / Ramadan checks that respect the settings and the preview switches
 * (preview Friday = today only; preview Ramadan = today onwards).
 */
export function useOccasions(index: DayIndex, today: DateKey) {
  const friday = useSettingsStore((s) => s.friday);
  const ramadan = useSettingsStore((s) => s.ramadan);
  const preview = useSettingsStore((s) => s.preview);

  const fridayOn = useCallback((date: DateKey) => isFriday(date) || (preview.friday && date === today), [preview.friday, today]);
  const ramadanOn = useCallback(
    (date: DateKey) => ramadan.enabled && (isRamadanDay(index.get(date)) || (preview.ramadan && date >= today)),
    [index, ramadan.enabled, preview.ramadan, today],
  );
  /** Friday and the user wants Dhuhr called Jumu'ah. */
  const jumuahOn = useCallback((date: DateKey) => friday.jumuahLabel && fridayOn(date), [friday.jumuahLabel, fridayOn]);
  return {
    isFriday: fridayOn,
    isJumuah: jumuahOn,
    isRamadan: ramadanOn,
    preview,
  };
}
