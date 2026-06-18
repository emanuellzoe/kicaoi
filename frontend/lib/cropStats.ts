export type CropEfficiency = {
  profit: number;
  seedPerMin: number;
  roi: number;
};

export type CropLike = { id: number; cost: number; yield: number; growMins: number };

/**
 * Sums the seed cost of all crops currently planted across the given plots.
 * Plots with cropId 0 (empty) contribute 0.
 */
export function totalSeedInFlight(
  plotsData: Array<{ cropId: number }> | undefined,
  getCropCost: (id: number) => number
): number {
  if (!plotsData) return 0;
  return plotsData.reduce((sum, p) => sum + (p.cropId > 0 ? getCropCost(p.cropId) : 0), 0);
}

/**
 * Computes profitability metrics for a single crop type.
 * `roi` is expressed as a percentage (e.g. 160 means 160%).
 */
export function cropEfficiency(cost: number, yieldAmt: number, growMins: number): CropEfficiency {
  const profit = yieldAmt - cost;
  const seedPerMin = growMins > 0 ? profit / growMins : 0;
  const roi = cost > 0 ? Math.round((yieldAmt / cost) * 100) : 0;
  return { profit, seedPerMin, roi };
}

/** Returns the crop with the highest ROI from the given list. */
export function bestCropByROI<T extends CropLike>(crops: readonly T[]): T | undefined {
  return crops.reduce<T | undefined>((best, c) => {
    const e = cropEfficiency(c.cost, c.yield, c.growMins);
    if (!best) return c;
    const bestE = cropEfficiency(best.cost, best.yield, best.growMins);
    return e.roi > bestE.roi ? c : best;
  }, undefined);
}

/** Returns the crop with the highest SEED-per-minute throughput from the given list. */
export function bestCropBySeedPerMin<T extends CropLike>(crops: readonly T[]): T | undefined {
  return crops.reduce<T | undefined>((best, c) => {
    const e = cropEfficiency(c.cost, c.yield, c.growMins);
    if (!best) return c;
    const bestE = cropEfficiency(best.cost, best.yield, best.growMins);
    return e.seedPerMin > bestE.seedPerMin ? c : best;
  }, undefined);
}
