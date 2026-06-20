import { describe, it, expect } from "vitest";
import {
  PRESTIGE_LEVELS,
  getPrestige,
  getPrestigeProgress,
  getNextPrestige,
} from "@/lib/prestige";

describe("getPrestige", () => {
  it("returns the base tier at zero", () => {
    expect(getPrestige(0).title).toBe("Seedling");
  });

  it("clamps negative seed to the base tier", () => {
    expect(getPrestige(-50).title).toBe("Seedling");
  });

  it("returns the matching tier at a boundary", () => {
    expect(getPrestige(2000).title).toBe("Farmer");
  });

  it("returns the top tier for huge amounts", () => {
    expect(getPrestige(10_000_000).title).toBe("Mythic");
  });
});

describe("getNextPrestige", () => {
  it("returns the following tier", () => {
    expect(getNextPrestige(0)?.title).toBe("Sprout");
  });

  it("returns null at max prestige", () => {
    expect(getNextPrestige(10_000_000)).toBeNull();
  });
});

describe("getPrestigeProgress", () => {
  it("is 0 at the start of a tier", () => {
    expect(getPrestigeProgress(0)).toBe(0);
  });

  it("is halfway between Seedling (0) and Sprout (500)", () => {
    expect(getPrestigeProgress(250)).toBeCloseTo(0.5);
  });

  it("returns 1 at max prestige", () => {
    expect(getPrestigeProgress(10_000_000)).toBe(1);
  });

  it("covers every defined tier without throwing", () => {
    for (const lvl of PRESTIGE_LEVELS) {
      const p = getPrestigeProgress(lvl.minSeed);
      expect(p).toBeGreaterThanOrEqual(0);
      expect(p).toBeLessThanOrEqual(1);
    }
  });
});
