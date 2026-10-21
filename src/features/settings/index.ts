// State only. UI lives in './ui' so that features depending on settings
// (prayer-times, notifications) don't import screens that depend back on them.
export { useAppTheme } from './hooks/use-app-theme';
export {
  ALARM_SOUNDS,
  DEFAULT_ALARMS,
  DEFAULT_FRIDAY,
  DEFAULT_RAMADAN,
  KAHF_HOUR_OPTIONS,
  SUHOOR_MINUTE_OPTIONS,
  DEFAULT_TIME_ADJUST,
  REMINDER_MINUTE_OPTIONS,
  useSettingsStore,
} from './store/settings-store';
export type {
  AlarmPrefs,
  AlarmSound,
  AsrMethod,
  CalculationMethodSetting,
  FridayPrefs,
  RamadanPrefs,
  SettingsState,
  ThemePreference,
  SunnahSettings,
  TimeAdjustSettings,
} from './store/settings-store';
