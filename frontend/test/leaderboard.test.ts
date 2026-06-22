import { describe, it, expect } from "vitest";
import {
  medalFor,
  rankEntries,
  findRank,
  percentile,
  type LeaderboardEntry,
} from "@/lib/leaderboard";

function entry(address: string, totalSeedHarvested: number): LeaderboardEntry {
  return { address, plotCount: 3, totalPlanted: 5, totalHarvested: 5, totalSeedHarvested };
}

// Distinct scores via totalSeedHarvested: alice > bob > carol.
const alice = entry("0xAAA", 10_000);
const bob = entry("0xBBB", 1_000);
const carol = entry("0xCCC", 100);
const field = [carol, alice, bob];

describe("medalFor", () => {
  it("awards medals to the top three only", () => {
    expect(medalFor(1)).toBe("🥇");
    expect(medalFor(2)).toBe("🥈");
    expect(medalFor(3)).toBe("🥉");
    expect(medalFor(4)).toBe("");
  });
});

describe("rankEntries", () => {
  it("sorts by score descending with 1-based ranks", () => {
    const ranked = rankEntries(field);
    expect(ranked.map((e) => e.address)).toEqual(["0xAAA", "0xBBB", "0xCCC"]);
    expect(ranked.map((e) => e.rank)).toEqual([1, 2, 3]);
  });

  it("does not mutate the input", () => {
    const copy = [...field];
    rankEntries(field);
    expect(field).toEqual(copy);
  });

  it("breaks ties deterministically by address", () => {
    const a = entry("0xB", 500);
    const b = entry("0xA", 500);
    expect(rankEntries([a, b]).map((e) => e.address)).toEqual(["0xA", "0xB"]);
  });

  it("attaches a score to every entry", () => {
    expect(rankEntries(field).every((e) => typeof e.score === "number")).toBe(true);
  });
});

describe("findRank", () => {
  it("finds a player's rank case-insensitively", () => {
    expect(findRank(field, "0xbbb")).toBe(2);
  });

  it("returns null for an unknown address", () => {
    expect(findRank(field, "0xZZZ")).toBeNull();
  });
});

describe("percentile", () => {
  it("puts first place at the 100th percentile", () => {
    expect(percentile(field, "0xAAA")).toBe(100);
  });

  it("puts last place at the 0th percentile", () => {
    expect(percentile(field, "0xCCC")).toBe(0);
  });

  it("returns 100 for a single-entry board", () => {
    expect(percentile([alice], "0xAAA")).toBe(100);
  });

  it("returns null for empty board or missing player", () => {
    expect(percentile([], "0xAAA")).toBeNull();
    expect(percentile(field, "0xZZZ")).toBeNull();
  });
});
