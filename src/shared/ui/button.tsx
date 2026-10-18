import { ActivityIndicator, Pressable, Text, type PressableProps } from 'react-native';

const variants = {
  primary: { box: 'bg-primary active:bg-primary-dark', text: 'text-white' },
  secondary: {
    box: 'border border-slate-300 bg-white active:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:active:bg-slate-800',
    text: 'text-slate-900 dark:text-slate-100',
  },
  ghost: { box: 'active:bg-slate-100 dark:active:bg-slate-800', text: 'text-primary dark:text-primary-light' },
} as const;

type Props = Omit<PressableProps, 'children'> & {
  label: string;
  variant?: keyof typeof variants;
  loading?: boolean;
  className?: string;
};

export function Button({ label, variant = 'primary', loading, disabled, className = '', ...rest }: Props) {
  const v = variants[variant];
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled || loading}
      className={`min-h-12 flex-row items-center justify-center gap-2 rounded-xl px-4 py-3 ${v.box} ${disabled ? 'opacity-50' : ''} ${className}`}
      {...rest}>
      {loading ? <ActivityIndicator color={variant === 'primary' ? '#fff' : undefined} /> : null}
      <Text className={`text-base font-semibold ${v.text}`}>{label}</Text>
    </Pressable>
  );
}
