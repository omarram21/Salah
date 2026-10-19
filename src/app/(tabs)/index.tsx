import { useLocationStore, WelcomeView } from '@/features/location';
import { TodayView } from '@/features/today';

export default function TodayScreen() {
  const hasLocation = useLocationStore((s) => s.location !== null);
  return hasLocation ? <TodayView /> : <WelcomeView />;
}
