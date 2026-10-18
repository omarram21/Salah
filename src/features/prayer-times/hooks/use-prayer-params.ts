import { useMemo } from 'react';

import { useLocationStore } from '@/features/location';
import { useSettingsStore } from '@/features/settings';

import type { PrayerTimesParams } from '../model/params';

/** Combines location + settings into AlAdhan request params (null until a location is set). */
export function usePrayerParams(): PrayerTimesParams | null {
  const location = useLocationStore((s) => s.location);
  const method = useSettingsStore((s) => s.calculationMethod);
  const asr = useSettingsStore((s) => s.asrMethod);

  const latitude = location?.latitude;
  const longitude = location?.longitude;
  return useMemo(
    () =>
      latitude === undefined || longitude === undefined
        ? null
        : {
            latitude,
            longitude,
            method: method === 'auto' ? undefined : method,
            school: asr === 'hanafi' ? 1 : 0,
          },
    [latitude, longitude, method, asr],
  );
}
