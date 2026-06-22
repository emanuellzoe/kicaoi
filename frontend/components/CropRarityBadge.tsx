"use client";

import { rarityForCrop, type RarityTier } from "@/lib/cropRarity";

interface CropRarityBadgeProps {
  /** SEED cost to plant the crop. */
  cost: number;
  /** SEED yielded on harvest. */
  yieldAmt: number;
  /** Show the ROI percentage next to the tier label. */
  showRoi?: boolean;
}

/**
 * A small inline badge that classifies a crop by its ROI into a rarity tier
 * (Common..Legendary). Pure presentation over lib/cropRarity — drop it onto a
 * crop card or the seed shop so players can read value at a glance.
 */
export function CropRarityBadge({ cost, yieldAmt, showRoi = false }: CropRarityBadgeProps) {
  const tier: RarityTier = rarityForCrop(cost, yieldAmt);
  const roi = cost > 0 ? Math.round((yieldAmt / cost) * 100) : 0;

  return (
    <span
      className={`inline-flex items-center gap-1 text-[11px] font-bold ${tier.color}`}
      title={`${tier.label} · ${roi}% ROI`}
    >
      <span aria-hidden>{tier.emoji}</span>
      {tier.label}
      {showRoi && <span className="text-white/40 font-body">· {roi}%</span>}
    </span>
  );
}
