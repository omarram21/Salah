import { Pressable, View } from 'react-native';

type Props = {
  value: boolean;
  onValueChange: (value: boolean) => void;
  accessibilityLabel: string;
  disabled?: boolean;
};

/** E-style switch: black track when on (near-white in dark mode). */
export function Switch({ value, onValueChange, accessibilityLabel, disabled }: Props) {
  return (
    <Pressable
      accessibilityRole="switch"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ checked: value, disabled }}
      disabled={disabled}
      hitSlop={8}
      onPress={() => onValueChange(!value)}
      className={`h-[30px] w-[50px] justify-center rounded-full px-[3px] ${
        value ? 'items-end bg-ink dark:bg-ink-dark' : 'items-start bg-[#DADAD5] dark:bg-[#3A3A3E]'
      } ${disabled ? 'opacity-40' : ''}`}>
      <View className="size-6 rounded-full bg-white dark:bg-paper-dark" />
    </Pressable>
  );
}
