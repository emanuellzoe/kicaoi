import { describe, it, expect } from "vitest";
import {
  maxPlantable,
  bestAffordable,
  planUniform,
} from "@/lib/plotPlanner";
import type { CropLike } from "@/lib/cropStats";

// Wheat 5->9 (180% ROI), Pumpkin 20->38 (190%), Golden 60->130 (216%).
const wheat: CropLike = { id: 1, cost: 5, yield: 9, growMins: 5 };
const pumpkin: CropLike = { id: 2, cost: 20, yield: 38, growMins: 30 };
const golden: CropLike = { id: 3, cost: 60, yield: 130, growMins: 120 };
const roster = [wheat, pumpkin, golden];

describe("maxPlantable", () => {
  it("divides budget by cost and floors", () => {
    expect(maxPlantable(100, 30)).toBe(3);
  });

  it("is 0 for non-positive budget or cost", () => {
    expect(maxPlantable(0, 5)).toBe(0);
    expect(maxPlantable(50, 0)).toBe(0);
    expect(maxPlantable(-10, 5)).toBe(0);
  });
});

describe("bestAffordable", () => {
  it("picks the highest-ROI crop within budget", () => {
    expect(bestAffordable(100, roster)?.id).toBe(golden.id); // 216% beats 190/180
  });

  it("excludes crops above budget", () => {
    expect(bestAffordable(25, roster)?.id).toBe(pumpkin.id); // golden (60) unaffordable
  });

  it("returns null when nothing is affordable", () => {
    expect(bestAffordable(4, roster)).toBeNull();
  });

  it("ignores zero-cost crops", () => {
    const free: CropLike = { id: 9, cost: 0, yield: 100, growMins: 1 };
    expect(bestAffordable(100, [free])).toBeNull();
  });
});

describe("planUniform", () => {
  it("fills plots with the best affordable crop, bounded by budget", () => {
    // budget 200, 5 plots, golden costs 60 -> can afford 3
    const plan = planUniform(200, 5, roster);
    expect(plan?.crop.id).toBe(golden.id);
    expect(plan?.count).toBe(3);
    expect(plan?.totalCost).toBe(180);
    expect(plan?.totalYield).toBe(390);
    expect(plan?.totalProfit).toBe(210);
  });

  it("is bounded by available plots, not just budget", () => {
    // budget 1000 could buy many, but only 2 plots free
    const plan = planUniform(1000, 2, roster);
    expect(plan?.count).toBe(2);
  });

  it("returns null with no plots", () => {
    expect(planUniform(1000, 0, roster)).toBeNull();
  });

  it("returns null when nothing affordable", () => {
    expect(planUniform(3, 5, roster)).toBeNull();
  });
});
