const pad = (n: number) => String(n).padStart(2, '0');

/** "17:05" → "5:05 PM" (or "5:05 م"). Uses the location's wall clock, not the device timezone. */
export function formatWallTime(wall: string, labels: { am: string; pm: string }): string {
  const [h = 0, m = 0] = wall.split(':').map(Number);
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return `${hour12}:${pad(m)} ${h < 12 ? labels.am : labels.pm}`;
}

/** Milliseconds → "1:05:09" or "05:09" when under an hour. */
export function formatCountdown(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`;
}
