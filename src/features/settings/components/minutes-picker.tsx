import { Pressable, Text, View } from 'react-native';

type Props = {
  options: readonly number[];
  value: number;
  onChange: (minutes: number) => void;
  label: (minutes: number) => string;
  disabled?: boolean;
};

export function MinutesPicker({ options, value, onChange, label, disabled }: Props) {
  return (
    <View className={`flex-row flex-wrap gap-2 ${disabled ? 'opacity-50' : ''}`}>
      {options.map((m) => {
        const selected = m === value;
        return (
          <Pressable
            key={m}
            disabled={disabled}
            accessibilityRole="radio"
            accessibilityState={{ selected, disabled }}
            onPress={() => onChange(m)}
            className={`rounded-full border px-3 py-1.5 ${
              selected
                ? 'border-primary bg-primary'
                : 'border-slate-300 bg-white dark:border-slate-700 dark:bg-slate-900'
            }`}>
            <Text className={`text-sm font-medium ${selected ? 'text-white' : 'text-slate-700 dark:text-slate-200'}`}>
              {label(m)}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
