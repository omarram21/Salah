// State only. UI lives in './ui' so that features depending on settings
// (prayer-times, notifications) don't import screens that depend back on them.
export { useAppTheme } from './hooks/use-app-theme';
export { DEFAULT_ALARMS, REMINDER_MINUTE_OPTIONS, useSettingsStore } from './store/settings-store';
export type {
  AlarmPrefs,
  AsrMethod,
  CalculationMethodSetting,
  SettingsState,
  ThemePreference,
} from './store/settings-store';
