import { TextInput, type TextInputProps } from 'react-native';

import { useDirection } from '@/shared/i18n/direction';
import { FONT_FAMILY } from '@/shared/theme/fonts';
import { useThemeColors } from '@/shared/theme/use-theme-colors';

type Props = TextInputProps & { className?: string; bare?: boolean };

/** Pill text field that aligns with the layout direction. `bare` drops the background (for custom wrappers). */
export function Input({ className = '', bare, style, ...rest }: Props) {
  const { isRTL } = useDirection();
  const { c } = useThemeColors();
  const box = bare ? '' : 'min-h-[52px] rounded-full bg-chip px-4 dark:bg-chip-dark';
  return (
    <TextInput
      placeholderTextColor={c.faint}
      autoCorrect={false}
      className={`${box} text-[15px] text-ink dark:text-ink-dark ${className}`}
      style={[{ textAlign: isRTL ? 'right' : 'left', fontFamily: FONT_FAMILY.regular }, style]}
      {...rest}
    />
  );
}
