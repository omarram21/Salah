import { Pressable, Text, View } from 'react-native';

type Option<T extends string> = { value: T; label: string };

type Props<T extends string> = {
  options: readonly Option<T>[];
  value: T;
  onChange: (value: T) => void;
  accessibilityLabel?: string;
};

export function SegmentedControl<T extends string>({ options, value, onChange, accessibilityLabel }: Props<T>) {
  return (
    <View
      accessibilityRole="radiogroup"
      accessibilityLabel={accessibilityLabel}
      className="flex-row rounded-xl bg-slate-100 p-1 dark:bg-slate-800">
      {options.map((o) => {
        const selected = o.value === value;
        return (
          <Pressable
            key={o.value}
            accessibilityRole="radio"
            accessibilityState={{ selected }}
            onPress={() => onChange(o.value)}
            className={`flex-1 items-center rounded-lg px-2 py-2 ${selected ? 'bg-white shadow-sm dark:bg-slate-600' : ''}`}>
            <Text
              numberOfLines={1}
              className={`text-sm font-semibold ${selected ? 'text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-400'}`}>
              {o.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
