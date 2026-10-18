import { useCallback } from 'react';

import { distanceKm } from '../model/distance';
import { getDeviceLocation } from '../services/device-location';
import { useLocationStore } from '../store/location-store';

const REFRESH_EVERY_MS = 3 * 60 * 60_000;
const MOVED_KM = 5;

/**
 * Returns a function that silently re-checks GPS (no permission prompt) when the user
 * chose GPS, and updates the location only if they've moved noticeably (e.g. travelling).
 */
export function useGpsRefresh() {
  return useCallback(async () => {
    const { location, gpsCheckedAt, setLocation, markGpsChecked } = useLocationStore.getState();
    if (location?.source !== 'gps') return;
    const now = Date.now();
    if (gpsCheckedAt && now - gpsCheckedAt < REFRESH_EVERY_MS) return;

    const result = await getDeviceLocation({ prompt: false });
    markGpsChecked(now);
    if (result.ok && distanceKm(location, result.location) >= MOVED_KM) setLocation(result.location);
  }, []);
}
