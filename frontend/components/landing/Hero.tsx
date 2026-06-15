"use client";

// Top-of-funnel hero. The connect CTA is passed in so the landing stays
// presentational and the wallet wiring lives in the page.
export function Hero({ onConnect, showConnect }: { onConnect: () => void; showConnect: boolean }) {
  return (
    <section className="hero">
      <div className="hero-badge">🌿 Live on Celo</div>
      <h1 className="hero-title">
        Plant. Wait.<br />
        <span className="hero-accent">Harvest.</span>
      </h1>
      <p className="hero-sub">
        Kicaoi is a tiny idle farm that lives entirely onchain. Buy seeds, grow crops in
        real time, and climb the harvest leaderboard — right inside MiniPay.
      </p>
      {showConnect && (
        <button className="hero-cta" onClick={onConnect}>
          🌱 Start farming
        </button>
      )}
      <p className="hero-foot">No sign-up. Your wallet is your save file.</p>
    </section>
  );
}
