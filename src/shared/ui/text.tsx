import { Text as RNText, type TextProps } from 'react-native';

import { useDirection } from '@/shared/i18n/direction';

const variants = {
  title: 'text-2xl font-bold text-slate-900 dark:text-slate-100',
  heading: 'text-lg font-semibold text-slate-900 dark:text-slate-100',
  body: 'text-base text-slate-800 dark:text-slate-200',
  muted: 'text-sm text-slate-500 dark:text-slate-400',
} as const;

type Props = TextProps & {
  variant?: keyof typeof variants;
  /** Logical alignment: "start" follows the layout direction. */
  align?: 'start' | 'center' | 'end';
  className?: string;
};

export function Text({ variant = 'body', align = 'start', className = '', style, ...rest }: Props) {
  const { isRTL } = useDirection();
  const textAlign =
    align === 'center' ? 'center' : (align === 'start') !== isRTL ? 'left' : 'right';
  return (
    <RNText
      className={`${variants[variant]} ${className}`}
      style={[{ textAlign, writingDirection: isRTL ? 'rtl' : 'ltr' }, style]}
      {...rest}
    />
  );
}
