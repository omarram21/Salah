import { AsrMethodPage } from '@/features/settings/ui';
import { goBackOr } from '@/shared/lib/navigation';

export default function AsrMethodScreen() {
  return <AsrMethodPage onDone={() => goBackOr('/settings')} />;
}
