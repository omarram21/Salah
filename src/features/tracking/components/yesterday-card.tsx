import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { getPrayerWindow, PRAYER_ICON, type DayIndex, type PrayerName } from '@/features/prayer-times';
import { addDays, type DateKey } from '@/shared/lib/date-key';
import { useThemeColors } from '@/shared/theme/use-theme-colors';
import { Button, Card, Icon, Text } from '@/shared/ui';

import { usePrayerStatus } from '../hooks/use-prayer-status';
import { unmarkedStartedPrayers } from '../logic/pending';
import { getTiming, type PrayerTiming } from '../logic/status';
import { selectRecords, selectTrackingSince, useTrackingStore } from '../store/tracking-store';
import { StatusCircle } from './status-circle';

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

  const rows = pending.map((p) => [p, getTiming(getPrayerWindow(index, yesterday, p), now, yesterday, today)] as const);
  const ended = rows.filter(([, timing]) => timing === 'ended').map(([p]) => p);

  return (
    <Card className="gap-1">
      <Text variant="heading">{t('tracking.yesterdayTitle')}</Text>
      <Text variant="caption" tone="muted" className="mb-1">
        {t('tracking.yesterdayBody')}
      </Text>
      {rows.map(([prayer, timing]) => (
        <YesterdayRow key={prayer} date={yesterday} prayer={prayer} timing={timing} />
      ))}
      {ended.length > 1 ? (
        <Button
          variant="ghost"
          label={t('tracking.markRestMissed')}
          onPress={() => setStatuses(yesterday, ended, 'missed')}
          className="mt-1"
        />
      ) : null}
    </Card>
  );
}

function YesterdayRow({ date, prayer, timing }: { date: DateKey; prayer: PrayerName; timing: PrayerTiming }) {
  const { t } = useTranslation();
  const { c } = useThemeColors();
  const { status, tap, openSheet, sheet } = usePrayerStatus(date, prayer, timing);
  const name = t(`prayers.${prayer}`);
  return (
    <View className="min-h-[54px] flex-row items-center gap-3">
      <Icon name={PRAYER_ICON[prayer]} color={c.muted} />
      <Text variant="label" className="flex-1">
        {name}
        {timing === 'inTime' ? <Text variant="caption" tone="accent">{` · ${t('tracking.stillInTime')}`}</Text> : null}
      </Text>
      <StatusCircle
        status={status}
        onPress={tap}
        onLongPress={openSheet}
        accessibilityLabel={`${name} (${t('tracking.yesterdayTitle')}): ${t(`status.${status ?? 'unmarked'}`)}`}
      />
      {sheet}
    </View>
  );
}
