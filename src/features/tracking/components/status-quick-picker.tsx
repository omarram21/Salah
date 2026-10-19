import { Pressable, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { useThemeColors } from '@/shared/theme/use-theme-colors';
import { Text } from '@/shared/ui';

import { STATUSES, type PrayerStatus } from '../logic/types';
import { STATUS_STYLE } from './status-style';
import { StatusIcon } from './status-icon';

type Props = {
  value?: PrayerStatus;
  onPick: (status: PrayerStatus) => void;
  /** Accessible name of the prayer, e.g. "Asr". */
  prayerLabel: string;
  /** "compact": icon-only row (Today). "large": 2×2 labeled tiles (day editor). */
  size?: 'compact' | 'large';
  disabled?: boolean;
};

/** The four statuses as tap targets; the selected one is filled with its color. */
export function StatusQuickPicker({ value, onPick, prayerLabel, size = 'compact', disabled }: Props) {
  const { t } = useTranslation();
  const { c } = useThemeColors();
  const large = size === 'large';
  return (
    <View className={large ? 'flex-row flex-wrap gap-2.5' : 'flex-row gap-2'}>
      {STATUSES.map((status) => {
        const selected = value === status;
        const color = STATUS_STYLE[status].color;
        return (
          <Pressable
            key={status}
            accessibilityRole="radio"
            accessibilityLabel={`${prayerLabel}: ${t(`status.${status}`)}`}
            accessibilityState={{ selected, disabled }}
            disabled={disabled}
            onPress={() => onPick(status)}
            style={large ? { width: '48%' } : undefined}
            className={`items-center justify-center active:opacity-70 ${
              large ? 'h-[92px] gap-2 rounded-[20px]' : 'h-12 flex-1 rounded-[14px]'
            } ${selected ? STATUS_STYLE[status].bg : 'bg-chip dark:bg-chip-dark'} ${disabled ? 'opacity-30' : ''}`}>
            <StatusIcon status={status} size={large ? 28 : 22} color={selected ? '#FFFFFF' : color} />
            {large ? (
              <Text variant="small" weight="semibold" tone="none" style={{ color: selected ? '#FFFFFF' : c.ink }}>
                {t(`status.${status}Short`)}
              </Text>
            ) : null}
          </Pressable>
        );
      })}
    </View>
  );
}
