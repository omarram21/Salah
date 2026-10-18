import Ionicons from '@expo/vector-icons/Ionicons';
import type { ReactNode } from 'react';
import { Pressable, Switch, View } from 'react-native';

import { useDirection } from '@/shared/i18n';
import { palette } from '@/shared/theme/colors';
import { Text } from '@/shared/ui';

const ROW = 'min-h-14 flex-row items-center gap-3 border-b border-slate-100 px-4 py-3 dark:border-slate-800';

type LinkProps = { label: string; value?: string | null; onPress: () => void };

/** Row that navigates somewhere (chevron flips in RTL). */
export function LinkRow({ label, value, onPress }: LinkProps) {
  const { isRTL } = useDirection();
  return (
    <Pressable accessibilityRole="button" onPress={onPress} className={`${ROW} active:bg-slate-50 dark:active:bg-slate-800`}>
      <View className="flex-1 gap-0.5">
        <Text className="font-medium">{label}</Text>
        {value ? (
          <Text variant="muted" numberOfLines={2}>
            {value}
          </Text>
        ) : null}
      </View>
      <Ionicons
        name="chevron-forward"
        size={18}
        color="#94A3B8"
        style={{ transform: [{ scaleX: isRTL ? -1 : 1 }] }}
      />
    </Pressable>
  );
}

type SwitchProps = {
  label: string;
  description?: string;
  value: boolean;
  onChange: (value: boolean) => void;
  disabled?: boolean;
};

export function SwitchRow({ label, description, value, onChange, disabled }: SwitchProps) {
  return (
    <View className={`${ROW} ${disabled ? 'opacity-50' : ''}`}>
      <View className="flex-1 gap-0.5">
        <Text className="font-medium">{label}</Text>
        {description ? <Text variant="muted">{description}</Text> : null}
      </View>
      <Switch
        accessibilityLabel={label}
        value={value}
        onValueChange={onChange}
        disabled={disabled}
        trackColor={{ true: palette.primary }}
      />
    </View>
  );
}

/** Row with a label on top and arbitrary control below (segmented controls, chips). */
export function ControlRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <View className="gap-2 border-b border-slate-100 px-4 py-3 dark:border-slate-800">
      <Text className="font-medium">{label}</Text>
      {children}
    </View>
  );
}
