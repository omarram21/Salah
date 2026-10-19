import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

import type { PrayerStatus } from '../logic/types';
import { STATUS_STYLE } from './status-style';

type Props = { status: PrayerStatus | 'unmarked'; size: number; color?: string };

/** Status glyph; the mosque icon comes from a different icon set than the others. */
export function StatusIcon({ status, size, color = '#fff' }: Props) {
  const { icon } = STATUS_STYLE[status];
  return icon.family === 'mci' ? (
    <MaterialCommunityIcons name={icon.name} size={size} color={color} />
  ) : (
    <Ionicons name={icon.name} size={size} color={color} />
  );
}
