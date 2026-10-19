import { Pressable, View } from 'react-native';

import { useThemeColors } from '@/shared/theme/use-theme-colors';
import { Icon, Text } from '@/shared/ui';

export type Option<T> = { value: T; label: string; detail?: string };

/** Single-choice list with a check on the selected row. */
export function OptionList<T extends string | number>({
  options,
  value,
  onSelect,
}: {
  options: readonly Option<T>[];
  value: T;
  onSelect: (value: T) => void;
}) {
  const { c } = useThemeColors();
  return (
    <View accessibilityRole="radiogroup" className="gap-2">
      {options.map((o) => {
        const selected = o.value === value;
        return (
          <Pressable
            key={String(o.value)}
            accessibilityRole="radio"
            accessibilityState={{ selected }}
            onPress={() => onSelect(o.value)}
            className={`min-h-[58px] flex-row items-center gap-3 rounded-[18px] px-4 py-3 active:opacity-70 ${
              selected ? 'border-2 border-ink bg-paper dark:border-ink-dark dark:bg-paper-dark' : 'bg-chip dark:bg-chip-dark'
            }`}>
            <View className="flex-1 gap-0.5">
              <Text variant="label" weight={selected ? 'bold' : 'semibold'}>{o.label}</Text>
              {o.detail ? <Text variant="caption" tone="muted">{o.detail}</Text> : null}
            </View>
            {selected ? <Icon name="check" size={20} color={c.ink} strokeWidth={2.4} /> : null}
          </Pressable>
        );
      })}
    </View>
  );
}
