import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { PRAYER_ICON, type PrayerName } from '@/features/prayer-times';
import { useDateFormat } from '@/shared/i18n';
import type { DateKey } from '@/shared/lib/date-key';

import { StatusSheet } from '../components/status-sheet';
import { resolveTap, suggestStatus, type PrayerTiming } from '../logic/status';
import type { PrayerStatus } from '../logic/types';
import { selectRecords, useTrackingStore } from '../store/tracking-store';

/**
 * Everything a prayer row needs: its record, what a tap does (per the tracking rules),
 * and the change-status sheet. Render `sheet` once alongside the row.
 */
export function usePrayerStatus(date: DateKey, prayer: PrayerName, timing: PrayerTiming) {
  const { t } = useTranslation();
  const fmt = useDateFormat();
  const record = useTrackingStore((s) => selectRecords(s)[date]?.[prayer]);
  const setStatus = useTrackingStore((s) => s.setStatus);
  const clearStatus = useTrackingStore((s) => s.clearStatus);
  const [open, setOpen] = useState<{ suggested: PrayerStatus | null } | null>(null);

  const mark = (status: PrayerStatus) => setStatus(date, prayer, status);
  const openSheet = () => timing !== 'upcoming' && setOpen({ suggested: suggestStatus(timing) });
  const tap = () => {
    const action = resolveTap(record, timing);
    if (action.kind === 'mark') mark(action.status);
    else if (action.kind === 'choose') setOpen({ suggested: action.suggested });
  };

  const sheet = (
    <StatusSheet
      visible={open !== null}
      title={t(`prayers.${prayer}`)}
      subtitle={fmt.short(date)}
      icon={PRAYER_ICON[prayer]}
      value={record?.status}
      suggested={open?.suggested ?? null}
      onSelect={(status) => {
        mark(status);
        setOpen(null);
      }}
      onClear={() => {
        clearStatus(date, prayer);
        setOpen(null);
      }}
      onClose={() => setOpen(null)}
    />
  );

  return { record, status: record?.status, tap, openSheet, mark, sheet };
}
