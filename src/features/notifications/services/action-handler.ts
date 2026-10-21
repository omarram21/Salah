import * as Notifications from 'expo-notifications';

import { useTrackingStore } from '@/features/tracking';
import { waitForHydration } from '@/shared/lib/wait-for-hydration';

import { isNotificationAction, parsePrayerData, statusForAction } from '../logic/actions';

/**
 * Handles a "Prayed" / "In mosque" tap on a prayer notification.
 *
 * @param live true when the tap arrives while JS is running (we know it happened just now);
 *   false when it's picked up on the next launch (we only know the notification's delivery time).
 * @returns whether a prayer was marked.
 */
export async function handleNotificationResponse(
  response: Notifications.NotificationResponse,
  { live }: { live: boolean },
): Promise<boolean> {
  const action = response.actionIdentifier;
  if (!isNotificationAction(action)) return false;
  const request = response.notification.request;
  const data = parsePrayerData(request.content.data);
  if (!data) return false; // e.g. a test alarm

  await waitForHydration(useTrackingStore);
  const respondedAt = live ? Date.now() : response.notification.date;
  const status = statusForAction(action, data.end, respondedAt);
  const saved = useTrackingStore.getState().markRealIfUnmarked(data.date, data.prayer, status);

  // The prayer is handled: no reminder needed, and clear the banner from the list.
  await Promise.all([
    Notifications.cancelScheduledNotificationAsync(`${data.date}:${data.prayer}:reminder`).catch(() => undefined),
    Notifications.dismissNotificationAsync(request.identifier).catch(() => undefined),
  ]);
  return saved;
}

let listening = false;

/**
 * Subscribes once for button taps, and processes a tap the OS kept while the app wasn't running.
 * Marking never overwrites, so seeing the same tap twice is harmless.
 */
export function listenForNotificationActions() {
  if (listening) return;
  listening = true;
  Notifications.addNotificationResponseReceivedListener((response) => {
    void handleNotificationResponse(response, { live: true });
  });
  const pending = Notifications.getLastNotificationResponse();
  if (pending) {
    void handleNotificationResponse(pending, { live: false }).finally(() => Notifications.clearLastNotificationResponse());
  }
}
