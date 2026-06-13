# KicaoiFarm — Internal Security Audit

> Self-audit of `src/KicaoiFarm.sol` for the Kicaoi MVP (Celo Proof of Ship).
> **Scope:** one contract, ~250 LOC. **Not** a third-party professional audit.
> **Tooling:** Solc 0.8.26, `forge test` (26 tests, all pass), `forge lint`, `forge coverage`, manual review.

| | |
|---|---|
| Contract | `KicaoiFarm.sol` |
| Compiler | `0.8.26` (built-in overflow checks) |
| Libraries | OpenZeppelin v5.6.1 (`Ownable`, `ReentrancyGuard`) |
| Tests | 26 passing · lines 91.9% · statements 89.4% |
| Status | ✅ No critical/high findings. MVP-ready for **testnet**. |

---

## 1. Design properties that remove whole risk classes

| Property | Risk class eliminated |
|---|---|
| **SEED is non-redeemable** — no function ever pays CELO to a player | Payout reentrancy, prize-pool insolvency, exit/grief on withdrawals, gambling-style economic attacks |
| **No randomness** — outcomes depend only on `block.timestamp` + input | RNG manipulation, VRF/oracle dependency, predictable-seed exploits |
| **No loops in state-changing functions** — every action is a single O(1) mapping write | Unbounded-loop gas bombs, DoS-by-growth, block-gas-limit failures |
| **No ERC-20/721, no transfers in hot path** | Approval bugs, token reentrancy, transfer-hook abuse |
| **Solidity 0.8.26** | Silent overflow/underflow (checked by default) |

---

## 2. Critical findings

**None.**

Checklist:

- [x] **Reentrancy** — only CELO-out path is `withdrawCelo` (owner-only): CEI ordering, checked low-level `call`, `nonReentrant`. No user payout path exists. `buySeeds` receives CELO but makes no external call. ✅
- [x] **Access control** — `setCrop`, `setSeedRate`, `setUnlockBaseCost`, `setStartingPlots`, `withdrawCelo` all `onlyOwner` (OZ `Ownable`). Player actions are correctly permissionless. ✅
- [x] **Integer overflow/underflow** — 0.8.x checked arithmetic. `unchecked` blocks are used only for counters that cannot realistically overflow (`totalPlanted`, `totalHarvested`, `plotCount`). ✅
- [x] **Unbounded loops** — none in any `external`/`public` non-view function. The only loop is in the `getPlots` **view** (paged, `eth_call`, no on-chain gas). ✅
- [x] **Unchecked return values** — the single external `call` checks `ok`. ✅
- [x] **No self-destruct / no upgradeability / no delegatecall.** ✅

---

## 3. High findings

**None blocking.** Items to harden before any production/mainnet-with-value:

- **H-1 (centralization).** Owner can retune crop economics and the SEED rate, and can withdraw all collected CELO. This is intended (game operator), but it is a trust assumption.
  - *Mitigation:* move ownership to a **multisig + timelock** for production; rate/crop changes are forward-only and never touch existing SEED balances or planted plots.

---

## 4. Medium / Low findings

- **M-1 (timestamp dependence) — accepted.** `harvest`/`isReady` compare `block.timestamp` against the grow deadline. A validator can nudge the timestamp by a few seconds. Because SEED is **non-redeemable**, shaving seconds off a grow timer yields **no economic gain**. Annotated in-code (`forge-lint: disable block-timestamp`). ✅ accepted by design.
- **L-1 (rate change affects in-flight buys).** `setSeedRate` changes the credit rate for future `buySeeds` calls. It does **not** retroactively alter balances. Document in UI; consider a small timelock in production.
- **L-2 (no per-tx SEED cap).** A whale could buy a very large SEED balance in one tx. Harmless (non-redeemable credits); noted for completeness.
- **L-3 (coverage gaps).** `setUnlockBaseCost`, `setStartingPlots`, and the `withdrawCelo` zero-address branch are not yet unit-tested. Logic is trivial; add tests before mainnet.
- **L-4 (`startingPlots` retune).** Changing `startingPlots` only affects players' **first** buy; existing players keep their plot count. Intended.

---

## 5. Gas profile

Measured via `forge test` (`test_Gas_PlantHarvestCycle`):

| Action | Gas | Note |
|---|---:|---|
| `plant` | **~31,000** | one packed `Plot` SSTORE + balance update |
| `harvest` | **~27,000** | clears packed `Plot` (refund) + balance + stats |
| `buySeeds` (first) | ~73,000 | initializes `plotCount` |
| `unlockPlot` | ~30,000 | single counter bump |

`Plot` is packed into **one storage slot** (`uint8 cropId` + `uint64 plantedAt`). Per-action cost is well under a 100k budget — cheap enough that genuine players make many real transactions, which is the point.

---

## 6. Invariants (enforced & tested)

1. Cannot plant without `seedBalance >= plantCost`. — `test_Plant_RevertsOnInsufficientSeed`
2. Cannot plant on a non-empty plot. — `test_Plant_RevertsOnNonEmptyPlot`
3. Cannot plant/harvest a plot id `>= plotCount`. — `test_Plant_RevertsOnPlotOutOfRange`
4. Cannot harvest before `plantedAt + growTime`. — `test_Harvest_RevertsBeforeMature`
5. Cannot harvest an empty plot. — `test_Harvest_RevertsOnEmptyPlot`
6. Cannot unlock without `plotCount > 0` (no free plots). — `test_UnlockPlot_RevertsWithoutPlots`
7. Cannot unlock without enough SEED. — `test_UnlockPlot_RevertsOnInsufficientSeed`
8. Second buy never re-grants starting plots. — `test_BuySeeds_SecondBuy_AccumulatesSeed_NoExtraPlots`
9. No function transfers CELO to a player; only owner withdraws. — `test_WithdrawCelo_*`

---

## 7. Recommendation

**Approved for testnet deployment (Celo Sepolia).**

Before any mainnet deployment that handles real CELO revenue at scale:
1. Move ownership to a multisig + timelock (addresses H-1).
2. Add unit tests for L-3 gaps.
3. Run Slither / a third-party review.
4. Keep the deploy/owner key in a dedicated, non-personal wallet (never committed).
