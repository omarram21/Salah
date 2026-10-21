import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Direct path (not the feature index) to keep settings free of runtime deps on prayer-times.
import type { PrayerName } from '@/features/prayer-times/model/types';
import { DEFAULT_SUNNAH_ITEMS, type SunnahId } from '@/features/tracking/logic/sunnah';
import { getDeviceLanguage, type Language } from '@/shared/i18n';
import { STORAGE_KEYS, zustandStorage } from '@/shared/lib/storage';

export type ThemePreference = 'system' | 'light' | 'dark';

/** 'auto' lets AlAdhan choose the method used in the user's region. */
export type CalculationMethodSetting = 'auto' | number;

export type AsrMethod = 'shafi' | 'hanafi';

export type AlarmPrefs = {
  /** Master switch for all prayer notifications. */
  enabled: boolean;
  /** Per-prayer on/off (start alarm and reminder). */
  prayers: Record<PrayerName, boolean>;
  /** Reminder before the prayer's time ends, only if it isn't marked yet. */
  reminderEnabled: boolean;
  reminderMinutes: number;
  sound: AlarmSound;
};

/** Sound for the alarm at the start of a prayer. Files live in assets/sounds (scripts/generate-sounds.py). */
export const ALARM_SOUNDS = ['oud', 'bell', 'chime', 'dawn', 'default'] as const;
export type AlarmSound = (typeof ALARM_SOUNDS)[number];

export const REMINDER_MINUTE_OPTIONS = [10, 15, 20, 30, 45] as const;

export const DEFAULT_ALARMS: AlarmPrefs = {
  enabled: true,
  prayers: { fajr: true, dhuhr: true, asr: true, maghrib: true, isha: true },
  reminderEnabled: true,
  reminderMinutes: 20,
  sound: 'oud',
};

/** Local corrections on top of AlAdhan's times (e.g. to match a mosque). */
export type TimeAdjustSettings = {
  /** Minutes added to each prayer's start, −30…+30. */
  timeOffsets: Record<PrayerName, number>;
  /** When Isha's time ends: next Fajr (default) or Islamic midnight. */
  ishaEnd: 'fajr' | 'midnight';
  /** Days to shift the Hijri date, −2…+2 (moon-sighting differences). */
  hijriOffset: number;
};

export const DEFAULT_TIME_ADJUST: TimeAdjustSettings = {
  timeOffsets: { fajr: 0, dhuhr: 0, asr: 0, maghrib: 0, isha: 0 },
  ishaEnd: 'fajr',
  hijriOffset: 0,
};

export type SunnahSettings = {
  /** Track sunnah / Witr / Duha at all. */
  sunnahEnabled: boolean;
  /** Which ones to show. */
  sunnahItems: Record<SunnahId, boolean>;
};

export type SettingsState = TimeAdjustSettings & SunnahSettings & {
  language: Language;
  theme: ThemePreference;
  calculationMethod: CalculationMethodSetting;
  asrMethod: AsrMethod;
  alarms: AlarmPrefs;
};

type SettingsActions = {
  setLanguage: (language: Language) => void;
  setTheme: (theme: ThemePreference) => void;
  setCalculationMethod: (method: CalculationMethodSetting) => void;
  setAsrMethod: (method: AsrMethod) => void;
  updateAlarms: (patch: Partial<AlarmPrefs>) => void;
  setPrayerAlarm: (prayer: PrayerName, on: boolean) => void;
  setTimeOffset: (prayer: PrayerName, minutes: number) => void;
  setIshaEnd: (ishaEnd: TimeAdjustSettings['ishaEnd']) => void;
  setHijriOffset: (days: number) => void;
  resetTimeAdjust: () => void;
  setSunnahEnabled: (on: boolean) => void;
  setSunnahItem: (id: SunnahId, on: boolean) => void;
};

export const useSettingsStore = create<SettingsState & SettingsActions>()(
  persist(
    (set) => ({
      language: getDeviceLanguage(),
      theme: 'system',
      calculationMethod: 'auto',
      asrMethod: 'shafi',
      alarms: DEFAULT_ALARMS,
      ...DEFAULT_TIME_ADJUST,
      sunnahEnabled: true,
      sunnahItems: DEFAULT_SUNNAH_ITEMS,
      setLanguage: (language) => set({ language }),
      setTheme: (theme) => set({ theme }),
      setCalculationMethod: (calculationMethod) => set({ calculationMethod }),
      setAsrMethod: (asrMethod) => set({ asrMethod }),
      updateAlarms: (patch) => set((s) => ({ alarms: { ...s.alarms, ...patch } })),
      setPrayerAlarm: (prayer, on) =>
        set((s) => ({ alarms: { ...s.alarms, prayers: { ...s.alarms.prayers, [prayer]: on } } })),
      setTimeOffset: (prayer, minutes) =>
        set((s) => ({ timeOffsets: { ...s.timeOffsets, [prayer]: Math.max(-30, Math.min(30, Math.round(minutes))) } })),
      setIshaEnd: (ishaEnd) => set({ ishaEnd }),
      setHijriOffset: (days) => set({ hijriOffset: Math.max(-2, Math.min(2, Math.round(days))) }),
      resetTimeAdjust: () => set({ ...DEFAULT_TIME_ADJUST }),
      setSunnahEnabled: (sunnahEnabled) => set({ sunnahEnabled }),
      setSunnahItem: (id, on) => set((s) => ({ sunnahItems: { ...s.sunnahItems, [id]: on } })),
    }),
    {
      name: STORAGE_KEYS.settings,
      storage: zustandStorage,
      version: 1,
      partialize: ({ language, theme, calculationMethod, asrMethod, alarms, timeOffsets, ishaEnd, hijriOffset, sunnahEnabled, sunnahItems }) => ({
        language,
        theme,
        calculationMethod,
        asrMethod,
        alarms,
        timeOffsets,
        ishaEnd,
        hijriOffset,
        sunnahEnabled,
        sunnahItems,
      }),
      // Fill in fields added after a user's data was first saved.
      merge: (persisted, current) => {
        const p = (persisted ?? {}) as Partial<SettingsState>;
        return {
          ...current,
          ...p,
          timeOffsets: { ...DEFAULT_TIME_ADJUST.timeOffsets, ...p.timeOffsets },
          sunnahItems: { ...DEFAULT_SUNNAH_ITEMS, ...p.sunnahItems },
          alarms: {
            ...DEFAULT_ALARMS,
            ...p.alarms,
            prayers: { ...DEFAULT_ALARMS.prayers, ...p.alarms?.prayers },
          },
        };
      },
    },
  ),
);
