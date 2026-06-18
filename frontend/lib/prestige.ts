export type PrestigeLevel = {
  title: string;
  emoji: string;
  minSeed: number;
  color: string;
};

export const PRESTIGE_LEVELS: PrestigeLevel[] = [
  { title: "Seedling", emoji: "🌱", minSeed: 0, color: "text-white/50" },
  { title: "Sprout", emoji: "🌿", minSeed: 500, color: "text-green-400" },
  { title: "Farmer", emoji: "🚜", minSeed: 2000, color: "text-lime-400" },
  { title: "Veteran", emoji: "🌾", minSeed: 10000, color: "text-yellow-400" },
  { title: "Legend", emoji: "🏆", minSeed: 50000, color: "text-amber-400" },
  { title: "Mythic", emoji: "👑", minSeed: 200000, color: "text-purple-400" },
];

/** Returns the highest PrestigeLevel the player has reached. */
export function getPrestige(totalSeedHarvested: number): PrestigeLevel {
  const seed = Math.max(0, totalSeedHarvested);
  let level = PRESTIGE_LEVELS[0];
  for (const l of PRESTIGE_LEVELS) {
    if (seed >= l.minSeed) level = l;
  }
  return level;
}

/**
 * Returns progress (0–1) towards the next prestige tier.
 * Returns 1 if the player is at the maximum prestige level.
 */
export function getPrestigeProgress(totalSeedHarvested: number): number {
  const current = getPrestige(totalSeedHarvested);
  const idx = PRESTIGE_LEVELS.findIndex((l) => l.minSeed === current.minSeed);
  const next = PRESTIGE_LEVELS[idx + 1];
  if (!next) return 1;
  const range = next.minSeed - current.minSeed;
  return range > 0 ? Math.min(1, (totalSeedHarvested - current.minSeed) / range) : 1;
}

/** Returns the next prestige tier, or null if at max prestige. */
export function getNextPrestige(totalSeedHarvested: number): PrestigeLevel | null {
  const current = getPrestige(totalSeedHarvested);
  const idx = PRESTIGE_LEVELS.findIndex((l) => l.minSeed === current.minSeed);
  return PRESTIGE_LEVELS[idx + 1] ?? null;
}
