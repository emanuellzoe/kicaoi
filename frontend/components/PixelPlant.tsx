"use client";

import { useEffect, useState, type ReactElement } from "react";

/**
 * 8-bit pixel-art plant that grows on a loop: seed → sprout → leaves → bud →
 * bloom, then holds and replays. The plant body gently sways; the soil stays put.
 * Pure SVG (crisp pixels), no assets — scales with its container.
 */

const E = "............."; // empty row (13 cols)

// Growth frames — 13 cols × 16 rows. Each char is a palette key (see PALETTE).
const FRAMES: string[][] = [
  // 0 — seed in the soil
  [E, E, E, E, E, E, E, E, E, E, E, E, E, "......n......", "kKkkKkkkKkkKk", "kkkkkkkkkkkkk"],
  // 1 — sprout
  [E, E, E, E, E, E, E, E, E, E, E, E, "......g......", "......g......", "kKkkKkkkKkkKk", "kkkkkkkkkkkkk"],
  // 2 — first leaves
  [E, E, E, E, E, E, E, E, E, E, "......g......", "....GGg......", "......gGG....", "......g......", "kKkkKkkkKkkKk", "kkkkkkkkkkkkk"],
  // 3 — small bud
  [E, E, E, E, E, E, E, E, "......o......", ".....ooo.....", "......g......", "....GGg......", "......gGG....", "......g......", "kKkkKkkkKkkKk", "kkkkkkkkkkkkk"],
  // 4 — swelling bud
  [E, E, E, E, E, E, E, ".....ooo.....", "....ooooo....", ".....ooo.....", "......g......", "....GGg......", "......gGG....", "......g......", "kKkkKkkkKkkKk", "kkkkkkkkkkkkk"],
  // 5 — opening flower
  [E, E, E, E, E, E, ".....yYy.....", "....yYbYy....", ".....yYy.....", "......g......", "......g......", "....GGg......", "......gGG....", "......g......", "kKkkKkkkKkkKk", "kkkkkkkkkkkkk"],
  // 6 — full bloom
  [E, E, E, ".....yYy.....", "...yYYbYYy...", "....yYYYy....", ".....ygy.....", "......g......", "......g......", "....GGg......", "......gGG....", "......g......", "......g......", "......g......", "kKkkKkkkKkkKk", "kkkkkkkkkkkkk"],
];

const PALETTE: Record<string, string> = {
  k: "#3a2817", // dark soil
  K: "#553c22", // light soil
  g: "#3fae4f", // stem
  G: "#5bd06a", // leaf
  o: "#2f9e44", // bud
  y: "#f5b820", // petal
  Y: "#ffd84d", // petal highlight
  b: "#7a4a1e", // flower center
  n: "#c9a06a", // seed
};

const STEP_MS = 430; // time between growth stages
const HOLD_MS = 2600; // pause on full bloom before replaying

export default function PixelPlant({ className = "" }: { className?: string }) {
  const [i, setI] = useState(0);

  useEffect(() => {
    const last = FRAMES.length - 1;
    const delay = i === last ? HOLD_MS : STEP_MS;
    const t = setTimeout(() => setI((p) => (p >= last ? 0 : p + 1)), delay);
    return () => clearTimeout(t);
  }, [i]);

  const plant: ReactElement[] = [];
  const soil: ReactElement[] = [];
  FRAMES[i].forEach((row, y) =>
    row.split("").forEach((ch, x) => {
      const fill = PALETTE[ch];
      if (!fill) return;
      // 1.02 size nudges pixels together so no hairline seams show between them
      const rect = <rect key={`${x}-${y}`} x={x} y={y} width={1.02} height={1.02} fill={fill} />;
      (y >= 14 ? soil : plant).push(rect);
    }),
  );

  return (
    <div className={className} aria-hidden>
      <style>{`@keyframes kicaoi-sway{0%,100%{transform:rotate(-2.2deg)}50%{transform:rotate(2.2deg)}}`}</style>
      <svg viewBox="-2 -1 17 18" shapeRendering="crispEdges" className="w-full h-full overflow-visible">
        <g
          style={{
            transformBox: "view-box",
            transformOrigin: "6.5px 14px",
            animation: "kicaoi-sway 3.4s ease-in-out infinite",
          }}
        >
          {plant}
        </g>
        <g>{soil}</g>
      </svg>
    </div>
  );
}
