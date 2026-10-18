import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { HistoryList } from '@/features/history';
import { useToday } from '@/features/prayer-times';
import { useDirection } from '@/shared/i18n';

export default function HistoryScreen() {
  const { today } = useToday(60_000);
  const { direction } = useDirection();
  return (
    <SafeAreaView
      edges={['top', 'left', 'right']}
      className="flex-1 bg-slate-50 dark:bg-slate-950"
      style={{ direction }}>
      <HistoryList today={today} onSelectDay={(date) => router.push({ pathname: '/day/[date]', params: { date } })} />
    </SafeAreaView>
  );
}
