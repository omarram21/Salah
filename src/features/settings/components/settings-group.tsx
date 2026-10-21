import { router, type Href } from 'expo-router';
import { Children, type ReactNode } from 'react';
import { Pressable, View } from 'react-native';

import { useDirection } from '@/shared/i18n';
import { useThemeColors } from '@/shared/theme/use-theme-colors';
import { Icon, type IconName, Text } from '@/shared/ui';

/** A labeled rounded group of rows (design S1). */
export function SettingsGroup({ title, children }: { title: string; children: ReactNode }) {
  const rows = Children.toArray(children).filter(Boolean);
  return (
    <View>
      <Text variant="tiny" weight="semibold" tone="faint" className="px-2 pb-1.5 pt-5" style={{ letterSpacing: 0.7 }}>
        {title}
      </Text>
      <View className="rounded-[20px] bg-well px-3.5 dark:bg-well-dark">
        {rows.map((row, i) => (
          <View key={i} className={i < rows.length - 1 ? 'border-b border-[#ECECE8] dark:border-line-dark' : ''}>
            {row}
          </View>
        ))}
      </View>
    </View>
  );
}

type RowProps = {
  icon: IconName;
  label: string;
  value?: string | null;
  href?: Href;
  onPress?: () => void;
  /** Dark icon tile to draw the eye (e.g. Alarms). */
  emphasis?: boolean;
  /** Replaces the chevron/value (e.g. a switch). */
  trailing?: ReactNode;
};

export function SettingsRow({ icon, label, value, href, onPress, emphasis, trailing }: RowProps) {
  const { c, isDark } = useThemeColors();
  const { isRTL } = useDirection();
  const press = onPress ?? (href ? () => router.push(href) : undefined);
  const body = (
    <>
      <View className={`size-[34px] items-center justify-center rounded-[10px] ${emphasis ? 'bg-ink dark:bg-ink-dark' : 'bg-paper dark:bg-paper-dark'}`}>
        <Icon name={icon} size={18} color={emphasis ? (isDark ? c.paper : '#FFFFFF') : c.ink} strokeWidth={1.9} />
      </View>
      <Text variant="label" className="flex-1">{label}</Text>
      {trailing ?? (
        <>
          {value ? <Text variant="small" tone="muted" numberOfLines={1} style={{ maxWidth: 170 }}>{value}</Text> : null}
          {press ? <Icon name="chevronRight" size={16} color={c.chevron} strokeWidth={2} flip={isRTL} /> : null}
        </>
      )}
    </>
  );
  if (!press) return <View className="min-h-[54px] flex-row items-center gap-3">{body}</View>;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={value ? `${label}, ${value}` : label}
      onPress={press}
      className="min-h-[54px] flex-row items-center gap-3 active:opacity-60">
      {body}
    </Pressable>
  );
}
