import { describe, it, expect } from "vitest";
import {
  ACHIEVEMENTS,
  ACHIEVEMENT_TOTAL,
  evaluateAchievements,
  getUnlockedCount,
  type PlayerStatsLike,
} from "@/lib/achievements";

const empty: PlayerStatsLike = {
  plotCount: 0,
  totalPlanted: 0,
  totalHarvested: 0,
  totalSeedHarvested: 0,
};

const maxed: PlayerStatsLike = {
  plotCount: 100,
  totalPlanted: 1000,
  totalHarvested: 1000,
  totalSeedHarvested: 100_000,
};

describe("ACHIEVEMENT_TOTAL", () => {
  it("matches the achievements array length", () => {
    expect(ACHIEVEMENT_TOTAL).toBe(ACHIEVEMENTS.length);
  });
});

describe("evaluateAchievements", () => {
  it("returns a state for every achievement", () => {
    expect(evaluateAchievements(empty)).toHaveLength(ACHIEVEMENTS.length);
  });

  it("unlocks nothing for empty stats", () => {
    expect(evaluateAchievements(empty).every((a) => !a.unlocked)).toBe(true);
  });

  it("unlocks everything for maxed stats", () => {
    expect(evaluateAchievements(maxed).every((a) => a.unlocked)).toBe(true);
  });

  it("reports progress clamped to [0,1]", () => {
    for (const a of evaluateAchievements({ ...empty, totalPlanted: 1 })) {
      expect(a.progress).toBeGreaterThanOrEqual(0);
      expect(a.progress).toBeLessThanOrEqual(1);
    }
  });

  it("unlocks 'First Sprout' after planting one crop", () => {
    const state = evaluateAchievements({ ...empty, totalPlanted: 1 });
    expect(state.find((a) => a.id === "first-sprout")?.unlocked).toBe(true);
  });
});

describe("getUnlockedCount", () => {
  it("is 0 for empty stats", () => {
    expect(getUnlockedCount(empty)).toBe(0);
  });

  it("equals the total for maxed stats", () => {
    expect(getUnlockedCount(maxed)).toBe(ACHIEVEMENT_TOTAL);
  });
});
