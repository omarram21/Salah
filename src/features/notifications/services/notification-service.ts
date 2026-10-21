import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import { ALARM_SOUNDS, type AlarmSound } from '@/features/settings';

import { PRAYER_CATEGORY, type PrayerNotificationData } from '../logic/actions';
import type { PlannedNotification } from '../logic/build-schedule';
import type { NotificationContent } from '../logic/content';
import { channelFor, contentSound, REMINDER_FILE, SOUND_FILE } from '../sounds';

/** Channel used before custom sounds existed; removed so Android settings stay tidy. */
const LEGACY_CHANNEL_ID = 'prayer-times';
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

/**
 * Android needs channels before notifications (and the Android 13+ permission prompt).
 * One channel per sound, because a channel's sound can't change after creation.
 */
export async function ensureChannels(names: { alarm: (sound: AlarmSound) => string; reminder: string }) {
  if (Platform.OS !== 'android') return;
  const base = { importance: Notifications.AndroidImportance.HIGH, vibrationPattern: [0, 250, 250, 250], lightColor: '#C2410C' };
  await Promise.all([
    ...ALARM_SOUNDS.map((sound) =>
      Notifications.setNotificationChannelAsync(channelFor('start', sound), {
        ...base,
        name: names.alarm(sound),
        sound: sound === 'default' ? 'default' : SOUND_FILE[sound],
      }),
    ),
    Notifications.setNotificationChannelAsync(channelFor('reminder', 'default'), { ...base, name: names.reminder, sound: REMINDER_FILE }),
    Notifications.deleteNotificationChannelAsync(LEGACY_CHANNEL_ID).catch(() => undefined),
  ]);
}

/**
 * The "Prayed" / "In mosque" buttons. Neither opens the app: the tap is handled in the
 * background (see action-handler.ts). Call again when the language changes.
 */
export async function registerPrayerActions(labels: { prayed: string; mosque: string }) {
  await Notifications.setNotificationCategoryAsync(PRAYER_CATEGORY, [
    { identifier: 'prayed', buttonTitle: labels.prayed, options: { opensAppToForeground: false } },
    { identifier: 'mosque', buttonTitle: labels.mosque, options: { opensAppToForeground: false } },
  ]);
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
  sound: AlarmSound,
) {
  await cancelPrayerAlarms();
  for (const plan of plans) {
    const { title, body } = contentFor(plan);
    await Notifications.scheduleNotificationAsync({
      identifier: plan.id,
      content: {
        title,
        body,
        sound: contentSound(plan.kind, sound),
        // Only prayer alarms get the Prayed / In mosque buttons.
        ...(plan.kind === 'start' || plan.kind === 'reminder' ? { categoryIdentifier: PRAYER_CATEGORY } : {}),
        data: { date: plan.date, prayer: plan.prayer, kind: plan.kind, at: plan.at, end: plan.end } satisfies PrayerNotificationData,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: new Date(plan.at),
        channelId: channelFor(plan.kind, sound),
      },
    });
  }
}

/** Fires `items` after the given delays, for checking sound/banners right away. */
export async function scheduleTestAlarms(
  items: { content: NotificationContent; inSeconds: number; kind: 'start' | 'reminder' }[],
  sound: AlarmSound,
) {
  await Promise.all(
    items.map(({ content, inSeconds, kind }, i) =>
      Notifications.scheduleNotificationAsync({
        identifier: `${TEST_ID_PREFIX}${Date.now()}-${i}`,
        // Test alarms show the buttons too; tapping them doesn't change any records.
        content: {
          ...content,
          sound: contentSound(kind, sound),
          categoryIdentifier: PRAYER_CATEGORY,
          data: { test: true, at: Date.now() + inSeconds * 1000 },
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
          seconds: inSeconds,
          channelId: channelFor(kind, sound),
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
