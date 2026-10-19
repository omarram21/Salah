import { Pressable, View } from 'react-native';

import { Text } from './text';

type Option<T extends string> = { value: T; label: string };

type Props<T extends string> = {
  options: readonly Option<T>[];
  value: T;
  onChange: (value: T) => void;
  accessibilityLabel?: string;
  /** "fill" stretches options; "fit" sizes them to content. */
  size?: 'fill' | 'fit';
};

/** Pill-shaped segmented control (E design). */
export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  accessibilityLabel,
  size = 'fill',
}: Props<T>) {
  return (
    <View
      accessibilityRole="radiogroup"
      accessibilityLabel={accessibilityLabel}
      className="flex-row rounded-full bg-chip p-[3px] dark:bg-chip-dark">
      {options.map((o) => {
        const selected = o.value === value;
        return (
          <Pressable
            key={o.value}
            accessibilityRole="radio"
            accessibilityState={{ selected }}
            onPress={() => onChange(o.value)}
            className={`h-9 items-center justify-center rounded-full px-4 ${size === 'fill' ? 'flex-1' : ''} ${
              selected ? 'bg-paper dark:bg-[#2A2A2E]' : ''
            }`}>
            <Text variant="caption" weight="semibold" tone={selected ? 'ink' : 'muted'} numberOfLines={1}>
              {o.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
