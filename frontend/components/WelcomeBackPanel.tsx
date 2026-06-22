"use client";

import { offlineSummary, type CropDef, type PlotState } from "@/lib/offlineProgress";
import { formatDuration } from "@/lib/time";

interface WelcomeBackPanelProps {
  plots: readonly PlotState[] | undefined;
  /** Resolves a cropId to its grow time / yield. */
  getCrop: (id: number) => CropDef | undefined;
  /** Optional fixed reference time (UNIX seconds) — defaults to now. */
  nowSec?: number;
  /** Called when the player taps the harvest-all shortcut. */
  onHarvestAll?: () => void;
}

/**
 * "Welcome back" panel summarising what ripened while the player was away,
 * computed from on-chain plots via lib/offlineProgress. Renders nothing when
 * there is no crop activity to report, so it can be mounted unconditionally.
 */
export function WelcomeBackPanel({ plots, getCrop, nowSec, onHarvestAll }: WelcomeBackPanelProps) {
  const s = offlineSummary(plots, getCrop, nowSec);

  // Nothing planted at all — stay out of the way.
  if (s.ready === 0 && s.growing === 0) return null;

  return (
    <div className="liquid-glass rounded-xl p-4 mb-4 flex flex-col gap-2">
      <span className="text-sm font-bold text-white">Welcome back! 🌅</span>

      {s.ready > 0 ? (
        <p className="text-sm text-green-400 font-body">
          {s.ready} plot{s.ready > 1 ? "s" : ""} ready · {s.pendingYield.toLocaleString()} SEED waiting
        </p>
      ) : (
        <p className="text-sm text-white/60 font-body">Nothing ready yet — crops still growing.</p>
      )}

      {s.growing > 0 && s.nextReadySec !== null && (
        <p className="text-[11px] text-white/40 font-body">
          Next plot ready in {formatDuration(s.nextReadySec)} ({s.growing} growing)
        </p>
      )}

      {s.ready > 0 && onHarvestAll && (
        <button
          type="button"
          onClick={onHarvestAll}
          className="mt-1 self-start rounded-lg bg-green-500/20 px-3 py-1.5 text-xs font-bold text-green-300 hover:bg-green-500/30 transition-colors"
        >
          Harvest all ({s.ready})
        </button>
      )}
    </div>
  );
}
