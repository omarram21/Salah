# Salah — Prayer Tracker

Expo (SDK 57) + React Native + TypeScript app that shows the five daily prayer times, sends alarms,
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

- **Today** — Gregorian + Hijri date, live countdown to the next prayer, the five prayers with
  one-tap status buttons, and a "Yesterday" card for anything left unmarked (incl. Isha after midnight).
- **History** — every day since first use with a colored dot per prayer; tap a day to edit it.
- **Stats** — this week / this month counts per status and per prayer, current and best on-time streak.
- **Settings** — location, calculation method (automatic = AlAdhan's regional default), Asr method,
  alarms per prayer, reminder before the time ends, Arabic/English (RTL), light/dark/system theme.
- **Offline** — prayer times are fetched a month at a time from AlAdhan and cached; next month is
  prefetched during the last week of the current one.

## Structure

```
src/
  app/            Expo Router routes only — thin screens that compose features
  features/
    prayer-times/ AlAdhan → PrayerDay model, prayer windows, monthly cache, Today UI
    location/     GPS, built-in city list, free-text city lookup
    tracking/     status rules (pure), records store, status buttons/sheets, day editor
    notifications/ pure schedule builder + expo-notifications sync
    history/      day list grouped by month
    stats/        counts, ranges, streaks (pure) + Stats UI
    settings/     settings store (index.ts) and settings UI (ui.ts)
  shared/
    api/aladhan/  HTTP client + response types (no app logic)
    i18n/         en/ar strings, direction (RTL), date formatting
    lib/          date keys, formatting, storage keys, small hooks
    ui/           Button, Card, Text, Input, Screen, SegmentedControl, state views
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
