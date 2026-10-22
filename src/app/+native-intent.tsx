/**
 * iOS shows Apple's "Please adopt containerBackground API" placeholder when a widget fails to
 * render, and tapping it opens salah://documentation/widgetkit/... — send that to the Widgets screen.
 */
export function redirectSystemPath({ path }: { path: string; initial: boolean }) {
  try {
    if (path.includes('documentation/widgetkit')) return '/widgets';
    return path;
  } catch {
    return '/';
  }
}
