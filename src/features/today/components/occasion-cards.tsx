import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { fastPhase, type Eid } from '@/features/occasions';
import type { DayIndex, PrayerDay } from '@/features/prayer-times';
import { ToggleChip } from '@/features/tracking';
import type { DateKey } from '@/shared/lib/date-key';
import { formatCountdown, formatWallTime } from '@/shared/lib/format';
import { useThemeColors } from '@/shared/theme/use-theme-colors';
import { Icon, Text } from '@/shared/ui';

/** Friday: Jumu'ah time and the Al-Kahf check. */
export function FridayCard({ day, jumuah }: { day: PrayerDay; jumuah: boolean }) {
  const { t } = useTranslation();
  const { c } = useThemeColors();
  const time = formatWallTime(day.times.dhuhr.wall, { am: t('common.am'), pm: t('common.pm') });
  return (
    <View className="mt-4 gap-3 rounded-[20px] bg-well p-4 dark:bg-well-dark">
      <View className="flex-row items-center gap-2.5">
        <Icon name="mosque" size={20} color={c.accent} />
        <View className="flex-1">
          <Text variant="label">{t('occasions.jumuahMubarak')}</Text>
          <Text variant="tiny" tone="muted" tabular>
            {jumuah ? t('occasions.jumuahAt', { time }) : t('occasions.kahfUntil')}
          </Text>
        </View>
      </View>
      <View className="flex-row">
        <ToggleChip date={day.date} id="kahf" icon="list" label={t('occasions.kahf')} a11y={t('occasions.kahfName')} />
      </View>
    </View>
  );
}

/** Ramadan: day number, Suhoor / Iftar countdown and today's fast. */
export function RamadanCard({
  index,
  now,
  today,
  isRamadan,
  preview,
}: {
  index: DayIndex;
  now: number;
  today: DateKey;
  isRamadan: (date: DateKey) => boolean;
  preview: boolean;
}) {
  const { t } = useTranslation();
  const { c } = useThemeColors();
  const phase = fastPhase(index, now, today, isRamadan);
  if (!phase) return null;
  const day = index.get(phase.date);
  if (!day) return null;
  const labels = { am: t('common.am'), pm: t('common.pm') };
  const fajr = formatWallTime(day.times.fajr.wall, labels);
  const maghrib = formatWallTime(day.times.maghrib.wall, labels);
  const lead = phase.phase === 'iftar' ? t('occasions.iftarIn') : t('occasions.suhoorEndsIn');
  const countdown = formatCountdown(phase.at - now);
  // The fast being kept now (or the one that just ended, after Maghrib).
  const fastDate = isRamadan(today) ? today : null;

  return (
    <View className="mt-4 gap-3 rounded-[20px] bg-ink p-4 dark:bg-well-dark">
      <View className="flex-row items-center gap-2">
        <Icon name="crescent" size={18} color={c.accent} />
        <Text variant="tiny" weight="semibold" tone="none" style={{ color: '#FFFFFFB3', letterSpacing: 0.7 }} className="flex-1">
          {t('occasions.ramadanDay', { n: preview && day.hijri.month !== 9 ? 1 : day.hijri.day }).toUpperCase()}
        </Text>
        {preview ? (
          <View className="rounded-full bg-accent px-2 py-0.5">
            <Text variant="micro" weight="semibold" tone="inverse">{t('occasions.preview')}</Text>
          </View>
        ) : null}
      </View>
      <View accessible accessibilityLabel={`${lead} ${countdown}`}>
        <Text variant="caption" tone="none" style={{ color: '#FFFFFFB3' }}>{lead}</Text>
        <Text variant="display" tone="none" tabular style={{ color: '#FFFFFF', fontSize: 40, lineHeight: 44 }}>{countdown}</Text>
      </View>
      <View className="flex-row gap-4">
        <Text variant="tiny" tone="none" tabular style={{ color: phase.phase === 'suhoor' ? c.accent : '#FFFFFFB3' }}>
          {t('occasions.suhoorAt', { time: fajr })}
        </Text>
        <Text variant="tiny" tone="none" tabular style={{ color: phase.phase === 'iftar' ? c.accent : '#FFFFFFB3' }}>
          {t('occasions.iftarAt', { time: maghrib })}
        </Text>
      </View>
      {fastDate ? (
        <View className="flex-row">
          <ToggleChip date={fastDate} id="fast" icon="crescent" label={t('occasions.fasting')} a11y={t('occasions.fastName')} />
        </View>
      ) : null}
    </View>
  );
}

export function EidCard({ eid }: { eid: Eid }) {
  const { t } = useTranslation();
  const { c } = useThemeColors();
  return (
    <View className="mt-4 flex-row items-center gap-3 rounded-[20px] bg-accent-soft p-4 dark:bg-accent-soft-dark">
      <Icon name="crescent" size={24} color={c.accent} />
      <View className="flex-1">
        <Text variant="label" tone="accent">{eid === 'fitr' ? t('occasions.eidFitr') : t('occasions.eidAdha')}</Text>
        <Text variant="tiny" tone="accent">{t('occasions.eidBody')}</Text>
      </View>
    </View>
  );
}
