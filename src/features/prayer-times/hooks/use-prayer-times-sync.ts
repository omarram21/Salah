import { useEffect } from 'react';
import { AppState } from 'react-native';

import { useGpsRefresh } from '@/features/location';

import { usePrayerTimesStore } from '../store/prayer-times-store';
import { usePrayerParams } from './use-prayer-params';

const RESYNC_EVERY_MS = 60 * 60_000;

/**
 * Keeps the offline cache filled: on launch, whenever location/settings change,
 * when the app comes back to the foreground, and hourly while it stays open.
 * Mount once, in the root layout.
 */
export function usePrayerTimesSync() {
  const params = usePrayerParams();
  const sync = usePrayerTimesStore((s) => s.sync);
  const refreshGps = useGpsRefresh();

  useEffect(() => {
    if (params) void sync(params);
  }, [params, sync]);

  useEffect(() => {
    const run = () => {
      void refreshGps(); // updates the location store → params change → effect above syncs
      if (params) void sync(params);
    };
    const sub = AppState.addEventListener('change', (s) => s === 'active' && run());
    const timer = setInterval(run, RESYNC_EVERY_MS);
    return () => {
      sub.remove();
      clearInterval(timer);
    };
  }, [params, sync, refreshGps]);
}
