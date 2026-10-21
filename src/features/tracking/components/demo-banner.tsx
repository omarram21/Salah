import { useTranslation } from 'react-i18next';
import { Pressable, View } from 'react-native';

import { useThemeColors } from '@/shared/theme/use-theme-colors';
import { Icon, Text } from '@/shared/ui';

import { selectIsDemo, useTrackingStore } from '../store/tracking-store';

/** Always-visible warning while demo data is shown, with a one-tap way out. */
export function DemoBanner() {
  const { t } = useTranslation();
  const isDemo = useTrackingStore(selectIsDemo);
  const disableDemo = useTrackingStore((s) => s.disableDemo);
  const { c } = useThemeColors();
  if (!isDemo) return null;
  const ORANGE = c.demo;

  return (
    <View accessibilityRole="alert" className="flex-row items-center gap-2.5 rounded-2xl bg-accent-soft px-4 py-2.5 dark:bg-accent-soft-dark">
      <Icon name="flask" size={18} color={ORANGE} />
      <Text variant="caption" weight="semibold" tone="none" className="flex-1" style={{ color: ORANGE }}>
        {t('demo.banner')}
      </Text>
      <Pressable accessibilityRole="button" onPress={disableDemo} hitSlop={8} className="active:opacity-60">
        <Text variant="caption" weight="bold" tone="none" style={{ color: ORANGE, textDecorationLine: 'underline' }}>
          {t('demo.turnOff')}
        </Text>
      </Pressable>
    </View>
  );
}
