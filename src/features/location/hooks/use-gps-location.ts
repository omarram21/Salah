import { useState } from 'react';

import { getDeviceLocation } from '../services/device-location';
import { useLocationStore } from '../store/location-store';

export type GpsStatus = 'idle' | 'locating' | 'denied' | 'unavailable';

/** "Use my location" action: prompts for permission and saves the result. */
export function useGpsLocation(onSuccess?: () => void) {
  const [status, setStatus] = useState<GpsStatus>('idle');
  const setLocation = useLocationStore((s) => s.setLocation);

  const locate = async () => {
    setStatus('locating');
    const result = await getDeviceLocation({ prompt: true });
    if (result.ok) {
      setLocation(result.location);
      setStatus('idle');
      onSuccess?.();
    } else {
      setStatus(result.reason);
    }
  };

  return { status, locate };
}
