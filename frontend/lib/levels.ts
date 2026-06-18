export type Level = {
  level: number;
  name: string;
  emoji: string;
  minSeed: number;
};

export const LEVELS: Level[] = [
  { level: 1, name: "Seedling",     emoji: "🌱", minSeed: 0 },
  { level: 2, name: "Sprout",       emoji: "🌿", minSeed: 100 },
  { level: 3, name: "Farmer",       emoji: "👨‍🌾", minSeed: 500 },
  { level: 4, name: "Cultivator",   emoji: "🚜", minSeed: 2000 },
  { level: 5, name: "Landowner",    emoji: "🏡", minSeed: 5000 },
  { level: 6, name: "Agronomist",   emoji: "🌾", minSeed: 15000 },
  { level: 7, name: "Harvest King", emoji: "👑", minSeed: 50000 },
];

/**
 * Returns the highest Level the player has reached based on their
 * total lifetime seed harvested. Never returns undefined.
 */
export function getPlayerLevel(totalSeedHarvested: number): Level {
  let current = LEVELS[0];
  for (const lvl of LEVELS) {
    if (totalSeedHarvested >= lvl.minSeed) current = lvl;
    else break;
  }
  return current;
}

/**
 * Returns the next Level tier above the current one, or null if the
 * player has already reached the maximum level.
 */
export function getNextLevel(totalSeedHarvested: number): Level | null {
  const current = getPlayerLevel(totalSeedHarvested);
  const idx = LEVELS.findIndex((l) => l.level === current.level);
  return idx >= 0 && idx < LEVELS.length - 1 ? LEVELS[idx + 1] : null;
}

/**
 * Returns progress (0–1) towards the next level, or 1 if at max level.
 */
export function getLevelProgress(totalSeedHarvested: number): number {
  const current = getPlayerLevel(totalSeedHarvested);
  const next = getNextLevel(totalSeedHarvested);
  if (!next) return 1;
  const range = next.minSeed - current.minSeed;
  return range > 0 ? Math.min(1, (totalSeedHarvested - current.minSeed) / range) : 1;
}
