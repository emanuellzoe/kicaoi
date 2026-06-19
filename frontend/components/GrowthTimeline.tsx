"use client";

import { cropById } from "@/lib/contract";

interface PlotEntry { cropId: number; plantedAt: number; }

interface GrowthTimelineProps {
  plots: PlotEntry[];
  now: number;
}

export function GrowthTimeline({ plots, now }: GrowthTimelineProps) {
  const growing = plots
    .map((p, i) => ({ ...p, id: i }))
    .filter((p) => p.cropId !== 0 && p.plantedAt !== 0)
    .map((p) => {
      const crop = cropById(p.cropId);
      if (!crop) return null;
      const endSec = p.plantedAt + crop.growMins * 60;
      const secsLeft = Math.max(0, endSec - now);
      const progress = Math.min(1, (now - p.plantedAt) / (crop.growMins * 60));
      return { id: p.id, crop, secsLeft, progress, ready: secsLeft === 0 };
    })
    .filter(Boolean)
    .sort((a, b) => a!.secsLeft - b!.secsLeft)
    .slice(0, 5);

  if (growing.length === 0) return null;

  return (
    <div className="liquid-glass rounded-2xl p-4">
      <div className="text-xs text-white/40 font-body mb-3 uppercase tracking-wider">Next harvests</div>
      <div className="flex flex-col gap-2">
        {growing.map((g) => {
          if (!g) return null;
          const mLeft = Math.ceil(g.secsLeft / 60);
          const timeStr = g.ready
            ? "Ready!"
            : mLeft >= 60
            ? `${Math.floor(mLeft / 60)}h ${mLeft % 60}m`
            : `${mLeft}m`;
          return (
            <div key={g.id} className="flex items-center gap-3">
              <span className="text-base w-5 text-center">{g.crop.emoji}</span>
              <div className="flex-1">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-white/70 font-body">Plot #{g.id} · {g.crop.name}</span>
                  <span className={`font-body font-medium ${g.ready ? "text-green-400" : "text-white/50"}`}>{timeStr}</span>
                </div>
                <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${g.progress * 100}%`,
                      background: g.ready ? "#22c55e" : "linear-gradient(90deg, #4ade80, #86efac)",
                    }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
