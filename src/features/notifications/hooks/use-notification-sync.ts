import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AppState } from 'react-native';

import { useOccasions } from '@/features/occasions';
import { locationToday, usePrayerDays, usePrayerParams } from '@/features/prayer-times';
import { useSettingsStore } from '@/features/settings';
import { useTrackingStore } from '@/features/tracking';
import { deviceUtcOffsetMin } from '@/shared/lib/date-key';
import { useNow } from '@/shared/lib/use-now';

import { buildSchedule, type PlannedNotification } from '../logic/build-schedule';
import { notificationContent } from '../logic/content';
import {
  cancelPrayerAlarms,
  configureNotificationHandler,
  registerPrayerActions,
  ensureChannels,
  getPermission,
  replaceSchedule,
} from '../services/notification-service';
import { channelNames } from '../logic/channel-names';
import { listenForNotificationActions } from '../services/action-handler';
import { useNotificationPermission } from '../store/permission-store';

configureNotificationHandler();
listenForNotificationActions();

const DEBOUNCE_MS = 800;

/**
 * Keeps OS-scheduled notifications in line with prayer times, settings and marks.
 * Reschedules on app open/foreground and whenever any input changes. Mount once at the root.
 */
export function useNotificationSync() {
  const { t, i18n } = useTranslation();
  const params = usePrayerParams();
  const { index } = usePrayerDays(params);
  // Real records only: marking demo data must not cancel real reminders.
  const records = useTrackingStore((s) => s.datasets.real.records);
  const extras = useTrackingStore((s) => s.datasets.real.extras);
  const friday = useSettingsStore((s) => s.friday);
  const ramadan = useSettingsStore((s) => s.ramadan);
  // Re-read each minute so Friday/Ramadan previews follow the date (only `today` is used).
  const minute = useNow(60_000);
  const { isFriday, isRamadan, isJumuah } = useOccasions(index, locationToday(index, minute, deviceUtcOffsetMin(minute)));
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
          await cancelPrayerAlarms();
          return;
        }
        await ensureChannels(channelNames(t));
        await registerPrayerActions({ prayed: t('alarms.actionPrayed'), mosque: t('alarms.actionMosque') });
        const permission = await getPermission({ prompt: index.size > 0 });
        if (cancelled) return;
        setPermission(permission);
        if (permission !== 'granted') return;

        const now = Date.now();
        const today = locationToday(index, now, deviceUtcOffsetMin(now));
        const occasions = { isFriday, isRamadan, friday, ramadan };
        const plans = buildSchedule({ index, records, prefs, now, today, extras, occasions });
        // Wording depends on Friday / Ramadan too (Jumu'ah, Iftar).
        const wording = plans.map((p) => (isJumuah(p.date) ? 'j' : '') + (isRamadan(p.date) ? 'r' : '')).join('');
        const signature = `${i18n.language}|${prefs.sound}|${wording}|${ramadan.suhoorMinutes}|${plans.map((p) => `${p.id}@${p.at}`).join(',')}`;
        if (signature === lastSignature.current) return;

        const contentFor = (plan: PlannedNotification) =>
          notificationContent(plan, {
            t,
            index,
            reminderMinutes: prefs.reminderMinutes,
            suhoorMinutes: ramadan.suhoorMinutes,
            isJumuah,
            isRamadan,
          });
        await replaceSchedule(plans, contentFor, prefs.sound);
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
  }, [index, records, extras, prefs, friday, ramadan, isFriday, isRamadan, isJumuah, i18n.language, t, setPermission, foregroundTick]);
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
