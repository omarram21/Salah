import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Direct path (not the feature index) to keep settings free of runtime deps on prayer-times.
import type { PrayerName } from '@/features/prayer-times/model/types';
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

export type SettingsState = {
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
};

export const useSettingsStore = create<SettingsState & SettingsActions>()(
  persist(
    (set) => ({
      language: getDeviceLanguage(),
      theme: 'system',
      calculationMethod: 'auto',
      asrMethod: 'shafi',
      alarms: DEFAULT_ALARMS,
      setLanguage: (language) => set({ language }),
      setTheme: (theme) => set({ theme }),
      setCalculationMethod: (calculationMethod) => set({ calculationMethod }),
      setAsrMethod: (asrMethod) => set({ asrMethod }),
      updateAlarms: (patch) => set((s) => ({ alarms: { ...s.alarms, ...patch } })),
      setPrayerAlarm: (prayer, on) =>
        set((s) => ({ alarms: { ...s.alarms, prayers: { ...s.alarms.prayers, [prayer]: on } } })),
    }),
    {
      name: STORAGE_KEYS.settings,
      storage: zustandStorage,
      version: 1,
      partialize: ({ language, theme, calculationMethod, asrMethod, alarms }) => ({
        language,
        theme,
        calculationMethod,
        asrMethod,
        alarms,
      }),
      // Fill in fields added after a user's data was first saved.
      merge: (persisted, current) => {
        const p = (persisted ?? {}) as Partial<SettingsState>;
        return {
          ...current,
          ...p,
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
