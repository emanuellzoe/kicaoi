import { describe, it, expect } from "vitest";
import {
  SCORE_WEIGHTS,
  SCORE_RANKS,
  UNRANKED,
  farmScore,
  rankForScore,
  rankForStats,
} from "@/lib/farmScore";
import type { PlayerStatsLike } from "@/lib/achievements";

const empty: PlayerStatsLike = {
  plotCount: 0,
  totalPlanted: 0,
  totalHarvested: 0,
  totalSeedHarvested: 0,
};

describe("farmScore", () => {
  it("is 0 for empty stats", () => {
    expect(farmScore(empty)).toBe(0);
  });

  it("applies the documented weights", () => {
    const s: PlayerStatsLike = {
      plotCount: 4, // *25 = 100
      totalPlanted: 10, // *2  = 20
      totalHarvested: 8, // *5  = 40
      totalSeedHarvested: 100, // *0.1 = 10
    };
    expect(farmScore(s)).toBe(170);
  });

  it("rounds to a whole number", () => {
    expect(Number.isInteger(farmScore({ ...empty, totalSeedHarvested: 5 }))).toBe(true);
  });

  it("floors negative stats at zero", () => {
    expect(farmScore({ ...empty, totalHarvested: -100 })).toBe(0);
  });

  it("weights map onto the four stat fields", () => {
    expect(Object.keys(SCORE_WEIGHTS).sort()).toEqual(
      ["plotCount", "totalHarvested", "totalPlanted", "totalSeedHarvested"]
    );
  });
});

describe("SCORE_RANKS", () => {
  it("is ordered from highest to lowest threshold", () => {
    for (let i = 1; i < SCORE_RANKS.length; i++) {
      expect(SCORE_RANKS[i - 1].minScore).toBeGreaterThan(SCORE_RANKS[i].minScore);
    }
  });

  it("ends with an Unranked tier at zero", () => {
    expect(UNRANKED.id).toBe("unranked");
    expect(UNRANKED.minScore).toBe(0);
  });
});

describe("rankForScore", () => {
  it("returns Unranked below 50", () => {
    expect(rankForScore(0).id).toBe("unranked");
    expect(rankForScore(49).id).toBe("unranked");
  });

  it("matches a tier exactly on its threshold", () => {
    expect(rankForScore(50).id).toBe("bronze");
    expect(rankForScore(2000).id).toBe("diamond");
    expect(rankForScore(5000).id).toBe("mythic");
  });
});

describe("rankForStats", () => {
  it("composes farmScore + rankForScore", () => {
    const s: PlayerStatsLike = {
      plotCount: 10, // 250
      totalPlanted: 50, // 100
      totalHarvested: 40, // 200
      totalSeedHarvested: 3000, // 300
    }; // total = 850 -> Gold
    expect(rankForStats(s).id).toBe("gold");
  });
});
