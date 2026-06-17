type StreakData = { lastDate: string; count: number };

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

function yesterday(): string {
  return new Date(Date.now() - 86400000).toISOString().slice(0, 10);
}

export function getStreak(address: string): number {
  if (typeof window === "undefined") return 0;
  try {
    const raw = localStorage.getItem(`kicaoi_streak_${address.toLowerCase()}`);
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

export function recordHarvest(address: string): number {
  if (typeof window === "undefined") return 0;
  try {
    const key = `kicaoi_streak_${address.toLowerCase()}`;
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
