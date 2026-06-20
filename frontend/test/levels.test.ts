import { describe, it, expect } from "vitest";
import { LEVELS, getPlayerLevel, getNextLevel, getLevelProgress } from "@/lib/levels";

describe("getPlayerLevel", () => {
  it("returns the first level at zero seed", () => {
    expect(getPlayerLevel(0).level).toBe(1);
  });

  it("clamps negative seed to the first level", () => {
    expect(getPlayerLevel(-100).level).toBe(1);
  });

  it("returns the matching tier at a boundary", () => {
    expect(getPlayerLevel(500).name).toBe("Farmer");
  });

  it("returns the max level for very large amounts", () => {
    expect(getPlayerLevel(1_000_000).level).toBe(LEVELS.length);
  });
});

describe("getNextLevel", () => {
  it("returns the following tier", () => {
    expect(getNextLevel(0)?.level).toBe(2);
  });

  it("returns null at max level", () => {
    expect(getNextLevel(1_000_000)).toBeNull();
  });
});

describe("getLevelProgress", () => {
  it("is 0 at the start of a tier", () => {
    expect(getLevelProgress(0)).toBe(0);
  });

  it("is halfway between two tiers", () => {
    // Level 1 (0) -> Level 2 (100); 50 is halfway.
    expect(getLevelProgress(50)).toBeCloseTo(0.5);
  });

  it("returns 1 at max level", () => {
    expect(getLevelProgress(1_000_000)).toBe(1);
  });
});
