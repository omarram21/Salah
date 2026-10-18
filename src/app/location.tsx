import { LocationPicker } from '@/features/location';
import { goBackOr } from '@/shared/lib/navigation';

export default function LocationScreen() {
  return <LocationPicker onDone={() => goBackOr('/')} />;
}
