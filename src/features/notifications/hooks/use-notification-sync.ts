import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AppState } from 'react-native';

import { locationToday, usePrayerDays, usePrayerParams } from '@/features/prayer-times';
import { useSettingsStore } from '@/features/settings';
import { useTrackingStore } from '@/features/tracking';
import { deviceUtcOffsetMin } from '@/shared/lib/date-key';
import { formatWallTime } from '@/shared/lib/format';

import { buildSchedule, type PlannedNotification } from '../logic/build-schedule';
import {
  cancelAll,
  configureNotificationHandler,
  ensureChannel,
  getPermission,
  replaceSchedule,
} from '../services/notification-service';
import { useNotificationPermission } from '../store/permission-store';

configureNotificationHandler();

const DEBOUNCE_MS = 800;

/**
 * Keeps OS-scheduled notifications in line with prayer times, settings and marks.
 * Reschedules on app open/foreground and whenever any input changes. Mount once at the root.
 */
export function useNotificationSync() {
  const { t, i18n } = useTranslation();
  const params = usePrayerParams();
  const { index } = usePrayerDays(params);
  const records = useTrackingStore((s) => s.records);
  const prefs = useSettingsStore((s) => s.alarms);
  const setPermission = useNotificationPermission((s) => s.setStatus);
  const lastSignature = useRef<string | null>(null);
  const foregroundTick = useForegroundTick();

  useEffect(() => {
    let cancelled = false;
    const timer = setTimeout(async () => {
      try {
        if (!prefs.enabled) {
          lastSignature.current = null;
          await cancelAll();
          return;
        }
        await ensureChannel(t('alarms.channelName'));
        const permission = await getPermission({ prompt: index.size > 0 });
        if (cancelled) return;
        setPermission(permission);
        if (permission !== 'granted') return;

        const now = Date.now();
        const today = locationToday(index, now, deviceUtcOffsetMin(now));
        const plans = buildSchedule({ index, records, prefs, now, today });
        const signature = `${i18n.language}|${plans.map((p) => `${p.id}@${p.at}`).join(',')}`;
        if (signature === lastSignature.current) return;

        const labels = { am: t('common.am'), pm: t('common.pm') };
        const contentFor = (plan: PlannedNotification) => {
          const prayer = t(`prayers.${plan.prayer}`);
          if (plan.kind === 'start') {
            const wall = index.get(plan.date)?.times[plan.prayer].wall ?? '';
            return {
              title: t('alarms.startTitle', { prayer }),
              body: t('alarms.startBody', { prayer, time: formatWallTime(wall, labels) }),
            };
          }
          return {
            title: t('alarms.reminderTitle', { prayer }),
            body: t('alarms.reminderBody', { prayer, minutes: prefs.reminderMinutes }),
          };
        };
        await replaceSchedule(plans, contentFor);
        lastSignature.current = signature;
      } catch (e) {
        // Scheduling is best-effort; the next trigger will retry.
        console.warn('Failed to schedule notifications', e);
        lastSignature.current = null;
      }
    }, DEBOUNCE_MS);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [index, records, prefs, i18n.language, t, setPermission, foregroundTick]);
}

/** Increments whenever the app returns to the foreground, forcing a fresh permission check and schedule. */
function useForegroundTick() {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const sub = AppState.addEventListener('change', (s) => {
      if (s === 'active') setTick((n) => n + 1);
    });
    return () => sub.remove();
  }, []);
  return tick;
}
