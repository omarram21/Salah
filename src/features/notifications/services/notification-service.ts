import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import type { PlannedNotification } from '../logic/build-schedule';

export const CHANNEL_ID = 'prayer-times';

export type PermissionStatus = 'granted' | 'denied' | 'undetermined';

export type NotificationContent = { title: string; body: string };

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

/** Replaces every scheduled notification with `plans`. */
export async function replaceSchedule(
  plans: PlannedNotification[],
  contentFor: (plan: PlannedNotification) => NotificationContent,
) {
  await Notifications.cancelAllScheduledNotificationsAsync();
  for (const plan of plans) {
    const { title, body } = contentFor(plan);
    await Notifications.scheduleNotificationAsync({
      identifier: plan.id,
      content: {
        title,
        body,
        sound: true,
        data: { date: plan.date, prayer: plan.prayer, kind: plan.kind },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: new Date(plan.at),
        channelId: CHANNEL_ID,
      },
    });
  }
}

export async function cancelAll() {
  await Notifications.cancelAllScheduledNotificationsAsync();
}
