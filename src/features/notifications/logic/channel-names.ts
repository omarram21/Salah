import type { TFunction } from 'i18next';

import type { AlarmSound } from '@/features/settings';

/** User-visible Android channel names (shown in the phone's notification settings). */
export function channelNames(t: TFunction) {
  return {
    alarm: (sound: AlarmSound) => t('alarms.channelAlarm', { sound: t(`sounds.${sound}`) }),
    reminder: t('alarms.channelReminder'),
  };
}
