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
import { selectRecords, useTrackingStore } from '@/features/tracking';

const PK = '30.044,31.236|mauto|s0';
const records = () => selectRecords(useTrackingStore.getState());
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
  useTrackingStore.setState({
    datasets: { real: { records: {}, trackingSince: '2026-10-28' }, demo: null },
    active: 'real',
  });
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
  it('Today: shows dates, location, countdown and the five prayers', async () => {
    seed();
    renderRouter('./src/app', { initialUrl: '/' });

    expect(await screen.findByText('Sat, 31 Oct')).toBeTruthy();
    expect(screen.getByText(/^20 Jum/)).toBeTruthy();
    expect(screen.getByText('Cairo')).toBeTruthy();
    expect(screen.getByText('Maghrib · 5:09 PM')).toBeTruthy();
    expect(screen.getByText(/^1:3\d:\d\d$/)).toBeTruthy(); // ticks while the test waits
    expect(screen.getByText('0 of 5 today')).toBeTruthy();
    for (const name of ['Fajr', 'Dhuhr', 'Maghrib', 'Isha']) expect(screen.getAllByText(name).length).toBeGreaterThan(0);
    expect(screen.getByText('Asr · Now')).toBeTruthy();
  });

  it('Today: one tap during Asr marks it on time', async () => {
    seed();
    renderRouter('./src/app', { initialUrl: '/' });

    fireEvent.press(await screen.findByLabelText('Asr: Prayed on time'));
    expect(records()['2026-10-31']?.asr?.status).toBe('onTime');
    expect(await screen.findByText('1 of 5 today')).toBeTruthy();
  });

  it('Today: tapping an ended prayer suggests "late" and saves the choice', async () => {
    seed();
    renderRouter('./src/app', { initialUrl: '/' });

    fireEvent.press(await screen.findByLabelText('Fajr: Not marked'));
    expect(await screen.findByText('Suggested')).toBeTruthy();
    fireEvent.press(screen.getByText('Prayed late'));
    expect(records()['2026-10-31']?.fajr?.status).toBe('late');
  });

  it('Today: an on-time prayer can be changed to "in mosque"', async () => {
    seed();
    renderRouter('./src/app', { initialUrl: '/' });

    fireEvent.press(await screen.findByLabelText('Asr: Prayed on time'));
    fireEvent.press(await screen.findByLabelText('Asr: Prayed on time'));
    fireEvent.press(await screen.findByText('Prayed in mosque'));
    expect(records()['2026-10-31']?.asr?.status).toBe('mosque');
  });

  it('Today: the bell turns a prayer’s alarm off', async () => {
    seed();
    renderRouter('./src/app', { initialUrl: '/' });

    fireEvent.press(await screen.findByLabelText('Alarm for Isha'));
    expect(useSettingsStore.getState().alarms.prayers.isha).toBe(false);
  });

  it('Today: asks about yesterday without auto-marking', async () => {
    seed();
    renderRouter('./src/app', { initialUrl: '/' });

    expect(await screen.findByText('Yesterday')).toBeTruthy();
    expect(screen.getByLabelText('Isha (Yesterday): Not marked')).toBeTruthy();
    expect(records()['2026-10-30']).toBeUndefined();
    fireEvent.press(screen.getByText('Mark the rest as not prayed'));
    expect(records()['2026-10-30']?.isha?.status).toBe('missed');
  });

  it('Today: at 01:00, one tap marks LAST NIGHT’s Isha as on time', async () => {
    seed();
    jest.setSystemTime(cairo('2026-11-01T01:00', 2));
    renderRouter('./src/app', { initialUrl: '/' });

    expect(await screen.findByText('Sun, 1 Nov')).toBeTruthy();
    expect(screen.getByText(/still in time/)).toBeTruthy();
    fireEvent.press(screen.getByLabelText('Isha (Yesterday): Not marked'));

    expect(records()['2026-10-31']?.isha?.status).toBe('onTime');
    expect(records()['2026-11-01']).toBeUndefined();
  });

  it('Welcome: first launch offers location or a city', async () => {
    seed({ withLocation: false });
    renderRouter('./src/app', { initialUrl: '/' });
    expect(await screen.findByText('Use my current location')).toBeTruthy();
    expect(screen.getByText('Choose a city')).toBeTruthy();
    expect(screen.getByText('Your records stay on your phone')).toBeTruthy();
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

  it('History: calendar → select a day → edit it one prayer at a time', async () => {
    seed();
    useTrackingStore.getState().setStatus('2026-10-30', 'fajr', 'onTime');
    renderRouter('./src/app', { initialUrl: '/history' });

    expect(await screen.findByText('October')).toBeTruthy();
    fireEvent.press(screen.getByLabelText(/^Fri, 30 Oct: Fajr Prayed on time/));
    fireEvent.press(await screen.findByLabelText('Edit Fri, 30 Oct'));

    // D1 editor opens on the first unmarked prayer (Dhuhr) and advances after a pick.
    expect(await screen.findByText('Friday, 30 October')).toBeTruthy();
    fireEvent.press(screen.getByLabelText('Dhuhr: Prayed in mosque'));
    expect(records()['2026-10-30']?.dhuhr?.status).toBe('mosque');
    expect(await screen.findByText('Done · 2 of 5 marked')).toBeTruthy();
    expect(screen.getByLabelText('Asr: Prayed late')).toBeTruthy();
  });

  it('History: days before tracking started are disabled', async () => {
    seed();
    renderRouter('./src/app', { initialUrl: '/history' });
    const early = await screen.findByLabelText(/^Thu, 1 Oct/);
    expect(early.props.accessibilityState?.disabled).toBe(true);
  });

  it('Stats: shows on-time %, counts, prayers and streaks', async () => {
    seed();
    useTrackingStore.getState().setStatuses('2026-10-30', ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'], 'onTime');
    renderRouter('./src/app', { initialUrl: '/stats' });
    expect(await screen.findByText('Week')).toBeTruthy();
    expect(screen.getByText('By prayer')).toBeTruthy();
    expect(screen.getByText('Current')).toBeTruthy();
    fireEvent.press(screen.getByText('Month'));
    expect(await screen.findByText('October 2026')).toBeTruthy();
  });

  it('Settings: grouped list opens sub-pages; Arabic applies immediately with RTL', async () => {
    seed();
    renderRouter('./src/app', { initialUrl: '/settings' });
    fireEvent.press(await screen.findByLabelText('Language, English'));
    fireEvent.press(await screen.findByText('العربية'));
    expect(useSettingsStore.getState().language).toBe('ar');
    expect((await screen.findAllByText('الإعدادات')).length).toBeGreaterThan(0);
    const rtl = screen.UNSAFE_root.findAll((n) => {
      const style = n.props?.style;
      return [style].flat(Infinity).some((st) => st && st.direction === 'rtl');
    });
    expect(rtl.length).toBeGreaterThan(0);
  });

  it('Settings: Asr method page saves Hanafi', async () => {
    seed();
    renderRouter('./src/app', { initialUrl: '/asr-method' });
    fireEvent.press(await screen.findByText('Hanafi'));
    expect(useSettingsStore.getState().asrMethod).toBe('hanafi');
  });

  it('Demo mode: fills History/Stats with sample data, then restores real records', async () => {
    seed();
    useTrackingStore.getState().setStatus('2026-10-30', 'fajr', 'late');
    renderRouter('./src/app', { initialUrl: '/settings' });

    fireEvent.press(await screen.findByLabelText('Demo data'));
    expect((await screen.findAllByText('Demo data · not your real records')).length).toBeGreaterThan(0);
    expect(Object.keys(records()).length).toBeGreaterThan(60);
    expect(useTrackingStore.getState().datasets.real.records['2026-10-30']?.fajr?.status).toBe('late');

    fireEvent.press(screen.getAllByText('Turn off')[0]!);
    expect(records()).toEqual({ '2026-10-30': { fajr: expect.objectContaining({ status: 'late' }) } });
    expect(screen.queryByText('Demo data · not your real records')).toBeNull();
  });

  it('Alarms page: previews when the next prayer rings and updates with the reminder', async () => {
    seed();
    renderRouter('./src/app', { initialUrl: '/alarms' });
    // Next prayer is Maghrib (5:09 → Isha 6:28); default reminder 20 min → 6:08.
    expect(await screen.findByText(/reminder at 6:08, 20 min before Isha/)).toBeTruthy();
    fireEvent.press(screen.getByLabelText('30 min before'));
    expect(useSettingsStore.getState().alarms.reminderMinutes).toBe(30);
    expect(await screen.findByText(/reminder at 5:58/)).toBeTruthy();
  });

  it('Alarms page: "Test alarm" fires a start alarm and a reminder within seconds', async () => {
    seed();
    renderRouter('./src/app', { initialUrl: '/alarms' });
    fireEvent.press(await screen.findByText('Send test alarm'));
    expect(await screen.findByText('Sent! Lock your phone now.')).toBeTruthy();

    const calls = (Notifications.scheduleNotificationAsync as jest.Mock).mock.calls.map((c) => c[0]);
    const tests = calls.filter((c) => c.identifier.startsWith('test:'));
    expect(tests.map((c) => c.trigger.seconds).sort((a: number, b: number) => a - b)).toEqual([5, 15]);
    expect(tests.map((c) => c.content.title)).toEqual(
      expect.arrayContaining(['Test · Maghrib', 'Test · Maghrib time is ending']),
    );
  });

  it('Settings: calculation method picker saves a method', async () => {
    seed();
    renderRouter('./src/app', { initialUrl: '/calculation-method' });
    fireEvent.press(await screen.findByText('Umm Al-Qura University, Makkah'));
    expect(useSettingsStore.getState().calculationMethod).toBe(4);
  });
});
