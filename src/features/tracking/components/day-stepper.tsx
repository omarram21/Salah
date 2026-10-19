import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, View } from 'react-native';

import {
  getPrayerWindow,
  PRAYER_ICON,
  PRAYERS,
  WINDOW_END,
  type DayIndex,
  type PrayerName,
} from '@/features/prayer-times';
import { useDirection } from '@/shared/i18n';
import { addDays, type DateKey } from '@/shared/lib/date-key';
import { formatWallShort } from '@/shared/lib/format';
import { useThemeColors } from '@/shared/theme/use-theme-colors';
import { Button, Icon, Text } from '@/shared/ui';

import { getTiming } from '../logic/status';
import { selectRecords, useTrackingStore } from '../store/tracking-store';
import { StatusDot } from './status-dot';
import { StatusQuickPicker } from './status-quick-picker';

type Props = {
  date: DateKey;
  index: DayIndex;
  now: number;
  today: DateKey;
  onDone: () => void;
};

/**
 * Edit a day one prayer at a time (design D1): tabs for the five prayers, four big choices,
 * and picking a status moves on to the next prayer.
 */
export function DayStepper({ date, index, now, today, onDone }: Props) {
  const { t } = useTranslation();
  const { c } = useThemeColors();
  const { isRTL } = useDirection();
  const records = useTrackingStore((s) => selectRecords(s)[date]);
  const setStatus = useTrackingStore((s) => s.setStatus);
  const clearStatus = useTrackingStore((s) => s.clearStatus);

  const timingOf = (p: PrayerName) => getTiming(getPrayerWindow(index, date, p), now, date, today);
  const firstOpen = PRAYERS.findIndex((p) => !records?.[p] && timingOf(p) !== 'upcoming');
  const [idx, setIdx] = useState(firstOpen >= 0 ? firstOpen : 0);

  const prayer = PRAYERS[idx] ?? 'fajr';
  const value = records?.[prayer]?.status;
  const upcoming = timingOf(prayer) === 'upcoming';
  const day = index.get(date);
  const endName = WINDOW_END[prayer];
  const endDay = prayer === 'isha' ? index.get(addDays(date, 1)) : day;
  const windowLabel =
    day && endDay
      ? `${formatWallShort(day.times[prayer].wall)} → ${t(`prayers.${endName}`)} ${formatWallShort(endDay.times[endName].wall)}`
      : null;
  const marked = PRAYERS.filter((p) => records?.[p]).length;
  const go = (i: number) => setIdx(Math.max(0, Math.min(PRAYERS.length - 1, i)));

  return (
    <View className="flex-1">
      <View accessibilityRole="tablist" className="flex-row gap-1.5">
        {PRAYERS.map((p, i) => {
          const selected = i === idx;
          return (
            <Pressable
              key={p}
              accessibilityRole="tab"
              accessibilityState={{ selected }}
              accessibilityLabel={`${t(`prayers.${p}`)}: ${t(`status.${records?.[p]?.status ?? 'unmarked'}`)}`}
              onPress={() => setIdx(i)}
              className={`h-16 flex-1 items-center justify-center gap-1.5 rounded-2xl border-2 ${
                selected ? 'border-ink bg-paper dark:border-ink-dark dark:bg-paper-dark' : 'border-transparent bg-chip dark:bg-chip-dark'
              }`}>
              <Text variant="micro" numberOfLines={1}>
                {t(`prayers.${p}`)}
              </Text>
              <StatusDot status={records?.[p]?.status} upcoming={timingOf(p) === 'upcoming'} size={12} />
            </Pressable>
          );
        })}
      </View>

      <View className="flex-1 items-center pt-6">
        <View className="size-[88px] items-center justify-center rounded-full bg-chip dark:bg-chip-dark">
          <Icon name={PRAYER_ICON[prayer]} size={44} color={c.ink} strokeWidth={1.5} />
        </View>
        <Text variant="title" className="mt-3" style={{ fontSize: 34, lineHeight: 40 }}>
          {t(`prayers.${prayer}`)}
        </Text>
        {windowLabel ? (
          <Text variant="small" tone="muted" tabular>
            {windowLabel}
          </Text>
        ) : null}

        <View className="mt-6 self-stretch">
          <StatusQuickPicker
            size="large"
            value={value}
            disabled={upcoming}
            prayerLabel={t(`prayers.${prayer}`)}
            onPick={(status) => {
              if (value === status) {
                clearStatus(date, prayer);
                return;
              }
              setStatus(date, prayer, status);
              go(idx + 1);
            }}
          />
        </View>
        <Text variant="tiny" tone="faint" align="center" className="mt-3">
          {upcoming ? t('tracking.notStartedYet') : t('tracking.pickToAdvance')}
        </Text>
      </View>

      <View className="flex-row gap-2.5 pb-2">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('tracking.prevPrayer')}
          onPress={() => go(idx - 1)}
          className="h-[52px] w-14 items-center justify-center rounded-full bg-chip dark:bg-chip-dark">
          <Icon name="chevronLeft" size={20} color={c.ink} strokeWidth={2} flip={isRTL} />
        </Pressable>
        <Button label={t('tracking.doneMarked', { n: marked })} onPress={onDone} className="flex-1" />
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('tracking.nextPrayer')}
          onPress={() => go(idx + 1)}
          className="h-[52px] w-14 items-center justify-center rounded-full bg-chip dark:bg-chip-dark">
          <Icon name="chevronRight" size={20} color={c.ink} strokeWidth={2} flip={isRTL} />
        </Pressable>
      </View>
    </View>
  );
}
