# Frontend ↔ Contract Integration

Everything the frontend needs to talk to the deployed **KicaoiFarm** contract.
After this, the app works on a fresh clone with **no manual setup** (the address is
committed in `lib/deployments.ts`); a `.env.local` only *overrides* it.

## Live deployment

| | |
|---|---|
| **Contract** | `0x82622F1d43B25DBB2414285FF98c52d694661c61` |
| **Network** | Celo Sepolia · chainId `11142220` |
| **Explorer** | https://sepolia.celoscan.io/address/0x82622F1d43B25DBB2414285FF98c52d694661c61 |
| **Verification** | Sourcify (`exact_match`) |
| **Rate** | `1 CELO = 100 SEED` |

## Where things live

| What | File |
|---|---|
| Address registry (per chain) | `lib/deployments.ts` |
| Resolved address + minimal UI ABI + crop catalog | `lib/contract.ts` |
| Full contract ABI (45 entries, from compiler) | `lib/abi/KicaoiFarm.json` |
| Chains (Sepolia / Mainnet) | `lib/chain.ts` |
| wagmi config (injected connector) | `lib/wagmi.ts` |
| MiniPay detect + auto-connect | `hooks/useMiniPay.ts` |

> `lib/contract.ts` resolves the address as: **env override → `deployments.ts` → zero**.
> The minimal ABI there is enough for the current UI; import `lib/abi/KicaoiFarm.json`
> if you need the complete ABI (events, all admin fns).

## How the UI calls the contract (wagmi v2 + viem)

```ts
import { useReadContract, useWriteContract } from "wagmi";
import { parseEther } from "viem";
import { KICAOI_ABI, KICAOI_ADDRESS } from "@/lib/contract";

const base = { address: KICAOI_ADDRESS, abi: KICAOI_ABI } as const;

// READ
useReadContract({ ...base, functionName: "seedBalance", args: [user] });
useReadContract({ ...base, functionName: "getStats", args: [user] });
useReadContract({ ...base, functionName: "getPlots", args: [user, 0n, BigInt(plotCount)] });
useReadContract({ ...base, functionName: "nextUnlockCost", args: [user] });
useReadContract({ ...base, functionName: "isReady", args: [user, BigInt(plotId)] });

// WRITE (each is one onchain tx)
const { writeContract } = useWriteContract();
writeContract({ ...base, functionName: "buySeeds", args: [], value: parseEther("0.1") }); // 0.1 CELO -> 10 SEED
writeContract({ ...base, functionName: "plant", args: [BigInt(plotId), cropId] });        // cropId: 1 Wheat, 2 Pumpkin, 3 Golden
writeContract({ ...base, functionName: "harvest", args: [BigInt(plotId)] });
writeContract({ ...base, functionName: "unlockPlot", args: [] });
```

## Contract surface (what the UI uses)

| Function | Type | Notes |
|---|---|---|
| `buySeeds()` | payable write | `msg.value * 100 / 1e18` SEED; grants 3 plots on first buy |
| `plant(uint256 plotId, uint8 cropId)` | write | burns crop plant cost; sets `plantedAt` |
| `harvest(uint256 plotId)` | write | reverts until mature; credits yield; clears plot |
| `unlockPlot()` | write | cost = `50 × current plotCount` SEED |
| `seedBalance(address)` | view | SEED credits |
| `getStats(address)` | view | `(plotCount, totalPlanted, totalHarvested, totalSeedHarvested)` |
| `getPlots(address, from, to)` | view | array of `(cropId, plantedAt)`; `to` exclusive |
| `getPlot(address, plotId)` | view | single `(cropId, plantedAt)` |
| `nextUnlockCost(address)` | view | SEED cost for the next plot |
| `isReady(address, plotId)` | view | true when mature |

## Crops (mirror of the on-chain constructor)

| id | name | plant cost | grow | yield |
|---:|---|---:|---:|---:|
| 1 | Wheat | 5 | 5 min | 9 |
| 2 | Pumpkin | 20 | 30 min | 38 |
| 3 | Golden | 60 | 2 hr | 130 |

## Plot states (derive in UI)

- `cropId === 0` → **empty** (show plant options)
- `cropId !== 0 && now < plantedAt + growTime` → **growing** (show countdown)
- `cropId !== 0 && now >= plantedAt + growTime` → **ready** (enable Harvest; `isReady` also confirms on-chain)

## Run

```bash
npm install
npm run dev        # works immediately against Sepolia (address is committed)
```

Optional override (e.g. a new deployment):
```bash
# .env.local
NEXT_PUBLIC_KICAOI_CONTRACT_ADDRESS=0x...
NEXT_PUBLIC_CHAIN_ID=11142220
```

## Gotchas

- **RPC read lag:** `forno.celo-sepolia` is load-balanced; a read immediately after a write can be stale. Refetch on `useWaitForTransactionReceipt({ hash }).isSuccess` (the UI already does this).
- **Two costs:** the SEED amount is the *game* cost; every tx **also** pays CELO gas. Make that clear in the UI.
- **SEED is non-redeemable** — there is no "cash out" function; don't build one.
