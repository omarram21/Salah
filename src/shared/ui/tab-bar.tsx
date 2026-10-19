import type { Tabs } from 'expo-router';
import type { ComponentProps } from 'react';
import { Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useDirection } from '@/shared/i18n/direction';
import { useThemeColors } from '@/shared/theme/use-theme-colors';

import { Icon, type IconName } from './icon';

type TabBarProps = Parameters<NonNullable<ComponentProps<typeof Tabs>['tabBar']>>[0];

/** Icon-only tab bar; the active tab sits in a pill (E design). */
export function IconTabBar({ state, descriptors, navigation, icons }: TabBarProps & { icons: Record<string, IconName> }) {
  const insets = useSafeAreaInsets();
  const { direction } = useDirection();
  const { c, isDark } = useThemeColors();

  return (
    <View
      className="flex-row justify-around border-t border-line bg-paper px-3 pt-2 dark:border-line-dark dark:bg-paper-dark"
      style={{ paddingBottom: Math.max(insets.bottom, 12), direction }}>
      {state.routes.map((route, i) => {
        const focused = state.index === i;
        const label = descriptors[route.key]?.options.title ?? route.name;
        const onPress = () => {
          const e = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
          if (!focused && !e.defaultPrevented) navigation.navigate(route.name);
        };
        return (
          <Pressable
            key={route.key}
            accessibilityRole="tab"
            accessibilityLabel={label}
            accessibilityState={{ selected: focused }}
            onPress={onPress}
            className={`h-11 w-14 items-center justify-center rounded-full ${focused ? 'bg-ink dark:bg-ink-dark' : ''}`}>
            <Icon name={icons[route.name] ?? 'dhuhr'} color={focused ? (isDark ? c.paper : '#FFFFFF') : c.muted} />
          </Pressable>
        );
      })}
    </View>
  );
}
