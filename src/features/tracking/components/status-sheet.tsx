import { Modal, Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

import { useDirection } from '@/shared/i18n';
import { useThemeColors } from '@/shared/theme/use-theme-colors';
import { Button, Icon, type IconName, Text } from '@/shared/ui';

import { STATUSES, type PrayerStatus } from '../logic/types';
import { STATUS_STYLE } from './status-style';
import { StatusIcon } from './status-icon';

type Props = {
  visible: boolean;
  title: string;
  subtitle?: string;
  icon: IconName;
  value: PrayerStatus | undefined;
  suggested: PrayerStatus | null;
  onSelect: (status: PrayerStatus) => void;
  onClear: () => void;
  onClose: () => void;
};

/** Bottom sheet for choosing or changing a prayer's status (E design). */
export function StatusSheet({ visible, title, subtitle, icon, value, suggested, onSelect, onClear, onClose }: Props) {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { direction } = useDirection();
  const { c } = useThemeColors();

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View className="flex-1 justify-end" style={{ direction }}>
        <Pressable accessibilityLabel={t('common.cancel')} className="absolute inset-0 bg-black/45" onPress={onClose} />
        <View
          accessibilityViewIsModal
          className="gap-3.5 rounded-t-[28px] bg-paper px-5 pt-2.5 dark:bg-[#141416]"
          style={{ paddingBottom: insets.bottom + 18 }}>
          <View className="h-[5px] w-10 self-center rounded-full bg-[#E4E4E0] dark:bg-[#3A3A3E]" />
          <View className="flex-row items-center gap-3">
            <View className="size-11 items-center justify-center rounded-full bg-chip dark:bg-chip-dark">
              <Icon name={icon} color={c.ink} />
            </View>
            <View>
              <Text variant="title" style={{ fontSize: 20, lineHeight: 26 }}>{title}</Text>
              {subtitle ? <Text variant="caption" tone="muted">{subtitle}</Text> : null}
            </View>
          </View>

          <View className="gap-2">
            {STATUSES.map((status) => {
              const selected = value === status;
              return (
                <Pressable
                  key={status}
                  accessibilityRole="radio"
                  accessibilityState={{ selected }}
                  onPress={() => onSelect(status)}
                  className={`min-h-[58px] flex-row items-center gap-3 rounded-2xl px-3.5 active:opacity-70 ${
                    selected ? 'border-2 bg-accent-soft dark:bg-accent-soft-dark' : 'bg-chip dark:bg-chip-dark'
                  }`}
                  style={selected ? { borderColor: STATUS_STYLE[status].color } : undefined}>
                  <View className={`size-9 items-center justify-center rounded-full ${STATUS_STYLE[status].bg}`}>
                    <StatusIcon status={status} size={18} />
                  </View>
                  <Text variant="body" weight={selected ? 'bold' : 'semibold'} className="flex-1">
                    {t(`status.${status}`)}
                  </Text>
                  {suggested === status && !selected ? (
                    <View className="rounded-full px-2 py-0.5" style={{ backgroundColor: c.suggestBg }}>
                      <Text variant="micro" tone="none" style={{ color: c.suggestFg }}>{t('status.suggested')}</Text>
                    </View>
                  ) : null}
                  {selected ? <Icon name="check" size={20} color={STATUS_STYLE[status].color} strokeWidth={2.4} /> : null}
                </Pressable>
              );
            })}
          </View>

          <View className="flex-row gap-2">
            {value ? (
              <Button variant="danger" icon="trash" label={t('status.clearShort')} onPress={onClear} className="flex-1" />
            ) : null}
            <Button label={t('common.done')} onPress={onClose} className="flex-[2]" />
          </View>
        </View>
      </View>
    </Modal>
  );
}
