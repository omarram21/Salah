import type { AladhanSchool } from '@/shared/api/aladhan';

/** Everything that changes the times AlAdhan returns. */
export type PrayerTimesParams = {
  latitude: number;
  longitude: number;
  /** Undefined = let AlAdhan pick the method for the region. */
  method: number | undefined;
  school: AladhanSchool;
};

export function paramsKey(p: PrayerTimesParams): string {
  return `${p.latitude.toFixed(3)},${p.longitude.toFixed(3)}|m${p.method ?? 'auto'}|s${p.school}`;
}
