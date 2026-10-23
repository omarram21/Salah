import { fastPhase } from '@/features/occasions';
import {
  getCurrentPrayer,
  getNextPrayer,
  getPrayerWindow,
  locationToday,
  PRAYERS,
  type DayIndex,
  type PrayerName,
} from '@/features/prayer-times';
import { currentStreak } from '@/features/stats';
import { countsAsOnTime, STATUSES, type ExtrasByDate, type PrayerStatus, type RecordsByDate } from '@/features/tracking';
import { addDays, parseDateKey, type DateKey } from '@/shared/lib/date-key';

/**
 * Everything the home / Lock Screen widgets show, as plain JSON (widgets run in their own
 * process and only get props). Text is pre-translated and pre-formatted here.
 */

export type WidgetPrayer = {
  key: PrayerName;
  name: string;
  time: string;
  status: PrayerStatus | null;
  /** Hasn't started yet at this entry's time. */
  upcoming: boolean;
  current: boolean;
};

export type WidgetTap = { date: DateKey; prayer: PrayerName; status: 'onTime' | 'mosque'; at: number };

/** A status set on the "Edit prayers" widget; '' clears it. */
export type WidgetEdit = { date: DateKey; prayer: PrayerName; status: PrayerStatus | ''; at: number };

export type DayProps = {
  rtl: boolean;
  /** The day the widget shows (location's today at this entry). */
  date: DateKey;
  dateLabel: string;
  hijriLabel: string;
  city: string;
  /** Next prayer start. */
  next: { key: PrayerName; name: string; time: string; at: number } | null;
  /** Latest prayer that has started (may be yesterday's Isha). */
  prev: { key: PrayerName; name: string; time: string; at: number } | null;
  /** Prayer whose time is running (with when it started / ends). */
  current: { key: PrayerName; name: string; date: DateKey; start: number; end: number; status: PrayerStatus | null } | null;
  prayers: WidgetPrayer[];
  done: number;
  streak: number;
  season: SeasonProps;
  /** Set by the widget's own buttons; the app imports it next time it opens. */
  tap?: WidgetTap | null;
  /** Set by the "Edit prayers" widget, keyed `date:prayer`; the app imports them next time it opens. */
  edits?: Record<string, WidgetEdit>;
  t: WidgetLabels;
};

export type SeasonProps =
  | { kind: 'ramadan'; day: number; phase: 'suhoor' | 'iftar'; at: number; start: number; suhoor: string; iftar: string; fasted: boolean }
  | { kind: 'friday'; jumuahTime: string; jumuahAt: number; kahfDone: boolean }
  | { kind: 'none'; hijri: string };

export type WeekProps = {
  rtl: boolean;
  streak: number;
  pct: number | null;
  days: { label: string; statuses: (PrayerStatus | null)[]; today: boolean }[];
  t: WidgetLabels;
};

export type QiblaProps = {
  rtl: boolean;
  bearing: number;
  city: string;
  /** "161° from north (SE)", in the app's language. */
  label: string;
  /** N, E, S, W in the app's language. */
  cardinals: [string, string, string, string];
  t: WidgetLabels;
};

/** Short strings the layouts need, in the app's language. */
export type WidgetLabels = {
  now: string;
  in: string;
  endsIn: string;
  today: string;
  ofFive: string;
  days: string;
  prayed: string;
  mosque: string;
  onTime: string;
  late: string;
  thisWeek: string;
  onTimePct: string;
  perfect: string;
  missed: string;
  qibla: string;
  ramadanDay: string;
  iftarIn: string;
  suhoorEndsIn: string;
  suhoor: string;
  iftar: string;
  fasting: string;
  fasted: string;
  jumuah: string;
  kahf: string;
  kahfDone: string;
  noTimes: string;
  appName: string;
  prev: string;
  next: string;
  tapToChange: string;
};

export type Formatters = {
  prayerName: (prayer: PrayerName, date: DateKey) => string;
  wallTime: (wall: string) => string;
  dateLabel: (date: DateKey) => string;
  weekdayShort: (date: DateKey) => string;
};

export type WidgetInput = {
  index: DayIndex;
  records: RecordsByDate;
  extras: ExtrasByDate;
  now: number;
  deviceOffsetMin: number;
  rtl: boolean;
  city: string;
  trackingSince: DateKey | null;
  firstWeekday: number;
  isFriday: (date: DateKey) => boolean;
  isRamadan: (date: DateKey) => boolean;
  fmt: Formatters;
  t: WidgetLabels;
};

