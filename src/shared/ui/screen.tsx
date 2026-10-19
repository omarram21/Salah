import { router } from 'expo-router';
import type { ReactNode } from 'react';
import { Pressable, RefreshControl, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useDirection } from '@/shared/i18n/direction';
import { useThemeColors } from '@/shared/theme/use-theme-colors';

import { Icon } from './icon';
import { Text } from './text';

type Props = {
  children: ReactNode;
  scroll?: boolean;
  /** Large page title (tabs) or a back-button header (pushed screens). */
  title?: string;
  subtitle?: string;
  back?: boolean | (() => void);
  /** Element on the trailing side of the header. */
  headerRight?: ReactNode;
  /** Extra classes for the content container. */
  contentClassName?: string;
  /** Pull-to-refresh (scrolling screens only). */
  refreshing?: boolean;
  onRefresh?: () => void;
};

/** Standard E screen: paper background, safe area, layout direction, optional header. */
export function Screen({
  children,
  scroll = true,
  title,
  subtitle,
  back,
  headerRight,
  contentClassName = '',
  refreshing,
  onRefresh,
}: Props) {
  const { direction } = useDirection();
  const content = `gap-4 px-6 pb-10 ${contentClassName}`;
  return (
    <SafeAreaView edges={['top', 'left', 'right']} className="flex-1 bg-paper dark:bg-paper-dark" style={{ direction }}>
      {title || back ? <ScreenHeader title={title} subtitle={subtitle} back={back} right={headerRight} /> : null}
      {scroll ? (
        <ScrollView
          contentContainerClassName={content}
          keyboardShouldPersistTaps="handled"
          refreshControl={onRefresh ? <RefreshControl refreshing={!!refreshing} onRefresh={onRefresh} /> : undefined}>
          {children}
        </ScrollView>
      ) : (
        <View className={`flex-1 ${content}`}>{children}</View>
      )}
    </SafeAreaView>
  );
}

function ScreenHeader({
  title,
  subtitle,
  back,
  right,
}: {
  title?: string;
  subtitle?: string;
  back?: boolean | (() => void);
  right?: ReactNode;
}) {
  const { isRTL } = useDirection();
  const { c } = useThemeColors();
  const onBack = typeof back === 'function' ? back : () => router.back();
  return (
    <View className={`flex-row items-center gap-1 pb-3 pt-2 ${back ? 'pe-6 ps-3' : 'px-6'}`}>
      {back ? (
        <Pressable accessibilityRole="button" accessibilityLabel="Back" onPress={onBack} hitSlop={8} className="size-11 items-center justify-center">
          <Icon name="chevronLeft" size={22} color={c.ink} strokeWidth={2} flip={isRTL} />
        </Pressable>
      ) : null}
      <View className="flex-1">
        {title ? (
          <Text variant={back ? 'heading' : 'title'} accessibilityRole="header" numberOfLines={1}>
            {title}
          </Text>
        ) : null}
        {subtitle ? <Text variant="caption" tone="muted">{subtitle}</Text> : null}
      </View>
      {right}
    </View>
  );
}
