import { describe, it, expect } from "vitest";
import {
  offlineSummary,
  hasHarvestable,
  type CropDef,
  type PlotState,
} from "@/lib/offlineProgress";

// Wheat: 5 min grow, 9 yield. Pumpkin: 30 min grow, 38 yield.
const crops: Record<number, CropDef> = {
  1: { growMins: 5, yield: 9 },
  2: { growMins: 30, yield: 38 },
};
const getCrop = (id: number) => crops[id];

const NOW = 1_000_000;

describe("offlineSummary", () => {
  it("returns an all-zero summary for no plots", () => {
    const s = offlineSummary([], getCrop, NOW);
    expect(s).toEqual({ ready: 0, growing: 0, empty: 0, pendingYield: 0, nextReadySec: null });
  });

  it("handles undefined plots", () => {
    expect(offlineSummary(undefined, getCrop, NOW).ready).toBe(0);
  });

  it("counts empty plots separately", () => {
    const plots: PlotState[] = [{ cropId: 0, plantedAt: 0 }];
    const s = offlineSummary(plots, getCrop, NOW);
    expect(s.empty).toBe(1);
    expect(s.ready + s.growing).toBe(0);
  });

  it("marks a crop ready once grow time has elapsed", () => {
    // planted 10 min ago, wheat needs 5 min -> ready
    const plots: PlotState[] = [{ cropId: 1, plantedAt: NOW - 600 }];
    const s = offlineSummary(plots, getCrop, NOW);
    expect(s.ready).toBe(1);
    expect(s.pendingYield).toBe(9);
    expect(s.nextReadySec).toBeNull();
  });

  it("counts a still-growing crop and its remaining time", () => {
    // pumpkin planted 10 min ago, needs 30 min -> 20 min left
    const plots: PlotState[] = [{ cropId: 2, plantedAt: NOW - 600 }];
    const s = offlineSummary(plots, getCrop, NOW);
    expect(s.growing).toBe(1);
    expect(s.pendingYield).toBe(0);
    expect(s.nextReadySec).toBe(20 * 60);
  });

  it("aggregates pending yield and reports the soonest next-ready", () => {
    const plots: PlotState[] = [
      { cropId: 1, plantedAt: NOW - 600 }, // wheat ready (+9)
      { cropId: 2, plantedAt: NOW - 600 }, // pumpkin 20 min left
      { cropId: 1, plantedAt: NOW - 120 }, // wheat 3 min left
      { cropId: 0, plantedAt: 0 }, // empty
    ];
    const s = offlineSummary(plots, getCrop, NOW);
    expect(s.ready).toBe(1);
    expect(s.growing).toBe(2);
    expect(s.empty).toBe(1);
    expect(s.pendingYield).toBe(9);
    expect(s.nextReadySec).toBe(3 * 60); // soonest of (20m, 3m)
  });

  it("ignores unknown crop ids", () => {
    const plots: PlotState[] = [{ cropId: 99, plantedAt: NOW - 999999 }];
    const s = offlineSummary(plots, getCrop, NOW);
    expect(s.ready + s.growing + s.empty).toBe(0);
  });

  it("treats the exact ready boundary as ready", () => {
    const plots: PlotState[] = [{ cropId: 1, plantedAt: NOW - 5 * 60 }];
    expect(offlineSummary(plots, getCrop, NOW).ready).toBe(1);
  });
});

describe("hasHarvestable", () => {
  it("is true only when something is ready", () => {
    expect(hasHarvestable(offlineSummary([{ cropId: 1, plantedAt: NOW - 600 }], getCrop, NOW))).toBe(true);
    expect(hasHarvestable(offlineSummary([{ cropId: 2, plantedAt: NOW }], getCrop, NOW))).toBe(false);
  });
});
