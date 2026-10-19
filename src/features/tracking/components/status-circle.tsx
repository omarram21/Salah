import { Pressable, View } from 'react-native';

import { useThemeColors } from '@/shared/theme/use-theme-colors';
import { Icon } from '@/shared/ui';

import type { PrayerStatus } from '../logic/types';
import { STATUS_STYLE } from './status-style';
import { StatusIcon } from './status-icon';

type Props = {
  status: PrayerStatus | undefined;
  size?: number;
  onPress?: () => void;
  onLongPress?: () => void;
  accessibilityLabel: string;
  accessibilityHint?: string;
};

/** Round status marker: filled with the status color, or an outlined "?" when not marked. */
export function StatusCircle({ status, size = 44, onPress, onLongPress, accessibilityLabel, accessibilityHint }: Props) {
  const { c } = useThemeColors();
  const iconSize = Math.round(size * 0.45);
  const body = status ? (
    <View
      style={{ width: size, height: size, borderRadius: size / 2 }}
      className={`items-center justify-center ${STATUS_STYLE[status].bg}`}>
      <StatusIcon status={status} size={iconSize} />
    </View>
  ) : (
    <View
      style={{ width: size, height: size, borderRadius: size / 2 }}
      className="items-center justify-center border-2 border-[#D4D4CF] dark:border-[#3A3A3E]">
      <Icon name="help" size={iconSize} color={c.faint} strokeWidth={2.2} />
    </View>
  );
  if (!onPress) {
    return (
      <View accessibilityRole="image" accessibilityLabel={accessibilityLabel}>
        {body}
      </View>
    );
  }
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={accessibilityHint}
      onPress={onPress}
      onLongPress={onLongPress}
      hitSlop={6}
      className="active:opacity-70">
      {body}
    </Pressable>
  );
}

export { STATUS_STYLE };
