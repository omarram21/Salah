import { useTranslation } from 'react-i18next';
import { Pressable, View } from 'react-native';

import { PRAYER_ICON, PRAYERS, useToday, type PrayerName } from '@/features/prayer-times';
import { currentLanguage } from '@/shared/i18n';
import { formatWallShort } from '@/shared/lib/format';
import { useThemeColors } from '@/shared/theme/use-theme-colors';
import { Button, Card, Icon, Screen, SegmentedControl, Text } from '@/shared/ui';

import { useSettingsStore } from '../store/settings-store';

const wallAt = (ms: number, offsetMin: number) => {
  const d = new Date(ms + offsetMin * 60_000);
  return `${String(d.getUTCHours()).padStart(2, '0')}:${String(d.getUTCMinutes()).padStart(2, '0')}`;
};
const signed = (n: number) => (n > 0 ? `+${n}` : String(n));

/** Corrections on top of AlAdhan's times: per-prayer minutes, Isha's end, Hijri date. */
export function AdjustTimesView() {
  const { t } = useTranslation();
  const lang = currentLanguage();
  const s = useSettingsStore();
  // Today's times already include the adjustments, so the preview is exactly what the app uses.
  const { day } = useToday(60_000);

  return (
    <Screen back title={t('adjust.title')} subtitle={t('adjust.subtitle')}>
      <Card className="gap-0 px-3.5 py-1">
        {PRAYERS.map((p, i) => (
          <OffsetRow
            key={p}
            prayer={p}
            value={s.timeOffsets[p]}
            time={day ? formatWallShort(day.times[p].wall) : null}
            onChange={(m) => s.setTimeOffset(p, m)}
            last={i === PRAYERS.length - 1}
          />
        ))}
      </Card>

      <View className="gap-2.5">
        <Text variant="label">{t('adjust.ishaEnds')}</Text>
        <SegmentedControl
          value={s.ishaEnd}
          onChange={s.setIshaEnd}
          accessibilityLabel={t('adjust.ishaEnds')}
          options={[
            { value: 'fajr', label: t('adjust.ishaEndsFajr') },
            { value: 'midnight', label: t('adjust.ishaEndsMidnight') },
          ]}
        />
        <Text variant="caption" tone="muted">
          {s.ishaEnd === 'midnight' && day?.ishaEndsAt
            ? t('adjust.ishaEndsMidnightBody', { time: formatWallShort(wallAt(day.ishaEndsAt, day.utcOffsetMin)) })
            : t('adjust.ishaEndsFajrBody')}
        </Text>
      </View>

      <View className="gap-2.5">
        <Text variant="label">{t('adjust.hijri')}</Text>
        <View className="flex-row items-center gap-3">
          <Stepper value={s.hijriOffset} min={-2} max={2} onChange={s.setHijriOffset} unit={t('adjust.daysShort')} label={t('adjust.hijri')} />
          {day ? (
            <Text variant="small" tone="muted" className="flex-1">{`${day.hijri.day} ${day.hijri.monthName[lang]} ${day.hijri.year}`}</Text>
          ) : null}
        </View>
        <Text variant="caption" tone="muted">{t('adjust.hijriBody')}</Text>
      </View>

      <Button variant="secondary" icon="trash" label={t('adjust.reset')} onPress={s.resetTimeAdjust} />
      <Text variant="tiny" tone="faint" align="center">{t('adjust.footnote')}</Text>
    </Screen>
  );
}

function OffsetRow({ prayer, value, time, onChange, last }: { prayer: PrayerName; value: number; time: string | null; onChange: (m: number) => void; last: boolean }) {
  const { t } = useTranslation();
  const { c } = useThemeColors();
  return (
    <View className={`min-h-[60px] flex-row items-center gap-3 ${last ? '' : 'border-b border-[#ECECE8] dark:border-line-dark'}`}>
      <Icon name={PRAYER_ICON[prayer]} size={20} color={c.muted} />
      <View className="flex-1">
        <Text variant="label">{t(`prayers.${prayer}`)}</Text>
        {time ? <Text variant="tiny" tone={value ? 'accent' : 'faint'} tabular>{value ? t('adjust.timeAdjusted', { time, n: signed(value) }) : time}</Text> : null}
      </View>
      <Stepper value={value} min={-30} max={30} onChange={onChange} unit={t('adjust.minShort')} label={t(`prayers.${prayer}`)} />
    </View>
  );
}

function Stepper({ value, min, max, onChange, unit, label }: { value: number; min: number; max: number; onChange: (v: number) => void; unit: string; label: string }) {
  const { t } = useTranslation();
  const { c } = useThemeColors();
  const btn = 'size-9 items-center justify-center rounded-full bg-paper active:opacity-60 dark:bg-paper-dark';
  return (
    <View
      accessible
      accessibilityRole="adjustable"
      accessibilityLabel={label}
      accessibilityValue={{ text: `${signed(value)} ${unit}` }}
      accessibilityActions={[{ name: 'increment' }, { name: 'decrement' }]}
      onAccessibilityAction={(e) => onChange(Math.max(min, Math.min(max, value + (e.nativeEvent.actionName === 'increment' ? 1 : -1))))}
      className="flex-row items-center gap-1 rounded-full bg-chip p-1 dark:bg-chip-dark">
      <Pressable accessibilityLabel={t('adjust.decrease', { label })} disabled={value <= min} onPress={() => onChange(value - 1)} className={`${btn} ${value <= min ? 'opacity-30' : ''}`}>
        <Text variant="heading" style={{ lineHeight: 22, color: c.ink }}>−</Text>
      </Pressable>
      <Text variant="small" weight="semibold" tabular align="center" style={{ minWidth: 48 }}>{value === 0 ? '0' : `${signed(value)} ${unit}`}</Text>
      <Pressable accessibilityLabel={t('adjust.increase', { label })} disabled={value >= max} onPress={() => onChange(value + 1)} className={`${btn} ${value >= max ? 'opacity-30' : ''}`}>
        <Text variant="heading" style={{ lineHeight: 22, color: c.ink }}>+</Text>
      </Pressable>
    </View>
  );
}
