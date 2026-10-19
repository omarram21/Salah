import { SoundPicker } from '@/features/notifications';
import { goBackOr } from '@/shared/lib/navigation';

export default function AlarmSoundScreen() {
  return <SoundPicker onDone={() => goBackOr('/alarms')} />;
}
