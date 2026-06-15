"use client";

import { CROPS } from "@/lib/contract";

// Mirrors the on-chain crop roster so the marketing copy can never drift from
// the actual game economy.
function grow(mins: number) {
  if (mins < 60) return `${mins} min`;
  const h = mins / 60;
  return `${h} hr${h > 1 ? "s" : ""}`;
}

export function CropsShowcase() {
  return (
    <section className="lp-section">
      <h2 className="lp-h2">The crops</h2>
      <div className="crop-grid">
        {CROPS.map((c) => (
          <div key={c.id} className="crop-card">
            <div className="crop-emoji">{c.emoji}</div>
            <div className="crop-name">{c.name}</div>
            <div className="crop-stats">
              <span>🪙 {c.cost} SEED</span>
              <span>⏳ {grow(c.growMins)}</span>
              <span className="crop-yield">🌾 {c.yield} SEED</span>
            </div>
          </div>
        ))}
      </div>
      <p className="lp-note">Yields are net-positive, but each new plot costs more — so SEED always has somewhere to go.</p>
    </section>
  );
}
