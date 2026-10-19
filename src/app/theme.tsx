import { ThemePage } from '@/features/settings/ui';
import { goBackOr } from '@/shared/lib/navigation';

export default function ThemeScreen() {
  return <ThemePage onDone={() => goBackOr('/settings')} />;
}
