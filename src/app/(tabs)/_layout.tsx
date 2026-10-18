import Ionicons from '@expo/vector-icons/Ionicons';
import { Tabs } from 'expo-router';
import type { ComponentProps } from 'react';
import type { ColorValue } from 'react-native';
import { useTranslation } from 'react-i18next';

import { useAppTheme } from '@/features/settings';

type IconName = ComponentProps<typeof Ionicons>['name'];

function tabIcon(name: IconName) {
  return function TabIcon({ color, size }: { color: ColorValue; size: number }) {
    return <Ionicons name={name} size={size} color={color as string} />;
  };
}

export default function TabLayout() {
  const { t } = useTranslation();
  const { colors, palette } = useAppTheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: palette.primary,
        tabBarInactiveTintColor: colors.muted,
        tabBarStyle: { backgroundColor: colors.card, borderTopColor: colors.border },
      }}>
      <Tabs.Screen name="index" options={{ title: t('tabs.today'), tabBarIcon: tabIcon('sunny-outline') }} />
      <Tabs.Screen name="history" options={{ title: t('tabs.history'), tabBarIcon: tabIcon('calendar-outline') }} />
      <Tabs.Screen name="stats" options={{ title: t('tabs.stats'), tabBarIcon: tabIcon('stats-chart-outline') }} />
      <Tabs.Screen name="settings" options={{ title: t('tabs.settings'), tabBarIcon: tabIcon('settings-outline') }} />
    </Tabs>
  );
}
