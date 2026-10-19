import { Tabs } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { IconTabBar, type IconName } from '@/shared/ui';

const ICONS: Record<string, IconName> = {
  index: 'dhuhr',
  history: 'calendar',
  stats: 'stats',
  settings: 'settings',
};

export default function TabLayout() {
  const { t } = useTranslation();
  return (
    <Tabs screenOptions={{ headerShown: false }} tabBar={(props) => <IconTabBar {...props} icons={ICONS} />}>
      <Tabs.Screen name="index" options={{ title: t('tabs.today') }} />
      <Tabs.Screen name="history" options={{ title: t('tabs.history') }} />
      <Tabs.Screen name="stats" options={{ title: t('tabs.stats') }} />
      <Tabs.Screen name="settings" options={{ title: t('tabs.settings') }} />
    </Tabs>
  );
}
