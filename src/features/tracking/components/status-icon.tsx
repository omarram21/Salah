import { Icon } from '@/shared/ui';

import type { StatusKey } from './status-style';
import { STATUS_STYLE } from './status-style';

type Props = { status: StatusKey; size: number; color?: string };

export function StatusIcon({ status, size, color = '#FFFFFF' }: Props) {
  return <Icon name={STATUS_STYLE[status].icon} size={size} color={color} strokeWidth={2.2} />;
}
