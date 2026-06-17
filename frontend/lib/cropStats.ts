export type CropEfficiency = {
  profit: number;
  seedPerMin: number;
  roi: number;
};

export function totalSeedInFlight(
  plotsData: Array<{ cropId: number }> | undefined,
  getCropCost: (id: number) => number
): number {
  if (!plotsData) return 0;
  return plotsData.reduce((sum, p) => sum + (p.cropId > 0 ? getCropCost(p.cropId) : 0), 0);
}

export function cropEfficiency(cost: number, yieldAmt: number, growMins: number): CropEfficiency {
  const profit = yieldAmt - cost;
  const seedPerMin = growMins > 0 ? profit / growMins : 0;
  const roi = cost > 0 ? Math.round((yieldAmt / cost) * 100) : 0;
  return { profit, seedPerMin, roi };
}
