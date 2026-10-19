import { Text as RNText, type TextProps } from 'react-native';

import { useDirection } from '@/shared/i18n/direction';
import { FONT_FAMILY, type FontWeight } from '@/shared/theme/fonts';

const SIZES = {
  hero: { cls: 'text-[68px]', lineHeight: 70, weight: 'bold', tracking: -2 },
  display: { cls: 'text-[52px]', lineHeight: 56, weight: 'bold', tracking: -1.5 },
  title: { cls: 'text-[28px]', lineHeight: 34, weight: 'bold', tracking: 0 },
  heading: { cls: 'text-lg', lineHeight: 24, weight: 'bold', tracking: 0 },
  body: { cls: 'text-base', lineHeight: 22, weight: 'regular', tracking: 0 },
  label: { cls: 'text-[15px]', lineHeight: 20, weight: 'semibold', tracking: 0 },
  small: { cls: 'text-sm', lineHeight: 19, weight: 'regular', tracking: 0 },
  caption: { cls: 'text-[13px]', lineHeight: 18, weight: 'regular', tracking: 0 },
  tiny: { cls: 'text-xs', lineHeight: 16, weight: 'regular', tracking: 0 },
  micro: { cls: 'text-[11px]', lineHeight: 14, weight: 'semibold', tracking: 0 },
} as const satisfies Record<string, { cls: string; lineHeight: number; weight: FontWeight; tracking: number }>;

const TONES = {
  ink: 'text-ink dark:text-ink-dark',
  muted: 'text-muted dark:text-muted-dark',
  faint: 'text-faint dark:text-faint-dark',
  accent: 'text-accent dark:text-accent-dark',
  inverse: 'text-white dark:text-paper-dark',
  none: '',
} as const;

export type TextVariant = keyof typeof SIZES;
export type TextTone = keyof typeof TONES;

type Props = TextProps & {
  variant?: TextVariant;
  tone?: TextTone;
  weight?: FontWeight;
  /** Logical alignment: "start" follows the layout direction. */
  align?: 'start' | 'center' | 'end';
  /** Equal-width digits for times and counters. */
  tabular?: boolean;
  className?: string;
};

export function Text({
  variant = 'body',
  tone = 'ink',
  weight,
  align = 'start',
  tabular,
  className = '',
  style,
  ...rest
}: Props) {
  const { isRTL } = useDirection();
  const s = SIZES[variant];
  const textAlign = align === 'center' ? 'center' : (align === 'start') !== isRTL ? 'left' : 'right';
  return (
    <RNText
      className={`${s.cls} ${TONES[tone]} ${className}`}
      style={[
        {
          fontFamily: FONT_FAMILY[weight ?? s.weight],
          lineHeight: s.lineHeight,
          letterSpacing: s.tracking,
          textAlign,
          writingDirection: isRTL ? 'rtl' : 'ltr',
          fontVariant: tabular ? ['tabular-nums'] : undefined,
        },
        style,
      ]}
      {...rest}
    />
  );
}
