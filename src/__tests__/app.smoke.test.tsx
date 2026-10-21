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
import { DEFAULT_ALARMS, DEFAULT_FRIDAY, DEFAULT_RAMADAN, DEFAULT_TIME_ADJUST, useSettingsStore } from '@/features/settings';
import { DEFAULT_SUNNAH_ITEMS, selectExtras, selectRecords, useTrackingStore } from '@/features/tracking';

const PK = '30.044,31.236|mauto|s0';
const records = () => selectRecords(useTrackingStore.getState());
const extras = () => selectExtras(useTrackingStore.getState());
const NOW = cairo('2026-10-31T15:30', 2); // during Asr, 31 Oct

function seed({ withLocation = true, withData = true } = {}) {
  useSettingsStore.setState({
    theme: 'system',
    ...DEFAULT_TIME_ADJUST,
    language: 'en',
    calculationMethod: 'auto',
    asrMethod: 'shafi',
    alarms: DEFAULT_ALARMS,
    sunnahEnabled: true,
    sunnahItems: DEFAULT_SUNNAH_ITEMS,
    friday: DEFAULT_FRIDAY,
    ramadan: DEFAULT_RAMADAN,
    preview: { friday: false, ramadan: false },
  });
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
    datasets: { real: { records: {}, trackingSince: '2026-10-28', extras: {} }, demo: null },
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
    const calls = (Notifications.scheduleNotificationAsync as jest.Mock).mock.calls.map((c) => c[0]);
    expect(calls.length).toBeLessThanOrEqual(60);
    // Default sound is the oud; reminders use the soft knock on their own channel.
    const start = calls.find((c) => c.identifier.endsWith(':start'));
    const reminder = calls.find((c) => c.identifier.endsWith(':reminder'));
    expect(start.content.sound).toBe('oud.wav');
    expect(start.trigger.channelId).toBe('prayer-oud');
    expect(reminder.content.sound).toBe('reminder.wav');
    expect(reminder.trigger.channelId).toBe('prayer-reminder');
    // Both carry the "Prayed" / "In mosque" buttons and the window end.
    expect(start.content.categoryIdentifier).toBe('prayer');
    expect(reminder.content.categoryIdentifier).toBe('prayer');
    expect(typeof start.content.data.end).toBe('number');
    expect(Notifications.setNotificationCategoryAsync).toHaveBeenCalledWith(
      'prayer',
      expect.arrayContaining([expect.objectContaining({ identifier: 'prayed', buttonTitle: 'Prayed' })]),
    );
  });

  it('Sound page: previews a sound and saves the choice', async () => {
    const audio = jest.requireMock('expo-audio');
    seed();
    renderRouter('./src/app', { initialUrl: '/alarm-sound' });
    fireEvent.press(await screen.findByLabelText('Play Bell'));
    expect(audio.createAudioPlayer).toHaveBeenCalled();
    expect(audio.__player.play).toHaveBeenCalled();
    fireEvent.press(screen.getByLabelText('Bell'));
    expect(useSettingsStore.getState().alarms.sound).toBe('bell');
  });

  it('History: calendar → select a day → edit it one prayer at a time', async () => {
    seed();
    useTrackingStore.getState().setStatus('2026-10-30', 'fajr', 'onTime');
    renderRouter('./src/app', { initialUrl: '/history' });

    expect(await screen.findByText('October')).toBeTruthy();
    fireEvent.press(screen.getByLabelText(/^Fri, 30 Oct: Fajr Prayed on time/));
    fireEvent.press(await screen.findByLabelText('Edit Fri, 30 Oct'));

    // D1 editor opens on the first unmarked prayer (Dhuhr — Jumu'ah, it's a Friday) and advances after a pick.
    expect(await screen.findByText('Friday, 30 October')).toBeTruthy();
    fireEvent.press(screen.getByLabelText('Jumu’ah: Prayed in mosque'));
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

  it('Qibla: shows the direction, distance and which way to turn', async () => {
    seed();
    renderRouter('./src/app', { initialUrl: '/qibla' });
    // Cairo → Qibla ≈ 136°. The mocked phone points at 100°, so turn right ~36°.
    expect(await screen.findByText(/^Turn right 3\d°$/)).toBeTruthy();
    expect(screen.getByText(/^13\d° SE$/)).toBeTruthy();
    expect(screen.getByText(/^1,2\d\d km$/)).toBeTruthy();
  });

  it('Qibla: says when you are facing it', async () => {
    const location = jest.requireMock('expo-location');
    location.watchHeadingAsync.mockImplementationOnce(async (cb: (h: object) => void) => {
      cb({ trueHeading: 135, magHeading: 131, accuracy: 3 });
      return { remove: jest.fn() };
    });
    seed();
    renderRouter('./src/app', { initialUrl: '/qibla' });
    expect(await screen.findByText('Facing the Qibla')).toBeTruthy();
  });

  it('Adjust times: shifting Isha changes the time everywhere, and can be reset', async () => {
    seed();
    renderRouter('./src/app', { initialUrl: '/adjust-times' });
    fireEvent.press(await screen.findByLabelText('Increase Isha'));
    fireEvent.press(screen.getByLabelText('Increase Isha'));
    expect(useSettingsStore.getState().timeOffsets.isha).toBe(2);
    expect(await screen.findByText('6:30 (+2 min)')).toBeTruthy(); // 6:28 + 2
    fireEvent.press(screen.getByText('Midnight'));
    expect(useSettingsStore.getState().ishaEnd).toBe('midnight');
    fireEvent.press(screen.getByText('Reset all adjustments'));
    expect(useSettingsStore.getState().timeOffsets.isha).toBe(0);
    expect(useSettingsStore.getState().ishaEnd).toBe('fajr');
  });

  it('Sunnah: chips on Today toggle done, upcoming ones are disabled, and Stats counts them', async () => {
    seed();
    renderRouter('./src/app', { initialUrl: '/' });
    const fajr = await screen.findByLabelText('Sunnah before Fajr, 2 rak’ahs');
    fireEvent.press(fajr);
    expect(extras()['2026-10-31']?.fajrBefore).toBeTruthy();
    fireEvent.press(screen.getByLabelText('Sunnah before Fajr, 2 rak’ahs'));
    expect(extras()['2026-10-31']?.fajrBefore).toBeUndefined();
    expect(screen.getByLabelText('Witr').props.accessibilityState?.disabled).toBe(true);

    fireEvent.press(screen.getByLabelText('Sunnah after Dhuhr, 2 rak’ahs'));
    renderRouter('./src/app', { initialUrl: '/stats' });
    expect(await screen.findByText('Sunnah & Witr')).toBeTruthy();
    expect(screen.getByLabelText('Sunnah after Dhuhr, 2 rak’ahs: 1 of 4')).toBeTruthy();
    expect(screen.getByText('Witr streak')).toBeTruthy();
  });

  it('Sunnah: Witr after midnight counts for last night; History shows the summary', async () => {
    seed();
    jest.setSystemTime(cairo('2026-11-01T01:00', 2));
    renderRouter('./src/app', { initialUrl: '/' });
    expect(await screen.findByText('Last night · Isha sunnah & Witr')).toBeTruthy();
    fireEvent.press(screen.getAllByLabelText('Witr')[0]!);
    expect(extras()['2026-10-31']?.witr).toBeTruthy();
    expect(extras()['2026-11-01']?.witr).toBeUndefined();

    renderRouter('./src/app', { initialUrl: '/history' });
    fireEvent.press(await screen.findByLabelText('Previous month'));
    fireEvent.press(await screen.findByLabelText(/^Sat, 31 Oct/));
    expect(await screen.findByText('Sunnah 0/5 · Witr ✓')).toBeTruthy();
  });

  it('Sunnah settings: turning tracking off hides the chips; Duha can be added', async () => {
    seed();
    renderRouter('./src/app', { initialUrl: '/settings' });
    fireEvent.press(await screen.findByLabelText('Sunnah & Witr, 6 on'));
    fireEvent.press(await screen.findByLabelText('Duha prayer'));
    expect(useSettingsStore.getState().sunnahItems.duha).toBe(true);
    fireEvent.press(screen.getByLabelText('Track sunnah & Witr'));
    expect(useSettingsStore.getState().sunnahEnabled).toBe(false);

    renderRouter('./src/app', { initialUrl: '/' });
    expect(await screen.findByText('Asr · Now')).toBeTruthy();
    expect(screen.queryByLabelText('Witr')).toBeNull();
  });

  it('Edit day: each prayer step has its sunnah chips (Duha with Dhuhr)', async () => {
    seed();
    useSettingsStore.getState().setSunnahItem('duha', true);
    renderRouter('./src/app', { initialUrl: '/day/2026-10-30' });
    fireEvent.press(await screen.findByLabelText('Sunnah before Fajr, 2 rak’ahs'));
    expect(extras()['2026-10-30']?.fajrBefore).toBeTruthy();
  });

  it("Friday: Dhuhr is Jumu'ah and Al-Kahf can be marked read", async () => {
    seed();
    jest.setSystemTime(cairo('2026-10-30T09:00', 3));
    renderRouter('./src/app', { initialUrl: '/' });
    expect(await screen.findByText('Jumu’ah Mubarak')).toBeTruthy();
    expect(screen.getByText(/^Jumu’ah · /)).toBeTruthy(); // next prayer in the hero
    fireEvent.press(screen.getByLabelText('Surat al-Kahf'));
    expect(extras()['2026-10-30']?.kahf).toBeTruthy();
  });

  it('Ramadan preview: Iftar countdown, fasting check, and Stats counts it', async () => {
    seed();
    renderRouter('./src/app', { initialUrl: '/friday-ramadan' });
    fireEvent.press(await screen.findByLabelText('Preview Ramadan'));
    expect(useSettingsStore.getState().preview.ramadan).toBe(true);

    renderRouter('./src/app', { initialUrl: '/' });
    expect(await screen.findByText('Iftar in')).toBeTruthy();
    expect(screen.getByText('Preview')).toBeTruthy();
    fireEvent.press(screen.getByLabelText('Fasted this day'));
    expect(extras()['2026-10-31']?.fast).toBeTruthy();

    renderRouter('./src/app', { initialUrl: '/stats' });
    expect(await screen.findByLabelText('Fasting: 1 of 1 days')).toBeTruthy();
  });

  it('Friday & Ramadan settings: Suhoor minutes and Al-Kahf time', async () => {
    seed();
    renderRouter('./src/app', { initialUrl: '/settings' });
    fireEvent.press(await screen.findByLabelText('Friday & Ramadan'));
    fireEvent.press(await screen.findByLabelText('45 min'));
    expect(useSettingsStore.getState().ramadan.suhoorMinutes).toBe(45);
    fireEvent.press(screen.getByLabelText('12:00 PM'));
    expect(useSettingsStore.getState().friday.kahfHour).toBe(12);
    fireEvent.press(screen.getByLabelText('Ramadan mode'));
    expect(useSettingsStore.getState().ramadan.enabled).toBe(false);
  });

  it('Widgets page: explains how to add them; off in Expo Go / tests', async () => {
    seed();
    renderRouter('./src/app', { initialUrl: '/settings' });
    fireEvent.press(await screen.findByLabelText('Widgets'));
    expect(await screen.findByText('Widgets need the installed Hayya app. They don’t work inside Expo Go.')).toBeTruthy();
    expect(screen.getByText('Mark prayer')).toBeTruthy();
    expect(screen.getByLabelText('Live Activity').props.accessibilityState?.disabled).toBe(true);
  });

  it.each(['/', '/history', '/stats', '/settings', '/alarms', '/alarm-sound', '/qibla', '/adjust-times', '/sunnah', '/friday-ramadan', '/widgets', '/day/2026-10-30', '/location'])(
    'Dark mode: %s renders',
    async (url) => {
      seed();
      useSettingsStore.setState({ theme: 'dark' });
      renderRouter('./src/app', { initialUrl: url });
      await waitFor(() => expect(screen.toJSON()).toBeTruthy());
      expect(screen.UNSAFE_root.findAll(() => true).length).toBeGreaterThan(20);
    },
  );
});

