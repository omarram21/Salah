/**
 * Renders the real Expo Router app (src/app) with Cairo fixture data to catch runtime errors
 * in screens, navigation and store wiring.
 */
import { fireEvent, renderRouter, screen, waitFor } from 'expo-router/testing-library';
import * as Notifications from 'expo-notifications';

import { useLocationStore } from '@/features/location';
import { usePrayerTimesStore } from '@/features/prayer-times';
import { cairo, cairoNovHead, cairoOctTail } from '@/features/prayer-times/model/__fixtures__/cairo';
import { cacheKey } from '@/features/prayer-times/store/prayer-times-store';
import { useSettingsStore } from '@/features/settings';
import { useTrackingStore } from '@/features/tracking';

const PK = '30.044,31.236|mauto|s0';
const NOW = cairo('2026-10-31T15:30', 2); // during Asr, 31 Oct

function seed({ withLocation = true, withData = true } = {}) {
  useSettingsStore.setState({ language: 'en', calculationMethod: 'auto', asrMethod: 'shafi' });
  useLocationStore.setState({
    location: withLocation
      ? { source: 'city', cityId: 'cairo', latitude: 30.044, longitude: 31.236, label: 'Cairo, Egypt' }
      : null,
  });
  usePrayerTimesStore.setState({
    error: null,
    syncing: false,
    months: withData
      ? { [cacheKey(PK, '2026-10')]: cairoOctTail, [cacheKey(PK, '2026-11')]: cairoNovHead }
      : {},
  });
  useTrackingStore.setState({ records: {}, trackingSince: '2026-10-28' });
}

beforeEach(() => {
  // Fake timers starting at NOW; RNTL's waitFor advances them for us.
  jest.useFakeTimers({ now: NOW });
  global.fetch = jest.fn(async () => {
    throw new TypeError('Network request failed');
  });
});

afterEach(() => {
  jest.useRealTimers();
  jest.clearAllMocks();
});

