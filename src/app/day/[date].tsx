import { Redirect, Stack, useLocalSearchParams } from 'expo-router';

import { usePrayerDays, usePrayerParams, useToday } from '@/features/prayer-times';
import { DayEditor } from '@/features/tracking';
import { useDateFormat } from '@/shared/i18n';
import { Screen } from '@/shared/ui';

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export default function DayScreen() {
  const { date } = useLocalSearchParams<{ date: string }>();
  const fmt = useDateFormat();
  const { today } = useToday(60_000);
  const { index } = usePrayerDays(usePrayerParams());

  // Only real, non-future dates can be edited.
  if (!date || !DATE_RE.test(date) || date > today) return <Redirect href="/history" />;

  return (
    <Screen edgeTop={false}>
      <Stack.Screen options={{ title: fmt.short(date) }} />
      <DayEditor date={date} index={index} />
    </Screen>
  );
}
