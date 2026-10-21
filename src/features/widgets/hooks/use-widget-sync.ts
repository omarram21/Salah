import { getCalendars } from 'expo-localization';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AppState } from 'react-native';

import { useLocationLabel, useLocationStore } from '@/features/location';
import { prayerNameKey, useOccasions } from '@/features/occasions';
import { locationToday, usePrayerDays, usePrayerParams } from '@/features/prayer-times';
import { qiblaBearing } from '@/features/qibla';
import { useSettingsStore } from '@/features/settings';
import { useTrackingStore } from '@/features/tracking';
import { useDateFormat } from '@/shared/i18n';
import { deviceUtcOffsetMin, weekdayOf } from '@/shared/lib/date-key';
import { formatWallTime } from '@/shared/lib/format';
import { useNow } from '@/shared/lib/use-now';

import { liveProps } from '../logic/live-activity';
import {
  changePoints,
  collectTaps,
  dailyTimeline,
  dayProps,
  dayTimeline,
  monthProps,
  weekProps,
  type WidgetInput,
  type WidgetLabels,
} from '../logic/widget-data';
import { nativeWidgets } from '../native';

const DEBOUNCE_MS = 1000;

/**
 * Keeps the iOS widgets and the Live Activity in line with prayer times, marks and settings.
 * Imports taps made on the "Mark" widget first. No-op where widgets aren't available. Mount once.
 */
export function useWidgetSync() {
  const { t, i18n } = useTranslation();
  const fmt = useDateFormat();
  const { index } = usePrayerDays(usePrayerParams());
  const real = useTrackingStore((s) => s.datasets.real);
  const markRealIfUnmarked = useTrackingStore((s) => s.markRealIfUnmarked);
  const location = useLocationStore((s) => s.location);
  const city = (useLocationLabel(location) ?? '').split(/[,،]/)[0]!.trim();
  const liveOn = useSettingsStore((s) => s.liveActivity);
  const [tick, setTick] = useState(0);
  const minute = useNow(60_000);
  const today = locationToday(index, minute, deviceUtcOffsetMin(minute));
  const { isFriday, isRamadan, isJumuah } = useOccasions(index, today);
  const last = useRef('');

  // Re-sync when the app comes back, and at the next change point while it stays open.
  useEffect(() => {
    const sub = AppState.addEventListener('change', (s) => s === 'active' && setTick((n) => n + 1));
    return () => sub.remove();
  }, []);
  useEffect(() => {
    const [, nextPoint] = changePoints(index, Date.now());
    if (!nextPoint) return;
    const timer = setTimeout(() => setTick((n) => n + 1), Math.min(nextPoint - Date.now() + 1000, 2 ** 31 - 1));
    return () => clearTimeout(timer);
  }, [index, tick]);

  useEffect(() => {
    const native = nativeWidgets();
    if (!native || index.size === 0) return;
    const timer = setTimeout(async () => {
      try {
        // 1. Taps on the Mark widget (saved in its timeline) → real records, never overwriting.
        const taps = collectTaps(await native.widgets.mark.getTimeline());
        for (const tap of taps) markRealIfUnmarked(tap.date, tap.prayer, tap.status, tap.at);

        // 2. Fresh timelines.
        const labels: WidgetLabels = {
          now: t('today.now'),
          in: t('widgets.in'),
          endsIn: t('widgets.endsIn'),
          today: t('widgets.today'),
          ofFive: t('widgets.ofFive'),
          days: t('widgets.days'),
          prayed: t('alarms.actionPrayed'),
          mosque: t('alarms.actionMosque'),
          onTime: t('status.onTimeShort'),
          late: t('status.lateShort'),
          thisWeek: t('stats.week'),
          onTimePct: t('stats.onTimeShort'),
          perfect: t('history.perfect'),
          missed: t('history.missed'),
          qibla: t('qibla.title'),
          ramadanDay: t('widgets.ramadanDay'),
          iftarIn: t('occasions.iftarIn'),
          suhoorEndsIn: t('occasions.suhoorEndsIn'),
          suhoor: t('widgets.suhoor'),
          iftar: t('widgets.iftar'),
          fasting: t('occasions.fasting'),
          fasted: t('widgets.fasted'),
          jumuah: t('prayers.jumuah'),
          kahf: t('occasions.kahf'),
          kahfDone: t('widgets.kahfDone'),
          noTimes: t('widgets.noTimes'),
          appName: t('welcome.title'),
        };
        const now = Date.now();
        const input: WidgetInput = {
          index,
          records: real.records,
          extras: real.extras,
          now,
          deviceOffsetMin: deviceUtcOffsetMin(now),
          rtl: i18n.language === 'ar',
          city,
          trackingSince: real.trackingSince,
          firstWeekday: getCalendars()[0]?.firstWeekday ?? 1,
          isFriday,
          isRamadan,
          fmt: {
            prayerName: (p, date) => t(prayerNameKey(p, isJumuah(date))),
            wallTime: (wall) => formatWallTime(wall, { am: t('common.am'), pm: t('common.pm') }),
            dateLabel: (date) => fmt.short(date),
            weekdayShort: (date) => t(`calendar.weekdaysShort.${String(weekdayOf(date)) as '0'}`),
            monthTitle: (date) => fmt.monthName(date.slice(0, 7)),
          },
          t: labels,
        };
        const day = dayTimeline(input);
        const week = dailyTimeline(input, weekProps);
        const month = dailyTimeline(input, monthProps);
        const qibla = location ? { rtl: input.rtl, bearing: qiblaBearing(location.latitude, location.longitude), city, t: labels } : null;
        const live = liveOn ? liveProps(dayProps(input, now), now) : null;

        const signature = JSON.stringify([day, week, month, qibla, live, taps.length]);
        if (signature !== last.current) {
          for (const w of [native.widgets.next, native.widgets.today, native.widgets.times, native.widgets.mark, native.widgets.arabic, native.widgets.season]) {
            w.updateTimeline(day);
          }
          native.widgets.streak.updateTimeline(week);
          native.widgets.month.updateTimeline(month);
          if (qibla) native.widgets.qibla.updateSnapshot(qibla);
          last.current = signature;
        }

        // 3. Live Activity: one countdown, updated in place; ended when switched off.
        const running = native.countdownActivity.getInstances();
        if (live) {
          const [first, ...rest] = running;
          if (first) await first.update(live);
          else native.countdownActivity.start(live, 'salah://');
          await Promise.all(rest.map((a) => a.end('immediate')));
        } else {
          await Promise.all(running.map((a) => a.end('immediate')));
        }
      } catch (e) {
        // Best effort: the next change retries.
        console.warn('Widget sync failed', e);
        last.current = '';
      }
    }, DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [index, real, location, city, liveOn, tick, i18n.language, t, fmt, isFriday, isRamadan, isJumuah, markRealIfUnmarked]);
}
