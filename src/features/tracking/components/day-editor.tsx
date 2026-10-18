import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { PRAYERS, type DayIndex } from '@/features/prayer-times';
import { formatWallTime } from '@/shared/lib/format';
import type { DateKey } from '@/shared/lib/date-key';
import { Card, Text } from '@/shared/ui';

import { useTrackingStore } from '../store/tracking-store';
import { StatusOptions } from './status-options';

/** Edit all five statuses for any date (used from History). */
export function DayEditor({ date, index }: { date: DateKey; index: DayIndex }) {
  const { t } = useTranslation();
  const day = index.get(date);
  const records = useTrackingStore((s) => s.records[date]);
  const setStatus = useTrackingStore((s) => s.setStatus);
  const clearStatus = useTrackingStore((s) => s.clearStatus);
  const labels = { am: t('common.am'), pm: t('common.pm') };

  return (
    <View className="gap-4">
      {PRAYERS.map((prayer) => (
        <Card key={prayer} className="gap-3">
          <View className="flex-row items-baseline justify-between">
            <Text variant="heading">{t(`prayers.${prayer}`)}</Text>
            {day ? <Text variant="muted">{formatWallTime(day.times[prayer].wall, labels)}</Text> : null}
          </View>
          <StatusOptions
            value={records?.[prayer]?.status}
            onSelect={(status) => setStatus(date, prayer, status)}
            onClear={() => clearStatus(date, prayer)}
          />
        </Card>
      ))}
    </View>
  );
}
