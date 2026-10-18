import { deviceUtcOffsetMin } from '@/shared/lib/date-key';
import { useNow } from '@/shared/lib/use-now';

import { getCurrentPrayer, getNextPrayer } from '../model/timeline';
import { locationToday } from '../model/today';
import { usePrayerDays } from './use-prayer-days';
import { usePrayerParams } from './use-prayer-params';

/** Everything the Today screen needs, re-evaluated every `intervalMs` (default: every second). */
export function useToday(intervalMs = 1000) {
  const params = usePrayerParams();
  const { index, method } = usePrayerDays(params);
  const now = useNow(intervalMs);

  const today = locationToday(index, now, deviceUtcOffsetMin(now));
  return {
    params,
    index,
    method,
    now,
    today,
    day: index.get(today) ?? null,
    current: getCurrentPrayer(index, now, today),
    next: getNextPrayer(index, now, today),
  };
}
