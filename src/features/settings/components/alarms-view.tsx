import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Pressable, View } from 'react-native';

import { TEST_REMINDER_SECONDS, TEST_START_SECONDS, useTestAlarm } from '@/features/notifications';
import { getPrayerWindow, PRAYER_ICON, PRAYERS, WINDOW_END, useToday, type PrayerName } from '@/features/prayer-times';
import { formatWallShort } from '@/shared/lib/format';
import { useDirection } from '@/shared/i18n';
import { useThemeColors } from '@/shared/theme/use-theme-colors';
import { Button, Card, Icon, Screen, Switch, Text } from '@/shared/ui';

import { REMINDER_MINUTE_OPTIONS, useSettingsStore } from '../store/settings-store';

const wallOf = (ms: number, offsetMin: number) => {
  const d = new Date(ms + offsetMin * 60_000);
  return `${String(d.getUTCHours()).padStart(2, '0')}:${String(d.getUTCMinutes()).padStart(2, '0')}`;
};

/** Alarm settings with a preview of when today's next prayer will ring (from design S3). */
export function AlarmsView() {
  const { t } = useTranslation();
  const { c } = useThemeColors();
  const { isRTL } = useDirection();
  const alarms = useSettingsStore((s) => s.alarms);
  const update = useSettingsStore((s) => s.updateAlarms);
  const setPrayerAlarm = useSettingsStore((s) => s.setPrayerAlarm);
  const { index, today, day, next } = useToday(60_000);
  const testAlarm = useTestAlarm();

  // Preview the next prayer of today (or Asr if the day is over).
  const example: PrayerName = next?.date === today ? next.prayer : 'asr';
  const window = getPrayerWindow(index, today, example);
  const offset = day?.utcOffsetMin ?? 0;
  const span = window ? window.end - window.start : 1;
  const remAt = window ? window.end - alarms.reminderMinutes * 60_000 : 0;
  const remOn = alarms.enabled && alarms.reminderEnabled && !!window && remAt > window.start;
  const pos = window ? Math.max(0, Math.min(1, (remAt - window.start) / span)) : 0;
  const startWall = window ? formatWallShort(wallOf(window.start, offset)) : '';
  const endWall = window ? formatWallShort(wallOf(window.end, offset)) : '';
  const remWall = window ? formatWallShort(wallOf(remAt, offset)) : '';
  const name = t(`prayers.${example}`);
  const endName = t(`prayers.${WINDOW_END[example]}`);

  return (
    <Screen
      back
      title={t('settings.alarmsTitle')}
      headerRight={<Switch accessibilityLabel={t('settings.alarmsEnabled')} value={alarms.enabled} onValueChange={(enabled) => update({ enabled })} />}>
      <View style={{ opacity: alarms.enabled ? 1 : 0.4 }} className="gap-4" pointerEvents={alarms.enabled ? 'auto' : 'none'}>
        {window ? (
          <Card className="gap-3.5">
            <View className="flex-row items-center gap-2">
              <Icon name={PRAYER_ICON[example]} size={16} color={c.faint} strokeWidth={2} />
              <Text variant="tiny" weight="semibold" tone="faint" style={{ letterSpacing: 0.7 }}>
                {t('settings.howItRings', { prayer: name })}
              </Text>
            </View>
            <View className="mx-1.5 h-[54px]" accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
              <View className="absolute inset-x-0 top-[13px] h-1 rounded-full bg-status-unmarked dark:bg-[#3A3A3E]" />
              <View className="absolute start-0 top-[13px] h-1 rounded-full bg-ink dark:bg-ink-dark" style={{ width: `${(remOn ? pos : 1) * 100}%` }} />
              <View className="absolute -start-2.5 top-0 size-[30px] items-center justify-center rounded-full bg-ink dark:bg-ink-dark">
                <Icon name="bell" size={15} color={c.paper} strokeWidth={2.2} />
              </View>
              {remOn ? (
                <View className="absolute top-0 items-center" style={{ start: `${pos * 100}%`, marginStart: -15 }}>
                  <View className="size-[30px] items-center justify-center rounded-full bg-status-late">
                    <Icon name="late" size={15} color="#FFFFFF" strokeWidth={2.4} />
                  </View>
                  <Text variant="micro" tone="none" style={{ color: '#B45309' }} className="mt-1">{remWall}</Text>
                </View>
              ) : null}
              <View className="absolute -end-1.5 top-[7px] size-4 rounded-full border-[3px] border-ink bg-paper dark:border-ink-dark dark:bg-paper-dark" />
              <Text variant="micro" className="absolute -start-2.5 top-9">{startWall}</Text>
              <Text variant="micro" className="absolute -end-2.5 top-9">{endWall}</Text>
            </View>
            <Text variant="caption" tone="muted">
              {remOn
                ? t('settings.ringsExplainReminder', { prayer: name, start: startWall, reminder: remWall, minutes: alarms.reminderMinutes, end: endName })
                : t('settings.ringsExplain', { prayer: name, start: startWall })}
            </Text>
          </Card>
        ) : null}

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`${t('sounds.title')}, ${t(`sounds.${alarms.sound}`)}`}
          onPress={() => router.push('/alarm-sound')}
          className="min-h-[56px] flex-row items-center gap-3 rounded-[18px] bg-well px-4 active:opacity-70 dark:bg-well-dark">
          <Icon name="music" size={20} color={c.ink} />
          <Text variant="label" className="flex-1">{t('sounds.title')}</Text>
          <Text variant="small" tone="muted">{t(`sounds.${alarms.sound}`)}</Text>
          <Icon name="chevronRight" size={16} color="#B4B4AF" strokeWidth={2} flip={isRTL} />
        </Pressable>

        <View className="gap-2.5">
          <View className="flex-row items-center gap-3">
            <Icon name="late" size={20} color={c.ink} />
            <View className="flex-1">
              <Text variant="label">{t('settings.reminder')}</Text>
              <Text variant="tiny" tone="muted">{t('settings.reminderBody')}</Text>
            </View>
            <Switch accessibilityLabel={t('settings.reminder')} value={alarms.reminderEnabled} onValueChange={(reminderEnabled) => update({ reminderEnabled })} />
          </View>
          <View accessibilityRole="radiogroup" accessibilityLabel={t('settings.reminderMinutes')} className="flex-row flex-wrap gap-1.5 ps-8" style={{ opacity: alarms.reminderEnabled ? 1 : 0.4 }}>
            {REMINDER_MINUTE_OPTIONS.map((m) => {
              const on = alarms.reminderMinutes === m;
              return (
                <Pressable
                  key={m}
                  accessibilityRole="radio"
                  accessibilityState={{ selected: on }}
                  accessibilityLabel={t('settings.minutesBefore', { count: m })}
                  onPress={() => update({ reminderMinutes: m, reminderEnabled: true })}
                  className={`h-[34px] items-center justify-center rounded-full px-3 ${on ? 'bg-ink dark:bg-ink-dark' : 'bg-chip dark:bg-chip-dark'}`}>
                  <Text variant="caption" weight="semibold" tone={on ? 'inverse' : 'ink'}>{t('settings.minutesShort', { n: m })}</Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <View>
          {PRAYERS.map((p) => (
            <View key={p} className="min-h-[48px] flex-row items-center gap-3 border-t border-line dark:border-line-dark">
              <Icon name={PRAYER_ICON[p]} size={20} color={c.muted} />
              <Text variant="label" className="flex-1">{t(`prayers.${p}`)}</Text>
              {day ? <Text variant="caption" tone="faint" tabular>{formatWallShort(day.times[p].wall)}</Text> : null}
              <Switch accessibilityLabel={t('today.alarmFor', { prayer: t(`prayers.${p}`) })} value={alarms.prayers[p]} onValueChange={(on) => setPrayerAlarm(p, on)} />
            </View>
          ))}
        </View>

        <View className="flex-row gap-2">
          <Button variant="secondary" icon="bellRing" label={t('settings.testAlarm')} onPress={() => void testAlarm.send()} className="flex-1" />
          <Button variant="secondary" icon="list" label={t('settings.scheduledShort')} onPress={() => router.push('/scheduled-alarms')} className="flex-1" />
        </View>
        {testAlarm.state === 'sent' ? (
          <Text variant="caption" weight="semibold" tone="none" style={{ color: '#15803D' }} align="center">
            {t('settings.testAlarmSent')}
          </Text>
        ) : testAlarm.state === 'denied' ? (
          <Text variant="caption" tone="accent" align="center">{t('settings.notificationsBlocked')}</Text>
        ) : (
          <Text variant="tiny" tone="faint" align="center">
            {t('settings.testAlarmBody', { start: TEST_START_SECONDS, reminder: TEST_REMINDER_SECONDS })}
          </Text>
        )}
      </View>
    </Screen>
  );
}
