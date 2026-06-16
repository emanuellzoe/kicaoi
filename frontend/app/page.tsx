"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { ArrowUpRight } from "lucide-react";
import BlurText from "@/components/ui/BlurText";

const CROPS = [
  { emoji: "🌾", name: "Wheat", time: "5 min", yield: "+9 SEED", cost: "5 SEED", roi: "180%" },
  { emoji: "🎃", name: "Pumpkin", time: "30 min", yield: "+38 SEED", cost: "20 SEED", roi: "190%" },
  { emoji: "✨", name: "Golden", time: "2 hours", yield: "+130 SEED", cost: "60 SEED", roi: "216%" },
];

const STEPS = [
  { n: "1", title: "Buy SEED", desc: "Exchange CELO for SEED tokens (1 CELO = 100 SEED). SEED is the in-game currency that powers your farm." },
  { n: "2", title: "Plant Crops", desc: "Choose from Wheat, Pumpkin, or Golden crops. Each has a different cost, grow time, and yield. Pick your strategy." },
  { n: "3", title: "Harvest & Expand", desc: "Return when your crops are ready, harvest SEED, reinvest, and unlock more plots to grow your farm." },
];

const FEATURES = [
  { emoji: "⛓️", title: "Fully On-Chain", desc: "Every action — plant, harvest, buy — is a real blockchain transaction on Celo." },
  { emoji: "💸", title: "Gas in cUSD", desc: "MiniPay users pay gas with cUSD via Celo CIP-64. No CELO balance required." },
  { emoji: "🚜", title: "Batch Harvest", desc: "Harvest all ready plots in a single transaction. Save gas, save time." },
  { emoji: "🏆", title: "Leaderboard", desc: "Compete globally. Rankings are based on lifetime SEED harvested, entirely on-chain." },
];

const FAQS = [
  { q: "What is SEED?", a: "SEED is Kicaoi's in-game currency. You buy it with CELO (1 CELO = 100 SEED), use it to plant crops, and earn more SEED by harvesting. It is not redeemable back for CELO." },
  { q: "Do I need CELO in my wallet?", a: "If you're using MiniPay, you only need cUSD — gas fees are paid in cUSD via Celo CIP-64. Desktop wallet users need a small amount of CELO for gas, plus CELO to buy SEED." },
  { q: "Which wallets are supported?", a: "Any injected Web3 wallet works: MetaMask, MiniPay, Valora, Rabby, and others. MiniPay auto-connects inside the MiniPay browser." },
  { q: "What network is Kicaoi on?", a: "Kicaoi is deployed on Celo Mainnet (chain ID 42220). A testnet version on Celo Alfajores / Sepolia is also available for testing." },
  { q: "How do I earn more plots?", a: "You start with 3 plots after your first SEED purchase. Additional plots can be unlocked by spending SEED. Each unlock costs progressively more SEED." },
  { q: "Is the contract verified?", a: "Yes — KicaoiFarm is Sourcify-verified on both Celo Mainnet and Alfajores. You can read and verify every function on-chain." },
];

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="liquid-glass rounded-2xl overflow-hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-5 py-4 text-left bg-transparent border-none cursor-pointer text-white font-medium text-sm font-body hover:bg-white/3 transition-colors"
      >
        <span>{q}</span>
        <span className="text-white/40 ml-4 flex-shrink-0">{open ? "–" : "+"}</span>
      </button>
      {open && (
        <div className="px-5 pb-4 text-sm text-white/50 font-body leading-relaxed border-t border-white/5 pt-3">
          {a}
        </div>
      )}
    </div>
  );
}

