import { useToday } from '@/features/prayer-times';
import { StatsView } from '@/features/stats';

export default function StatsScreen() {
  const { index, now, today } = useToday(60_000);
  return <StatsView index={index} now={now} today={today} />;
}
