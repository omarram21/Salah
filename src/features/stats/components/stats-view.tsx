import { getCalendars } from 'expo-localization';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { PRAYER_ICON, PRAYERS, type DayIndex } from '@/features/prayer-times';
import { DemoBanner, STATUS_STYLE, STATUSES, StatusIcon } from '@/features/tracking';
import { useDateFormat } from '@/shared/i18n';
import type { DateKey } from '@/shared/lib/date-key';
import { useThemeColors } from '@/shared/theme/use-theme-colors';
import { Icon, Screen, SegmentedControl, Text } from '@/shared/ui';

import { useStats, type StatsPeriod } from '../hooks/use-stats';
import { onTimeCount, type StatusCounts, type StatusKey } from '../logic/counts';
import { prayerInsight } from '../logic/insights';
import { weekStart } from '../logic/ranges';

const KEYS: StatusKey[] = [...STATUSES, 'unmarked'];
const TILE_BG: Record<StatusKey, string> = {
  mosque: 'bg-[#EFF4FF] dark:bg-[#16203A]',
  onTime: 'bg-[#ECFBF1] dark:bg-[#11261A]',
  late: 'bg-[#FEF6E7] dark:bg-[#2A2010]',
  missed: 'bg-[#FDEEEE] dark:bg-[#2A1414]',
  unmarked: 'bg-chip dark:bg-chip-dark',
};

type Props = { index: DayIndex; now: number; today: DateKey };

/** Stats tab (design E): on-time %, status counts, per-prayer bars, streaks, one insight. */
export function StatsView({ index, now, today }: Props) {
  const { t } = useTranslation();
  const fmt = useDateFormat();
  const { c } = useThemeColors();
  const [period, setPeriod] = useState<StatsPeriod>('week');
  const { summary, current, best } = useStats(period, index, now, today);
  const pct = summary.due ? Math.round((onTimeCount(summary.total) / summary.due) * 100) : null;
  const insight = prayerInsight(summary);
  const range =
    period === 'week'
      ? `${fmt.short(weekStart(today, getCalendars()[0]?.firstWeekday ?? 1))} – ${fmt.short(today)}`
      : fmt.monthYear(today);

  return (
    <Screen
      title={t('tabs.stats')}
      subtitle={range}
      headerRight={
        <SegmentedControl
          size="fit"
          value={period}
          onChange={setPeriod}
          accessibilityLabel={t('stats.period')}
          options={[
            { value: 'week', label: t('stats.week') },
            { value: 'month', label: t('stats.month') },
          ]}
        />
      }>
      <DemoBanner />
      <View className="flex-row items-end gap-3 pt-2">
        <Text variant="hero" tabular>{pct === null ? '—' : `${pct}%`}</Text>
        <View className="pb-1.5">
          <Text variant="label">{t('stats.onTimeShort')}</Text>
          <Text variant="caption" tone="muted">
            {t('stats.ofTotalMosque', { count: onTimeCount(summary.total), total: summary.due })}
          </Text>
        </View>
      </View>

      <StackBar counts={summary.total} height={10} />

      <View className="flex-row justify-between">
        {KEYS.map((k) => (
          <View key={k} className="flex-1 items-center gap-1" accessible accessibilityLabel={`${t(`status.${k}Short`)}: ${summary.total[k]}`}>
            <View className={`size-9 items-center justify-center rounded-full ${TILE_BG[k]}`}>
              <StatusIcon status={k} size={18} color={STATUS_STYLE[k].color} />
            </View>
            <Text variant="heading" tabular>{String(summary.total[k])}</Text>
            <Text variant="micro" tone="muted" weight="regular">{t(`status.${k}Short`)}</Text>
          </View>
        ))}
      </View>

      <View className="gap-3 pt-2">
        <Text variant="tiny" weight="semibold" tone="faint" style={{ letterSpacing: 0.7 }}>{t('stats.perPrayer')}</Text>
        {summary.due === 0 ? (
          <Text variant="caption" tone="muted">{t('stats.noData')}</Text>
        ) : (
          PRAYERS.map((p) => {
            const counts = summary.byPrayer[p];
            const due = KEYS.reduce((n, k) => n + counts[k], 0);
            return (
              <View key={p} className="flex-row items-center gap-2.5" accessible accessibilityLabel={`${t(`prayers.${p}`)}: ${onTimeCount(counts)}/${due}`}>
                <Icon name={PRAYER_ICON[p]} size={18} color={c.muted} />
                <Text variant="small" weight="semibold" className="w-[70px]">{t(`prayers.${p}`)}</Text>
                <View className="flex-1">
                  <StackBar counts={counts} height={8} />
                </View>
                <Text variant="caption" tone="muted" tabular className="w-11" align="end">{`${onTimeCount(counts)}/${due}`}</Text>
              </View>
            );
          })
        )}
      </View>

      <View className="flex-row gap-2.5 pt-2">
        <View className="flex-1 flex-row items-center gap-2.5 rounded-[18px] bg-accent-soft p-3.5 dark:bg-accent-soft-dark">
          <Icon name="flame" size={26} color={c.accent} />
          <View>
            <Text variant="heading" tone="accent" style={{ fontSize: 22, lineHeight: 26 }}>{t('stats.days', { n: current })}</Text>
            <Text variant="tiny" tone="accent" weight="medium">{t('stats.currentStreak')}</Text>
          </View>
        </View>
        <View className="flex-1 flex-row items-center gap-2.5 rounded-[18px] bg-chip p-3.5 dark:bg-chip-dark">
          <Icon name="trophy" size={26} color={c.ink} />
          <View>
            <Text variant="heading" style={{ fontSize: 22, lineHeight: 26 }}>{t('stats.days', { n: best })}</Text>
            <Text variant="tiny" tone="muted" weight="medium">{t('stats.bestStreak')}</Text>
          </View>
        </View>
      </View>

      {insight.weakest || insight.strongest ? (
        <View className="flex-row items-center gap-2">
          <Icon name={PRAYER_ICON[insight.weakest ?? insight.strongest ?? 'fajr']} size={16} color={STATUS_STYLE.late.color} strokeWidth={2} />
          <Text variant="caption" tone="muted" className="flex-1">
            {[
              insight.strongest ? t('stats.strongest', { prayer: t(`prayers.${insight.strongest}`) }) : null,
              insight.weakest ? t('stats.weakest', { prayer: t(`prayers.${insight.weakest}`) }) : null,
            ]
              .filter(Boolean)
              .join(' · ')}
          </Text>
        </View>
      ) : null}
    </Screen>
  );
}

function StackBar({ counts, height }: { counts: StatusCounts; height: number }) {
  return (
    <View style={{ height, borderRadius: height / 2 }} className="flex-row overflow-hidden bg-chip dark:bg-chip-dark" accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      {KEYS.map((k) =>
        counts[k] > 0 ? <View key={k} className={k === 'unmarked' ? 'bg-status-unmarked dark:bg-[#3A3A3E]' : STATUS_STYLE[k].bg} style={{ flex: counts[k] }} /> : null,
      )}
    </View>
  );
}
