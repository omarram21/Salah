import * as Notifications from 'expo-notifications';

import { cancelPrayerAlarms, listScheduledAlarms } from '../notification-service';

const pending = (id: string, at?: number) => ({
  identifier: id,
  content: { title: id, body: '', data: at === undefined ? {} : { at } },
  trigger: null,
});

describe('notification service', () => {
  it('rescheduling cancels prayer alarms but keeps pending test alarms', async () => {
    (Notifications.getAllScheduledNotificationsAsync as jest.Mock).mockResolvedValueOnce([
      pending('2026-10-31:asr:start'),
      pending('test:123-0'),
    ]);
    await cancelPrayerAlarms();
    expect(Notifications.cancelScheduledNotificationAsync).toHaveBeenCalledWith('2026-10-31:asr:start');
    expect(Notifications.cancelScheduledNotificationAsync).not.toHaveBeenCalledWith('test:123-0');
  });

  it('lists scheduled alarms soonest first', async () => {
    (Notifications.getAllScheduledNotificationsAsync as jest.Mock).mockResolvedValueOnce([
      pending('b', 200),
      pending('test:1', 100),
      pending('c'),
    ]);
    const list = await listScheduledAlarms();
    expect(list.map((a) => a.id)).toEqual(['test:1', 'b', 'c']);
    expect(list[0]!.isTest).toBe(true);
  });
});
