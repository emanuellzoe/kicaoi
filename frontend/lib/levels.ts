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

export function getPlayerLevel(totalSeedHarvested: number): Level {
  let current = LEVELS[0];
  for (const lvl of LEVELS) {
    if (totalSeedHarvested >= lvl.minSeed) current = lvl;
    else break;
  }
  return current;
}
