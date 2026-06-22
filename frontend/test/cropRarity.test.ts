import { describe, it, expect } from "vitest";
import {
  RARITY_TIERS,
  COMMON_TIER,
  rarityForRoi,
  rarityForCrop,
} from "@/lib/cropRarity";

describe("RARITY_TIERS", () => {
  it("is ordered from highest minRoi to lowest", () => {
    for (let i = 1; i < RARITY_TIERS.length; i++) {
      expect(RARITY_TIERS[i - 1].minRoi).toBeGreaterThan(RARITY_TIERS[i].minRoi);
    }
  });

  it("has a Common tier with a zero floor as the last entry", () => {
    expect(COMMON_TIER.id).toBe("common");
    expect(COMMON_TIER.minRoi).toBe(0);
  });

  it("uses unique tier ids", () => {
    const ids = RARITY_TIERS.map((t) => t.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe("rarityForRoi", () => {
  it("returns Common for zero and negative ROI", () => {
    expect(rarityForRoi(0).id).toBe("common");
    expect(rarityForRoi(-50).id).toBe("common");
  });

  it("returns Legendary at and above 300%", () => {
    expect(rarityForRoi(300).id).toBe("legendary");
    expect(rarityForRoi(999).id).toBe("legendary");
  });

  it("picks the boundary tier exactly on its threshold", () => {
    expect(rarityForRoi(220).id).toBe("epic");
    expect(rarityForRoi(170).id).toBe("rare");
    expect(rarityForRoi(130).id).toBe("uncommon");
  });

  it("falls to the next lower tier just below a threshold", () => {
    expect(rarityForRoi(299).id).toBe("epic");
    expect(rarityForRoi(129).id).toBe("common");
  });
});

describe("rarityForCrop", () => {
  it("derives ROI from cost and yield", () => {
    // 5 -> 9 == 180% ROI -> Rare
    expect(rarityForCrop(5, 9).id).toBe("rare");
    // 20 -> 38 == 190% ROI -> Rare
    expect(rarityForCrop(20, 38).id).toBe("rare");
    // 60 -> 130 == 216% ROI -> Rare (just under Epic)
    expect(rarityForCrop(60, 130).id).toBe("rare");
  });

  it("treats a zero cost as zero ROI (Common)", () => {
    expect(rarityForCrop(0, 100).id).toBe("common");
  });
});
