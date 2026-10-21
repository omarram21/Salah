/** The Kaaba, Makkah. */
export const KAABA = { latitude: 21.422487, longitude: 39.826206 } as const;

const rad = (d: number) => (d * Math.PI) / 180;
const deg = (r: number) => (r * 180) / Math.PI;

/** Normalises any angle to [0, 360). */
export function normalize(angle: number): number {
  return ((angle % 360) + 360) % 360;
}

/** Great-circle initial bearing from a point to the Kaaba, degrees clockwise from true north. */
export function qiblaBearing(latitude: number, longitude: number): number {
  const φ1 = rad(latitude);
  const φ2 = rad(KAABA.latitude);
  const Δλ = rad(KAABA.longitude - longitude);
  const y = Math.sin(Δλ);
  const x = Math.cos(φ1) * Math.tan(φ2) - Math.sin(φ1) * Math.cos(Δλ);
  return normalize(deg(Math.atan2(y, x)));
}

/** Great-circle distance to the Kaaba in km. */
export function distanceToKaabaKm(latitude: number, longitude: number): number {
  const R = 6371;
  const dφ = rad(KAABA.latitude - latitude);
  const dλ = rad(KAABA.longitude - longitude);
  const h = Math.sin(dφ / 2) ** 2 + Math.cos(rad(latitude)) * Math.cos(rad(KAABA.latitude)) * Math.sin(dλ / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

/**
 * How far to turn, in degrees: positive = turn right (clockwise), negative = turn left.
 * Always the short way round, in (-180, 180].
 */
export function turnBy(heading: number, bearing: number): number {
  const d = normalize(bearing - heading);
  return d > 180 ? d - 360 : d;
}

/** Facing the Qibla when within this many degrees. */
export const ALIGNED_DEGREES = 5;

export type Guidance = { kind: 'aligned' } | { kind: 'right' | 'left'; degrees: number };

export function guidance(heading: number, bearing: number): Guidance {
  const t = turnBy(heading, bearing);
  if (Math.abs(t) <= ALIGNED_DEGREES) return { kind: 'aligned' };
  return { kind: t > 0 ? 'right' : 'left', degrees: Math.round(Math.abs(t)) };
}

/** 16-point compass name for a bearing (N, NNE, NE…). */
export function compassPoint(bearing: number): string {
  const points = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
  return points[Math.round(normalize(bearing) / 22.5) % 16]!;
}

/**
 * Keeps a rotating dial continuous: picks the equivalent of `next` closest to `prev`
 * so 359° → 1° animates +2°, not −358°.
 */
export function unwrap(prev: number, next: number): number {
  return prev + turnBy(normalize(prev), normalize(next));
}
