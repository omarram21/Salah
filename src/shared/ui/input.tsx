import { TextInput, type TextInputProps } from 'react-native';

import { useDirection } from '@/shared/i18n/direction';

type Props = TextInputProps & { className?: string; bare?: boolean };

/** Text field that aligns with the layout direction. `bare` drops the border (for custom wrappers). */
export function Input({ className = '', bare, style, ...rest }: Props) {
  const { isRTL } = useDirection();
  const box = bare
    ? ''
    : 'min-h-12 rounded-xl border border-slate-300 bg-white px-3 dark:border-slate-700 dark:bg-slate-950';
  return (
    <TextInput
      placeholderTextColor="#94A3B8"
      autoCorrect={false}
      className={`${box} text-base text-slate-900 dark:text-slate-100 ${className}`}
      style={[{ textAlign: isRTL ? 'right' : 'left' }, style]}
      {...rest}
    />
  );
}
