"use client";

type Props = { progress: number; label?: string; showPct?: boolean }; // 0..1

export function GrowthBar({ progress, label, showPct = false }: Props) {
  const pct = Math.round(Math.min(1, Math.max(0, progress)) * 100);
  const color = pct >= 100 ? "#35d07f" : pct >= 80 ? "#fcff52" : "#35d07f55";
  const ariaLabel = label ?? (pct >= 100 ? "Crop ready to harvest" : `Crop growth: ${pct}%`);

  return (
    <div className="flex items-center gap-2">
      <div
        className="growth-bar-track flex-1"
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={ariaLabel}
      >
        <div className="growth-bar-fill" style={{ width: `${pct}%`, background: color }} />
      </div>
      {showPct && (
        <span className="text-[10px] text-white/40 font-body w-7 text-right tabular-nums">{pct}%</span>
      )}
    </div>
  );
}


// [growbar-v] 2