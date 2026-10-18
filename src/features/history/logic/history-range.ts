import type { RecordsByDate } from '@/features/tracking';
import { addDays, monthKeyOf, type DateKey, type MonthKey } from '@/shared/lib/date-key';

export type HistorySection = { month: MonthKey; data: DateKey[] };

/**
 * Days to show in History, newest first, grouped by month: from the first day the app was used
 * (or the earliest record, if older) up to today. Future days are never shown.
 */
export function historySections(
  records: RecordsByDate,
  trackingSince: DateKey | null,
  today: DateKey,
): HistorySection[] {
  const earliestRecord = Object.keys(records).sort()[0];
  const candidates = [trackingSince, earliestRecord, today].filter((d): d is DateKey => !!d);
  const start = candidates.sort()[0] ?? today;

  const sections: HistorySection[] = [];
  for (let d = today; d >= start; d = addDays(d, -1)) {
    const month = monthKeyOf(d);
    const last = sections.at(-1);
    if (last?.month === month) last.data.push(d);
    else sections.push({ month, data: [d] });
  }
  return sections;
}
