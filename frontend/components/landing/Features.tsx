"use client";

const FEATURES = [
  { emoji: "⛓️", title: "Fully onchain", desc: "Every plant, wait and harvest is a real Celo transaction. No backend, no database." },
  { emoji: "📲", title: "MiniPay-native", desc: "Opens straight inside MiniPay. One tap to connect, no extensions or seed phrases." },
  { emoji: "🎲", title: "No randomness", desc: "Outcomes depend only on time and your choices — no gambling, no surprises." },
  { emoji: "💤", title: "Idle-friendly", desc: "Plant, close the app, come back later. Crops grow on real-world time." },
];

export function Features() {
  return (
    <section className="lp-section">
      <h2 className="lp-h2">Why Kicaoi</h2>
      <div className="feature-grid">
        {FEATURES.map((f) => (
          <div key={f.title} className="feature-card">
            <div className="feature-emoji">{f.emoji}</div>
            <div className="feature-title">{f.title}</div>
            <div className="feature-desc">{f.desc}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