describe('app', () => {
  it('Today: shows dates, prayers and the next prayer', async () => {
    seed();
    renderRouter('./src/app', { initialUrl: '/' });

    expect(await screen.findByText('Saturday')).toBeTruthy();
    expect(screen.getByText('31 October 2026')).toBeTruthy();
    expect(screen.getByText(/1448 AH/)).toBeTruthy();
    expect(screen.getByText('Next: Maghrib')).toBeTruthy();
    for (const name of ['Fajr', 'Sunrise', 'Dhuhr', 'Asr', 'Isha']) {
      expect(screen.getAllByText(name).length).toBeGreaterThan(0);
    }
  });

  it('Today: one tap during Asr marks it on time', async () => {
    seed();
    renderRouter('./src/app', { initialUrl: '/' });

    fireEvent.press(await screen.findByLabelText('Asr: Not marked'));
    expect(useTrackingStore.getState().records['2026-10-31']?.asr?.status).toBe('onTime');
    expect(await screen.findByLabelText('Asr: Prayed on time')).toBeTruthy();
  });

  it('Today: tapping an ended prayer suggests "late" and saves the choice', async () => {
    seed();
    renderRouter('./src/app', { initialUrl: '/' });

    fireEvent.press(await screen.findByLabelText('Fajr: Not marked'));
    expect(await screen.findByText('Suggested')).toBeTruthy();
    fireEvent.press(screen.getByText('Prayed late'));
    expect(useTrackingStore.getState().records['2026-10-31']?.fajr?.status).toBe('late');
  });

  it('Today: asks about yesterday without auto-marking', async () => {
    seed();
    renderRouter('./src/app', { initialUrl: '/' });

    expect(await screen.findByText('Yesterday')).toBeTruthy();
    expect(screen.getByLabelText('Isha (Yesterday): Not marked')).toBeTruthy();
    expect(useTrackingStore.getState().records['2026-10-30']).toBeUndefined();
    fireEvent.press(screen.getByText('Mark the rest as not prayed'));
    expect(useTrackingStore.getState().records['2026-10-30']?.isha?.status).toBe('missed');
  });

  it('Today: at 01:00, one tap marks LAST NIGHT’s Isha as on time', async () => {
    seed();
    jest.setSystemTime(cairo('2026-11-01T01:00', 2));
    renderRouter('./src/app', { initialUrl: '/' });

    expect(await screen.findByText('Sunday')).toBeTruthy(); // the new day
    expect(screen.getByText('Isha · still in time')).toBeTruthy();
    fireEvent.press(screen.getByLabelText('Isha (Yesterday): Not marked'));

    const { records } = useTrackingStore.getState();
    expect(records['2026-10-31']?.isha?.status).toBe('onTime');
    expect(records['2026-11-01']).toBeUndefined();
  });

  it('Today: first launch asks for a location', async () => {
    seed({ withLocation: false });
    renderRouter('./src/app', { initialUrl: '/' });
    expect(await screen.findByText('Where are you?')).toBeTruthy();
    expect(screen.getByText('Choose a city')).toBeTruthy();
  });

  it('Today: offline with nothing saved shows an error and Retry', async () => {
    seed({ withData: false });
    renderRouter('./src/app', { initialUrl: '/' });
    expect(await screen.findByText('Couldn’t load prayer times')).toBeTruthy();
    expect(screen.getByText('Retry')).toBeTruthy();
  });

  it('schedules alarms with the iOS-safe cap', async () => {
    seed();
    renderRouter('./src/app', { initialUrl: '/' });
    await waitFor(() => expect(Notifications.scheduleNotificationAsync).toHaveBeenCalled(), {
      timeout: 3000,
    });
    expect((Notifications.scheduleNotificationAsync as jest.Mock).mock.calls.length).toBeLessThanOrEqual(60);
  });

  it('History: lists days and opens the day editor', async () => {
    seed();
    useTrackingStore.getState().setStatus('2026-10-30', 'fajr', 'onTime');
    renderRouter('./src/app', { initialUrl: '/history' });

    expect(await screen.findByText('October 2026')).toBeTruthy();
    fireEvent.press(screen.getByLabelText(/^Fri, 30 Oct: Fajr Prayed on time/));
    expect(await screen.findAllByText('Clear status')).toBeTruthy();
    fireEvent.press(screen.getAllByText('Prayed late')[1]!); // Dhuhr card
    expect(useTrackingStore.getState().records['2026-10-30']?.dhuhr?.status).toBe('late');
  });

  it('Stats: shows counts and streaks', async () => {
    seed();
    renderRouter('./src/app', { initialUrl: '/stats' });
    expect(await screen.findByText('This week')).toBeTruthy();
    expect(screen.getByText('On-time streak')).toBeTruthy();
    expect(screen.getByText('By prayer')).toBeTruthy();
  });

  it('Settings: switching to Arabic translates the app immediately', async () => {
    seed();
    renderRouter('./src/app', { initialUrl: '/settings' });
    fireEvent.press(await screen.findByText('العربية'));
    expect((await screen.findAllByText('الإعدادات')).length).toBeGreaterThan(0);
    expect(screen.getAllByText('الفجر').length).toBeGreaterThan(0);
    expect(useSettingsStore.getState().language).toBe('ar');
    // Layout flips to RTL immediately (no reload needed).
    const rtl = screen.UNSAFE_root.findAll((n) => {
      const style = n.props?.style;
      return [style].flat(Infinity).some((st) => st && st.direction === 'rtl');
    });
    expect(rtl.length).toBeGreaterThan(0);
  });

  it('Settings: calculation method picker saves a method', async () => {
    seed();
    renderRouter('./src/app', { initialUrl: '/calculation-method' });
    fireEvent.press(await screen.findByText('Umm Al-Qura University, Makkah'));
    expect(useSettingsStore.getState().calculationMethod).toBe(4);
  });
});
