import type { AladhanDay, AladhanResponse, AladhanSchool } from './types';

const BASE_URL = 'https://api.aladhan.com/v1';
const TIMEOUT_MS = 15_000;

export type ApiErrorKind = 'network' | 'server' | 'invalid';

export class ApiError extends Error {
  constructor(
    readonly kind: ApiErrorKind,
    message: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

type MonthQuery = {
  year: number;
  /** 1–12 */
  month: number;
  /** AlAdhan method id. Omit to let AlAdhan pick the method for the location's region. */
  method?: number;
  school: AladhanSchool;
};

export type CoordinatesMonthQuery = MonthQuery & { latitude: number; longitude: number };
export type CityMonthQuery = MonthQuery & { city: string; country: string };

/** GET /v1/calendar/{year}/{month} by coordinates. */
export function fetchCalendarByCoordinates(q: CoordinatesMonthQuery): Promise<AladhanDay[]> {
  return getCalendar(`/calendar/${q.year}/${q.month}`, q, {
    latitude: String(q.latitude),
    longitude: String(q.longitude),
  });
}

/** GET /v1/calendarByCity/{year}/{month}. Note: AlAdhan geocodes loosely and rarely rejects a city. */
export function fetchCalendarByCity(q: CityMonthQuery): Promise<AladhanDay[]> {
  return getCalendar(`/calendarByCity/${q.year}/${q.month}`, q, {
    city: q.city,
    country: q.country,
  });
}

async function getCalendar(
  path: string,
  q: MonthQuery,
  extra: Record<string, string>,
): Promise<AladhanDay[]> {
  const params: Record<string, string> = { ...extra, school: String(q.school), iso8601: 'true' };
  if (q.method !== undefined) params.method = String(q.method);

  const body = await getJson<AladhanResponse<AladhanDay[]>>(`${BASE_URL}${path}?${toQuery(params)}`);
  if (body.code !== 200 || !Array.isArray(body.data) || body.data.length === 0) {
    throw new ApiError('invalid', `Unexpected AlAdhan response (code ${body.code})`);
  }
  return body.data;
}

function toQuery(params: Record<string, string>) {
  return Object.entries(params)
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
    .join('&');
}

async function getJson<T>(url: string): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  let res: Response;
  try {
    res = await fetch(url, { signal: controller.signal, headers: { Accept: 'application/json' } });
  } catch (e) {
    throw new ApiError('network', e instanceof Error ? e.message : 'Network request failed');
  } finally {
    clearTimeout(timer);
  }
  if (!res.ok) throw new ApiError('server', `AlAdhan HTTP ${res.status}`);
  try {
    return (await res.json()) as T;
  } catch {
    throw new ApiError('invalid', 'AlAdhan returned invalid JSON');
  }
}
