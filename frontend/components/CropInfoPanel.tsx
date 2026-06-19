"use client";

import { cropById } from "@/lib/contract";

interface CropInfoPanelProps {
  selectedCropId: number;
  seedBalance: number;
}

export function CropInfoPanel({ selectedCropId, seedBalance }: CropInfoPanelProps) {
  const crop = cropById(selectedCropId);
  if (!crop) return null;

  const canAfford = seedBalance >= crop.cost;
  const profitPerCycle = crop.yield - crop.cost;
  const profitPerHour = (profitPerCycle / crop.growMins) * 60;

  return (
    <div className="liquid-glass rounded-2xl p-4 flex items-center gap-4">
      <div className="text-3xl">{crop.emoji}</div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="font-bold text-white text-sm">{crop.name}</span>
          {canAfford ? (
            <span className="text-[10px] bg-green-500/20 text-green-400 rounded-full px-2 py-0.5 font-body">Can plant</span>
          ) : (
            <span className="text-[10px] bg-red-500/20 text-red-400 rounded-full px-2 py-0.5 font-body">Need {crop.cost - seedBalance} more SEED</span>
          )}
        </div>
        <div className="flex gap-3 text-[11px] text-white/50 font-body">
          <span>Cost: <strong className="text-white/80">{crop.cost} SEED</strong></span>
          <span>Yield: <strong className="text-yellow-400">{crop.yield} SEED</strong></span>
          <span>Time: <strong className="text-white/80">{crop.growMins >= 60 ? `${crop.growMins / 60}h` : `${crop.growMins}m`}</strong></span>
        </div>
      </div>
      <div className="text-right flex-shrink-0">
        <div className="text-[10px] text-white/30 font-body">+/cycle</div>
        <div className={`text-sm font-bold ${profitPerCycle > 0 ? "text-green-400" : "text-red-400"}`}>
          {profitPerCycle > 0 ? "+" : ""}{profitPerCycle} SEED
        </div>
        <div className="text-[10px] text-white/30 font-body">{profitPerHour.toFixed(1)}/hr</div>
      </div>
    </div>
  );
}
