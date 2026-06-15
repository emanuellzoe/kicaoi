"use client";

import { Hero } from "./Hero";
import { Features } from "./Features";
import { HowItPlays } from "./HowItPlays";
import { CropsShowcase } from "./CropsShowcase";
import { Faq } from "./Faq";
import { Footer } from "./Footer";

// Marketing landing shown to visitors who have not connected a wallet yet.
// `showConnect` is false inside MiniPay, where auto-connect handles it.
export function Landing({ onConnect, showConnect }: { onConnect: () => void; showConnect: boolean }) {
  return (
    <div className="landing">
      <Hero onConnect={onConnect} showConnect={showConnect} />
      <Features />
      <HowItPlays />
      <CropsShowcase />
      <Faq />
      {showConnect && (
        <button className="hero-cta wide" onClick={onConnect}>
          🌱 Connect & start farming
        </button>
      )}
      <Footer />
    </div>
  );
}
