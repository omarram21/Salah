import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { getPrayerWindow, type DayIndex } from '@/features/prayer-times';
import { addDays, type DateKey } from '@/shared/lib/date-key';
import { Button, Card, Text } from '@/shared/ui';

import { unmarkedStartedPrayers } from '../logic/pending';
import { getTiming } from '../logic/status';
import { selectRecords, selectTrackingSince, useTrackingStore } from '../store/tracking-store';
import { PrayerStatusControl } from './prayer-status-control';

type Props = { index: DayIndex; now: number; today: DateKey };

/**
 * Asks about yesterday's unmarked prayers. Covers Isha after midnight (still "in time",
 * so one tap = on time) and lets the user mark the rest as not prayed — only when they choose to.
 */
export function YesterdayCard({ index, now, today }: Props) {
  const { t } = useTranslation();
  const yesterday = addDays(today, -1);
  const records = useTrackingStore(selectRecords);
  const trackingSince = useTrackingStore(selectTrackingSince);
  const setStatuses = useTrackingStore((s) => s.setStatuses);

  if (!trackingSince || yesterday < trackingSince) return null;
  const pending = unmarkedStartedPrayers(index, records, yesterday, now, today);
  if (pending.length === 0) return null;

  const timings = pending.map((p) => [p, getTiming(getPrayerWindow(index, yesterday, p), now, yesterday, today)] as const);
  const ended = timings.filter(([, timing]) => timing === 'ended').map(([p]) => p);

  return (
    <Card className="gap-3">
      <View className="gap-1">
        <Text variant="heading">{t('tracking.yesterdayTitle')}</Text>
        <Text variant="muted">{t('tracking.yesterdayBody')}</Text>
      </View>
      {timings.map(([prayer, timing]) => (
        <View key={prayer} className="flex-row items-center justify-between">
          <Text className="font-medium">
            {t(`prayers.${prayer}`)}
            {timing === 'inTime' ? ` · ${t('tracking.stillInTime')}` : ''}
          </Text>
          <PrayerStatusControl
            date={yesterday}
            prayer={prayer}
            timing={timing}
            contextLabel={t('tracking.yesterdayTitle')}
          />
        </View>
      ))}
      {ended.length > 1 ? (
        <Button
          variant="ghost"
          label={t('tracking.markRestMissed')}
          onPress={() => setStatuses(yesterday, ended, 'missed')}
        />
      ) : null}
    </Card>
  );
}
