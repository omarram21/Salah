/** Small seeded PRNG (mulberry32): same seed → same sequence, so demo data is reproducible. */
export function seededRandom(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Picks a key with probability proportional to its weight. */
export function pickWeighted<K extends string>(weights: Record<K, number>, rand: () => number): K {
  const entries = Object.entries(weights) as [K, number][];
  const total = entries.reduce((n, [, w]) => n + w, 0);
  let r = rand() * total;
  for (const [key, w] of entries) {
    r -= w;
    if (r < 0) return key;
  }
  return entries[entries.length - 1]![0];
}
