import type { ReactNode } from 'react';
import { ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useDirection } from '@/shared/i18n/direction';

type Props = {
  children: ReactNode;
  scroll?: boolean;
  /** Include the top safe area (tabs have no header). */
  edgeTop?: boolean;
};

/** Standard screen wrapper: safe area + themed background + padding + layout direction. */
export function Screen({ children, scroll = true, edgeTop = true }: Props) {
  const { direction } = useDirection();
  return (
    <SafeAreaView
      edges={edgeTop ? ['top', 'left', 'right'] : ['left', 'right']}
      className="flex-1 bg-slate-50 dark:bg-slate-950"
      style={{ direction }}>
      {scroll ? (
        <ScrollView contentContainerClassName="gap-4 p-4 pb-10" keyboardShouldPersistTaps="handled">
          {children}
        </ScrollView>
      ) : (
        <View className="flex-1 gap-4 p-4">{children}</View>
      )}
    </SafeAreaView>
  );
}
