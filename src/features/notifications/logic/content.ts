import type { TFunction } from 'i18next';

import { prayerNameKey } from '@/features/occasions';
import type { DayIndex } from '@/features/prayer-times';
import type { DateKey } from '@/shared/lib/date-key';
import { formatWallTime } from '@/shared/lib/format';

import type { PlannedNotification } from './build-schedule';

export type NotificationContent = { title: string; body: string };

/** Title/body for a planned notification, in the current language. */
export function notificationContent(
  plan: Pick<PlannedNotification, 'kind' | 'date' | 'prayer'>,
  {
    t,
    index,
    reminderMinutes,
    suhoorMinutes = 0,
    isJumuah = () => false,
    isRamadan = () => false,
  }: {
    t: TFunction;
    index: DayIndex;
    reminderMinutes: number;
    suhoorMinutes?: number;
    isJumuah?: (date: DateKey) => boolean;
    isRamadan?: (date: DateKey) => boolean;
  },
): NotificationContent {
  const prayer = t(prayerNameKey(plan.prayer, isJumuah(plan.date)));
  const wall = index.get(plan.date)?.times[plan.prayer].wall ?? '';
  const time = wall ? formatWallTime(wall, { am: t('common.am'), pm: t('common.pm') }) : '';
  if (plan.kind === 'suhoor') return { title: t('occasions.suhoorTitle', { minutes: suhoorMinutes }), body: t('occasions.suhoorBody', { time }) };
  if (plan.kind === 'kahf') return { title: t('occasions.kahfTitle'), body: t('occasions.kahfBody') };
  if (plan.kind === 'start') {
    if (plan.prayer === 'maghrib' && isRamadan(plan.date)) return { title: t('occasions.iftarTitle'), body: t('occasions.iftarBody', { time }) };
    return { title: t('alarms.startTitle', { prayer }), body: t('alarms.startBody', { prayer, time }) };
  }
  return {
    title: t('alarms.reminderTitle', { prayer }),
    body: t('alarms.reminderBody', { prayer, minutes: reminderMinutes }),
  };
}
