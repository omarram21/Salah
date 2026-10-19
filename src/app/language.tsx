import { LanguagePage } from '@/features/settings/ui';
import { goBackOr } from '@/shared/lib/navigation';

export default function LanguageScreen() {
  return <LanguagePage onDone={() => goBackOr('/settings')} />;
}
