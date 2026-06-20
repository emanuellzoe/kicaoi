import { describe, it, expect } from "vitest";
import {
  totalSeedInFlight,
  cropEfficiency,
  bestCropByROI,
  bestCropBySeedPerMin,
  type CropLike,
} from "@/lib/cropStats";

const CROPS: CropLike[] = [
  { id: 1, cost: 10, yield: 16, growMins: 5 }, // roi 160%, 1.2/min
  { id: 2, cost: 100, yield: 250, growMins: 60 }, // roi 250%, 2.5/min
  { id: 3, cost: 50, yield: 90, growMins: 10 }, // roi 180%, 4/min
];

describe("totalSeedInFlight", () => {
  const cost = (id: number) => CROPS.find((c) => c.id === id)?.cost ?? 0;

  it("returns 0 for undefined plots", () => {
    expect(totalSeedInFlight(undefined, cost)).toBe(0);
  });

  it("ignores empty plots (cropId 0)", () => {
    expect(totalSeedInFlight([{ cropId: 0 }, { cropId: 0 }], cost)).toBe(0);
  });

  it("sums the cost of planted crops", () => {
    expect(totalSeedInFlight([{ cropId: 1 }, { cropId: 2 }, { cropId: 0 }], cost)).toBe(110);
  });
});

describe("cropEfficiency", () => {
  it("computes profit, seedPerMin and roi", () => {
    expect(cropEfficiency(10, 16, 5)).toEqual({ profit: 6, seedPerMin: 1.2, roi: 160 });
  });

  it("guards against zero grow time and zero cost", () => {
    expect(cropEfficiency(0, 10, 0)).toEqual({ profit: 10, seedPerMin: 0, roi: 0 });
  });
});

describe("bestCropByROI", () => {
  it("returns undefined for an empty list", () => {
    expect(bestCropByROI([])).toBeUndefined();
  });

  it("picks the highest-ROI crop", () => {
    expect(bestCropByROI(CROPS)?.id).toBe(2);
  });
});

describe("bestCropBySeedPerMin", () => {
  it("picks the highest throughput crop", () => {
    expect(bestCropBySeedPerMin(CROPS)?.id).toBe(3);
  });
});
