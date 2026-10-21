import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

import { PRAYER_ICON, type DayIndex, type UpcomingPrayer } from '@/features/prayer-times';
import { formatCountdown, formatWallTime } from '@/shared/lib/format';
import { useThemeColors } from '@/shared/theme/use-theme-colors';
import { Icon, Text } from '@/shared/ui';

type Props = {
  now: number;
  index: DayIndex;
  next: UpcomingPrayer | null;
  /** Display name of the next prayer ("Jumu'ah" on Friday). */
  nextName: string;
  /** Prayers done today (any "prayed" status) out of five. */
  done: number;
  streak: number;
};

/** Next prayer, big countdown, today's ring and the streak (design E). */
export function TodayHero({ now, index, next, nextName, done, streak }: Props) {
  const { t } = useTranslation();
  const { c } = useThemeColors();
  const labels = { am: t('common.am'), pm: t('common.pm') };

  return (
    <View className="gap-1.5 pt-8">
      {next ? (
        <>
          <View className="flex-row items-center gap-2.5">
            <Icon name={PRAYER_ICON[next.prayer]} size={28} color={c.accent} />
            <Text variant="heading" tone="accent" weight="semibold">
              {`${nextName} · ${formatWallTime(index.get(next.date)?.times[next.prayer].wall ?? '', labels)}`}
            </Text>
          </View>
          <Text
            variant="hero"
            tabular
            accessibilityLabel={t('today.nextPrayerIn', { prayer: nextName, time: formatCountdown(next.at - now) })}>
            {formatCountdown(next.at - now)}
          </Text>
        </>
      ) : (
        <Text variant="body" tone="muted">{t('today.noUpcoming')}</Text>
      )}
      <View className="mt-2.5 flex-row items-center gap-4">
        <View className="flex-row items-center gap-2">
          <Ring value={done / 5} track={c.line} color={c.accent} />
          <Text variant="small" weight="semibold">{t('today.doneOfFive', { n: done })}</Text>
        </View>
        {streak > 0 ? (
          <View className="flex-row items-center gap-1.5">
            <Icon name="flame" size={18} color={c.accent} strokeWidth={2} />
            <Text variant="small" weight="semibold" tone="accent">{t('today.streak', { n: streak })}</Text>
          </View>
        ) : null}
      </View>
    </View>
  );
}

function Ring({ value, track, color }: { value: number; track: string; color: string }) {
  const r = 32;
  const len = 2 * Math.PI * r;
  return (
    <Svg width={28} height={28} viewBox="0 0 84 84" accessibilityElementsHidden importantForAccessibility="no">
      <Circle cx={42} cy={42} r={r} fill="none" stroke={track} strokeWidth={12} />
      {value > 0 ? (
        <Circle
          cx={42}
          cy={42}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={12}
          strokeLinecap="round"
          strokeDasharray={`${(len * Math.min(1, value)).toFixed(1)} ${len.toFixed(1)}`}
          transform="rotate(-90 42 42)"
        />
      ) : null}
    </Svg>
  );
}
