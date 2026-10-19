import { ActivityIndicator, Pressable, View, type PressableProps } from 'react-native';

import { useThemeColors } from '@/shared/theme/use-theme-colors';

import { Icon, type IconName } from './icon';
import { Text } from './text';

const VARIANTS = {
  /** Black pill (light) / near-white pill (dark). */
  primary: { box: 'bg-ink dark:bg-ink-dark', tone: 'inverse' as const },
  secondary: { box: 'bg-chip dark:bg-chip-dark', tone: 'ink' as const },
  ghost: { box: '', tone: 'ink' as const },
  danger: { box: '', tone: 'none' as const },
};

type Props = Omit<PressableProps, 'children'> & {
  label: string;
  icon?: IconName;
  variant?: keyof typeof VARIANTS;
  loading?: boolean;
  className?: string;
};

export function Button({ label, icon, variant = 'primary', loading, disabled, className = '', ...rest }: Props) {
  const v = VARIANTS[variant];
  const { c, isDark } = useThemeColors();
  const fg =
    variant === 'primary' ? (isDark ? c.paper : '#FFFFFF') : variant === 'danger' ? '#DC2626' : c.ink;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: !!(disabled || loading), busy: !!loading }}
      disabled={disabled || loading}
      className={`min-h-[52px] flex-row items-center justify-center gap-2.5 rounded-full px-5 active:opacity-80 ${v.box} ${disabled ? 'opacity-40' : ''} ${className}`}
      {...rest}>
      {loading ? (
        <ActivityIndicator color={fg} />
      ) : icon ? (
        <View>
          <Icon name={icon} size={20} color={fg} strokeWidth={2} />
        </View>
      ) : null}
      <Text variant="label" tone={v.tone} style={variant === 'danger' ? { color: fg } : undefined}>
        {label}
      </Text>
    </Pressable>
  );
}
