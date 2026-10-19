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
