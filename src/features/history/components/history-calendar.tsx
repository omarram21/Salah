import { getCalendars } from 'expo-localization';
import { router } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, View } from 'react-native';

import { getPrayerWindow, PRAYERS, type DayIndex } from '@/features/prayer-times';
import {
  countsAsOnTime,
  DemoBanner,
  getTiming,
  selectRecords,
  selectTrackingSince,
  StatusCircle,
  StatusDot,
  useTrackingStore,
  type DayRecord,
} from '@/features/tracking';
import { currentLanguage, useDateFormat, useDirection, type Translations } from '@/shared/i18n';
import { parseDateKey, type DateKey, type MonthKey } from '@/shared/lib/date-key';
import { useThemeColors } from '@/shared/theme/use-theme-colors';
import { Icon, Screen, Text } from '@/shared/ui';

import { monthBounds, monthGrid, weekdayOrder } from '../logic/month-grid';

type Props = { index: DayIndex; now: number; today: DateKey };

const isPerfect = (day: DayRecord | undefined) => PRAYERS.every((p) => countsAsOnTime(day?.[p]?.status));

/** History as a month calendar with a selected-day panel (design H1). */
export function HistoryCalendar({ index, now, today }: Props) {
  const { t } = useTranslation();
  const fmt = useDateFormat();
  const { c } = useThemeColors();
  const { isRTL } = useDirection();
  const records = useTrackingStore(selectRecords);
  const trackingSince = useTrackingStore(selectTrackingSince);
  const bounds = monthBounds(trackingSince, today);
  const [month, setMonth] = useState<MonthKey>(bounds.last);
  const [selected, setSelected] = useState<DateKey>(today);
  const shownMonth = bounds.clamp(month);

  const firstWeekday = getCalendars()[0]?.firstWeekday ?? 1;
  const cells = monthGrid(shownMonth, firstWeekday);
  const tracked = (d: DateKey) => d <= today && (!trackingSince || d >= trackingSince);
  const monthDays = cells.filter((d): d is DateKey => !!d && tracked(d));
  const perfectCount = monthDays.filter((d) => isPerfect(records[d])).length;
  const count = (s: string) =>
    monthDays.reduce((n, d) => n + PRAYERS.filter((p) => records[d]?.[p]?.status === s).length, 0);

  const hijri = hijriSpan(index, shownMonth);
  const goto = (m: MonthKey) => {
    setMonth(m);
    // Keep a sensible selection: today in the current month, else the month's first tracked day.
    const firstTracked = monthGrid(m, firstWeekday).find((d): d is DateKey => !!d && tracked(d));
    setSelected(m === bounds.last ? today : (firstTracked ?? `${m}-01`));
  };

  return (
    <Screen
      title={fmt.monthName(shownMonth)}
      subtitle={`${parseDateKey(`${shownMonth}-01`).year}${hijri ? ` · ${hijri}` : ''}`}
      headerRight={
        <View className="flex-row gap-1">
          <MonthArrow label={t('history.prevMonth')} icon="chevronLeft" disabled={!bounds.canGoBack(shownMonth)} onPress={() => goto(bounds.prev(shownMonth))} flip={isRTL} />
          <MonthArrow label={t('history.nextMonth')} icon="chevronRight" disabled={!bounds.canGoForward(shownMonth)} onPress={() => goto(bounds.next(shownMonth))} flip={isRTL} />
        </View>
      }
      contentClassName="gap-3 px-5">
      <DemoBanner />
      <View className="flex-row flex-wrap gap-x-4 gap-y-1 px-1">
        <Summary icon="flame" color={c.accent} n={perfectCount} label={t('history.perfect')} />
        <Summary dot="bg-status-missed" n={count('missed')} label={t('history.missed')} />
        <Summary dot="bg-status-mosque" n={count('mosque')} label={t('history.mosque')} />
      </View>

      <View>
        <View className="flex-row" accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
          {weekdayOrder(firstWeekday).map((wd) => (
            <Text key={wd} variant="micro" tone="faint" align="center" className="flex-1">
              {t(`calendar.weekdaysShort.${String(wd) as keyof Translations['calendar']['weekdaysShort']}`)}
            </Text>
          ))}
        </View>
        <View className="mt-1 flex-row flex-wrap">
          {cells.map((date, i) =>
            date ? (
              <DayCell
                key={date}
                date={date}
                record={records[date]}
                today={today}
                selected={date === selected}
                enabled={tracked(date)}
                index={index}
                now={now}
                onPress={() => setSelected(date)}
              />
            ) : (
              <View key={`pad-${i}`} style={{ width: `${100 / 7}%` }} className="h-[58px]" />
            ),
          )}
        </View>
      </View>

      <SelectedDay date={selected} record={records[selected]} today={today} index={index} now={now} />
    </Screen>
  );
}

