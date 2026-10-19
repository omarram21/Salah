import type { IconName } from '@/shared/ui';

import type { TimeName } from '../model/types';

/** Time-of-day icon for each prayer (and sunrise). */
export const PRAYER_ICON: Record<TimeName, IconName> = {
  fajr: 'fajr',
  sunrise: 'sunrise',
  dhuhr: 'dhuhr',
  asr: 'asr',
  maghrib: 'maghrib',
  isha: 'isha',
};

/** What ends each prayer's window, for labels like "Asr 2:46 → Maghrib 5:09". */
export const WINDOW_END: Record<'fajr' | 'dhuhr' | 'asr' | 'maghrib' | 'isha', TimeName> = {
  fajr: 'sunrise',
  dhuhr: 'asr',
  asr: 'maghrib',
  maghrib: 'isha',
  isha: 'fajr',
};
