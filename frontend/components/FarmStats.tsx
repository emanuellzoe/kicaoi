"use client";

interface FarmStatsProps {
  plotCount: number;
  totalPlanted: number;
  totalHarvested: number;
  totalSeedHarvested: number;
  seedBalance: number;
}

export function FarmStats({ plotCount, totalPlanted, totalHarvested, totalSeedHarvested, seedBalance }: FarmStatsProps) {
  return (
    <div className="grid grid-cols-2 gap-2 mb-4">
      <div className="liquid-glass rounded-xl p-3 flex flex-col gap-0.5">
        <span className="text-[10px] text-white/40 font-body uppercase tracking-wider">Plots</span>
        <span className="text-lg font-bold text-white">{plotCount}</span>
      </div>
      <div className="liquid-glass rounded-xl p-3 flex flex-col gap-0.5">
        <span className="text-[10px] text-white/40 font-body uppercase tracking-wider">Seed Balance</span>
        <span className="text-lg font-bold text-green-400">{seedBalance.toLocaleString()}</span>
      </div>
      <div className="liquid-glass rounded-xl p-3 flex flex-col gap-0.5">
        <span className="text-[10px] text-white/40 font-body uppercase tracking-wider">Total Planted</span>
        <span className="text-lg font-bold text-white">{totalPlanted.toLocaleString()}</span>
      </div>
      <div className="liquid-glass rounded-xl p-3 flex flex-col gap-0.5">
        <span className="text-[10px] text-white/40 font-body uppercase tracking-wider">Total Harvested</span>
        <span className="text-lg font-bold text-yellow-400">{totalSeedHarvested.toLocaleString()} SEED</span>
      </div>
    </div>
  );
}
