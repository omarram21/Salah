import { fetchCalendarByCity } from '@/shared/api/aladhan';

import { roundCoordinates } from '../model/distance';
import type { AppLocation } from '../model/types';

export type ResolvedCity = { location: AppLocation; timezone: string };

/**
 * Looks up a free-text city through AlAdhan's geocoder. AlAdhan always returns *some*
 * place, so the UI must show the result (timezone + coordinates) for the user to confirm.
 */
export async function resolveCity(city: string, country: string, now = new Date()): Promise<ResolvedCity> {
  const [first] = await fetchCalendarByCity({
    city: city.trim(),
    country: country.trim(),
    year: now.getFullYear(),
    month: now.getMonth() + 1,
    school: 0,
  });
  const { latitude, longitude, timezone } = first?.meta ?? {};
  if (latitude === undefined || longitude === undefined || !timezone) {
    throw new Error('City not found');
  }
  return {
    timezone,
    location: {
      source: 'city',
      ...roundCoordinates({ latitude, longitude }),
      label: [city.trim(), country.trim()].filter(Boolean).join(', '),
    },
  };
}
