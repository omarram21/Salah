import * as Location from 'expo-location';
import { useEffect, useRef, useState } from 'react';

import { unwrap } from '../logic/qibla';

export type HeadingState = {
  /** Degrees clockwise from north, or null until the first reading. */
  heading: number | null;
  /** Same heading, but continuous (e.g. 359 → 361) so a rotating dial never spins the long way. */
  continuous: number;
  /** True north (needs location permission) or magnetic north (a few degrees off). */
  reference: 'true' | 'magnetic';
  /** Compass calibration: 0 none … 3 high (expo-location's scale). */
  accuracy: number;
  status: 'starting' | 'ok' | 'unavailable';
};

const MIN_CHANGE = 0.8; // degrees; avoids re-rendering on sensor noise

/** Live compass heading while the screen is mounted. */
export function useHeading(): HeadingState {
  const [state, setState] = useState<HeadingState>({ heading: null, continuous: 0, reference: 'magnetic', accuracy: 0, status: 'starting' });
  const last = useRef<number | null>(null);
  const continuous = useRef(0);

  useEffect(() => {
    let sub: Location.LocationSubscription | null = null;
    let cancelled = false;
    (async () => {
      try {
        // True heading needs location permission; ask, but work without it.
        await Location.requestForegroundPermissionsAsync().catch(() => undefined);
        sub = await Location.watchHeadingAsync(
          ({ trueHeading, magHeading, accuracy }) => {
            const useTrue = trueHeading >= 0;
            const h = useTrue ? trueHeading : magHeading;
            if (last.current !== null && Math.abs(h - last.current) < MIN_CHANGE) return;
            continuous.current = last.current === null ? h : unwrap(continuous.current, h);
            last.current = h;
            setState({ heading: h, continuous: continuous.current, reference: useTrue ? 'true' : 'magnetic', accuracy, status: 'ok' });
          },
          () => setState((s) => ({ ...s, status: 'unavailable' })),
        );
        if (cancelled) sub.remove();
      } catch {
        if (!cancelled) setState((s) => ({ ...s, status: 'unavailable' }));
      }
    })();
    return () => {
      cancelled = true;
      sub?.remove();
    };
  }, []);

  return state;
}
