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

export function getPrestige(totalSeedHarvested: number): PrestigeLevel {
  let level = PRESTIGE_LEVELS[0];
  for (const l of PRESTIGE_LEVELS) {
    if (totalSeedHarvested >= l.minSeed) level = l;
  }
  return level;
}
