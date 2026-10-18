import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import type { PrayerName } from '@/features/prayer-times';
import { useDateFormat } from '@/shared/i18n';
import type { DateKey } from '@/shared/lib/date-key';

import { resolveTap, suggestStatus, type PrayerTiming } from '../logic/status';
import type { PrayerStatus } from '../logic/types';
import { useTrackingStore } from '../store/tracking-store';
import { StatusBadge } from './status-badge';
import { StatusSheet } from './status-sheet';

type Props = {
  date: DateKey;
  prayer: PrayerName;
  timing: PrayerTiming;
  /** Extra context for screen readers when the same prayer appears twice, e.g. "Yesterday". */
  contextLabel?: string;
};

/** Status button + its picker sheet for one prayer on one date. */
export function PrayerStatusControl({ date, prayer, timing, contextLabel }: Props) {
  const { t } = useTranslation();
  const fmt = useDateFormat();
  const record = useTrackingStore((s) => s.records[date]?.[prayer]);
  const setStatus = useTrackingStore((s) => s.setStatus);
  const clearStatus = useTrackingStore((s) => s.clearStatus);
  const [sheet, setSheet] = useState<{ suggested: PrayerStatus | null } | null>(null);

  const onPress = () => {
    const action = resolveTap(record, timing);
    if (action.kind === 'mark') setStatus(date, prayer, action.status);
    else if (action.kind === 'choose') setSheet({ suggested: action.suggested });
  };
  // Long-press always opens the picker (e.g. to record "late" while still in time).
  const onLongPress = () => timing !== 'upcoming' && setSheet({ suggested: suggestStatus(timing) });

  const prayerName = t(`prayers.${prayer}`);
  const prayerLabel = contextLabel ? `${prayerName} (${contextLabel})` : prayerName;
  return (
    <>
      <StatusBadge
        record={record}
        timing={timing}
        onPress={onPress}
        onLongPress={onLongPress}
        prayerLabel={prayerLabel}
      />
      <StatusSheet
        visible={sheet !== null}
        title={prayerName}
        subtitle={fmt.short(date)}
        value={record?.status}
        suggested={sheet?.suggested ?? null}
        onSelect={(status) => {
          setStatus(date, prayer, status);
          setSheet(null);
        }}
        onClear={() => {
          clearStatus(date, prayer);
          setSheet(null);
        }}
        onClose={() => setSheet(null)}
      />
    </>
  );
}
