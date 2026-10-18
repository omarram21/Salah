import { router, type Href } from 'expo-router';

/** Go back, or to `fallback` when the screen was opened directly (deep link, cold start). */
export function goBackOr(fallback: Href) {
  if (router.canGoBack()) router.back();
  else router.replace(fallback);
}
