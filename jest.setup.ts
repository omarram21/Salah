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
  // A phone pointing 100° (true north known). Tests can override per case.
  watchHeadingAsync: jest.fn(async (cb: (h: { trueHeading: number; magHeading: number; accuracy: number }) => void) => {
    cb({ trueHeading: 100, magHeading: 96, accuracy: 3 });
    return { remove: jest.fn() };
  }),
}));

jest.mock('expo-notifications', () => ({
  AndroidImportance: { HIGH: 4 },
  SchedulableTriggerInputTypes: { DATE: 'date', TIME_INTERVAL: 'timeInterval' },
  setNotificationHandler: jest.fn(),
  setNotificationChannelAsync: jest.fn(async () => null),
  setNotificationCategoryAsync: jest.fn(async () => null),
  addNotificationResponseReceivedListener: jest.fn(() => ({ remove: jest.fn() })),
  getLastNotificationResponse: jest.fn(() => null),
  clearLastNotificationResponse: jest.fn(),
  dismissNotificationAsync: jest.fn(async () => undefined),
  deleteNotificationChannelAsync: jest.fn(async () => undefined),
  getPermissionsAsync: jest.fn(async () => ({ granted: true, status: 'granted', canAskAgain: true })),
  requestPermissionsAsync: jest.fn(async () => ({ granted: true, status: 'granted' })),
  cancelAllScheduledNotificationsAsync: jest.fn(async () => undefined),
  cancelScheduledNotificationAsync: jest.fn(async () => undefined),
  getAllScheduledNotificationsAsync: jest.fn(async () => []),
  scheduleNotificationAsync: jest.fn(async () => 'id'),
}));

// On device, the compiled global.css registers `darkMode: class` (from tailwind.config.js).
// Jest mocks CSS out, so register the flag manually.
require('react-native-css-interop').StyleSheet.registerCompiled({ flags: { darkMode: 'class' } });

jest.mock('expo-audio', () => {
  const player = { play: jest.fn(), remove: jest.fn(), addListener: jest.fn(() => ({ remove: jest.fn() })) };
  return {
    createAudioPlayer: jest.fn(() => player),
    setAudioModeAsync: jest.fn(async () => undefined),
    __player: player,
  };
});
