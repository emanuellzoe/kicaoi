"use client";

const QA = [
  {
    q: "Can I cash SEED out for CELO?",
    a: "No. SEED is an in-game arcade credit (1 CELO = 100 SEED) and is non-transferable and non-redeemable. The fun is the progression, not earnings.",
  },
  {
    q: "What is MiniPay?",
    a: "MiniPay is a lightweight stablecoin wallet built into Opera, popular across Africa. Kicaoi runs inside its dapp browser with one-tap connect.",
  },
  {
    q: "Is this gambling?",
    a: "No. There is no randomness anywhere. Crop outcomes depend only on time and the choices you make.",
  },
  {
    q: "Do I need to keep the app open?",
    a: "No. Crops grow on real-world time, so you can plant, leave, and come back later to harvest.",
  },
];

export function Faq() {
  return (
    <section className="lp-section">
      <h2 className="lp-h2">FAQ</h2>
      <div className="faq">
        {QA.map((item) => (
          <details key={item.q} className="faq-item">
            <summary className="faq-q">{item.q}</summary>
            <p className="faq-a">{item.a}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
