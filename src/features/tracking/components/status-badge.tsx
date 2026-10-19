import Ionicons from '@expo/vector-icons/Ionicons';
import { useTranslation } from 'react-i18next';
import { Pressable } from 'react-native';

import type { PrayerTiming } from '../logic/status';
import type { PrayerRecord } from '../logic/types';
import { StatusIcon } from './status-icon';
import { STATUS_STYLE } from './status-style';

type Props = {
  record: PrayerRecord | undefined;
  timing: PrayerTiming;
  onPress: () => void;
  onLongPress?: () => void;
  prayerLabel: string;
};

/** Round status button shown next to each prayer. */
export function StatusBadge({ record, timing, onPress, onLongPress, prayerLabel }: Props) {
  const { t } = useTranslation();

  if (record) {
    const s = STATUS_STYLE[record.status];
    return (
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${prayerLabel}: ${t(`status.${record.status}`)}`}
        accessibilityHint={t('status.changeHint')}
        onPress={onPress}
        onLongPress={onLongPress}
        hitSlop={8}
        className={`size-10 items-center justify-center rounded-full active:opacity-70 ${s.bg}`}>
        <StatusIcon status={record.status} size={22} />
      </Pressable>
    );
  }

  const disabled = timing === 'upcoming';
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${prayerLabel}: ${t('status.unmarked')}`}
      accessibilityHint={disabled ? t('status.notStartedHint') : t('status.markHint')}
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      onLongPress={onLongPress}
      hitSlop={8}
      className={`size-10 items-center justify-center rounded-full border-2 active:opacity-70 ${
        disabled
          ? 'border-slate-200 dark:border-slate-800'
          : timing === 'inTime'
            ? 'border-primary dark:border-primary-light'
            : 'border-slate-400 dark:border-slate-500'
      }`}>
      {disabled ? null : (
        <Ionicons
          name={timing === 'inTime' ? 'checkmark' : 'help'}
          size={20}
          color={timing === 'inTime' ? '#0F766E' : '#94A3B8'}
        />
      )}
    </Pressable>
  );
}
