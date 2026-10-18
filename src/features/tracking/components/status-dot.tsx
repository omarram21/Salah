import { View } from 'react-native';

import type { PrayerStatus } from '../logic/types';
import { STATUS_STYLE } from './status-style';

export function StatusDot({ status, size = 'md' }: { status: PrayerStatus | undefined; size?: 'sm' | 'md' }) {
  const s = STATUS_STYLE[status ?? 'unmarked'];
  return <View className={`${size === 'sm' ? 'size-2.5' : 'size-3.5'} rounded-full ${s.bg}`} />;
}
