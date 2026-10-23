# Hayya (حيّ) — Prayer Tracker

**Hayya** — from the adhan's *“Hayya ʿala-s-salah”* (come to prayer). Expo (SDK 57) + React Native + TypeScript app that shows the five daily prayer times, sends alarms,
and tracks whether each prayer was prayed on time, late, or not at all.

> Pinned to SDK 57 because Expo Go for SDK 58 is not yet on the App Store / Play Store.
> To upgrade once it is: `npx expo install expo@^58.0.0 --fix`.

## Run

```bash
npm install
npx expo start        # scan the QR code with Expo Go
npm test              # unit + screen smoke tests
npm run typecheck     # tsc --noEmit
npx expo lint
```

## Features

Design "E": minimal, icon-led, Space Grotesk, one orange accent (light + dark).

- **Today** — next prayer and a big countdown, today's ring and streak, the five prayers with
  time-of-day icons. The current prayer shows four status buttons (🕌 ✓ 🕒 ✕); marked prayers show
  one colored icon; upcoming prayers show their alarm bell (tap to toggle). A "Yesterday" card
  asks about unmarked prayers (incl. Isha after midnight).
- **History** — month calendar with 5 status dots per day and a selected-day panel; "Edit" opens
  a one-prayer-at-a-time editor that advances after each pick.
- **Stats** — week / month on-time % (mosque counts as on time), status counts, per-prayer bars,
  current and best streak, and a short insight (strongest / weakest prayer).
- **Settings** — grouped list; Alarms page previews when the next prayer and its reminder will ring,
  with a test alarm and the scheduled-alarms list. Language (Arabic RTL), theme, demo data.
- **Qibla** — compass screen (from Today's header or Settings): the dial turns with the phone,
  the Kaaba marker shows where to face, with "Turn right 23°" / "Facing the Qibla", bearing and
  distance to Makkah. Uses true north with location permission, magnetic north without.
- **Adjust times** — per-prayer ±30 min, Isha ends at next Fajr or Islamic midnight, Hijri date ±2
  days. Applied locally on top of AlAdhan's times (offline, instant; alarms/tracking/stats follow).
- **Sunnah & Witr** — small done/not-done chips under each prayer (2 before Fajr, 4 before / 2 after
  Dhuhr, 2 after Maghrib, 2 after Isha, Witr; optional Duha row). Also in the day editor, a
  "Sunnah 4/5 · Witr ✓" line in History, and a Stats card with per-item counts and a Witr streak.
  Witr after midnight counts for the previous night. Choose which to track in Settings → Sunnah & Witr.
  They never affect the on-time streak.
- **Friday** — Dhuhr is called Jumu'ah (Today, alarms, History, day editor), a "Jumu'ah Mubarak"
  card with a "Read Al-Kahf" check, and an Al-Kahf reminder on Friday at a chosen hour (skipped once
  marked read).
- **Ramadan** — turns on by itself from the Hijri date (month 9). Today shows a Suhoor / Iftar countdown
  and a "Fasting today" check; Maghrib's alarm says "Iftar time"; optional Suhoor reminder N minutes
  before Fajr. History lets you edit fasts; Stats counts fasting days and Al-Kahf Fridays. Eid card on
  1 Shawwal and 10 Dhul-Hijjah. Settings → Friday & Ramadan has "Preview" switches (not saved) to try it
  on any day.
- **Widgets (iOS, `expo-widgets`)** — Next prayer, Previous & next, Today, Prayer times, Mark prayer and
  Edit prayers (tap buttons, iOS 17+), Streak & week, حيّ (Arabic), Friday & Ramadan, Qibla — Home Screen, Lock Screen and StandBy sizes,
  plus a Live Activity countdown (Lock Screen + Dynamic Island, Settings → Widgets). The app writes ~36 h
  timelines (an entry at every prayer start, sunrise and midnight) and countdowns tick on their own.
  Taps on "Mark prayer" and "Edit prayers" are saved in the widget and imported when the app opens. Layouts live in
  `features/widgets/native/layouts.tsx` (each `'widget'` function is serialized — no outside references);
  `__tests__/layouts.test.ts` runs them in a fake widget runtime. Not in Expo Go (needs the built app).
- **Notification buttons** — "Prayed" / "In mosque" on alarms and reminders mark the prayer without
  opening the app (never overwriting an existing mark).
- **Offline** — prayer times are fetched a month at a time from AlAdhan and cached; next month is
  prefetched during the last week of the current one.

## Structure

```
src/
  app/            Expo Router routes only — thin screens that compose features
  features/
    prayer-times/ AlAdhan → PrayerDay model, prayer windows, monthly cache
    today/        Today screen (composes prayer-times + tracking + settings)
    location/     GPS, built-in city list, free-text city lookup
    tracking/     status rules (pure), records store, status buttons/sheets, day editor
    notifications/ pure schedule builder + expo-notifications sync
    history/      month grid (pure) + calendar screen
    stats/        counts, ranges, streaks (pure) + Stats UI
    qibla/        bearing / distance / turn guidance (pure) + compass screen
    settings/     settings store (index.ts) and settings UI (ui.ts)
  shared/
    api/aladhan/  HTTP client + response types (no app logic)
    i18n/         en/ar strings, direction (RTL), date formatting
    lib/          date keys, formatting, storage keys, small hooks
    theme/        color tokens, fonts
    ui/           Icon set, Text, Button, Switch, Screen, SegmentedControl, tab bar, state views
```

Rules:

- `features/*/logic` and `features/*/model` are pure TypeScript (no React, no I/O) and unit-tested.
- `shared/` never imports from `features/`. Features import each other through their `index.ts`.
- No circular imports (`npx madge --circular --extensions ts,tsx --ts-config tsconfig.json src`).
- Every persisted store has its own versioned key in `shared/lib/storage.ts`.

## Key decisions

- **Times are absolute instants.** AlAdhan is called with `iso8601=true`, so each time carries its UTC
  offset; DST changes and picking a city in another timezone just work. Times are shown in the
  location's wall clock.
- **Prayer windows:** Fajr → sunrise, Dhuhr → Asr, Asr → Maghrib, Maghrib → Isha, Isha → next day's Fajr.
- **Records are keyed by the date the prayer belongs to.** Isha prayed at 00:30 counts for the previous day.
- **Statuses are never set automatically.** One tap during the window = on time; after it, a picker
  opens with "late" suggested. "Not prayed" is only ever set by the user.
- **Alarms:** start + optional reminder (default 20 min before the end, skipped if already marked),
  scheduled ~6 days ahead and capped at 60 (iOS allows 64). Rescheduled on app open/foreground and
  whenever times, settings, language or marks change.
- **RTL** uses the `direction` style + expo-router's `LocaleProvider` instead of
  `I18nManager.forceRTL`, so it switches instantly and works in Expo Go.

## Brand assets

- App icon, Android adaptive icon, splash and in-app logo are the «حي» monogram in Reem Kufi with an
  orange sun in place of the shadda. They're PNGs in `assets/images/`.
- Home-screen name: `Hayya` / `حيّ` via `app.json → locales` (`locales/en.json`, `locales/ar.json`).
- Bundle IDs, slug and storage keys still say `salah`; changing them would install a separate app
  and lose saved data.
