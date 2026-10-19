import { View } from 'react-native';

import type { PrayerStatus } from '../logic/types';
import { STATUS_STYLE } from './status-style';

type Props = {
  status: PrayerStatus | undefined;
  /** Hollow ring for prayers that haven't started yet. */
  upcoming?: boolean;
  size?: number;
};

export function StatusDot({ status, upcoming, size = 14 }: Props) {
  const style = { width: size, height: size, borderRadius: size / 2 };
  if (upcoming && !status) {
    return <View style={style} className="border-2 border-status-unmarked dark:border-[#3A3A3E]" />;
  }
  return <View style={style} className={status ? STATUS_STYLE[status].bg : 'bg-status-unmarked dark:bg-[#3A3A3E]'} />;
}
