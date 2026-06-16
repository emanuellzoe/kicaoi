export function cropEfficiency(cost, yieldAmt, growMins) {
  const profit = yieldAmt - cost;
  const seedPerMin = growMins > 0 ? profit / growMins : 0;
  const roi = cost > 0 ? Math.round((yieldAmt / cost) * 100) : 0;
  return { profit, seedPerMin, roi };
}
