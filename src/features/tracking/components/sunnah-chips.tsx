import type { TFunction } from 'i18next';
import { useTranslation } from 'react-i18next';
import { Pressable, View } from 'react-native';

import type { PrayerName } from '@/features/prayer-times';
import { useSettingsStore } from '@/features/settings';
import type { DateKey } from '@/shared/lib/date-key';
import { useThemeColors } from '@/shared/theme/use-theme-colors';
import { Icon, Text } from '@/shared/ui';

import { SUNNAH, sunnahFor, type SunnahDef } from '../logic/sunnah';
import { selectExtras, useTrackingStore } from '../store/tracking-store';

type Props = {
  date: DateKey;
  /** Extras shown with this prayer; `'duha'` for the Duha row. */
  prayer: PrayerName | 'duha';
  /** Add Duha to this group (the day editor shows it on the Dhuhr step). */
  withDuha?: boolean;
  /** Before the prayer has started, its extras can't be marked yet. */
  disabled?: boolean;
  size?: 'small' | 'large';
};

/** Tap-to-toggle chips for the sunnah / Witr / Duha that go with a prayer. */
export function SunnahChips({ date, prayer, withDuha, disabled, size = 'small' }: Props) {
  const { t } = useTranslation();
  const enabled = useSettingsStore((s) => s.sunnahEnabled);
  const items = useSettingsStore((s) => s.sunnahItems);
  const extras = useTrackingStore((s) => selectExtras(s)[date]);
  const setExtra = useTrackingStore((s) => s.setExtra);
  if (!enabled) return null;

  const defs: SunnahDef[] =
    prayer === 'duha' ? (items.duha ? [SUNNAH.duha] : []) : [...(withDuha && items.duha ? [SUNNAH.duha] : []), ...sunnahFor(prayer, items)];
  if (defs.length === 0) return null;

  return (
    <View className={`flex-row flex-wrap ${size === 'large' ? 'gap-2' : 'gap-1.5'}`}>
      {defs.map((def) => (
        <Chip
          key={def.id}
          def={def}
          done={!!extras?.[def.id]}
          disabled={disabled}
          large={size === 'large'}
          label={chipLabel(def, t)}
          a11y={t(`sunnah.names.${def.id}`)}
          onToggle={(on) => setExtra(date, def.id, on)}
        />
      ))}
    </View>
  );
}

function chipLabel(def: SunnahDef, t: TFunction) {
  if (def.placement === 'witr') return t('sunnah.witr');
  if (def.placement === 'duha') return t('sunnah.duha');
  return t(def.placement === 'before' ? 'sunnah.before' : 'sunnah.after', { n: def.rakahs });
}

function Chip({
  def,
  done,
  disabled,
  large,
  label,
  a11y,
  onToggle,
}: {
  def: SunnahDef;
  done: boolean;
  disabled?: boolean;
  large: boolean;
  label: string;
  a11y: string;
  onToggle: (on: boolean) => void;
}) {
  const { c, isDark } = useThemeColors();
  const fg = done ? (isDark ? c.paper : '#FFFFFF') : c.muted;
  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityLabel={a11y}
      accessibilityState={{ checked: done, disabled }}
      disabled={disabled}
      onPress={() => onToggle(!done)}
      hitSlop={4}
      className={`flex-row items-center rounded-full active:opacity-70 ${large ? 'h-10 gap-1.5 px-3.5' : 'h-7 gap-1 px-2.5'} ${
        done ? 'bg-ink dark:bg-ink-dark' : 'border border-line bg-paper dark:border-line-dark dark:bg-paper-dark'
      } ${disabled ? 'opacity-35' : ''}`}>
      <Icon name={done ? 'check' : def.placement === 'witr' ? 'isha' : def.placement === 'duha' ? 'sunrise' : 'unmarked'} size={large ? 16 : 13} color={fg} strokeWidth={2.2} />
      <Text variant={large ? 'small' : 'tiny'} weight="semibold" tone="none" style={{ color: done ? fg : c.ink }}>
        {label}
      </Text>
    </Pressable>
  );
}
