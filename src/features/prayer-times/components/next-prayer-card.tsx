import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import type { DateKey } from '@/shared/lib/date-key';
import { formatCountdown, formatWallTime } from '@/shared/lib/format';
import { Card, Text } from '@/shared/ui';

import type { DayIndex, PrayerWindow, UpcomingPrayer } from '../model/timeline';

type Props = {
  now: number;
  today: DateKey;
  index: DayIndex;
  next: UpcomingPrayer | null;
  current: PrayerWindow | null;
};

export function NextPrayerCard({ now, today, index, next, current }: Props) {
  const { t } = useTranslation();
  const labels = { am: t('common.am'), pm: t('common.pm') };

  if (!next) {
    return (
      <Card>
        <Text variant="muted">{t('today.noUpcoming')}</Text>
      </Card>
    );
  }

  const wall = index.get(next.date)?.times[next.prayer].wall ?? '';
  return (
    <Card className="gap-2 border-0 bg-primary dark:bg-primary-dark">
      <Text className="text-sm font-medium text-teal-100">
        {t('today.nextPrayer', { prayer: t(`prayers.${next.prayer}`) })}
        {next.date > today ? ` · ${t('today.tomorrow')}` : ''}
      </Text>
      <View className="flex-row items-baseline justify-between">
        <Text className="text-3xl font-bold text-white">{formatWallTime(wall, labels)}</Text>
        <Text className="text-xl font-semibold tabular-nums text-white">
          {t('today.inTime', { time: formatCountdown(next.at - now) })}
        </Text>
      </View>
      {current ? (
        <Text className="text-sm text-teal-100">
          {t(`prayers.${current.prayer}`)} · {t('today.endsIn', { time: formatCountdown(current.end - now) })}
        </Text>
      ) : null}
    </Card>
  );
}
