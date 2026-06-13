# Kicaoi — Product Requirements Document (PRD)

> **Plant. Wait. Harvest. Grow your farm — one onchain tap at a time.**
>
> **Kicaoi** is a mobile-first **idle farming game** on Celo, built as a MiniApp for MiniPay.
> Buy **SEED** game credits with CELO (`1 CELO = 100 SEED`), then plant, harvest, and expand
> your farm. Every action is a real onchain transaction.

| | |
|---|---|
| **Document** | Product Requirements Document (PRD) |
| **Product** | Kicaoi (idle farming MiniApp) |
| **Category** | Games |
| **Program** | Proof of Ship — Celo Builder Program |
| **Chain** | Celo (Sepolia for dev/QA · Mainnet for eligibility) |
| **Wallet/host** | MiniPay (Opera self-custodial wallet) |
| **Status** | MVP in design / build-out |
| **Repo** | https://github.com/emanuellzoe/kicaoi |

---

## Table of Contents

1. [Summary](#1-summary)
2. [Problem & opportunity](#2-problem--opportunity)
3. [Goals & non-goals](#3-goals--non-goals)
4. [Why Kicaoi fits Proof of Ship](#4-why-kicaoi-fits-proof-of-ship)
5. [Personas](#5-personas)
6. [Core game loop](#6-core-game-loop)
7. [SEED credit & economy](#7-seed-credit--economy)
8. [Crops & plots](#8-crops--plots)
9. [Transaction model (how activity is generated)](#9-transaction-model-how-activity-is-generated)
10. [Functional requirements](#10-functional-requirements)
11. [Smart contract requirements](#11-smart-contract-requirements)
12. [Frontend requirements](#12-frontend-requirements)
13. [Non-functional requirements](#13-non-functional-requirements)
14. [Metrics & success criteria](#14-metrics--success-criteria)
15. [Security & compliance](#15-security--compliance)
16. [Risks & mitigations](#16-risks--mitigations)
17. [Milestones](#17-milestones)
18. [Open questions](#18-open-questions)

---

## 1. Summary

Kicaoi turns **one CELO deposit into many small farming actions**. A player buys **SEED**
credits (`1 CELO = 100 SEED`), then runs a simple, satisfying loop — **plant a crop → wait for
it to grow → harvest it for more SEED → reinvest into more plots and rarer crops**. Each loop
step is a real onchain transaction on Celo, so an engaged player naturally produces dozens of
transactions per session without any artificial farming.

SEED is an **internal, non-transferable, non-redeemable game credit** — it cannot be cashed back
out to CELO. This keeps Kicaoi unambiguously a **game** (arcade-style credits), not a DeFi,
yield, or gambling product.

The deliberate design choice is **a tiny smart contract**: no NFTs, no token transfers in the hot
path, no randomness oracle, no payout/solvency logic. Just a per-user SEED ledger plus
timestamp-based crop growth.

---

## 2. Problem & opportunity

MiniPay reaches **14M+ self-custodial users** who already hold CELO and stablecoins, but most
onchain "games" are either heavy DeFi dashboards or one-tap click-to-earn loops. Casual users
rarely get a reason to make **repeated, genuine onchain transactions** that are also *fun*.

Idle/incremental farming games (FarmVille, Hay Day, Cookie-style idlers) are one of the most
proven retention loops in mobile gaming: short sessions, frequent return visits, visible
progression. **No idle farming game exists as a native MiniPay MiniApp.** Kicaoi fills that gap
with a loop that maps cleanly onto cheap Celo transactions.

---

## 3. Goals & non-goals

### Goals

- G1 — Ship a **playable idle farming MiniApp** inside MiniPay.
- G2 — Make **each meaningful action an onchain transaction** (plant, harvest, upgrade, unlock).
- G3 — Keep the **smart contract minimal** (smallest viable surface; easy to reason about).
- G4 — Deploy a **verified contract on Celo Mainnet** for Proof of Ship eligibility.
- G5 — Drive **honest, sustained onchain activity** (many real actions per real user).

### Non-goals

- NG1 — **No real-money redemption.** SEED is never converted back to CELO.
- NG2 — **No NFTs / marketplace** in the MVP.
- NG3 — **No PvP, no wagering, no chance-based payouts** (not a gambling game).
- NG4 — **No multi-token deposits** in the MVP (CELO only).
- NG5 — **No yield, staking, or DeFi mechanics.**

---

## 4. Why Kicaoi fits Proof of Ship

| Program signal | How Kicaoi responds |
|---|---|
| Wanted category: **Games** | A casual idle farming game — not a DeFi/finance app. |
| **MiniApp built with the MiniPay hook** | Detects `window.ethereum.isMiniPay`, auto-connects, hides the Connect button. |
| **Onchain activity** required | Every plant/harvest/upgrade is its own onchain tx — naturally high volume per active player. |
| **Deploy on Celo Mainnet, verified** | `KicaoiFarm.sol` targets Celo Mainnet with Celoscan verification. |
| **Open source** | Public, MIT-licensed repository. |
| **"Simpler is better"** | One deposit asset (CELO), one internal credit (SEED), one loop, one small contract. |
| **Mobile-first** | Thumb-friendly, arcade-style farm UI for the in-wallet browser. |

> **Integrity note — this is not transaction farming.** The credit model does not *invent*
> transactions; it makes each action cheap enough that *genuine* players take many. Inflating the
> Transactions count by scripting one wallet is exactly the bot-engagement pattern the program
> rejects. The defensible signal is **real users × many actions each**, which lifts Transactions
> *and* DAU together.

---

## 5. Personas

- **Casual mobile player (primary).** Holds a little CELO in MiniPay, wants a quick, low-stakes
  game they can dip into for 60 seconds while waiting. Doesn't care about DeFi.
- **Returning idler.** Comes back several times a day to harvest grown crops and replant — the
  retention engine and the main source of sustained transactions.
- **Builder / judge (secondary).** Evaluates whether the MiniApp is real, mobile-native, onchain,
  and open source.

---

## 6. Core game loop

```
Buy SEED with CELO            (1 CELO = 100 SEED)   ── 1 tx (occasional)
        ↓
Plant a crop on a plot        (burns SEED plant cost) ── 1 tx
        ↓
Wait for it to grow           (real time; off-chain countdown)
        ↓
Harvest                       (credits SEED yield)   ── 1 tx
        ↓
Reinvest:
   • Plant again                                      ── 1 tx each
   • Unlock a new plot         (burns SEED)           ── 1 tx
   • Plant rarer/slower crops for bigger yield        ── 1 tx each
        ↓
Climb the Harvest leaderboard (lifetime SEED harvested)
```

The loop is intentionally short and repeatable. A "session" is **plant all plots → leave →
return when grown → harvest all → replant**, which is several transactions every visit.

---

## 7. SEED credit & economy

| Concept | Detail |
|---|---|
| **Deposit asset** | **CELO** (native), via a `payable` purchase. |
| **Game currency** | **SEED** — an internal per-player balance in the contract. |
| **Conversion rate** | **`1 CELO = 100 SEED`**, owner-configurable (`setSeedRate`). |
| **Transferable?** | No — SEED cannot move between players. |
| **Redeemable?** | **No — one-way.** SEED is consumed in-game and never returns to CELO. |

> **What SEED is — and is not.** SEED is **internal game accounting**, like arcade tokens. It is
> not an ERC-20, not transferable, not listed, not redeemable, and has no existence outside the
> Kicaoi contract. Because SEED can never be cashed out, Kicaoi has **no payout, solvency, or
> prize-pool logic** — which keeps the contract small and keeps the product clearly a game.

### Example economy (configurable)

| Action | SEED effect |
|---|---|
| Buy 1 CELO | **+100 SEED** |
| Plant Wheat | −5 SEED |
| Harvest Wheat (after grow time) | +9 SEED |
| Plant Pumpkin | −20 SEED |
| Harvest Pumpkin | +38 SEED |
| Plant Golden Crop | −60 SEED |
| Harvest Golden Crop | +130 SEED |
| Unlock plot #(n+1) | −(50 × current plot count) SEED |

> Harvest yields are **net-positive vs. plant cost** so the farm feels rewarding, but the **plot
> unlock sink scales up** (each new plot costs more) so SEED always has somewhere to go and the
> economy doesn't trivially balloon. Since SEED is non-redeemable, net SEED generation has **no
> financial value** — it is purely progression/score.

---

## 8. Crops & plots

### Crops (configurable per crop id)

| Crop | Plant cost (SEED) | Grow time | Harvest yield (SEED) | Notes |
|---|---:|---:|---:|---|
| **Wheat** | 5 | 5 min | 9 | Starter crop, fast loop |
| **Pumpkin** | 20 | 30 min | 38 | Mid tier |
| **Golden Crop** | 60 | 2 hr | 130 | Slow, high yield |

- A plot is either **empty**, **growing** (planted, not yet mature), or **ready** (mature, can be
  harvested).
- Grow time is enforced **onchain** via `block.timestamp`: `harvest` reverts if
  `block.timestamp < plantedAt + growTime`.
- Crop parameters are owner-configurable (`setCrop`).

### Plots

- A new player starts with **3 plots** (configurable `startingPlots`).
- More plots are unlocked with SEED (`unlockPlot`); each unlock costs more than the last
  (`unlockBaseCost × currentPlotCount`).
- More plots → more parallel plant/harvest actions → more transactions per session.

---

## 9. Transaction model (how activity is generated)

Each row is a distinct onchain transaction:

| Action | Onchain tx | Frequency driver |
|---|---|---|
| `buySeeds()` | 1 | Occasional top-up |
| `plant(plotId, cropId)` | 1 per plot per cycle | Every empty plot, every cycle |
| `harvest(plotId)` | 1 per plot per cycle | Every matured plot |
| `unlockPlot()` | 1 | Progression milestones |
| `setCrop` / `setSeedRate` | (owner only) | Rare admin |

**Worked example.** A player with **6 plots** who returns **3 times a day** does, per day:
`6 harvest + 6 replant = 12 tx/visit × 3 = 36 tx/day` from one occasional CELO top-up. 100 real
daily players ≈ **~3,600 real transactions/day** — high, honest, sustained activity that also
counts toward DAU because the players are real and distinct.

> Optional batching helpers (`plantAll`, `harvestAll`) can be offered for UX, but the MVP keeps
> per-plot actions as separate transactions to maximize legible onchain activity and keep gas per
> tx low.

---

## 10. Functional requirements

- **FR1** — Player can buy SEED by sending CELO; balance credited at the current rate.
- **FR2** — Player can view their farm: every plot's state (empty/growing/ready), crop, and time
  remaining.
- **FR3** — Player can plant a crop on an empty plot; the plant cost is deducted from SEED.
- **FR4** — Player can harvest a matured plot; the yield is added to SEED; the plot returns to
  empty.
- **FR5** — Harvest of an un-matured plot must fail (revert) with a clear message.
- **FR6** — Player can unlock an additional plot by spending SEED.
- **FR7** — Player can see lifetime stats: total planted, total harvested, total SEED harvested,
  plots owned.
- **FR8** — A leaderboard ranks wallets by **lifetime SEED harvested** (from contract events).
- **FR9** — Inside MiniPay, the app auto-connects and hides the Connect Wallet button.
- **FR10** — The UI clearly separates the **SEED game cost** from **CELO network gas**.

---

## 11. Smart contract requirements

**Contract:** `KicaoiFarm.sol` — single, minimal contract.

### Core types

```solidity
struct CropConfig {
    uint256 plantCost;   // SEED
    uint256 growTime;    // seconds
    uint256 yieldAmount; // SEED on harvest
    bool    enabled;
}

struct Plot {
    uint8   cropId;      // 0 = empty
    uint256 plantedAt;   // block.timestamp at plant
}

struct PlayerStats {
    uint256 plotCount;
    uint256 totalPlanted;
    uint256 totalHarvested;   // count of harvests
    uint256 totalSeedHarvested; // SEED earned over lifetime (leaderboard key)
}
```

### State

```solidity
mapping(address => uint256)        public seedBalance;     // SEED per player
mapping(address => Plot[])         public plots;           // plots per player
mapping(address => PlayerStats)    public stats;
mapping(uint8 => CropConfig)       public crops;

uint256 public seedPerCelo   = 100;   // 1 CELO -> 100 SEED (owner-configurable)
uint256 public startingPlots = 3;
uint256 public unlockBaseCost = 50;   // unlock cost = unlockBaseCost * currentPlotCount
address public owner;
```

### Functions

| Function | Purpose |
|---|---|
| `buySeeds() payable` | Credit SEED = `msg.value * seedPerCelo / 1e18`; initialize starting plots on first buy. |
| `plant(uint256 plotId, uint8 cropId)` | Require empty plot + enough SEED; deduct plant cost; set crop + `plantedAt`. |
| `harvest(uint256 plotId)` | Require `block.timestamp >= plantedAt + growTime`; add yield; reset plot to empty; update stats. |
| `unlockPlot()` | Deduct `unlockBaseCost * plotCount` SEED; append a new empty plot. |
| `getFarm(address user) view` | Return the player's plots array for the UI. |
| `getStats(address user) view` | Return the player's stats. |
| `setCrop(uint8 cropId, uint256 plantCost, uint256 growTime, uint256 yieldAmount, bool enabled) onlyOwner` | Configure a crop. |
| `setSeedRate(uint256 newSeedPerCelo) onlyOwner` | Update the CELO→SEED rate. |
| `withdrawCelo(uint256 amount) onlyOwner` | Withdraw collected CELO (purchases) to the owner/treasury. |

### Events

```solidity
event SeedsBought(address indexed user, uint256 celoAmount, uint256 seedCredited);
event Planted(address indexed user, uint256 indexed plotId, uint8 cropId, uint256 plantedAt);
event Harvested(address indexed user, uint256 indexed plotId, uint8 cropId, uint256 yieldAmount);
event PlotUnlocked(address indexed user, uint256 newPlotCount, uint256 cost);
event CropUpdated(uint8 indexed cropId, uint256 plantCost, uint256 growTime, uint256 yieldAmount, bool enabled);
event SeedRateUpdated(uint256 seedPerCelo);
```

### Invariants

- A player cannot plant without `seedBalance >= crop.plantCost`.
- A player cannot plant on a non-empty plot.
- A player cannot harvest before the grow time elapses.
- A player cannot harvest an empty plot.
- A player cannot unlock a plot without enough SEED.
- **No function pays CELO to a player** — there is no redemption path, so no solvency/reentrancy
  risk on payouts. Only the owner can withdraw collected CELO (`withdrawCelo`), guarded by
  `Ownable` + checked low-level `call`.

> **Why this is the "small contract" option.** No ERC-721/ERC-20, no randomness oracle, no
> prize-pool accounting, no per-user payout path. The only CELO movement is **in** (purchases) and
> an owner-only **out** (treasury). Growth is pure arithmetic over timestamps.

---

## 12. Frontend requirements

**Stack:** Next.js (App Router) + React + TypeScript + Tailwind, wagmi + viem.

| Page | Route | Contents |
|---|---|---|
| Landing | `/` | Title, tagline, Start Farming, How to play. |
| Farm | `/farm` | The grid of plots (empty/growing/ready), plant & harvest actions, SEED balance, buy-SEED. |
| Shop | `/shop` | Crop catalog (cost/grow time/yield), unlock-plot button. |
| Leaderboard | `/leaderboard` | Rank, wallet, plots, lifetime SEED harvested (from events). |

- **MiniPay integration**: detect `window.ethereum.isMiniPay`, auto-connect injected wallet, hide
  Connect button (same pattern as the rest of the Celo MiniApp ecosystem).
- **Growth countdown**: each growing plot shows a live timer derived from `plantedAt + growTime`;
  the Harvest button enables only when mature (and the contract enforces it too).
- **Two-cost clarity**: UI must state that SEED is the in-game cost and CELO gas is the separate
  network cost.
- **Theme**: warm, arcade farm vibe (greens/earth tones) with a Celo accent — not a finance
  dashboard.

---

## 13. Non-functional requirements

- **NFR1 — Gas:** keep per-action gas low; `plant`/`harvest` only mutate small per-user state.
- **NFR2 — Mobile-first:** usable at common phone widths inside the MiniPay browser.
- **NFR3 — Open source:** public GitHub, MIT license.
- **NFR4 — Deterministic:** no randomness; outcomes depend only on time and player input.
- **NFR5 — Auditability:** all state-changing actions emit events for indexing/leaderboard.

---

## 14. Metrics & success criteria

| Metric | Target (MVP) | Source |
|---|---|---|
| Verified contract on Celo Mainnet | Yes | Celoscan |
| MiniPay hook integrated | Yes | `isMiniPay` detect + auto-connect |
| Median actions per active player per day | ≥ 8 | Contract events |
| Onchain transactions | High & sustained | Talent App (Transactions) |
| Distinct daily wallets (DAU) | Growing via real onboarding | Talent App (DAU) |

> DAU only grows with **real, distinct players** — replays from one wallet do not raise it. The
> credit model is designed to lift Transactions *honestly alongside* DAU, never instead of it.

---

## 15. Security & compliance

- **Access control** via `Ownable` for crop config, rate, and treasury withdrawal.
- **Checks-Effects-Interactions** + checked `call` on the single `withdrawCelo` path; `nonReentrant`
  as defense-in-depth even though no user payout exists.
- **No randomness** → no VRF/commit-reveal needed; nothing is manipulable for gain.
- **Compliance posture:** because SEED is **non-redeemable**, Kicaoi is not a betting/lottery/yield
  product. It is an **arcade-credit game**. This is the deliberate reason redemption was removed —
  it sidesteps the gambling/financial-product classification that a redeemable credit would invite.
- **Operational security:** use a **dedicated, non-personal wallet** for deployment; never commit
  `PRIVATE_KEY`.

> Standard disclaimers apply: unaudited MVP for a builder program; not financial advice; owner-key
> centralization risk (mitigate with multisig/timelock for any production use).

---

## 16. Risks & mitigations

| Risk | Mitigation |
|---|---|
| Players see "no cash out" and lose interest | Lean into progression/leaderboard/cosmetics; the fun is the loop, not earnings. Frame honestly up front. |
| SEED inflation makes numbers meaningless | Scaling plot-unlock sink + tunable crop economy keep progression paced. |
| Gas per action annoys casual users | Keep actions tiny; offer optional `plantAll`/`harvestAll` post-MVP. |
| Owner-key risk | Multisig + timelock for production; document admin powers. |
| Treasury optics | `withdrawCelo` is owner-only and event-logged; CELO collected is the "game purchase" revenue, disclosed clearly. |

---

## 17. Milestones

**M1 — Contract MVP:** `KicaoiFarm.sol` with buy/plant/harvest/unlock + events; Foundry tests.

**M2 — Frontend MVP:** MiniPay connect, farm grid, plant/harvest, buy-SEED, shop.

**M3 — Testnet:** deploy to Celo Sepolia; seed crop configs; end-to-end QA on a phone.

**M4 — Mainnet eligibility:** deploy + verify on Celo Mainnet; configure crops; wire address.

**M5 — Leaderboard & polish:** events-based leaderboard, countdown timers, animations.

---

## 18. Open questions

1. Final crop roster and grow-time tuning (fast-loop vs. idle-return balance)?
2. Offer `plantAll` / `harvestAll` batching in MVP, or keep strictly per-plot for activity?
3. Cosmetic-only spend sinks (skins/themes) as additional SEED uses?
4. Daily login bonus (`claimDaily`) as an extra cheap tx + retention hook — in MVP or post-MVP?

---

<sub>Kicaoi is an experimental testnet game built for the Celo Proof of Ship builder program. SEED
credits are internal, non-transferable, non-redeemable game points — not a token, security, or
currency. Not audited. Not a financial or gambling product.</sub>
