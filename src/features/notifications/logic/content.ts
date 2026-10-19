import type { TFunction } from 'i18next';

import type { DayIndex } from '@/features/prayer-times';
import { formatWallTime } from '@/shared/lib/format';

import type { PlannedNotification } from './build-schedule';

export type NotificationContent = { title: string; body: string };

/** Title/body for a planned notification, in the current language. */
export function notificationContent(
  plan: Pick<PlannedNotification, 'kind' | 'date' | 'prayer'>,
  { t, index, reminderMinutes }: { t: TFunction; index: DayIndex; reminderMinutes: number },
): NotificationContent {
  const prayer = t(`prayers.${plan.prayer}`);
  if (plan.kind === 'start') {
    const wall = index.get(plan.date)?.times[plan.prayer].wall ?? '';
    const time = wall ? formatWallTime(wall, { am: t('common.am'), pm: t('common.pm') }) : '';
    return { title: t('alarms.startTitle', { prayer }), body: t('alarms.startBody', { prayer, time }) };
  }
  return {
    title: t('alarms.reminderTitle', { prayer }),
    body: t('alarms.reminderBody', { prayer, minutes: reminderMinutes }),
  };
}
