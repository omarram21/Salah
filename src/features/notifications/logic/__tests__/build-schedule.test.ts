import { cairo, cairoIndex } from '@/features/prayer-times/model/__fixtures__/cairo';
import { DEFAULT_ALARMS } from '@/features/settings';
import { addDays } from '@/shared/lib/date-key';

import { buildSchedule, MAX_SCHEDULED } from '../build-schedule';

const base = {
  index: cairoIndex,
  records: {},
  prefs: DEFAULT_ALARMS,
  now: cairo('2026-10-31T15:30', 2), // during Asr on 31 Oct
  today: '2026-10-31',
};

describe('buildSchedule', () => {
  it('schedules only future notifications, sorted', () => {
    const plans = buildSchedule(base);
    expect(plans.length).toBeGreaterThan(0);
    expect(plans.every((p) => p.at > base.now)).toBe(true);
    expect(plans.map((p) => p.at)).toEqual([...plans.map((p) => p.at)].sort((a, b) => a - b));
  });

  it('first is the Asr reminder (20 min before Maghrib), then Maghrib start', () => {
    const [first, second] = buildSchedule(base);
    const day = cairoIndex.get('2026-10-31')!;
    expect(first).toMatchObject({ prayer: 'asr', kind: 'reminder', at: day.times.maghrib.at - 20 * 60_000 });
    expect(second).toMatchObject({ prayer: 'maghrib', kind: 'start' });
  });

  it('drops the reminder once the prayer is marked', () => {
    const records = { '2026-10-31': { asr: { status: 'onTime' as const, updatedAt: 0 } } };
    const plans = buildSchedule({ ...base, records });
    expect(plans.find((p) => p.id === '2026-10-31:asr:reminder')).toBeUndefined();
  });

  it('Isha reminder is before the NEXT day’s Fajr, across months', () => {
    const plans = buildSchedule(base);
    const r = plans.find((p) => p.id === '2026-10-31:isha:reminder')!;
    expect(r.at).toBe(cairoIndex.get('2026-11-01')!.times.fajr.at - 20 * 60_000);
  });

  it('keeps yesterday’s Isha reminder after midnight', () => {
    const plans = buildSchedule({ ...base, now: cairo('2026-11-01T01:00', 2), today: '2026-11-01' });
    expect(plans[0]).toMatchObject({ id: '2026-10-31:isha:reminder' });
  });

  it('respects per-prayer switches and the master switch', () => {
    const noFajr = { ...DEFAULT_ALARMS, prayers: { ...DEFAULT_ALARMS.prayers, fajr: false } };
    expect(buildSchedule({ ...base, prefs: noFajr }).some((p) => p.prayer === 'fajr')).toBe(false);
    expect(buildSchedule({ ...base, prefs: { ...DEFAULT_ALARMS, enabled: false } })).toEqual([]);
  });

  it('can turn reminders off', () => {
    const plans = buildSchedule({ ...base, prefs: { ...DEFAULT_ALARMS, reminderEnabled: false } });
    expect(plans.every((p) => p.kind === 'start')).toBe(true);
  });

  it('skips a reminder longer than the window', () => {
    const plans = buildSchedule({ ...base, prefs: { ...DEFAULT_ALARMS, reminderMinutes: 600 } });
    expect(plans.some((p) => p.kind === 'reminder' && p.prayer === 'maghrib')).toBe(false);
  });

  it('never exceeds the iOS-safe cap', () => {
    // 10 consecutive days copied from one real day, shifted by 24h each.
    const template = cairoIndex.get('2026-10-31')!;
    const big = new Map(
      Array.from({ length: 10 }, (_, i) => {
        const date = addDays('2026-12-01', i);
        const times = Object.fromEntries(
          Object.entries(template.times).map(([k, v]) => [k, { ...v, at: v.at + (31 + i) * 86_400_000 }]),
        ) as typeof template.times;
        return [date, { ...template, date, times }] as const;
      }),
    );
    const plans = buildSchedule({ ...base, index: big, now: 0, today: '2026-12-01' });
    expect(plans).toHaveLength(MAX_SCHEDULED);
  });
});
