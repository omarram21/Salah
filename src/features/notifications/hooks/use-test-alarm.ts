import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { getNextPrayer, locationToday, usePrayerDays, usePrayerParams } from '@/features/prayer-times';
import { useSettingsStore } from '@/features/settings';
import { deviceUtcOffsetMin } from '@/shared/lib/date-key';

import { notificationContent } from '../logic/content';
import { channelNames } from '../logic/channel-names';
import { ensureChannels, getPermission, scheduleTestAlarms } from '../services/notification-service';
import { useNotificationPermission } from '../store/permission-store';

export const TEST_START_SECONDS = 5;
export const TEST_REMINDER_SECONDS = 15;

/** Sends a sample start alarm and reminder (for the next prayer) a few seconds from now. */
export function useTestAlarm() {
  const { t } = useTranslation();
  const { index } = usePrayerDays(usePrayerParams());
  const reminderMinutes = useSettingsStore((s) => s.alarms.reminderMinutes);
  const sound = useSettingsStore((s) => s.alarms.sound);
  const setPermission = useNotificationPermission((s) => s.setStatus);
  const [state, setState] = useState<'idle' | 'sent' | 'denied'>('idle');

  const send = async () => {
    await ensureChannels(channelNames(t));
    const permission = await getPermission({ prompt: true });
    setPermission(permission);
    if (permission !== 'granted') {
      setState('denied');
      return;
    }

    const now = Date.now();
    const next = getNextPrayer(index, now, locationToday(index, now, deviceUtcOffsetMin(now)));
    const plan = { date: next?.date ?? '', prayer: next?.prayer ?? 'fajr' };
    const test = (title: string) => t('alarms.testTitle', { title });
    const start = notificationContent({ ...plan, kind: 'start' }, { t, index, reminderMinutes });
    const reminder = notificationContent({ ...plan, kind: 'reminder' }, { t, index, reminderMinutes });

    await scheduleTestAlarms(
      [
        { kind: 'start', content: { ...start, title: test(start.title) }, inSeconds: TEST_START_SECONDS },
        { kind: 'reminder', content: { ...reminder, title: test(reminder.title) }, inSeconds: TEST_REMINDER_SECONDS },
      ],
      sound,
    );
    setState('sent');
  };

  return { state, send };
}
