export const ACHIEVEMENTS = [
  { id: "first-sprout", name: "First Sprout", emoji: "🌱", desc: "Plant your first crop", value: (s) => s.totalPlanted, target: 1 },
  { id: "green-thumb", name: "Green Thumb", emoji: "🌿", desc: "Harvest 10 crops", value: (s) => s.totalHarvested, target: 10 },
  { id: "master-farmer", name: "Master Farmer", emoji: "👩‍🌾", desc: "Harvest 100 crops", value: (s) => s.totalHarvested, target: 100 },
  { id: "landowner", name: "Landowner", emoji: "🏡", desc: "Own 5 plots", value: (s) => s.plotCount, target: 5 },
  { id: "estate", name: "Estate", emoji: "🏞️", desc: "Own 10 plots", value: (s) => s.plotCount, target: 10 },
  { id: "seed-baron", name: "SEED Baron", emoji: "💰", desc: "Harvest 1,000 SEED total", value: (s) => s.totalSeedHarvested, target: 1000 },
  { id: "seed-tycoon", name: "SEED Tycoon", emoji: "👑", desc: "Harvest 10,000 SEED total", value: (s) => s.totalSeedHarvested, target: 10000 },
];

export function evaluateAchievements(s) {
  return ACHIEVEMENTS.map((a) => {
    const v = a.value(s);
    return { ...a, unlocked: v >= a.target, progress: Math.min(1, v / a.target) };
  });
}
