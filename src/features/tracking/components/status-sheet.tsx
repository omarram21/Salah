import { Modal, Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

import { useDirection } from '@/shared/i18n';
import { Button, Text } from '@/shared/ui';

import type { PrayerStatus } from '../logic/types';
import { StatusOptions } from './status-options';

type Props = {
  visible: boolean;
  title: string;
  subtitle?: string;
  value: PrayerStatus | undefined;
  suggested: PrayerStatus | null;
  onSelect: (status: PrayerStatus) => void;
  onClear: () => void;
  onClose: () => void;
};

/** Bottom sheet for choosing or changing a prayer's status. */
export function StatusSheet({ visible, title, subtitle, value, suggested, onSelect, onClear, onClose }: Props) {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { direction } = useDirection();

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View className="flex-1 justify-end" style={{ direction }}>
        <Pressable
          accessibilityLabel={t('common.cancel')}
          className="absolute inset-0 bg-black/40"
          onPress={onClose}
        />
        <View
          className="gap-4 rounded-t-3xl bg-white p-5 dark:bg-slate-900"
          style={{ paddingBottom: insets.bottom + 16 }}>
          <View className="gap-1">
            <Text variant="heading">{title}</Text>
            {subtitle ? <Text variant="muted">{subtitle}</Text> : null}
          </View>
          <StatusOptions value={value} suggested={suggested} onSelect={onSelect} onClear={onClear} />
          <Button label={t('common.cancel')} variant="secondary" onPress={onClose} />
        </View>
      </View>
    </Modal>
  );
}
