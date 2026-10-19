import type { PrayerStatus } from '../logic/types';

export type StatusIconSpec =
  | { family: 'ionicons'; name: 'checkmark' | 'time-outline' | 'close' | 'ellipse-outline' }
  | { family: 'mci'; name: 'mosque' };

/** One place for status colors/icons (blue / green / yellow / red / gray). Keep in sync with tailwind.config.js. */
export const STATUS_STYLE: Record<PrayerStatus | 'unmarked', { bg: string; color: string; icon: StatusIconSpec }> = {
  mosque: { bg: 'bg-status-mosque', color: '#2563EB', icon: { family: 'mci', name: 'mosque' } },
  onTime: { bg: 'bg-status-onTime', color: '#16A34A', icon: { family: 'ionicons', name: 'checkmark' } },
  late: { bg: 'bg-status-late', color: '#EAB308', icon: { family: 'ionicons', name: 'time-outline' } },
  missed: { bg: 'bg-status-missed', color: '#DC2626', icon: { family: 'ionicons', name: 'close' } },
  unmarked: { bg: 'bg-status-unmarked', color: '#9CA3AF', icon: { family: 'ionicons', name: 'ellipse-outline' } },
};
