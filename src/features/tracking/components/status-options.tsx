import Ionicons from '@expo/vector-icons/Ionicons';
import { useTranslation } from 'react-i18next';
import { Pressable, View } from 'react-native';

import { Text } from '@/shared/ui';

import { STATUSES, type PrayerStatus } from '../logic/types';
import { StatusIcon } from './status-icon';
import { STATUS_STYLE } from './status-style';

type Props = {
  value: PrayerStatus | undefined;
  suggested?: PrayerStatus | null;
  onSelect: (status: PrayerStatus) => void;
  onClear?: () => void;
};

/** Vertical list of the three statuses, with an optional "Suggested" tag and Clear. */
export function StatusOptions({ value, suggested, onSelect, onClear }: Props) {
  const { t } = useTranslation();
  return (
    <View className="gap-2">
      {STATUSES.map((status) => {
        const s = STATUS_STYLE[status];
        const selected = value === status;
        return (
          <Pressable
            key={status}
            accessibilityRole="radio"
            accessibilityState={{ selected }}
            onPress={() => onSelect(status)}
            className={`min-h-14 flex-row items-center gap-3 rounded-xl border px-4 active:opacity-70 ${
              selected
                ? 'border-primary bg-teal-50 dark:bg-teal-950'
                : 'border-slate-200 dark:border-slate-700'
            }`}>
            <View className={`size-8 items-center justify-center rounded-full ${s.bg}`}>
              <StatusIcon status={status} size={18} />
            </View>
            <Text className="flex-1 font-medium">{t(`status.${status}`)}</Text>
            {suggested === status && !selected ? (
              <Text className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                {t('status.suggested')}
              </Text>
            ) : null}
            {selected ? <Ionicons name="checkmark-circle" size={22} color="#0F766E" /> : null}
          </Pressable>
        );
      })}
      {value && onClear ? (
        <Pressable onPress={onClear} className="min-h-12 items-center justify-center rounded-xl active:opacity-70">
          <Text className="font-medium text-red-600 dark:text-red-400">{t('status.clear')}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}
