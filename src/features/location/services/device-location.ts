import * as Location from 'expo-location';

import { roundCoordinates } from '../model/distance';
import type { AppLocation } from '../model/types';

export type DeviceLocationResult =
  | { ok: true; location: AppLocation }
  | { ok: false; reason: 'denied' | 'unavailable' };

/**
 * Reads the device position. Prompts for permission only when `prompt` is true,
 * so background refreshes never pop a dialog.
 */
export async function getDeviceLocation({ prompt }: { prompt: boolean }): Promise<DeviceLocationResult> {
  const perm = prompt
    ? await Location.requestForegroundPermissionsAsync()
    : await Location.getForegroundPermissionsAsync();
  if (!perm.granted) return { ok: false, reason: 'denied' };

  try {
    const position =
      (await Location.getLastKnownPositionAsync({ maxAge: 30 * 60_000, requiredAccuracy: 5_000 })) ??
      (await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Low }));
    const coords = roundCoordinates(position.coords);
    const place = await reverseGeocode(coords);
    return {
      ok: true,
      location: {
        source: 'gps',
        ...coords,
        label: place?.label ?? `${coords.latitude.toFixed(2)}, ${coords.longitude.toFixed(2)}`,
        countryCode: place?.countryCode,
      },
    };
  } catch {
    return { ok: false, reason: 'unavailable' };
  }
}

async function reverseGeocode(coords: { latitude: number; longitude: number }) {
  try {
    const [addr] = await Location.reverseGeocodeAsync(coords);
    if (!addr) return null;
    const place = addr.city ?? addr.subregion ?? addr.region;
    const label = [place, addr.country].filter(Boolean).join(', ');
    return { label: label || null, countryCode: addr.isoCountryCode ?? undefined };
  } catch {
    // Geocoding is best-effort; coordinates are what matter.
    return null;
  }
}