/** How far ahead timelines go; the app refreshes them whenever it's opened. */
export const HORIZON_MS = 36 * 3600_000;

/** Every instant the day widgets change: each prayer start, sunrise (end of Fajr) and each local midnight. */
export function changePoints(index: DayIndex, now: number, horizon = HORIZON_MS): number[] {
  const points = new Set<number>([now]);
  for (const day of index.values()) {
    for (const t of [day.times.fajr.at, day.times.sunrise.at, ...PRAYERS.slice(1).map((p) => day.times[p].at)]) {
      if (t > now && t <= now + horizon) points.add(t);
    }
    const { year, month, day: d } = parseDateKey(day.date);
    const midnight = Date.UTC(year, month - 1, d) - day.utcOffsetMin * 60_000;
    if (midnight > now && midnight <= now + horizon) points.add(midnight);
    if (day.ishaEndsAt && day.ishaEndsAt > now && day.ishaEndsAt <= now + horizon) points.add(day.ishaEndsAt);
  }
  return [...points].sort((a, b) => a - b);
}

/** Props for the day widgets (Next, Today, Times, Mark, Friday & Ramadan) at instant `at`. */
export function dayProps(input: WidgetInput, at: number): DayProps {
  const { index, records, extras, fmt, t } = input;
  const today = locationToday(index, at, input.deviceOffsetMin);
  const day = index.get(today);
  const cur = getCurrentPrayer(index, at, today);
  const nxt = getNextPrayer(index, at, today);
  const record = records[today];

  const prayers: WidgetPrayer[] = PRAYERS.map((p) => {
    const w = getPrayerWindow(index, today, p);
    return {
      key: p,
      name: fmt.prayerName(p, today),
      time: day ? fmt.wallTime(day.times[p].wall) : '—',
      status: record?.[p]?.status ?? null,
      upcoming: !w || at < w.start,
      current: !!cur && cur.date === today && cur.prayer === p,
    };
  });

  let prev: DayProps['prev'] = null;
  for (const date of [addDays(today, -1), today]) {
    const d = index.get(date);
    if (!d) continue;
    for (const p of PRAYERS) {
      const start = d.times[p].at;
      if (start <= at && (!prev || start > prev.at)) prev = { key: p, name: fmt.prayerName(p, date), time: fmt.wallTime(d.times[p].wall), at: start };
    }
  }

  return {
    rtl: input.rtl,
    date: today,
    dateLabel: fmt.dateLabel(today),
    hijriLabel: day ? `${day.hijri.day} ${day.hijri.monthName[input.rtl ? 'ar' : 'en']}` : '',
    city: input.city,
    next: nxt
      ? { key: nxt.prayer, name: fmt.prayerName(nxt.prayer, nxt.date), time: fmt.wallTime(index.get(nxt.date)!.times[nxt.prayer].wall), at: nxt.at }
      : null,
    prev,
    current: cur
      ? {
          key: cur.prayer,
          name: fmt.prayerName(cur.prayer, cur.date),
          date: cur.date,
          start: cur.start,
          end: cur.end,
          status: records[cur.date]?.[cur.prayer]?.status ?? null,
        }
      : null,
    prayers,
    done: PRAYERS.filter((p) => countsAsDone(record?.[p]?.status)).length,
    streak: currentStreak(records, today),
    season: seasonProps(input, at, today, extras),
    tap: null,
    t,
  };
}

function countsAsDone(s: PrayerStatus | undefined) {
  return s === 'mosque' || s === 'onTime' || s === 'late';
}

function seasonProps(input: WidgetInput, at: number, today: DateKey, extras: ExtrasByDate): SeasonProps {
  const { index, fmt } = input;
  const phase = fastPhase(index, at, today, input.isRamadan);
  if (phase) {
    const day = index.get(phase.date)!;
    const prev = index.get(addDays(phase.date, -1));
    // Progress bar runs Fajr → Maghrib for Iftar, previous Maghrib → Fajr for Suhoor.
    const start = phase.phase === 'iftar' ? day.times.fajr.at : (prev?.times.maghrib.at ?? at);
    return {
      kind: 'ramadan',
      day: day.hijri.month === 9 ? day.hijri.day : 1,
      phase: phase.phase,
      at: phase.at,
      start: Math.min(start, at),
      suhoor: fmt.wallTime(day.times.fajr.wall),
      iftar: fmt.wallTime(day.times.maghrib.wall),
      fasted: !!extras[today]?.fast,
    };
  }
  const day = index.get(today);
  if (day && input.isFriday(today)) {
    return { kind: 'friday', jumuahTime: fmt.wallTime(day.times.dhuhr.wall), jumuahAt: day.times.dhuhr.at, kahfDone: !!extras[today]?.kahf };
  }
  return { kind: 'none', hijri: day ? `${day.hijri.day} ${day.hijri.monthName[input.rtl ? 'ar' : 'en']} ${day.hijri.year}` : '' };
}

