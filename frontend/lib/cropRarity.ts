// Crop rarity tiers, derived PURELY from a crop's return-on-investment (ROI).
// ROI here is yield/cost as a percentage (200 == doubles your SEED). Tiers are a
// presentation layer over cropStats — no new on-chain data, no extra calls. The
// UI uses these to colour crop cards and badges so players can read value at a
// glance without doing the math.

export type RarityTier = {
  id: string;
  label: string;
  emoji: string;
  // Tailwind text colour class used by badges/cards.
  color: string;
  // Inclusive lower bound on ROI (percent) for a crop to reach this tier.
  minRoi: number;
};

// Ordered from rarest to most common so the first match in `rarityForRoi`
// is always the highest tier the crop qualifies for.
export const RARITY_TIERS: readonly RarityTier[] = [
  { id: "legendary", label: "Legendary", emoji: "🌟", color: "text-amber-400", minRoi: 300 },
  { id: "epic", label: "Epic", emoji: "💜", color: "text-purple-400", minRoi: 220 },
  { id: "rare", label: "Rare", emoji: "💎", color: "text-sky-400", minRoi: 170 },
  { id: "uncommon", label: "Uncommon", emoji: "🍀", color: "text-green-400", minRoi: 130 },
  { id: "common", label: "Common", emoji: "🌾", color: "text-stone-400", minRoi: 0 },
];

/** The fallback tier (Common) — always the last entry, matches any ROI >= 0. */
export const COMMON_TIER: RarityTier = RARITY_TIERS[RARITY_TIERS.length - 1];

/**
 * Maps an ROI percentage to its rarity tier. Returns Common for any value
 * below the lowest threshold (including negative ROI). Pure function.
 */
export function rarityForRoi(roi: number): RarityTier {
  return RARITY_TIERS.find((t) => roi >= t.minRoi) ?? COMMON_TIER;
}

/**
 * Convenience helper: computes ROI from a crop's cost/yield and returns its
 * rarity tier. ROI is yield/cost as a percent, matching cropStats.cropEfficiency.
 */
export function rarityForCrop(cost: number, yieldAmt: number): RarityTier {
  const roi = cost > 0 ? Math.round((yieldAmt / cost) * 100) : 0;
  return rarityForRoi(roi);
}
