jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

jest.mock('expo-location', () => ({
  Accuracy: { Low: 2 },
  requestForegroundPermissionsAsync: jest.fn(async () => ({ granted: false, status: 'denied' })),
  getForegroundPermissionsAsync: jest.fn(async () => ({ granted: false, status: 'denied' })),
  getLastKnownPositionAsync: jest.fn(async () => null),
  getCurrentPositionAsync: jest.fn(),
  reverseGeocodeAsync: jest.fn(async () => []),
}));

jest.mock('expo-notifications', () => ({
  AndroidImportance: { HIGH: 4 },
  SchedulableTriggerInputTypes: { DATE: 'date' },
  setNotificationHandler: jest.fn(),
  setNotificationChannelAsync: jest.fn(async () => null),
  getPermissionsAsync: jest.fn(async () => ({ granted: true, status: 'granted', canAskAgain: true })),
  requestPermissionsAsync: jest.fn(async () => ({ granted: true, status: 'granted' })),
  cancelAllScheduledNotificationsAsync: jest.fn(async () => undefined),
  scheduleNotificationAsync: jest.fn(async () => 'id'),
}));

// On device, the compiled global.css registers `darkMode: class` (from tailwind.config.js).
// Jest mocks CSS out, so register the flag manually.
require('react-native-css-interop').StyleSheet.registerCompiled({ flags: { darkMode: 'class' } });
