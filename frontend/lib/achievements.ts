// Achievements are derived PURELY from on-chain PlayerStats — no extra contract
// calls, no new storage. Each badge is unlocked once its stat crosses a target.
// `progress` (0..1) lets the UI show a bar for locked badges.

export type PlayerStatsLike = {
  plotCount: number;
  totalPlanted: number;
  totalHarvested: number;
  totalSeedHarvested: number;
};

export type Achievement = {
  id: string;
  name: string;
  emoji: string;
  desc: string;
  // value(stats) is compared against `target` to compute unlock + progress.
  value: (s: PlayerStatsLike) => number;
  target: number;
};

export const ACHIEVEMENTS: Achievement[] = [
  { id: "first-sprout", name: "First Sprout", emoji: "🌱", desc: "Plant your first crop", value: (s) => s.totalPlanted, target: 1 },
  { id: "green-thumb", name: "Green Thumb", emoji: "🌿", desc: "Harvest 10 crops", value: (s) => s.totalHarvested, target: 10 },
  { id: "master-farmer", name: "Master Farmer", emoji: "👩‍🌾", desc: "Harvest 100 crops", value: (s) => s.totalHarvested, target: 100 },
  { id: "landowner", name: "Landowner", emoji: "🏡", desc: "Own 5 plots", value: (s) => s.plotCount, target: 5 },
  { id: "estate", name: "Estate", emoji: "🏞️", desc: "Own 10 plots", value: (s) => s.plotCount, target: 10 },
  { id: "seed-baron", name: "SEED Baron", emoji: "💰", desc: "Harvest 1,000 SEED total", value: (s) => s.totalSeedHarvested, target: 1000 },
  { id: "seed-tycoon", name: "SEED Tycoon", emoji: "👑", desc: "Harvest 10,000 SEED total", value: (s) => s.totalSeedHarvested, target: 10000 },
];

export type AchievementState = Achievement & { unlocked: boolean; progress: number };

/**
 * Derives the unlock state and progress (0–1) for every achievement
 * from the given player stats. Pure function — no side effects.
 */
export function evaluateAchievements(s: PlayerStatsLike): AchievementState[] {
  return ACHIEVEMENTS.map((a) => {
    const v = a.value(s);
    return { ...a, unlocked: v >= a.target, progress: Math.min(1, v / a.target) };
  });
}

/** Returns the count of unlocked achievements for the given stats. */
export function getUnlockedCount(s: PlayerStatsLike): number {
  return ACHIEVEMENTS.filter((a) => a.value(s) >= a.target).length;
}
