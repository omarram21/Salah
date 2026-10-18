import Ionicons from '@expo/vector-icons/Ionicons';
import { useTranslation } from 'react-i18next';
import { Pressable, SectionList, View } from 'react-native';

import { PRAYERS } from '@/features/prayer-times';
import { StatusDot, STATUSES, useTrackingStore } from '@/features/tracking';
import { useDateFormat, useDirection } from '@/shared/i18n';
import type { DateKey } from '@/shared/lib/date-key';
import { Card, Text } from '@/shared/ui';

import { historySections } from '../logic/history-range';

const COL = 'w-12 items-center';

type Props = { today: DateKey; onSelectDay: (date: DateKey) => void };

export function HistoryList({ today, onSelectDay }: Props) {
  const { t } = useTranslation();
  const fmt = useDateFormat();
  const { isRTL } = useDirection();
  const records = useTrackingStore((s) => s.records);
  const trackingSince = useTrackingStore((s) => s.trackingSince);
  const sections = historySections(records, trackingSince, today);

  return (
    <SectionList
      sections={sections}
      keyExtractor={(d) => d}
      contentContainerClassName="gap-1 px-4 pb-10"
      stickySectionHeadersEnabled={false}
      ListHeaderComponent={
        <View className="gap-3 pb-2 pt-4">
          <Text variant="title">{t('tabs.history')}</Text>
          <Card className="flex-row flex-wrap gap-x-4 gap-y-2 py-3">
            {[...STATUSES, undefined].map((s) => (
              <View key={s ?? 'unmarked'} className="flex-row items-center gap-1.5">
                <StatusDot status={s} size="sm" />
                <Text variant="muted">{t(`status.${s ?? 'unmarked'}Short`)}</Text>
              </View>
            ))}
          </Card>
          <View className="flex-row items-center px-3">
            <View className="flex-1" />
            {PRAYERS.map((p) => (
              <View key={p} className={COL}>
                <Text numberOfLines={1} className="text-[11px] text-slate-500 dark:text-slate-400">
                  {t(`prayers.${p}`)}
                </Text>
              </View>
            ))}
            <View className="w-5" />
          </View>
        </View>
      }
      renderSectionHeader={({ section }) => (
        <Text variant="heading" className="mb-1 mt-4">
          {fmt.monthYear(`${section.month}-01`)}
        </Text>
      )}
      renderItem={({ item: date }) => {
        const day = records[date];
        const label = date === today ? t('history.today') : fmt.short(date);
        return (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`${label}: ${PRAYERS.map(
              (p) => `${t(`prayers.${p}`)} ${t(`status.${day?.[p]?.status ?? 'unmarked'}`)}`,
            ).join(', ')}`}
            onPress={() => onSelectDay(date)}
            className="flex-row items-center rounded-xl border border-slate-200 bg-white px-3 py-3 active:opacity-70 dark:border-slate-800 dark:bg-slate-900">
            <Text numberOfLines={1} className={`flex-1 ${date === today ? 'font-bold' : 'font-medium'}`}>
              {label}
            </Text>
            {PRAYERS.map((p) => (
              <View key={p} className={COL}>
                <StatusDot status={day?.[p]?.status} />
              </View>
            ))}
            <Ionicons
              name="chevron-forward"
              size={16}
              color="#94A3B8"
              style={{ width: 20, transform: [{ scaleX: isRTL ? -1 : 1 }] }}
            />
          </Pressable>
        );
      }}
      ListFooterComponent={
        Object.keys(records).length === 0 ? (
          <Text variant="muted" align="center" className="mt-6">
            {t('history.empty')}
          </Text>
        ) : null
      }
    />
  );
}
