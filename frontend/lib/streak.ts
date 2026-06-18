const STREAK_KEY_PREFIX = "kicaoi_streak_";
const MS_PER_DAY = 86_400_000;

type StreakData = { lastDate: string; count: number };

function streakKey(address: string): string {
  return `${STREAK_KEY_PREFIX}${address.toLowerCase()}`;
}

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

function yesterday(): string {
  return new Date(Date.now() - MS_PER_DAY).toISOString().slice(0, 10);
}

/** Returns the current streak count for `address`, or 0 if expired or not started. */
export function getStreak(address: string): number {
  if (typeof window === "undefined") return 0;
  try {
    const raw = localStorage.getItem(streakKey(address));
    if (!raw) return 0;
    const d: StreakData = JSON.parse(raw);
    const t = today();
    const y = yesterday();
    if (d.lastDate === t || d.lastDate === y) return d.count;
    return 0;
  } catch {
    return 0;
  }
}

/** Records a harvest event for streak tracking. Returns the new streak count. */
export function recordHarvest(address: string): number {
  if (typeof window === "undefined") return 0;
  try {
    const key = streakKey(address);
    const raw = localStorage.getItem(key);
    const t = today();
    const y = yesterday();
    let count = 1;
    if (raw) {
      const d: StreakData = JSON.parse(raw);
      if (d.lastDate === t) return d.count;
      if (d.lastDate === y) count = d.count + 1;
    }
    localStorage.setItem(key, JSON.stringify({ lastDate: t, count }));
    return count;
  } catch {
    return 0;
  }
}
