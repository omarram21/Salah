import { useTranslation } from 'react-i18next';
import { Pressable, View } from 'react-native';

import { Text } from '@/shared/ui';

import { selectIsDemo, useTrackingStore } from '../store/tracking-store';

/** Always-visible warning while demo data is shown, with a one-tap way out. */
export function DemoBanner() {
  const { t } = useTranslation();
  const isDemo = useTrackingStore(selectIsDemo);
  const disableDemo = useTrackingStore((s) => s.disableDemo);
  if (!isDemo) return null;

  return (
    <View
      accessibilityRole="alert"
      className="flex-row items-center gap-3 rounded-xl bg-orange-100 px-4 py-2 dark:bg-orange-950">
      <Text className="flex-1 text-sm font-semibold text-orange-800 dark:text-orange-300">
        {t('demo.banner')}
      </Text>
      <Pressable accessibilityRole="button" onPress={disableDemo} hitSlop={8} className="active:opacity-60">
        <Text className="text-sm font-bold text-orange-800 underline dark:text-orange-300">
          {t('demo.turnOff')}
        </Text>
      </Pressable>
    </View>
  );
}
