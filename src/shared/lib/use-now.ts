import { useEffect, useState } from 'react';

/** Current time, re-rendering every `intervalMs` (aligned to the wall-clock second). */
export function useNow(intervalMs = 1000): number {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    let timer: ReturnType<typeof setInterval> | undefined;
    const align = setTimeout(() => {
      setNow(Date.now());
      timer = setInterval(() => setNow(Date.now()), intervalMs);
    }, 1000 - (Date.now() % 1000));
    return () => {
      clearTimeout(align);
      if (timer) clearInterval(timer);
    };
  }, [intervalMs]);

  return now;
}
