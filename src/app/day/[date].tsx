import { Redirect, useLocalSearchParams } from 'expo-router';

import { usePrayerDays, usePrayerParams, useToday } from '@/features/prayer-times';
import { DayStepper } from '@/features/tracking';
import { currentLanguage, useDateFormat } from '@/shared/i18n';
import { goBackOr } from '@/shared/lib/navigation';
import { Screen } from '@/shared/ui';

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export default function DayScreen() {
  const { date } = useLocalSearchParams<{ date: string }>();
  const fmt = useDateFormat();
  const { now, today } = useToday(60_000);
  const { index } = usePrayerDays(usePrayerParams());

  // Only real, non-future dates can be edited.
  if (!date || !DATE_RE.test(date) || date > today) return <Redirect href="/history" />;

  const hijri = index.get(date)?.hijri;
  const lang = currentLanguage();
  const done = () => goBackOr('/history');
  return (
    <Screen
      back={done}
      scroll={false}
      title={fmt.weekdayLong(date)}
      subtitle={hijri ? `${hijri.day} ${hijri.monthName[lang]} ${hijri.year}` : undefined}>
      <DayStepper key={date} date={date} index={index} now={now} today={today} onDone={done} />
    </Screen>
  );
}
