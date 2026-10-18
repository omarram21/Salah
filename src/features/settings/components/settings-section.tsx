import type { ReactNode } from 'react';
import { View } from 'react-native';

import { Text } from '@/shared/ui';

export function SettingsSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <View className="gap-2">
      <Text className="px-1 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
        {title}
      </Text>
      <View className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        {children}
      </View>
    </View>
  );
}