/** Timeline for the day widgets: one entry per change point. */
export function dayTimeline(input: WidgetInput): { date: Date; props: DayProps }[] {
  return changePoints(input.index, input.now).map((at) => ({ date: new Date(at), props: dayProps(input, at) }));
}

/** Last 7 days (oldest first) with on-time % and streak. */
export function weekProps(input: WidgetInput, at: number): WeekProps {
  const today = locationToday(input.index, at, input.deviceOffsetMin);
  const dates = Array.from({ length: 7 }, (_, i) => addDays(today, i - 6));
  let due = 0;
  let good = 0;
  const days = dates.map((date) => {
    const tracked = !input.trackingSince || date >= input.trackingSince;
    const statuses = PRAYERS.map((p) => input.records[date]?.[p]?.status ?? null);
    if (tracked) {
      for (const p of PRAYERS) {
        const w = getPrayerWindow(input.index, date, p);
        if (date < today || (w && w.start <= at)) {
          due += 1;
          if (countsAsOnTime(input.records[date]?.[p]?.status)) good += 1;
        }
      }
    }
    return { label: input.fmt.weekdayShort(date), statuses, today: date === today };
  });
  return {
    rtl: input.rtl,
    streak: currentStreak(input.records, today),
    pct: due ? Math.round((good / due) * 100) : null,
    days,
    t: input.t,
  };
}

/** Entries at each local midnight (the week widget only changes then, plus when the app syncs). */
export function dailyTimeline<P>(input: WidgetInput, build: (input: WidgetInput, at: number) => P): { date: Date; props: P }[] {
  const points = changePoints(input.index, input.now).filter((at, i, all) => {
    if (i === 0) return true;
    return locationToday(input.index, at, input.deviceOffsetMin) !== locationToday(input.index, all[i - 1]!, input.deviceOffsetMin);
  });
  return points.map((at) => ({ date: new Date(at), props: build(input, at) }));
}

/** Widget button taps saved in any timeline entry, oldest first, one per prayer. */
export function collectTaps(entries: { props: Partial<DayProps> | null | undefined }[]): WidgetTap[] {
  const byKey = new Map<string, WidgetTap>();
  for (const e of entries) {
    const tap = e.props?.tap;
    if (!tap || typeof tap !== 'object') continue;
    if (typeof tap.date !== 'string' || !(PRAYERS as readonly string[]).includes(tap.prayer)) continue;
    if (tap.status !== 'onTime' && tap.status !== 'mosque') continue;
    const key = `${tap.date}:${tap.prayer}`;
    if (!byKey.has(key)) byKey.set(key, tap);
  }
  return [...byKey.values()].sort((a, b) => a.at - b.at);
}

/** Edits saved in any timeline entry: the newest per prayer, oldest first. */
export function collectEdits(entries: { props: Partial<DayProps> | null | undefined }[]): WidgetEdit[] {
  const byKey = new Map<string, WidgetEdit>();
  for (const e of entries) {
    for (const edit of Object.values(e.props?.edits ?? {})) {
      if (!edit || typeof edit !== 'object' || typeof edit.date !== 'string' || typeof edit.at !== 'number') continue;
      if (!(PRAYERS as readonly string[]).includes(edit.prayer)) continue;
      if (edit.status !== '' && !(STATUSES as readonly string[]).includes(edit.status)) continue;
      const key = `${edit.date}:${edit.prayer}`;
      const seen = byKey.get(key);
      if (!seen || edit.at > seen.at) byKey.set(key, edit);
    }
  }
  return [...byKey.values()].sort((a, b) => a.at - b.at);
}

/**
 * Props as a property list. expo-widgets stores timelines in UserDefaults, which rejects the
 * whole write if anything is `null` (it arrives as NSNull), so the widget never gets data.
 * Null fields are dropped and null array items become '' — the layouts only test truthiness.
 */
export function plistSafe<T>(value: T): T {
  if (Array.isArray(value)) return value.map((v) => (v == null ? '' : plistSafe(v))) as T;
  if (value && typeof value === 'object' && !(value instanceof Date)) {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value)) if (v != null) out[k] = plistSafe(v);
    return out as T;
  }
  return value;
}
