"use client";

const STEPS = [
  { n: 1, emoji: "🪙", title: "Buy SEED", desc: "Top up SEED credits with CELO (1 CELO = 100 SEED). Your first buy unlocks 3 plots." },
  { n: 2, emoji: "🌱", title: "Plant", desc: "Spend SEED to plant a crop on an empty plot. Each crop has its own grow time." },
  { n: 3, emoji: "⏳", title: "Wait", desc: "Crops mature on real-world time — from 5 minutes up to a few hours." },
  { n: 4, emoji: "🌾", title: "Harvest", desc: "Collect more SEED than you planted, then reinvest into more plots." },
];

export function HowItPlays() {
  return (
    <section className="lp-section">
      <h2 className="lp-h2">How it plays</h2>
      <div className="steps">
        {STEPS.map((s) => (
          <div key={s.n} className="step">
            <div className="step-num">{s.n}</div>
            <div className="step-body">
              <div className="step-title">
                {s.emoji} {s.title}
              </div>
              <div className="step-desc">{s.desc}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
