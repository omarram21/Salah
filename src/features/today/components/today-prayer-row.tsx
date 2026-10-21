import { useTranslation } from 'react-i18next';
import { Pressable, View } from 'react-native';

import { PRAYER_ICON, type PrayerDay, type PrayerName } from '@/features/prayer-times';
import { useSettingsStore } from '@/features/settings';
import {
  StatusCircle,
  StatusQuickPicker,
  SunnahChips,
  usePrayerStatus,
  type PrayerTiming,
} from '@/features/tracking';
import { formatCountdown, formatWallShort } from '@/shared/lib/format';
import { useThemeColors } from '@/shared/theme/use-theme-colors';
import { Icon, Text } from '@/shared/ui';

type Props = {
  day: PrayerDay;
  prayer: PrayerName;
  /** Display name ("Jumu'ah" for Dhuhr on Friday). */
  name: string;
  timing: PrayerTiming;
  /** End of the window, for "ends in" while the prayer is current. */
  endsAt: number | null;
  now: number;
  last?: boolean;
};

/**
 * One prayer on Today (design E):
 * - current & not marked → the four status buttons, one tap marks;
 * - marked → one colored icon (tap to change);
 * - ended & not marked → "?" (tap: picker with "late" suggested);
 * - not started → its alarm bell (tap to turn that prayer's alarm on/off).
 */
export function TodayPrayerRow({ day, prayer, name, timing, endsAt, now, last }: Props) {
  const { t } = useTranslation();
  const { c } = useThemeColors();
  const { status, tap, openSheet, mark, sheet } = usePrayerStatus(day.date, prayer, timing);
  const alarms = useSettingsStore((s) => s.alarms);
  const setPrayerAlarm = useSettingsStore((s) => s.setPrayerAlarm);
  const time = formatWallShort(day.times[prayer].wall);
  const border = last ? '' : 'border-b border-line dark:border-line-dark';

  if (timing === 'inTime' && !status) {
    return (
      <View className={`gap-2.5 py-3.5 ${border}`}>
        <View className="flex-row items-center gap-3.5">
          <Icon name={PRAYER_ICON[prayer]} color={c.accent} />
          <View className="flex-1">
            <Text variant="body" weight="bold" tone="accent">{`${name} · ${t('today.now')}`}</Text>
            {endsAt ? (
              <Text variant="tiny" tone="muted" tabular>
                {t('today.endsIn', { time: formatCountdown(endsAt - now) })}
              </Text>
            ) : null}
          </View>
          <Text variant="small" tone="muted" tabular>
            {time}
          </Text>
        </View>
        <StatusQuickPicker prayerLabel={name} onPick={mark} />
        <SunnahChips date={day.date} prayer={prayer} />
        {sheet}
      </View>
    );
  }

  const upcoming = timing === 'upcoming' && !status;
  const alarmOn = alarms.enabled && alarms.prayers[prayer];
  return (
    <View className={`gap-2 py-3 ${border}`}>
      <View className="min-h-[44px] flex-row items-center gap-3.5">
        <Icon name={PRAYER_ICON[prayer]} color={c.muted} />
        <View className="flex-1">
          <Text variant="body" weight="semibold" tone={upcoming ? 'muted' : 'ink'}>
            {name}
          </Text>
          {prayer === 'fajr' ? (
            <Text
              variant="tiny"
              tone="faint"
              tabular
            >{`${t('prayers.sunrise')} ${formatWallShort(day.times.sunrise.wall)}`}</Text>
          ) : null}
        </View>
        <Text variant="small" tone="muted" tabular>
          {time}
        </Text>
        {upcoming ? (
          <Pressable
            accessibilityRole="switch"
            accessibilityState={{ checked: alarmOn }}
            accessibilityLabel={t('today.alarmFor', { prayer: name })}
            onPress={() => setPrayerAlarm(prayer, !alarms.prayers[prayer])}
            disabled={!alarms.enabled}
            hitSlop={4}
            className="size-11 items-center justify-center rounded-full active:bg-chip dark:active:bg-chip-dark"
          >
            <Icon name={alarmOn ? 'bell' : 'bellOff'} size={20} color={c.muted} />
          </Pressable>
        ) : (
          <StatusCircle
            status={status}
            onPress={tap}
            onLongPress={openSheet}
            accessibilityLabel={`${name}: ${t(`status.${status ?? 'unmarked'}`)}`}
            accessibilityHint={status ? t('status.changeHint') : t('status.markHint')}
          />
        )}
        {sheet}
      </View>
      <View className="ps-9">
        <SunnahChips date={day.date} prayer={prayer} disabled={timing === 'upcoming'} />
      </View>
    </View>
  );
}
