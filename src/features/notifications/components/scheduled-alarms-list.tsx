import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { useDateFormat } from '@/shared/i18n';
import { dateKeyAt, deviceUtcOffsetMin } from '@/shared/lib/date-key';
import { formatWallTime } from '@/shared/lib/format';
import { useThemeColors } from '@/shared/theme/use-theme-colors';
import { Icon, Screen, Text } from '@/shared/ui';

import { listScheduledAlarms, type ScheduledAlarm } from '../services/notification-service';

/** Debug view of what iOS/Android will actually fire, in device time. */
export function ScheduledAlarmsList() {
  const { t } = useTranslation();
  const fmt = useDateFormat();
  const { c } = useThemeColors();
  const [alarms, setAlarms] = useState<ScheduledAlarm[] | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    setRefreshing(true);
    setAlarms(await listScheduledAlarms());
    setRefreshing(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );

  const when = (at: number) => {
    const d = new Date(at);
    const wall = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
    return `${fmt.short(dateKeyAt(at, deviceUtcOffsetMin(at)))} · ${formatWallTime(wall, { am: t('common.am'), pm: t('common.pm') })}`;
  };

  return (
    <Screen
      back
      title={t('settings.scheduledAlarms')}
      subtitle={alarms ? t('settings.scheduledCount', { n: alarms.length }) : undefined}
      refreshing={refreshing}
      onRefresh={load}>
      {alarms && alarms.length === 0 ? (
        <Text variant="caption" tone="muted" align="center" className="mt-8">{t('settings.scheduledAlarmsEmpty')}</Text>
      ) : null}
      {(alarms ?? []).map((a) => (
        <View key={a.id} className={`flex-row gap-3 rounded-[18px] p-3.5 ${a.isTest ? 'bg-accent-soft dark:bg-accent-soft-dark' : 'bg-well dark:bg-well-dark'}`}>
          <Icon name={a.isTest ? 'flask' : 'bell'} size={18} color={a.isTest ? c.accent : c.muted} />
          <View className="flex-1 gap-0.5">
            <View className="flex-row items-baseline justify-between gap-2">
              <Text variant="label" className="flex-1" numberOfLines={1}>{a.title}</Text>
              {a.at ? <Text variant="tiny" tone="muted" tabular>{when(a.at)}</Text> : null}
            </View>
            <Text variant="caption" tone="muted">{a.body}</Text>
          </View>
        </View>
      ))}
    </Screen>
  );
}
