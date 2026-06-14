# Kicaoi

> **Plant. Wait. Harvest. Grow your farm — one onchain tap at a time.**

**Kicaoi — a Celo idle farming game powered by an onchain SEED credit system, built as a MiniApp for MiniPay.**

![Status](https://img.shields.io/badge/status-MVP%20in%20development-yellow)
![Hackathon](https://img.shields.io/badge/Proof%20of%20Ship-Celo%20Builder%20Program-35D07F)
![Chain](https://img.shields.io/badge/chain-Celo-FCFF52)
![Wallet](https://img.shields.io/badge/wallet-MiniPay-2775CA)
![Contracts](https://img.shields.io/badge/contracts-Foundry%20%2B%20OpenZeppelin-orange)
![Frontend](https://img.shields.io/badge/frontend-Next.js%20%2B%20React-black)
![License](https://img.shields.io/badge/license-MIT-blue)

> **⚠️ Honest status:** Kicaoi is an **MVP in active development** for the **Celo Proof of Ship** builder program. This README documents the target architecture; sections use a status legend so nothing is overclaimed.
>
> **Legend:** ✅ implemented &nbsp;·&nbsp; 🚧 in progress &nbsp;·&nbsp; 🗺️ planned

---

## 🟢 Live on Celo Sepolia (testnet)

| | |
|---|---|
| **Contract** | [`0x82622F1d43B25DBB2414285FF98c52d694661c61`](https://sepolia.celoscan.io/address/0x82622F1d43B25DBB2414285FF98c52d694661c61) |
| **Network** | Celo Sepolia (chainId `11142220`) |
| **Verification** | ✅ Sourcify (`exact_match`) |
| **Conversion rate** | `1 CELO = 100 SEED` |
| **Crops seeded** | Wheat · Pumpkin · Golden (in constructor) |

Point the frontend at it via `frontend/.env.local`:
`NEXT_PUBLIC_KICAOI_CONTRACT_ADDRESS=0x82622F1d43B25DBB2414285FF98c52d694661c61`

---

## Table of Contents

1. [One-liner](#one-liner)
2. [Problem](#problem)
3. [Solution](#solution)
4. [Why Kicaoi fits Proof of Ship](#why-kicaoi-fits-proof-of-ship)
5. [Project status](#project-status)
6. [Key features](#key-features)
7. [Deposit asset & SEED credits](#deposit-asset--seed-credits)
8. [Economy & gas model](#economy--gas-model)
9. [Crops & plots](#crops--plots)
10. [Game loop](#game-loop)
11. [Why each action is a transaction](#why-each-action-is-a-transaction)
12. [Demo flow](#demo-flow)
13. [Architecture](#architecture)
14. [Smart contract design](#smart-contract-design)
15. [Frontend design](#frontend-design)
16. [Tech stack](#tech-stack)
17. [Security model](#security-model)
18. [Compliance disclaimer](#compliance-disclaimer)
19. [Installation](#installation)
20. [Environment variables](#environment-variables)
21. [Smart contract deployment](#smart-contract-deployment)
22. [Frontend development](#frontend-development)
23. [Testing checklist](#testing-checklist)
24. [Repository structure](#repository-structure)
25. [Roadmap](#roadmap)
26. [Team](#team)
27. [License](#license)
28. [Hackathon submission checklist](#hackathon-submission-checklist)

---

## One-liner

Kicaoi is a mobile-first **idle farming game** on Celo: **buy SEED credits once with CELO**, then plant, wait, harvest, and expand your farm — each action is a fast, real onchain transaction, and your harvested SEED grows the farm (it is never cashed out).

---

## Problem

Most onchain "games" on mobile wallets are either heavy DeFi dashboards or one-off click-to-earn loops. They are slow to understand, hard to play on a phone, and rarely give a casual user a reason to make *repeated* real onchain transactions.

MiniPay reaches **14M+ self-custodial users** who already hold CELO and stablecoins, but there is a shortage of **simple, fun, mobile-native experiences** that:

- onboard a user into a real onchain action in seconds,
- work natively inside the MiniPay wallet,
- and generate **sustained onchain activity** (many transactions per user) rather than a single tap.

Idle/incremental farming is one of mobile gaming's most proven retention loops — short sessions, frequent return visits, visible progression — yet **no idle farming game exists as a native MiniPay MiniApp.**

---

## Solution

Kicaoi converts **one CELO purchase into many farming actions** using an internal credit system:

1. **Buy SEED** with CELO (default rate: `1 CELO = 100 SEED`).
2. **Plant** a crop on a plot — burns the crop's SEED plant cost.
3. **Wait** for it to grow (real time, enforced onchain by `block.timestamp`).
4. **Harvest** — credits the crop's SEED yield back to you; the plot becomes empty again.
5. **Reinvest** — replant, unlock more plots, and grow rarer crops for bigger yields.

Because the loop is short and every step is a real `plant()` / `harvest()` / `unlockPlot()` transaction, an engaged player naturally makes **dozens of transactions per day** — directly producing the **onchain activity** Proof of Ship asks for, while keeping each action cheap and casual.

SEED is an **internal, non-transferable, non-redeemable** game credit — it can **never** be cashed back out to CELO. That single decision keeps Kicaoi unambiguously a **Game** (arcade-style credits) and keeps the smart contract tiny: **no payouts, no prize pool, no solvency logic, no randomness oracle.** See the [Compliance disclaimer](#compliance-disclaimer).

---

## Why Kicaoi fits Proof of Ship

Targeting the **Proof of Ship — Celo Builder Program**: *ship real products as MiniApps for MiniPay.*

| Program signal | How Kicaoi responds |
|---|---|
| Wanted category: **Games** | A casual idle farming game — not a DeFi/finance app. |
| **MiniApp built with the MiniPay hook** | Detects `window.ethereum.isMiniPay`, auto-connects the injected wallet, and hides the Connect Wallet button inside MiniPay. 🚧 |
| **Onchain activity** required | **Each plant/harvest/unlock is an onchain tx.** One funded farm produces dozens of transactions per day. |
| **Deploy on Celo Mainnet, verified contract** | `KicaoiFarm.sol` targets Celo Mainnet with source verification on Celoscan. 🗺️ |
| **Open source, public GitHub** | This repository is public and MIT-licensed. |
| **"Simpler is better"** | One deposit asset (CELO), one internal currency (SEED), one loop, one small contract. |
| **Mobile-first** | Warm, rounded, thumb-friendly farm UI for the MiniPay in-wallet browser. |

> Avoided on purpose: the program explicitly does **not** seek *DeFi apps by solo builders*, *reward-farming apps*, or non-functional *demos / bot engagement*. Kicaoi is framed and built as a **functional game**; SEED is a non-redeemable in-game credit, not a financial or farming product.

### Effect on the Proof of Ship onchain metrics

Builder activity is tracked on [Talent App](https://talent.app/) (Transactions, DAU, Gas Fees). The SEED credit model is designed to lift these **honestly**:

| Metric | Effect | Why |
|---|---|---|
| **Transactions** | ↑ | Each `plant()` / `harvest()` / `unlockPlot()` is **one onchain transaction**. A player with several plots who returns a few times a day does dozens of real transactions daily. |
| **Gas Fees** | ↑ (proportional) | Every action still pays **CELO gas** (kept low — actions only mutate small per-user state — but never zero). More actions → more total gas. |
| **DAU** | — (not by itself) | Daily Active Users counts **distinct wallets**. One person replaying is still **1 DAU**. DAU grows only with real onboarding. |

> **Integrity note — this is not transaction farming.** The credit model does **not invent** transactions; it makes each action cheap enough that *genuine* users take many. Inflating the count by scripting one wallet is exactly the **"bot engagement / reward farming"** pattern the program rejects. The real, defensible signal is **real users × many actions each** — which lifts Transactions *and* DAU together.

---

## Project status

| Area | Component | Status |
|---|---|---|
| Repo | Two-package layout (`frontend/`, `contracts/`) | ✅ |
| Repo | Product spec ([PRD.md](./PRD.md)) — economy, structs, functions, events | ✅ |
| Frontend | Next.js + React + Tailwind scaffold | 🚧 |
| Frontend | MiniPay integration — detect `isMiniPay`, auto-connect, hide Connect button | 🗺️ |
| Frontend | Farm grid, buy-SEED, plant/harvest, shop, leaderboard | 🗺️ |
| Contracts | Foundry project scaffold | 🚧 |
| Contracts | `KicaoiFarm.sol` (buy SEED, plant, harvest, unlock, stats, admin) | ✅ |
| Contracts | OpenZeppelin `Ownable` / `ReentrancyGuard` integration | ✅ |
| Contracts | Foundry unit tests (26 passing) | ✅ |
| Deploy | Celo Sepolia (dev/QA) deployment + Sourcify verification | ✅ |
| Deploy | **Celo Mainnet** deployment + Celoscan verification (eligibility) | 🗺️ |
| Roadmap | Cosmetics, daily bonus, batched plant/harvest | 🗺️ |

---

## Key features

- 🗺️ **CELO → SEED credits** — buy in-game credits once at a configurable rate (default `1 CELO = 100 SEED`).
- 🗺️ **Internal credit ledger** — SEED is an **internal accounting balance**, not a transferable ERC-20. Actions only mutate internal numbers, keeping gas low.
- 🗺️ **Non-redeemable by design** — SEED is **never** converted back to CELO, so there is no payout/solvency logic and no gambling/financial framing.
- 🗺️ **Plant → grow → harvest loop** — timestamp-based crop growth enforced onchain.
- 🗺️ **Multiple plots** — start with 3 plots; unlock more with SEED for parallel farming (and more transactions).
- 🗺️ **Crop tiers** — fast/cheap to slow/high-yield crops, all owner-configurable.
- 🗺️ **Player stats** — plots owned, total planted, total harvested, lifetime SEED harvested.
- 🗺️ **Leaderboard** — rank wallets by lifetime SEED harvested (from contract events).
- 🗺️ **Owner/admin configuration** — conversion rate and per-crop economics are configurable onchain.
- 🗺️ **Events for indexing** — `SeedsBought`, `Planted`, `Harvested`, `PlotUnlocked`, `CropUpdated`, `SeedRateUpdated`.

---

## Deposit asset & SEED credits

| Concept | Detail |
|---|---|
| **Deposit asset** | **CELO** (native), via a `payable` purchase. |
| **Game currency** | **SEED credits** — an internal balance tracked per player in the contract. |
| **Conversion rate** | Default **`1 CELO = 100 SEED`**, owner-configurable (`setSeedRate`). |
| **Transferable?** | **No** — SEED cannot move between players. |
| **Redeemable?** | **No** — SEED is one-way; consumed in-game, never returned to CELO. |

> **What SEED is — and is not.** SEED credits are **internal game accounting**, like arcade tokens. They are **not** an ERC-20, **not** transferable, **not** listed, **not** redeemable, and have **no existence outside the Kicaoi contract**. Because SEED can never be cashed out, Kicaoi has **no payout, prize-pool, or solvency logic** — which keeps the contract small and keeps the product clearly a game.

---

## Economy & gas model

### Credit economy (example, configurable)

| Action | SEED effect |
|---|---|
| Buy 1 CELO | **+100 SEED** |
| Plant Wheat | −5 SEED |
| Harvest Wheat | +9 SEED |
| Plant Pumpkin | −20 SEED |
| Harvest Pumpkin | +38 SEED |
| Plant Golden Crop | −60 SEED |
| Harvest Golden Crop | +130 SEED |
| Unlock plot #(n+1) | −(50 × current plot count) SEED |

> Harvest yields are **net-positive vs. plant cost** so the farm feels rewarding, while the **plot-unlock sink scales up** (each new plot costs more) so SEED always has somewhere to go. Because SEED is non-redeemable, net SEED generation has **no financial value** — it is purely progression and leaderboard score.

### Two separate costs — game cost ≠ gas

| Cost | Paid in | Goes to | Notes |
|---|---|---|---|
| **Game cost** | SEED credits (internal) | Consumed in-game | Just an internal ledger update. |
| **Network gas fee** | CELO (or a Celo-supported fee token) | Celo validators / the network | Required for every transaction. |

**Important:** the SEED cost **does not replace gas**. Every `plant()` / `harvest()` is still a blockchain transaction and still costs network gas, paid in CELO. Because these only update internal balances (no token transfers in the hot path), their **gas cost is kept low** — but it is never zero.

---

## Crops & plots

| Crop | Plant cost (SEED) | Grow time | Harvest yield (SEED) | Tier |
|---|---:|---:|---:|---|
| **Wheat** | 5 | 5 min | 9 | Starter — fast loop |
| **Pumpkin** | 20 | 30 min | 38 | Mid |
| **Golden Crop** | 60 | 2 hr | 130 | Slow — high yield |

- A plot is **empty**, **growing** (planted, not yet mature), or **ready** (mature → harvestable).
- Grow time is enforced **onchain**: `harvest` reverts if `block.timestamp < plantedAt + growTime`.
- New players start with **3 plots**; unlock more with SEED (`unlockPlot`), each costing more than the last.
- Crop and plot economics are **owner-configurable** (`setCrop`, `unlockBaseCost`).

---

## Game loop

```
Buy SEED with CELO            (1 CELO = 100 SEED)    ── 1 tx (occasional)
   ↓
Plant a crop on a plot        (burns SEED plant cost) ── 1 tx
   ↓
Wait for it to grow           (real time; onchain-enforced)
   ↓
Harvest                       (credits SEED yield)    ── 1 tx
   ↓
Reinvest:
   • Plant again                                       ── 1 tx each
   • Unlock a new plot         (burns SEED)            ── 1 tx
   • Plant rarer/slower crops for bigger yield         ── 1 tx each
   ↓
Climb the Harvest leaderboard (lifetime SEED harvested)
```

1. **Connect wallet** — the app reads your CELO balance and your in-contract SEED balance.
2. **Buy SEED** — send native CELO; the contract credits your SEED at the current rate and initializes your starting plots.
3. **Plant** — pick an empty plot and a crop; submit the plant transaction (gas in CELO); the plant cost is deducted from SEED.
4. **Wait & harvest** — when the crop matures, the Harvest button enables; submit the harvest transaction to collect the SEED yield.
5. **Grow** — replant, unlock more plots, and move up to higher-yield crops; track your rank on the leaderboard.

---

## Why each action is a transaction

Each of these is a distinct onchain transaction:

| Action | Onchain tx | Frequency driver |
|---|---|---|
| `buySeeds()` | 1 | Occasional top-up |
| `plant(plotId, cropId)` | 1 per plot per cycle | Every empty plot, every cycle |
| `harvest(plotId)` | 1 per plot per cycle | Every matured plot |
| `unlockPlot()` | 1 | Progression milestones |

**Worked example.** A player with **6 plots** returning **3 times a day** does `6 harvest + 6 replant = 12 tx/visit × 3 = 36 tx/day` from one occasional CELO top-up. 100 real daily players ≈ **~3,600 real transactions/day** — high, honest, sustained activity that also counts toward DAU because the players are real and distinct.

> Optional `plantAll` / `harvestAll` batching helpers may be added post-MVP for UX; the MVP keeps per-plot actions separate to maximize legible onchain activity and keep gas per tx low.

---

## Demo flow

A ~60-second judge/demo walkthrough:

1. Open Kicaoi inside MiniPay (or a browser wallet on Celo Sepolia for local testing).
2. Connect wallet → CELO balance and SEED credits load.
3. Buy SEED with a small amount of CELO (e.g. 0.1 CELO → 10 SEED) → confirm the onchain purchase.
4. Plant Wheat on two plots → confirm two plant transactions.
5. Wait for the short grow timer → harvest both → confirm two harvest transactions and watch SEED grow.
6. Unlock an extra plot to show progression, then replant to demonstrate the repeatable loop.
7. Show the leaderboard ranking by lifetime SEED harvested.

> **Demo narration:** *"Kicaoi is a Celo farming game. Buy SEED with CELO — 1 CELO is 100 SEED — then plant, wait, and harvest. Every plant and harvest is a real onchain transaction, so an active farm makes dozens of transactions a day. SEED stays in the game to grow your farm; it's a game credit, not a payout."*

---

## Architecture

```
                       ┌─────────────────────────────────────┐
                       │            MiniPay wallet            │
                       │   (Opera, self-custodial, mobile)    │
                       └───────────────────┬─────────────────┘
                                           │ injected provider
                                           ▼
┌──────────────────────────────────────────────────────────────────────┐
│  frontend/   Next.js (App Router) · React · Tailwind                   │
│                                                                        │
│   Pages: Landing · Farm · Shop · Leaderboard                           │
│   wagmi + viem  ──── read CELO + SEED / send tx ────┐                  │
│   Plot grid · growth countdowns · plant/harvest     │                  │
└──────────────────────────────────────────────────────┼─────────────────┘
                                                        │ JSON-RPC
                                                        ▼
┌──────────────────────────────────────────────────────────────────────┐
│  contracts/   Foundry · Solidity · OpenZeppelin                        │
│                                                                        │
│   KicaoiFarm.sol                                                       │
│     • buySeeds     (CELO → SEED credits)                               │
│     • plant        (burn SEED → set crop + plantedAt)                  │
│     • harvest      (time check → add SEED yield → reset plot)          │
│     • unlockPlot   (burn SEED → append plot)                           │
│     • per-user SEED balance · plots · player stats                     │
│     • admin: setCrop / setSeedRate / withdrawCelo                      │
│     • events: SeedsBought / Planted / Harvested / PlotUnlocked / ...   │
└───────────────────────────────────────────────────┬────────────────────┘
                                                     ▼
                                  Celo  (Sepolia for dev · Mainnet for eligibility)
```

The repository is a **two-package layout**: **`frontend/`** (the MiniApp) and **`contracts/`** (the Foundry contracts).

---

## Smart contract design

**Contract:** `contracts/src/KicaoiFarm.sol` (🗺️ to be implemented; the repo ships a Foundry scaffold to be replaced).

### Responsibilities

1. Accept native **CELO** and credit SEED at the conversion rate; initialize starting plots.
2. Track per-user **SEED balances**, **plots**, and **stats**.
3. **Plant**: validate empty plot + balance, deduct cost, set crop and `plantedAt`.
4. **Harvest**: validate maturity, add yield, reset the plot, update stats.
5. **Unlock** additional plots for SEED.
6. Let the owner configure crops and the rate, and withdraw collected CELO.
7. Emit events for the frontend and leaderboard.

### Core types

```solidity
struct CropConfig {
    uint256 plantCost;    // SEED
    uint256 growTime;     // seconds
    uint256 yieldAmount;  // SEED on harvest
    bool    enabled;
}

struct Plot {
    uint8   cropId;       // 0 = empty
    uint256 plantedAt;    // block.timestamp at plant
}

struct PlayerStats {
    uint256 plotCount;
    uint256 totalPlanted;
    uint256 totalHarvested;     // number of harvests
    uint256 totalSeedHarvested; // lifetime SEED earned (leaderboard key)
}
```

### State & constants

```solidity
mapping(address => uint256)      public seedBalance;    // SEED credits per user
mapping(address => Plot[])       public plots;          // plots per user
mapping(address => PlayerStats)  public stats;
mapping(uint8 => CropConfig)     public crops;

uint256 public seedPerCelo    = 100;  // 1 CELO -> 100 SEED (owner-configurable)
uint256 public startingPlots  = 3;
uint256 public unlockBaseCost = 50;   // unlock cost = unlockBaseCost * current plot count
address public owner;

uint8 public constant CROP_WHEAT   = 1;
uint8 public constant CROP_PUMPKIN = 2;
uint8 public constant CROP_GOLDEN  = 3;
```

### Functions

| Function | Purpose |
|---|---|
| `buySeeds() payable` | Credit SEED = `msg.value * seedPerCelo / 1e18`; initialize `startingPlots` empty plots on first buy. |
| `plant(uint256 plotId, uint8 cropId)` | Require empty plot + `seedBalance >= plantCost`; deduct cost; set crop and `plantedAt`. |
| `harvest(uint256 plotId)` | Require `block.timestamp >= plantedAt + growTime`; add `yieldAmount`; reset plot; update stats. |
| `unlockPlot()` | Deduct `unlockBaseCost * plotCount` SEED; append a new empty plot. |
| `getFarm(address user) view returns (Plot[])` | Return the player's plots for the UI. |
| `getStats(address user) view returns (PlayerStats)` | Return the player's stats. |
| `setCrop(uint8 cropId, uint256 plantCost, uint256 growTime, uint256 yieldAmount, bool enabled) onlyOwner` | Configure a crop. |
| `setSeedRate(uint256 newSeedPerCelo) onlyOwner` | Update the CELO↔SEED rate. |
| `withdrawCelo(uint256 amount) onlyOwner` | Withdraw collected CELO (purchase revenue) to the owner/treasury. |

### Events

```solidity
event SeedsBought(address indexed user, uint256 celoAmount, uint256 seedCredited);
event Planted(address indexed user, uint256 indexed plotId, uint8 cropId, uint256 plantedAt);
event Harvested(address indexed user, uint256 indexed plotId, uint8 cropId, uint256 yieldAmount);
event PlotUnlocked(address indexed user, uint256 newPlotCount, uint256 cost);
event CropUpdated(uint8 indexed cropId, uint256 plantCost, uint256 growTime, uint256 yieldAmount, bool enabled);
event SeedRateUpdated(uint256 seedPerCelo);
```

### Invariants enforced

- A user cannot plant without `seedBalance >= crop.plantCost`.
- A user cannot plant on a non-empty plot.
- A user cannot harvest before the grow time elapses.
- A user cannot harvest an empty plot.
- A user cannot unlock a plot without enough SEED.
- **No function pays CELO to a player** — there is no redemption path, so no payout solvency or reentrancy risk on the user side. Only the owner can withdraw collected CELO (`withdrawCelo`), guarded by `Ownable`, `nonReentrant`, and a checked low-level `call`.

> **Why this is the "small contract" option.** No ERC-721/ERC-20, no randomness oracle, no prize-pool accounting, no per-user payout path. The only CELO movement is **in** (purchases) and an owner-only **out** (treasury). Growth is pure arithmetic over timestamps.

---

## Frontend design

**Package:** `frontend/` (Next.js App Router, React, Tailwind).

### MiniPay integration

MiniPay injects an EIP-1193 provider flagged with **`window.ethereum.isMiniPay`**. Kicaoi treats the integration as "integrated" only when both are true:

1. **Detection** — the app checks `window.ethereum?.isMiniPay`.
2. **Auto-connect + hidden button** — inside MiniPay, the app auto-connects the injected wallet and hides the Connect Wallet button.

```tsx
// hooks/useMiniPay.ts
"use client";
import { useEffect, useState } from "react";
import { useConnect } from "wagmi";
import { injected } from "wagmi/connectors";

export function useMiniPay() {
  const [isMiniPay, setIsMiniPay] = useState(false);
  const { connect } = useConnect();

  useEffect(() => {
    const inMiniPay =
      typeof window !== "undefined" && (window as any).ethereum?.isMiniPay;
    if (inMiniPay) {
      setIsMiniPay(true);
      connect({ connector: injected() }); // auto-connect; no Connect button needed
    }
  }, [connect]);

  return { isMiniPay };
}
```

```tsx
// components/ConnectWalletButton.tsx
const { isMiniPay } = useMiniPay();
if (isMiniPay) return null; // hide Connect Wallet button when opened from MiniPay
return <button onClick={() => connect({ connector: injected() })}>Connect Wallet</button>;
```

### Pages

| Page | Route | Contents |
|---|---|---|
| Landing | `/` | Title, tagline, Start Farming, How to play. |
| Farm | `/farm` | Plot grid (empty/growing/ready), plant & harvest actions, SEED balance, buy-SEED. |
| Shop | `/shop` | Crop catalog (cost / grow time / yield), unlock-plot button. |
| Leaderboard | `/leaderboard` | Rank, wallet, plots, lifetime SEED harvested (mock first → events later). |

### Components

`ConnectWalletButton`, `CeloBalanceCard`, `SeedCreditCard`, `BuySeedCard`, `PlotTile`, `FarmGrid`, `CropCard`, `PlantModal`, `HarvestButton`, `GrowthTimer`, `PlayerStatsCard`, `LeaderboardTable`.

### Visual theme

Warm, rounded, mobile-first, **arcade farm** vibe (greens / earth tones, sunny accents) — not a finance dashboard — with a Celo accent and small plant/harvest animations.

| Token | Hex |
|---|---|
| Background | `#0E140C` |
| Surface | `#161E12` |
| Card surface | `#1D2718` |
| Primary green | `#35D07F` |
| Celo yellow | `#FCFF52` |
| Soil brown | `#8B5E3C` |
| Text | `#F8FAFC` |
| Muted text | `#94A3B8` |
| Danger | `#EF4444` |
| Success | `#22C55E` |

---

## Tech stack

| Layer | Choice |
|---|---|
| Wallet / host | **MiniPay** (Opera self-custodial wallet) |
| Frontend | Next.js (App Router), React, TypeScript |
| Styling | Tailwind CSS |
| Web3 client | wagmi + viem (MiniPay-compatible injected connector) |
| Contracts | Solidity + **Foundry** (`forge`) |
| Libraries | OpenZeppelin (`Ownable`, `ReentrancyGuard`) |
| Network | Celo — **Sepolia** for dev/QA, **Mainnet** for eligibility |
| Verification | Celoscan |

> The Celo [`celo-composer`](https://github.com/celo-org/celo-composer) starter kit is a useful reference for MiniPay + Hardhat if you prefer that path; this repo standardizes on Foundry for contracts.

---

## Security model

Kicaoi is an **unaudited MVP for a builder program**. The design follows standard safeguards, but it is **not** production-hardened.

**Implemented by design (🗺️ as `KicaoiFarm.sol` is built):**

- **`ReentrancyGuard`** on the single fund-moving function (`withdrawCelo`), as defense-in-depth — note that **no user-facing function pays out CELO**, so the usual game payout reentrancy surface does not exist.
- **Checks-Effects-Interactions** ordering with a checked low-level `call` on `withdrawCelo`.
- **Access control** via `Ownable` for crop config, rate, and treasury withdrawal.
- **No randomness** → nothing is manipulable for gain; outcomes depend only on time and player input.
- **Non-redeemable credits** → no prize pool, no solvency dependency, no insolvency risk.

**Known risks / limitations (explicitly disclosed):**

- ❌ **Not audited.** No third-party security audit has been performed.
- ⚠️ **Admin powers.** The owner can change crop economics / the rate and withdraw collected CELO — centralization/admin-key risk. Production should use a multisig + timelock.
- ⚠️ **Collected CELO custody.** The contract holds CELO from purchases until the owner withdraws it; this is game revenue, disclosed plainly.

**Operational security (per Proof of Ship guidance):**

- **Never use a personal wallet for development or deployment.** Always use a dedicated, separate wallet, and keep `PRIVATE_KEY` out of version control.

We deliberately avoid claims like *"fully secure"*, *"audited"*, or *"risk-free"*.

---

## Compliance disclaimer

**Kicaoi is an experimental game built for the Celo Proof of Ship builder program. It is not a financial product, not a real-money gambling service, and not investment or yield-bearing software. SEED credits are internal game points, not a token, security, or currency.**

- The buy / plant / harvest mechanics are **in-game mechanics**.
- **SEED is non-redeemable.** It is never converted back to CELO. There is no payout, no prize pool, no wager, and no chance-based reward — so Kicaoi does **not** present as betting, lottery, or yield. CELO collected from SEED purchases is game revenue.
- Nothing here is legal advice. Operators are solely responsible for compliance in their jurisdiction before any commercial operation.

> Positioning: within Proof of Ship, Kicaoi is presented as a **Game** (a wanted category) — explicitly **not** a DeFi-by-solo-builder product and **not** a reward-farming app.

---

## Installation

**Prerequisites:** Node.js 20+, npm, [Foundry](https://book.getfoundry.sh/getting-started/installation) (`forge`), git, and a dedicated (non-personal) wallet funded with Celo Sepolia test CELO.

```bash
# Clone
git clone https://github.com/emanuellzoe/kicaoi.git
cd kicaoi

# Frontend
cd frontend
npm install
cd ..

# Contracts (Foundry)
cd contracts
forge install OpenZeppelin/openzeppelin-contracts
forge build
cd ..
```

> Add an OpenZeppelin remapping in `contracts/remappings.txt` (or `foundry.toml`), e.g.
> `@openzeppelin/=lib/openzeppelin-contracts/`.

---

## Environment variables

The repo is split into two packages, so environment files are split too.

### Frontend — `frontend/.env.local`

```bash
# Wallet / connection
NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID=
NEXT_PUBLIC_CHAIN_ID=11142220            # Celo Sepolia (dev). Celo Mainnet = 42220

# Contract
NEXT_PUBLIC_KICAOI_CONTRACT_ADDRESS=

# Economy (display only; source of truth is on-chain)
NEXT_PUBLIC_SEED_PER_CELO=100
NEXT_PUBLIC_CELO_NATIVE=true
```

### Contracts — `contracts/.env`

```bash
# Deployment (use a DEDICATED wallet, never a personal one)
PRIVATE_KEY=

# RPC endpoints
CELO_SEPOLIA_RPC_URL=https://forno.celo-sepolia.celo-testnet.org
CELO_RPC_URL=https://forno.celo.org

# Verification
CELOSCAN_API_KEY=
```

> ⚠️ Add both env files to `.gitignore`. Never commit a private key. Confirm the exact Celo Sepolia RPC host against the current Celo docs before deploying.

---

## Smart contract deployment

> Status: 🗺️ `KicaoiFarm.sol` and its deploy script (`contracts/script/KicaoiFarm.s.sol`) are part of the build-out; commands below reflect the intended Foundry workflow.

```bash
cd contracts

# Build & test
forge build
forge test

# Deploy to Celo Sepolia (dev/QA)
forge script script/KicaoiFarm.s.sol:KicaoiFarmScript \
  --rpc-url "$CELO_SEPOLIA_RPC_URL" \
  --private-key "$PRIVATE_KEY" \
  --broadcast

# Deploy to Celo Mainnet (eligibility) + verify on Celoscan
forge script script/KicaoiFarm.s.sol:KicaoiFarmScript \
  --rpc-url "$CELO_RPC_URL" \
  --private-key "$PRIVATE_KEY" \
  --broadcast \
  --verify \
  --etherscan-api-key "$CELOSCAN_API_KEY"
```

**Post-deploy (owner):**

1. `setSeedRate(100)` (or your chosen rate).
2. `setCrop(...)` for Wheat / Pumpkin / Golden Crop (costs, grow times, yields in SEED).
3. Copy the deployed address into `frontend/.env.local`.

---

## Frontend development

```bash
cd frontend
npm run dev      # start the dev server (http://localhost:3000)
npm run build    # production build
npm run start    # serve the production build
npm run lint     # lint
```

For MiniPay testing, expose the dev server (e.g. via a tunnel) and open it inside the MiniPay in-wallet browser, or use a standard browser wallet on **Celo Sepolia** for local iteration.

---

## Testing checklist

Use this as the QA pass before submission.

**Contract (Foundry):**

- [ ] `buySeeds` credits SEED = `msg.value * seedPerCelo / 1e18` (exact) and initializes `startingPlots` on first buy.
- [ ] `plant` reverts on a non-empty plot.
- [ ] `plant` reverts when `seedBalance < plantCost`.
- [ ] `plant` deducts the plant cost and sets `cropId` + `plantedAt`.
- [ ] `harvest` reverts before `plantedAt + growTime`.
- [ ] `harvest` reverts on an empty plot.
- [ ] `harvest` adds the yield, resets the plot, and updates stats (`totalHarvested`, `totalSeedHarvested`).
- [ ] `unlockPlot` reverts without enough SEED and otherwise appends a plot at the scaling cost.
- [ ] Only owner can call `setCrop` / `setSeedRate` / `withdrawCelo`.
- [ ] `withdrawCelo` sends CELO via a checked low-level `call` and respects `nonReentrant`.
- [ ] Events emitted with correct args for `SeedsBought` / `Planted` / `Harvested` / `PlotUnlocked`.

**Frontend:**

- [ ] Inside MiniPay: `window.ethereum.isMiniPay` is detected, the wallet auto-connects, and the Connect Wallet button is hidden.
- [ ] Wallet connects inside MiniPay and reads CELO + SEED balances.
- [ ] Buying SEED shows the resulting credit (rate applied).
- [ ] Farm grid renders each plot's state (empty / growing / ready) with a live countdown.
- [ ] Plant deducts SEED and starts the growth timer; Harvest enables only when mature.
- [ ] Harvest updates the SEED balance and stats; the plot returns to empty.
- [ ] Unlock-plot adds a plot at the correct scaling cost.
- [ ] UI makes clear that gas (CELO) is separate from the SEED game cost.
- [ ] Mobile layout is usable at common phone widths.

---

## Repository structure

```
kicaoi/
├── README.md                  # this file
├── PRD.md                     # product requirements (economy, structs, functions, events)
│
├── frontend/                  # MiniApp — Next.js + React + Tailwind
│   ├── app/                   # App Router pages
│   │   ├── layout.tsx
│   │   └── page.tsx           # Landing
│   ├── components/            # FarmGrid, PlotTile, BuySeedCard, ...
│   ├── hooks/                 # useMiniPay, useKicaoi
│   ├── lib/                   # abi, addresses, wagmi config
│   ├── public/
│   └── package.json
│
└── contracts/                 # Contracts — Foundry
    ├── foundry.toml
    ├── src/                   # KicaoiFarm.sol
    ├── script/                # KicaoiFarm.s.sol (deploy)
    ├── test/                  # KicaoiFarm.t.sol
    └── lib/forge-std/
```

---

## Roadmap

**MVP (Proof of Ship submission)**

- 🗺️ Implement `KicaoiFarm.sol` (buy SEED, plant, harvest, unlock, stats, admin, events).
- 🗺️ Foundry tests covering the [testing checklist](#testing-checklist).
- 🗺️ MiniPay wallet connection + buy-SEED / farm grid / plant / harvest UI.
- 🗺️ Deploy + verify on **Celo Mainnet**; configure crops; generate real onchain activity.

**Post-MVP**

- 🗺️ **Leaderboard** from contract events (indexer/subgraph).
- 🗺️ **Daily login bonus** (`claimDaily`) — extra cheap tx + retention hook.
- 🗺️ **Batched actions** (`plantAll` / `harvestAll`) for UX.
- 🗺️ **Cosmetic spend sinks** (farm skins/themes) as additional SEED uses.
- 🗺️ Owner controls behind a **multisig + timelock**.
- 🗺️ Independent **security audit**.

---

## Team

- **Project Leader:** _(add name)_
- **Builder profile / Proof of Humanity:** via [Talent App](https://talent.app/) (Self human checkmark) — required for Proof of Ship eligibility.

*Building in public — progress shared via the Proof of Ship [Telegram group](https://t.me/proofofship).*

---

## License

[MIT](LICENSE) — open source, as required by Proof of Ship.

---

## Hackathon submission checklist

Tracking the **Proof of Ship — Celo Builder Program** eligibility requirements:

- [ ] Smart contract **deployed on Celo Mainnet** and **verified** on Celoscan.
- [ ] Project is a **MiniApp built with the MiniPay hook** — code detects `window.ethereum.isMiniPay` and hides the Connect Wallet button when opened from MiniPay.
- [ ] Repository is **open source** with an active public GitHub repo.
- [ ] **Onchain activity** present (real buy / plant / harvest / unlock transactions).
- [ ] Every builder has **Proof of Humanity** (Self human checkmark / Talent App credential).
- [ ] Builder profile created on [Talent App](https://talent.app/~/earn/celo-proof-of-ship).
- [ ] Project page created on Talent App with contributors, GitHub repo, and ≥1 Celo smart contract.
- [ ] Project registered on the **Proof of Ship** campaign page.
- [ ] Rewards claim wallet (MiniPay) ready for the Project Leader.
- [ ] Built in public (progress shared on Telegram / socials).
- [ ] A dedicated (non-personal) wallet used throughout development and deployment.

---

<sub>Kicaoi is an experimental testnet game built for the Celo Proof of Ship builder program. SEED credits are internal, non-transferable, non-redeemable game points — not a token. Not audited. Not a financial or gambling product. See the [Compliance disclaimer](#compliance-disclaimer).</sub>
