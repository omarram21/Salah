import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Pressable, View } from 'react-native';

import { useLocationLabel, useLocationStore } from '@/features/location';
import type { HijriDate } from '@/features/prayer-times';
import { currentLanguage, useDateFormat } from '@/shared/i18n';
import type { DateKey } from '@/shared/lib/date-key';
import { useThemeColors } from '@/shared/theme/use-theme-colors';
import { Icon, Text } from '@/shared/ui';

/** Small icon row: Gregorian date · Hijri date · location (tap to change). */
export function TodayHeader({ date, hijri }: { date: DateKey; hijri: HijriDate | null }) {
  const { t } = useTranslation();
  const fmt = useDateFormat();
  const { c } = useThemeColors();
  const location = useLocationStore((s) => s.location);
  const label = useLocationLabel(location);
  const city = label?.split(/[,،]/)[0] ?? '';
  const lang = currentLanguage();

  return (
    <View className="flex-row flex-wrap items-center gap-x-3.5 gap-y-1 pt-3">
      <View className="flex-row items-center gap-1.5">
        <Icon name="calendar" size={15} color={c.muted} strokeWidth={2} />
        <Text variant="caption" tone="muted">{fmt.short(date)}</Text>
      </View>
      {hijri ? (
        <View className="flex-row items-center gap-1.5">
          <Icon name="crescent" size={15} color={c.muted} strokeWidth={2} />
          <Text variant="caption" tone="muted">{`${hijri.day} ${hijri.monthName[lang]}`}</Text>
        </View>
      ) : null}
      {city ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`${t('location.title')}: ${label}. ${t('location.change')}`}
          onPress={() => router.push('/location')}
          hitSlop={8}
          className="ms-auto min-h-8 flex-row items-center gap-1.5 active:opacity-60">
          <Icon name="pin" size={15} color={c.muted} strokeWidth={2} />
          <Text variant="caption" tone="muted">{city}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}
