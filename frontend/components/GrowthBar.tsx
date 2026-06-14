"use client";

type Props = { progress: number }; // 0..1

export function GrowthBar({ progress }: Props) {
  const pct = Math.round(Math.min(1, Math.max(0, progress)) * 100);
  const color = pct >= 100 ? "#35d07f" : pct >= 80 ? "#fcff52" : "#35d07f55";

  return (
    <div className="growth-bar-track" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
      <div className="growth-bar-fill" style={{ width: `${pct}%`, background: color }} />
    </div>
  );
}


// [growbar-v] 1