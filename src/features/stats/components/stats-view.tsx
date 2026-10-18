import Ionicons from '@expo/vector-icons/Ionicons';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { PRAYERS, type DayIndex } from '@/features/prayer-times';
import { STATUS_STYLE } from '@/features/tracking';
import type { DateKey } from '@/shared/lib/date-key';
import { Card, SegmentedControl, Text } from '@/shared/ui';

import { useStats, type StatsPeriod } from '../hooks/use-stats';
import type { StatusCounts, StatusKey } from '../logic/counts';

const KEYS: StatusKey[] = ['onTime', 'late', 'missed', 'unmarked'];

type Props = { index: DayIndex; now: number; today: DateKey };

export function StatsView({ index, now, today }: Props) {
  const { t } = useTranslation();
  const [period, setPeriod] = useState<StatsPeriod>('week');
  const { summary, current, best } = useStats(period, index, now, today);

  return (
    <View className="gap-4">
      <SegmentedControl
        value={period}
        onChange={setPeriod}
        options={[
          { value: 'week', label: t('stats.thisWeek') },
          { value: 'month', label: t('stats.thisMonth') },
        ]}
      />

      <View className="flex-row flex-wrap gap-3">
        {KEYS.map((key) => (
          <Card key={key} className="min-w-[45%] flex-1 gap-1">
            <View className="flex-row items-center gap-2">
              <View className={`size-3 rounded-full ${STATUS_STYLE[key].bg}`} />
              <Text variant="muted">{t(`status.${key}Short`)}</Text>
            </View>
            <Text className="text-3xl font-bold tabular-nums">{summary.total[key]}</Text>
            <Text variant="muted">{percent(summary.total[key], summary.due)}</Text>
          </Card>
        ))}
      </View>

      <Card className="gap-3">
        <Text variant="heading">{t('stats.perPrayer')}</Text>
        {summary.due === 0 ? (
          <Text variant="muted">{t('stats.noData')}</Text>
        ) : (
          PRAYERS.map((p) => <PrayerBar key={p} label={t(`prayers.${p}`)} counts={summary.byPrayer[p]} />)
        )}
      </Card>

      <Card className="gap-3">
        <View className="flex-row items-center gap-2">
          <Ionicons name="flame" size={20} color="#F97316" />
          <Text variant="heading">{t('stats.streak')}</Text>
        </View>
        <Text variant="muted">{t('stats.streakBody')}</Text>
        <View className="flex-row gap-3">
          <StreakTile label={t('stats.currentStreak')} days={current} unit={t('stats.daysUnit')} />
          <StreakTile label={t('stats.bestStreak')} days={best} unit={t('stats.daysUnit')} />
        </View>
      </Card>
    </View>
  );
}

function PrayerBar({ label, counts }: { label: string; counts: StatusCounts }) {
  const { t } = useTranslation();
  const total = KEYS.reduce((n, k) => n + counts[k], 0);
  return (
    <View className="gap-1">
      <View className="flex-row justify-between">
        <Text className="font-medium">{label}</Text>
        <Text variant="muted" className="tabular-nums">
          {t('stats.ofTotal', { count: counts.onTime, total })}
        </Text>
      </View>
      <View className="h-2.5 flex-row overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
        {KEYS.map((k) =>
          counts[k] > 0 ? <View key={k} className={STATUS_STYLE[k].bg} style={{ flex: counts[k] }} /> : null,
        )}
      </View>
    </View>
  );
}

function StreakTile({ label, days, unit }: { label: string; days: number; unit: string }) {
  return (
    <View className="flex-1 rounded-xl bg-orange-50 p-3 dark:bg-orange-950">
      <Text variant="muted">{label}</Text>
      <View className="flex-row items-baseline gap-1">
        <Text className="text-3xl font-bold tabular-nums text-orange-600 dark:text-orange-400">{days}</Text>
        <Text variant="muted">{unit}</Text>
      </View>
    </View>
  );
}

function percent(n: number, total: number) {
  return total === 0 ? '—' : `${Math.round((n / total) * 100)}%`;
}
