import { usePrayerDays, usePrayerParams } from '@/features/prayer-times';
import { MethodPicker } from '@/features/settings/ui';
import { goBackOr } from '@/shared/lib/navigation';

export default function CalculationMethodScreen() {
  const { method } = usePrayerDays(usePrayerParams());
  return <MethodPicker detectedName={method?.name ?? null} onDone={() => goBackOr('/settings')} />;
}
