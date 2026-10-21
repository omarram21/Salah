import * as Notifications from 'expo-notifications';

import { selectRecords, useTrackingStore } from '@/features/tracking';

import { handleNotificationResponse, listenForNotificationActions } from '../action-handler';

const END = Date.UTC(2026, 9, 31, 15, 9);
const DELIVERED = Date.UTC(2026, 9, 31, 12, 46);

function response(action: string, data: Record<string, unknown> = {}) {
  return {
    actionIdentifier: action,
    notification: {
      date: DELIVERED,
      request: {
        identifier: '2026-10-31:asr:start',
        content: { data: { date: '2026-10-31', prayer: 'asr', kind: 'start', at: DELIVERED, end: END, ...data } },
      },
    },
  } as unknown as Notifications.NotificationResponse;
}

const real = () => useTrackingStore.getState().datasets.real.records;

beforeEach(() => {
  useTrackingStore.setState({ datasets: { real: { records: {}, trackingSince: '2026-10-28' }, demo: null }, active: 'real' });
  jest.clearAllMocks();
});
afterEach(() => jest.restoreAllMocks());

describe('notification buttons', () => {
  it('"Prayed" during the window marks on time, cancels the reminder and clears the banner', async () => {
    jest.spyOn(Date, 'now').mockReturnValue(END - 60_000);
    expect(await handleNotificationResponse(response('prayed'), { live: true })).toBe(true);
    expect(real()['2026-10-31']?.asr?.status).toBe('onTime');
    expect(Notifications.cancelScheduledNotificationAsync).toHaveBeenCalledWith('2026-10-31:asr:reminder');
    expect(Notifications.dismissNotificationAsync).toHaveBeenCalledWith('2026-10-31:asr:start');
  });

  it('"Prayed" after the window ends marks late', async () => {
    jest.spyOn(Date, 'now').mockReturnValue(END + 60_000);
    await handleNotificationResponse(response('prayed'), { live: true });
    expect(real()['2026-10-31']?.asr?.status).toBe('late');
  });

  it('"In mosque" marks mosque', async () => {
    await handleNotificationResponse(response('mosque'), { live: true });
    expect(real()['2026-10-31']?.asr?.status).toBe('mosque');
  });

  it('a tap picked up on the next launch uses the delivery time (on time)', async () => {
    jest.spyOn(Date, 'now').mockReturnValue(END + 3 * 3600_000); // app opened hours later
    await handleNotificationResponse(response('prayed'), { live: false });
    expect(real()['2026-10-31']?.asr?.status).toBe('onTime');
  });

  it('never overwrites a prayer already marked in the app', async () => {
    useTrackingStore.getState().setStatus('2026-10-31', 'asr', 'mosque');
    expect(await handleNotificationResponse(response('prayed'), { live: true })).toBe(false);
    expect(real()['2026-10-31']?.asr?.status).toBe('mosque');
  });

  it('writes to real records even while demo mode is on', async () => {
    useTrackingStore.getState().enableDemo('2026-10-31');
    await handleNotificationResponse(response('prayed'), { live: true });
    expect(real()['2026-10-31']?.asr?.status).toBeDefined();
    expect(selectRecords(useTrackingStore.getState())['2026-10-31']).toBeUndefined(); // demo untouched
  });

  it('ignores a plain tap and test alarms', async () => {
    expect(await handleNotificationResponse(response(Notifications.DEFAULT_ACTION_IDENTIFIER ?? 'default'), { live: true })).toBe(false);
    expect(await handleNotificationResponse(response('prayed', { date: undefined, test: true }), { live: true })).toBe(false);
    expect(real()).toEqual({});
  });

  it('on start-up, processes the tap the OS kept while the app was closed, then clears it', async () => {
    (Notifications.getLastNotificationResponse as jest.Mock).mockReturnValueOnce(response('mosque'));
    listenForNotificationActions();
    await new Promise((r) => setImmediate(r));
    await new Promise((r) => setImmediate(r));
    expect(real()['2026-10-31']?.asr?.status).toBe('mosque');
    expect(Notifications.clearLastNotificationResponse).toHaveBeenCalled();
    expect(Notifications.addNotificationResponseReceivedListener).toHaveBeenCalledTimes(1);
  });
});