function DayCell({
  date,
  record,
  today,
  selected,
  enabled,
  index,
  now,
  onPress,
}: {
  date: DateKey;
  record: DayRecord | undefined;
  today: DateKey;
  selected: boolean;
  enabled: boolean;
  index: DayIndex;
  now: number;
  onPress: () => void;
}) {
  const { t } = useTranslation();
  const fmt = useDateFormat();
  const isToday = date === today;
  const perfect = isPerfect(record);
  const { day } = parseDateKey(date);
  const numTone = isToday ? 'inverse' : !enabled ? 'faint' : perfect ? 'accent' : 'ink';
  const aria = `${fmt.short(date)}: ${PRAYERS.map((p) => `${t(`prayers.${p}`)} ${t(`status.${record?.[p]?.status ?? 'unmarked'}`)}`).join(', ')}`;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={aria}
      accessibilityState={{ selected, disabled: !enabled }}
      disabled={!enabled}
      onPress={onPress}
      style={{ width: `${100 / 7}%` }}
      className={`h-[58px] items-center justify-center gap-1.5 rounded-[14px] ${selected ? 'bg-chip dark:bg-chip-dark' : ''}`}>
      <View className={`size-[26px] items-center justify-center rounded-full ${isToday ? 'bg-ink dark:bg-ink-dark' : ''}`}>
        <Text variant="small" weight={isToday || perfect ? 'bold' : 'medium'} tone={numTone} tabular>
          {String(day)}
        </Text>
      </View>
      <View className="h-[5px] flex-row gap-0.5">
        {enabled
          ? PRAYERS.map((p) => (
              <StatusDot
                key={p}
                size={5}
                status={record?.[p]?.status}
                upcoming={isToday && getTiming(getPrayerWindow(index, date, p), now, date, today) === 'upcoming'}
              />
            ))
          : null}
      </View>
    </Pressable>
  );
}

function SelectedDay({ date, record, today, index, now }: { date: DateKey; record: DayRecord | undefined; today: DateKey; index: DayIndex; now: number }) {
  const { t } = useTranslation();
  const fmt = useDateFormat();
  const { c } = useThemeColors();
  const { isRTL } = useDirection();
  const title = date === today ? `${t('history.today')}, ${fmt.long(date).replace(/\s\d{4}$/, '')}` : fmt.weekdayLong(date);
  return (
    <View className="gap-3 rounded-[20px] bg-well px-4 py-3.5 dark:bg-well-dark">
      <View className="flex-row items-center">
        <Text variant="label" weight="bold" className="flex-1">
          {title}
        </Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('history.editDay', { day: fmt.short(date) })}
          onPress={() => router.push({ pathname: '/day/[date]', params: { date } })}
          hitSlop={8}
          className="min-h-8 flex-row items-center gap-1 active:opacity-60">
          <Text variant="caption" weight="semibold">{t('history.edit')}</Text>
          <Icon name="chevronRight" size={16} color={c.ink} strokeWidth={2} flip={isRTL} />
        </Pressable>
      </View>
      <View className="flex-row justify-between">
        {PRAYERS.map((p) => {
          const upcoming = date === today && getTiming(getPrayerWindow(index, date, p), now, date, today) === 'upcoming';
          const status = record?.[p]?.status;
          return (
            <View key={p} className="items-center gap-1.5">
              {upcoming && !status ? (
                <View className="size-[34px] rounded-full border-2 border-[#D4D4CF] dark:border-[#3A3A3E]" accessibilityLabel={`${t(`prayers.${p}`)}: ${t('status.later')}`} />
              ) : (
                <StatusCircle size={34} status={status} accessibilityLabel={`${t(`prayers.${p}`)}: ${t(`status.${status ?? 'unmarked'}`)}`} />
              )}
              <Text variant="micro" tone="muted" weight="regular">{t(`prayers.${p}`)}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

function Summary({ n, label, icon, color, dot }: { n: number; label: string; icon?: 'flame'; color?: string; dot?: string }) {
  return (
    <View className="flex-row items-center gap-1.5">
      {icon && color ? <Icon name={icon} size={14} color={color} strokeWidth={2} /> : <View className={`size-2 rounded-full ${dot ?? ''}`} />}
      <Text variant="tiny" tone="muted">
        <Text variant="tiny" weight="bold">{`${n} `}</Text>
        {label}
      </Text>
    </View>
  );
}

function MonthArrow({ label, icon, disabled, onPress, flip }: { label: string; icon: 'chevronLeft' | 'chevronRight'; disabled: boolean; onPress: () => void; flip: boolean }) {
  const { c } = useThemeColors();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      className="size-11 items-center justify-center rounded-full bg-chip dark:bg-chip-dark">
      <Icon name={icon} size={18} color={disabled ? '#C9C9C4' : c.ink} strokeWidth={2} flip={flip} />
    </Pressable>
  );
}

/** "Rabi II – Jumada I 1448" from cached prayer days, when the month is cached. */
function hijriSpan(index: DayIndex, month: MonthKey): string | null {
  const lang = currentLanguage();
  const days = [...index.values()].filter((d) => d.date.startsWith(month));
  const first = days[0]?.hijri;
  const last = days.at(-1)?.hijri;
  if (!first || !last) return null;
  return first.month === last.month
    ? `${first.monthName[lang]} ${first.year}`
    : `${first.monthName[lang]} – ${last.monthName[lang]} ${last.year}`;
}
