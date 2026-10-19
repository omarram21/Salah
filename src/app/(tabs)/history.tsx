import { HistoryCalendar } from '@/features/history';
import { useToday } from '@/features/prayer-times';

export default function HistoryScreen() {
  const { index, now, today } = useToday(60_000);
  return <HistoryCalendar index={index} now={now} today={today} />;
}
