import Ionicons from '@expo/vector-icons/Ionicons';
import { useTranslation } from 'react-i18next';
import { FlatList, Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CALCULATION_METHODS } from '@/features/prayer-times';
import { currentLanguage, useDirection } from '@/shared/i18n';
import { Text } from '@/shared/ui';

import { useSettingsStore, type CalculationMethodSetting } from '../store/settings-store';

type Item = { value: CalculationMethodSetting; title: string; subtitle?: string };

/** List of AlAdhan methods, with "Automatic" (region default) first. */
export function MethodPicker({ detectedName, onDone }: { detectedName: string | null; onDone: () => void }) {
  const { t } = useTranslation();
  const lang = currentLanguage();
  const insets = useSafeAreaInsets();
  const { direction } = useDirection();
  const value = useSettingsStore((s) => s.calculationMethod);
  const setValue = useSettingsStore((s) => s.setCalculationMethod);

  const items: Item[] = [
    {
      value: 'auto',
      title: t('settings.methodAuto'),
      subtitle: [t('settings.methodAutoBody'), detectedName].filter(Boolean).join(' · '),
    },
    ...CALCULATION_METHODS.map((m) => ({ value: m.id, title: m.name[lang] })),
  ];

  return (
    <FlatList
      className="flex-1 bg-slate-50 dark:bg-slate-950"
      style={{ direction }}
      contentContainerClassName="gap-2 p-4"
      contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
      data={items}
      keyExtractor={(i) => String(i.value)}
      renderItem={({ item }) => {
        const selected = item.value === value;
        return (
          <Pressable
            accessibilityRole="radio"
            accessibilityState={{ selected }}
            onPress={() => {
              setValue(item.value);
              onDone();
            }}
            className={`flex-row items-center gap-3 rounded-xl border px-4 py-3 active:opacity-70 ${
              selected
                ? 'border-primary bg-teal-50 dark:bg-teal-950'
                : 'border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900'
            }`}>
            <View className="flex-1 gap-0.5">
              <Text className="font-medium">{item.title}</Text>
              {item.subtitle ? <Text variant="muted">{item.subtitle}</Text> : null}
            </View>
            {selected ? <Ionicons name="checkmark" size={20} color="#0F766E" /> : null}
          </Pressable>
        );
      }}
    />
  );
}