export default function Home() {
  return (
    <main className="bg-black relative w-full">
      {/* ── Hero ───────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden w-full min-h-screen">
        <div className="absolute inset-0 z-0">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-green-900/25 rounded-full blur-[150px]" />
          <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-emerald-900/15 rounded-full blur-[100px]" />
        </div>
        <div className="absolute bottom-0 left-0 w-full h-[300px] bg-gradient-to-b from-transparent to-black z-0 pointer-events-none" />

        <div className="relative z-10 flex flex-col items-center text-center px-6 pt-40 pb-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="liquid-glass rounded-full px-1 py-1 pr-4 flex items-center gap-3 mb-8"
          >
            <span className="bg-green-500 text-black rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wider font-body">
              🌱 LIVE
            </span>
            <span className="text-white/70 font-body text-sm font-medium">On-chain farming on Celo.</span>
          </motion.div>

          <BlurText
            text="Plant. Grow. Harvest."
            className="text-5xl md:text-7xl lg:text-8xl font-heading italic text-white leading-[0.9] max-w-3xl tracking-tight justify-center"
            delay={0.1}
            stagger={0.1}
          />

          <motion.p
            initial={{ filter: "blur(10px)", opacity: 0, y: 20 }}
            animate={{ filter: "blur(0px)", opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.8 }}
            className="mt-8 text-lg md:text-xl text-white/60 font-body font-light leading-relaxed max-w-xl"
          >
            A yield farming game on Celo. Every crop is a real transaction. Every harvest earns real SEED — all
            on-chain, all yours.
          </motion.p>

          <motion.div
            initial={{ filter: "blur(10px)", opacity: 0, y: 20 }}
            animate={{ filter: "blur(0px)", opacity: 1, y: 0 }}
            transition={{ delay: 1.1, duration: 0.8 }}
            className="flex flex-col sm:flex-row items-center gap-4 mt-10"
          >
            <Link
              href="/farm"
              className="liquid-glass-strong hover:scale-105 transition-transform duration-300 rounded-full px-6 py-3.5 flex items-center gap-2 text-white font-medium text-sm font-body no-underline"
            >
              Start Farming
              <ArrowUpRight className="w-4 h-4 opacity-70" />
            </Link>
            <Link
              href="/leaderboard"
              className="rounded-full px-6 py-3.5 flex items-center gap-2 text-white/70 hover:text-white transition-colors font-medium text-sm font-body no-underline"
            >
              🏆 View Leaderboard
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.5, duration: 1 }}
            className="mt-16 flex items-center gap-4 flex-wrap justify-center"
          >
            {CROPS.map((c) => (
              <div key={c.name} className="liquid-glass rounded-2xl px-5 py-4 flex flex-col items-center min-w-[100px]">
                <span className="text-3xl">{c.emoji}</span>
                <span className="text-sm font-heading italic text-white mt-2">{c.name}</span>
                <span className="text-xs text-white/40 font-body mt-0.5">{c.time}</span>
                <span className="text-xs text-green-400 font-semibold mt-1">{c.yield}</span>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Sections ────────────────────────────────────────────────── */}
      <div className="relative z-10 bg-black w-full flex flex-col items-center px-6 pb-24 gap-24">
        {/* How It Works */}
        <section id="how-it-works" className="w-full max-w-2xl scroll-mt-24">
          <div className="text-center mb-10">
            <div className="liquid-glass inline-block rounded-full px-3 py-1 text-xs font-body text-white/50 mb-4">How it works</div>
            <h2 className="text-4xl font-heading italic text-white">Three steps to harvest</h2>
          </div>
          <div className="flex flex-col gap-4">
            {STEPS.map((s) => (
              <div key={s.n} className="liquid-glass rounded-2xl p-5 flex items-start gap-4">
                <div className="w-8 h-8 flex-shrink-0 rounded-full bg-green-500 text-black font-bold text-sm flex items-center justify-center font-body">
                  {s.n}
                </div>
                <div>
                  <div className="font-semibold text-white text-base">{s.title}</div>
                  <div className="text-white/50 text-sm font-body leading-relaxed mt-1">{s.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Dashboard Preview */}
        <section id="dashboard" className="w-full max-w-2xl scroll-mt-24">
          <div className="text-center mb-10">
            <div className="liquid-glass inline-block rounded-full px-3 py-1 text-xs font-body text-white/50 mb-4">Dashboard</div>
            <h2 className="text-4xl font-heading italic text-white">Your farm, at a glance</h2>
            <p className="text-white/40 text-sm font-body mt-3 max-w-md mx-auto">
              Track your CELO balance, SEED balance, plots, achievements — everything in one place.
            </p>
          </div>
          <div className="liquid-glass rounded-3xl p-6 overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-br from-green-900/10 to-transparent pointer-events-none" />
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="bg-white/5 rounded-2xl p-4">
                <div className="text-xs text-white/40 font-body mb-1">CELO Balance</div>
                <div className="text-2xl font-heading italic text-white">2.450</div>
              </div>
              <div className="bg-white/5 rounded-2xl p-4">
                <div className="text-xs text-white/40 font-body mb-1">SEED Balance</div>
                <div className="text-2xl font-heading italic text-green-400">840</div>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2 mb-4">
              {[
                { emoji: "🌾", label: "Plot #1", state: "✅ Ready", ready: true },
                { emoji: "🎃", label: "Plot #2", state: "14:32", ready: false },
                { emoji: "🟫", label: "Plot #3", state: "Empty", ready: false },
              ].map((p) => (
                <div
                  key={p.label}
                  className={`rounded-xl p-3 text-center border ${p.ready ? "bg-green-900/20 border-green-500/30" : "bg-white/3 border-white/5"}`}
                >
                  <div className="text-2xl">{p.emoji}</div>
                  <div className="text-[10px] text-white/40 font-body mt-1">{p.label}</div>
                  <div className={`text-[10px] font-semibold mt-0.5 ${p.ready ? "text-green-400" : "text-white/30"}`}>{p.state}</div>
                </div>
              ))}
            </div>
            <Link
              href="/farm"
              className="w-full flex items-center justify-center gap-2 liquid-glass-strong rounded-full py-3 text-sm font-semibold text-white font-body no-underline hover:scale-105 transition-transform"
            >
              Open Farm Dashboard
              <ArrowUpRight className="w-4 h-4 opacity-70" />
            </Link>
          </div>
        </section>

        {/* Features */}
        <section id="features" className="w-full max-w-2xl scroll-mt-24">
          <div className="text-center mb-10">
            <div className="liquid-glass inline-block rounded-full px-3 py-1 text-xs font-body text-white/50 mb-4">Features</div>
            <h2 className="text-4xl font-heading italic text-white">Built different</h2>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {FEATURES.map((f) => (
              <div key={f.title} className="liquid-glass rounded-2xl p-5">
                <div className="text-2xl mb-3">{f.emoji}</div>
                <div className="font-semibold text-white text-sm mb-2">{f.title}</div>
                <div className="text-white/40 text-xs font-body leading-relaxed">{f.desc}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Stats */}
        <section className="w-full max-w-2xl">
          <div className="liquid-glass rounded-3xl p-8">
            <div className="grid grid-cols-3 gap-6 text-center">
              {[
                { label: "Crops Available", value: "3" },
                { label: "On-chain", value: "100%" },
                { label: "Network", value: "Celo" },
              ].map((s) => (
                <div key={s.label}>
                  <div className="text-4xl font-heading italic text-white">{s.value}</div>
                  <div className="text-xs text-white/40 font-body mt-1">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="w-full max-w-2xl scroll-mt-24">
          <div className="text-center mb-10">
            <div className="liquid-glass inline-block rounded-full px-3 py-1 text-xs font-body text-white/50 mb-4">FAQ</div>
            <h2 className="text-4xl font-heading italic text-white">Common questions</h2>
          </div>
          <div className="flex flex-col gap-3">
            {FAQS.map((f) => (
              <FaqItem key={f.q} q={f.q} a={f.a} />
            ))}
          </div>
        </section>

        {/* CTA Footer */}
        <section className="w-full max-w-xl text-center">
          <h2 className="text-5xl font-heading italic text-white mb-6">Ready to farm?</h2>
          <p className="text-white/50 text-base font-body leading-relaxed mb-8">
            Connect your wallet and start planting. Works with MetaMask, MiniPay, and any injected provider.
          </p>
          <Link
            href="/farm"
            className="liquid-glass-strong hover:scale-105 transition-transform duration-300 rounded-full px-8 py-4 inline-flex items-center gap-2 text-white font-semibold text-base font-body no-underline"
          >
            Go to Farm
            <ArrowUpRight className="w-5 h-5 opacity-70" />
          </Link>
          <p className="text-white/20 text-xs font-body mt-6">
            SEED is an in-game credit · 1 CELO = 100 SEED · Not redeemable
          </p>
        </section>
      </div>
    </main>
  );
}
