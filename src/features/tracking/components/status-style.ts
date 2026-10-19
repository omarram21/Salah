import type { IconName } from '@/shared/ui';
import { palette } from '@/shared/theme/colors';

import type { PrayerStatus } from '../logic/types';

export type StatusKey = PrayerStatus | 'unmarked';

/** One place for status colors/icons (blue / green / amber / red / gray). Keep in sync with tailwind.config.js. */
export const STATUS_STYLE: Record<StatusKey, { bg: string; color: string; icon: IconName }> = {
  mosque: { bg: 'bg-status-mosque', color: palette.status.mosque, icon: 'mosque' },
  onTime: { bg: 'bg-status-onTime', color: palette.status.onTime, icon: 'check' },
  late: { bg: 'bg-status-late', color: palette.status.late, icon: 'late' },
  missed: { bg: 'bg-status-missed', color: palette.status.missed, icon: 'close' },
  unmarked: { bg: 'bg-status-unmarked', color: '#B4B4AF', icon: 'unmarked' },
};
