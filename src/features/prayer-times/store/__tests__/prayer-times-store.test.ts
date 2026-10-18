import oct from '@/shared/api/aladhan/__fixtures__/cairo-2026-10-tail.json';

import type { PrayerTimesParams } from '../../model/params';
import { cacheKey, usePrayerTimesStore } from '../prayer-times-store';

const params: PrayerTimesParams = { latitude: 30.044, longitude: 31.236, method: undefined, school: 0 };
const PK = '30.044,31.236|mauto|s0';
// Mid-month noon UTC, so device timezone can't shift the date.
const MID_OCT = Date.UTC(2026, 9, 15, 12);
const LATE_OCT = Date.UTC(2026, 9, 28, 12);

const okResponse = () =>
  Promise.resolve({ ok: true, status: 200, json: () => Promise.resolve(oct) } as Response);

beforeEach(() => {
  usePrayerTimesStore.setState({ months: {}, syncing: false, error: null });
  global.fetch = jest.fn(okResponse);
});

describe('prayer times store', () => {
  it('fetches the current month with iso8601 and no method when "auto"', async () => {
    await usePrayerTimesStore.getState().sync(params, MID_OCT);

    expect(fetch).toHaveBeenCalledTimes(1);
    const url = (fetch as jest.Mock).mock.calls[0][0] as string;
    expect(url).toContain('/calendar/2026/10?');
    expect(url).toContain('iso8601=true');
    expect(url).not.toContain('method=');
    expect(usePrayerTimesStore.getState().months[cacheKey(PK, '2026-10')]).toBeDefined();
    expect(usePrayerTimesStore.getState().error).toBeNull();
  });

  it('does not refetch a cached month (works offline)', async () => {
    await usePrayerTimesStore.getState().sync(params, MID_OCT);
    (fetch as jest.Mock).mockRejectedValue(new TypeError('Network request failed'));
    await usePrayerTimesStore.getState().sync(params, MID_OCT);

    expect(fetch).toHaveBeenCalledTimes(1);
    expect(usePrayerTimesStore.getState().error).toBeNull();
  });

  it('prefetches next month in the last week', async () => {
    await usePrayerTimesStore.getState().sync(params, LATE_OCT);
    const urls = (fetch as jest.Mock).mock.calls.map((c) => c[0] as string);
    expect(urls.some((u) => u.includes('/calendar/2026/11?'))).toBe(true);
  });

  it('reports a network error when nothing is cached', async () => {
    (fetch as jest.Mock).mockRejectedValue(new TypeError('Network request failed'));
    await usePrayerTimesStore.getState().sync(params, MID_OCT);

    const s = usePrayerTimesStore.getState();
    expect(s.error).toBe('network');
    expect(s.syncing).toBe(false);
    expect(Object.keys(s.months)).toHaveLength(0);
  });

  it('keeps old data when new settings fail to load offline', async () => {
    await usePrayerTimesStore.getState().sync(params, MID_OCT);
    (fetch as jest.Mock).mockRejectedValue(new TypeError('offline'));
    await usePrayerTimesStore.getState().sync({ ...params, school: 1 }, MID_OCT);

    expect(usePrayerTimesStore.getState().months[cacheKey(PK, '2026-10')]).toBeDefined();
    expect(usePrayerTimesStore.getState().error).toBe('network');
  });

  it('drops other settings once the new ones load', async () => {
    await usePrayerTimesStore.getState().sync(params, MID_OCT);
    await usePrayerTimesStore.getState().sync({ ...params, method: 4 }, MID_OCT);

    const keys = Object.keys(usePrayerTimesStore.getState().months);
    expect(keys).toEqual([cacheKey('30.044,31.236|m4|s0', '2026-10')]);
  });

  it('flags a server error', async () => {
    (fetch as jest.Mock).mockResolvedValue({ ok: false, status: 503 } as Response);
    await usePrayerTimesStore.getState().sync(params, MID_OCT);
    expect(usePrayerTimesStore.getState().error).toBe('server');
  });
});
