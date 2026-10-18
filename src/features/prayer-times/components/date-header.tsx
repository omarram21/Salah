import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { currentLanguage, useDateFormat } from '@/shared/i18n';
import type { DateKey } from '@/shared/lib/date-key';
import { Text } from '@/shared/ui';

import type { HijriDate } from '../model/types';

type Props = { date: DateKey; hijri: HijriDate | null };

export function DateHeader({ date, hijri }: Props) {
  const { t } = useTranslation();
  const fmt = useDateFormat();
  const lang = currentLanguage();

  return (
    <View className="gap-1">
      <Text variant="title">{fmt.weekday(date)}</Text>
      <Text variant="body">{fmt.long(date)}</Text>
      {hijri ? (
        <Text variant="muted">
          {hijri.day} {hijri.monthName[lang]} {hijri.year} {t('calendar.hijriSuffix')}
        </Text>
      ) : null}
    </View>
  );
}
