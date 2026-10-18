import type { Coordinates } from './types';

/** Great-circle distance in km. */
export function distanceKm(a: Coordinates, b: Coordinates): number {
  const R = 6371;
  const rad = (d: number) => (d * Math.PI) / 180;
  const dLat = rad(b.latitude - a.latitude);
  const dLng = rad(b.longitude - a.longitude);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(rad(a.latitude)) * Math.cos(rad(b.latitude)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

/** ~110 m precision: plenty for prayer times, and keeps cache keys stable. */
export function roundCoordinates({ latitude, longitude }: Coordinates): Coordinates {
  const r = (n: number) => Math.round(n * 1000) / 1000;
  return { latitude: r(latitude), longitude: r(longitude) };
}
