"use client";

interface FarmStatsProps {
  plotCount: number;
  totalPlanted: number;
  totalHarvested: number;
  totalSeedHarvested: number;
  seedBalance: number;
  harvestRate?: number;
}

export function FarmStats({ plotCount, totalPlanted, totalHarvested, totalSeedHarvested, seedBalance }: FarmStatsProps) {
  const efficiency = totalPlanted > 0 ? Math.round((totalHarvested / totalPlanted) * 100) : 0;

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
        <span className="text-[10px] text-white/40 font-body uppercase tracking-wider">Harvest Rate</span>
        <span className="text-lg font-bold text-white">{efficiency}%</span>
        <span className="text-[10px] text-white/30 font-body">{totalHarvested}/{totalPlanted} cycles</span>
      </div>
      <div className="liquid-glass rounded-xl p-3 flex flex-col gap-0.5">
        <span className="text-[10px] text-white/40 font-body uppercase tracking-wider">Total Yield</span>
        <span className="text-lg font-bold text-yellow-400">{totalSeedHarvested.toLocaleString()}</span>
        <span className="text-[10px] text-white/30 font-body">SEED earned</span>
      </div>
    </div>
  );
}
