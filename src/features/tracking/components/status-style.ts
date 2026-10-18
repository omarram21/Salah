import type Ionicons from '@expo/vector-icons/Ionicons';
import type { ComponentProps } from 'react';

import type { PrayerStatus } from '../logic/types';

type IconName = ComponentProps<typeof Ionicons>['name'];

/** One place for status colors/icons (green / yellow / red / gray). */
export const STATUS_STYLE: Record<PrayerStatus | 'unmarked', { bg: string; color: string; icon: IconName }> = {
  onTime: { bg: 'bg-status-onTime', color: '#16A34A', icon: 'checkmark' },
  late: { bg: 'bg-status-late', color: '#EAB308', icon: 'time-outline' },
  missed: { bg: 'bg-status-missed', color: '#DC2626', icon: 'close' },
  unmarked: { bg: 'bg-status-unmarked', color: '#9CA3AF', icon: 'ellipse-outline' },
};
