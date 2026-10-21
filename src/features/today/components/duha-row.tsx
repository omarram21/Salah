import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import type { PrayerDay } from '@/features/prayer-times';
import { useSettingsStore } from '@/features/settings';
import { SunnahChips } from '@/features/tracking';
import { formatWallShort } from '@/shared/lib/format';
import { useThemeColors } from '@/shared/theme/use-theme-colors';
import { Icon, Text } from '@/shared/ui';

/** Optional Duha row between sunrise and Dhuhr (shown only when Duha is tracked). */
export function DuhaRow({ day, now }: { day: PrayerDay; now: number }) {
  const { t } = useTranslation();
  const { c } = useThemeColors();
  const on = useSettingsStore((s) => s.sunnahEnabled && s.sunnahItems.duha);
  if (!on) return null;
  const started = now >= day.times.sunrise.at;
  return (
    <View className="min-h-[56px] flex-row items-center gap-3.5 border-b border-line py-2 dark:border-line-dark">
      <Icon name="sunrise" color={c.muted} />
      <View className="flex-1">
        <Text variant="body" weight="semibold" tone={started ? 'ink' : 'muted'}>{t('sunnah.duhaRow')}</Text>
        <Text variant="tiny" tone="faint" tabular>{`${t('sunnah.duhaTime')} ${formatWallShort(day.times.sunrise.wall)}`}</Text>
      </View>
      <SunnahChips date={day.date} prayer="duha" disabled={!started} />
    </View>
  );
}
