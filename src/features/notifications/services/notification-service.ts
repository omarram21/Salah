import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import type { PlannedNotification } from '../logic/build-schedule';
import type { NotificationContent } from '../logic/content';

export const CHANNEL_ID = 'prayer-times';
/** Test alarms use this id prefix so rescheduling never cancels them. */
export const TEST_ID_PREFIX = 'test:';

export type PermissionStatus = 'granted' | 'denied' | 'undetermined';

/** Show alarms as banners with sound even while the app is open. Call once at startup. */
export function configureNotificationHandler() {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldPlaySound: true,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
}

/** Android needs a channel before notifications (and the Android 13+ permission prompt). */
export async function ensureChannel(name: string) {
  if (Platform.OS !== 'android') return;
  await Notifications.setNotificationChannelAsync(CHANNEL_ID, {
    name,
    importance: Notifications.AndroidImportance.HIGH,
    sound: 'default',
    vibrationPattern: [0, 250, 250, 250],
    lightColor: '#0F766E',
  });
}

export async function getPermission({ prompt }: { prompt: boolean }): Promise<PermissionStatus> {
  const current = await Notifications.getPermissionsAsync();
  if (current.granted) return 'granted';
  if (!prompt || !current.canAskAgain) return current.status === 'undetermined' ? 'undetermined' : 'denied';
  const asked = await Notifications.requestPermissionsAsync();
  return asked.granted ? 'granted' : 'denied';
}

/** Cancels all prayer alarms we scheduled, leaving pending test alarms alone. */
export async function cancelPrayerAlarms() {
  const pending = await Notifications.getAllScheduledNotificationsAsync();
  await Promise.all(
    pending
      .filter((n) => !n.identifier.startsWith(TEST_ID_PREFIX))
      .map((n) => Notifications.cancelScheduledNotificationAsync(n.identifier)),
  );
}

/** Replaces every scheduled prayer alarm with `plans`. */
export async function replaceSchedule(
  plans: PlannedNotification[],
  contentFor: (plan: PlannedNotification) => NotificationContent,
) {
  await cancelPrayerAlarms();
  for (const plan of plans) {
    const { title, body } = contentFor(plan);
    await Notifications.scheduleNotificationAsync({
      identifier: plan.id,
      content: {
        title,
        body,
        sound: true,
        data: { date: plan.date, prayer: plan.prayer, kind: plan.kind, at: plan.at },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: new Date(plan.at),
        channelId: CHANNEL_ID,
      },
    });
  }
}

/** Fires `items` after the given delays, for checking sound/banners right away. */
export async function scheduleTestAlarms(items: { content: NotificationContent; inSeconds: number }[]) {
  await Promise.all(
    items.map(({ content, inSeconds }, i) =>
      Notifications.scheduleNotificationAsync({
        identifier: `${TEST_ID_PREFIX}${Date.now()}-${i}`,
        content: { ...content, sound: true, data: { test: true, at: Date.now() + inSeconds * 1000 } },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
          seconds: inSeconds,
          channelId: CHANNEL_ID,
        },
      }),
    ),
  );
}

export type ScheduledAlarm = { id: string; title: string; body: string; at: number | null; isTest: boolean };

/** What the OS currently has queued, soonest first. */
export async function listScheduledAlarms(): Promise<ScheduledAlarm[]> {
  const pending = await Notifications.getAllScheduledNotificationsAsync();
  return pending
    .map((n) => {
      const at = (n.content.data as { at?: unknown } | null)?.at;
      return {
        id: n.identifier,
        title: n.content.title ?? '',
        body: n.content.body ?? '',
        at: typeof at === 'number' ? at : null,
        isTest: n.identifier.startsWith(TEST_ID_PREFIX),
      };
    })
    .sort((a, b) => (a.at ?? Infinity) - (b.at ?? Infinity));
}
