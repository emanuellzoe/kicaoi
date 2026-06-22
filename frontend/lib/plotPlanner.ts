// Planting advisor: given a SEED budget, the available empty plots and the crop
// roster, suggests what to plant. Pure helpers over lib/cropStats — no network,
// no state. Powers a "what should I plant?" hint in the farm UI.

import { cropEfficiency, type CropLike } from "@/lib/cropStats";

export type PlantPlan<T extends CropLike> = {
  crop: T;
  count: number; // how many plots to fill with this crop
  totalCost: number; // SEED spent
  totalYield: number; // SEED returned at harvest
  totalProfit: number; // totalYield - totalCost
};

/** How many of a crop you can afford with `budget` SEED. */
export function maxPlantable(budget: number, cost: number): number {
  if (cost <= 0 || budget <= 0) return 0;
  return Math.floor(budget / cost);
}

/** The highest-ROI crop affordable within the budget, or null if none fits. */
export function bestAffordable<T extends CropLike>(budget: number, crops: readonly T[]): T | null {
  return crops
    .filter((c) => c.cost > 0 && c.cost <= budget)
    .reduce<T | null>((best, c) => {
      if (!best) return c;
      const e = cropEfficiency(c.cost, c.yield, c.growMins).roi;
      const bestE = cropEfficiency(best.cost, best.yield, best.growMins).roi;
      return e > bestE ? c : best;
    }, null);
}

/**
 * Builds a uniform planting plan: fills as many of the given empty plots as the
 * budget allows with the highest-ROI affordable crop. Returns null when nothing
 * is plantable (no budget, no plots, or no affordable crop).
 */
export function planUniform<T extends CropLike>(
  budget: number,
  plotsAvailable: number,
  crops: readonly T[]
): PlantPlan<T> | null {
  if (plotsAvailable <= 0) return null;
  const crop = bestAffordable(budget, crops);
  if (!crop) return null;

  const count = Math.min(plotsAvailable, maxPlantable(budget, crop.cost));
  if (count <= 0) return null;

  const totalCost = count * crop.cost;
  const totalYield = count * crop.yield;
  return { crop, count, totalCost, totalYield, totalProfit: totalYield - totalCost };
}
