import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { formatWallTime } from '@/shared/lib/format';
import { Card, Text } from '@/shared/ui';

import type { PrayerWindow } from '../model/timeline';
import { TIME_NAMES, type PrayerDay, type PrayerName } from '../model/types';

type Props = {
  day: PrayerDay;
  current: PrayerWindow | null;
  /** Slot for per-prayer controls (e.g. tracking buttons). */
  renderAccessory?: (prayer: PrayerName) => ReactNode;
};

export function PrayerList({ day, current, renderAccessory }: Props) {
  const { t } = useTranslation();
  const labels = { am: t('common.am'), pm: t('common.pm') };

  return (
    <Card className="gap-1 p-2">
      {TIME_NAMES.map((name) => {
        const isSunrise = name === 'sunrise';
        const isCurrent = !isSunrise && current?.date === day.date && current.prayer === name;
        return (
          <View
            key={name}
            className={`flex-row items-center gap-3 rounded-xl px-3 py-3 ${isCurrent ? 'bg-teal-50 dark:bg-teal-950' : ''}`}>
            <View className="flex-1 flex-row items-center gap-2">
              {isCurrent ? <View className="size-2 rounded-full bg-primary dark:bg-primary-light" /> : null}
              <Text
                variant={isSunrise ? 'muted' : 'body'}
                className={isCurrent ? 'font-bold text-primary dark:text-primary-light' : 'font-medium'}>
                {t(`prayers.${name}`)}
              </Text>
            </View>
            <Text variant={isSunrise ? 'muted' : 'body'} className="tabular-nums">
              {formatWallTime(day.times[name].wall, labels)}
            </Text>
            {!isSunrise && renderAccessory ? renderAccessory(name) : null}
          </View>
        );
      })}
    </Card>
  );
}
