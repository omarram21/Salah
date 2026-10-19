import { useTranslation } from 'react-i18next';

import { parseDateKey, weekdayOf, type DateKey } from '@/shared/lib/date-key';

import type { Translations } from './locales/en';

type WeekdayKey = keyof Translations['calendar']['weekdays'];
type MonthKey = keyof Translations['calendar']['months'];

/** Locale-aware labels for DateKeys, using our own translations (no Intl dependency). */
export function useDateFormat() {
  const { t } = useTranslation();

  const weekday = (key: DateKey) => t(`calendar.weekdays.${String(weekdayOf(key)) as WeekdayKey}`);
  const weekdayShort = (key: DateKey) =>
    t(`calendar.weekdaysShort.${String(weekdayOf(key)) as WeekdayKey}`);
  const month = (m: number) => t(`calendar.months.${String(m) as MonthKey}`);
  const monthShort = (m: number) => t(`calendar.monthsShort.${String(m) as MonthKey}`);

  return {
    weekday,
    /** "18 October 2026" */
    long: (key: DateKey) => {
      const { year, month: m, day } = parseDateKey(key);
      return `${day} ${month(m)} ${year}`;
    },
    /** "Sun, 18 Oct" */
    short: (key: DateKey) => {
      const { month: m, day } = parseDateKey(key);
      return `${weekdayShort(key)}${t('calendar.listSeparator')} ${day} ${monthShort(m)}`;
    },
    /** "October" for a "YYYY-MM" month key */
    monthName: (monthKey: string) => month(Number(monthKey.slice(5, 7))),
    /** "Friday, 30 October" */
    weekdayLong: (key: DateKey) => {
      const { month: m, day } = parseDateKey(key);
      return `${weekday(key)}${t('calendar.listSeparator')} ${day} ${month(m)}`;
    },
    /** "October 2026" */
    monthYear: (key: DateKey) => {
      const { year, month: m } = parseDateKey(key);
      return `${month(m)} ${year}`;
    },
  };
}
