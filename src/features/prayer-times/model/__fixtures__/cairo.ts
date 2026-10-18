import nov from '@/shared/api/aladhan/__fixtures__/cairo-2026-11-head.json';
import oct from '@/shared/api/aladhan/__fixtures__/cairo-2026-10-tail.json';
import type { AladhanDay } from '@/shared/api/aladhan';

import { parseMonth } from '../parse';
import { indexDays } from '../timeline';

/** Real AlAdhan data for Cairo, 28 Oct – 2 Nov 2026 (DST ends 30 Oct: +03:00 → +02:00). */
export const cairoOctTail = parseMonth(oct.data as AladhanDay[], 0);
export const cairoNovHead = parseMonth(nov.data as AladhanDay[], 0);
export const cairoIndex = indexDays([...cairoOctTail.days, ...cairoNovHead.days]);

/** Instant for a Cairo wall-clock time given its UTC offset in hours. */
export const cairo = (iso: string, offsetH: number) =>
  Date.UTC(
    Number(iso.slice(0, 4)),
    Number(iso.slice(5, 7)) - 1,
    Number(iso.slice(8, 10)),
    Number(iso.slice(11, 13)),
    Number(iso.slice(14, 16)),
  ) -
  offsetH * 3600_000;
