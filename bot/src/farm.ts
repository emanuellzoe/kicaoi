// Full farm loop: harvest plot yang sudah matang → beli seed jika kurang → plant plot kosong.
// Setiap run menghasilkan harvest TX + plant TX per wallet.
//
// Grow times (onchain): Wheat=5min | Pumpkin=30min | Golden=2hr
//
//   npm run farm
import "dotenv/config";
import { config } from "./config.js";
import {
  publicClient, makeWallet, loadWallets,
  contract, pool, formatEther, short, log,
} from "./chain.js";
import type { Wallet } from "./chain.js";

const GROW_TIMES: Record<number, number> = { 1: 300, 2: 1800, 3: 7200 };
const SEED_COSTS: Record<number, number> = { 1: 5,   2: 20,   3: 60   };
const SEED_PER_CELO = 100;

const wallets  = loadWallets();
const cropId   = config.cropId;
const growTime = GROW_TIMES[cropId] ?? 300;
const seedCost = SEED_COSTS[cropId] ?? 5;

log(`Farm loop mulai: ${wallets.length} wallet | crop=${cropId} (grow=${growTime}s cost=${seedCost}SEED)`);
log(`Chain: ${config.chainName} | Contract: ${config.kicaoiAddress}`);

const stat = { harvested: 0, planted: 0, bought: 0, skipped: 0, errors: 0 };

async function farmWallet(w: Wallet): Promise<void> {
  const { client, account } = makeWallet(w.privateKey);

  const native = await publicClient.getBalance({ address: w.address });
  if (native < config.minGasReserve) {
    log(`#${w.index} ${short(w.address)}  SKIP: gas ${formatEther(native)} CELO < ${config.minGasReserveStr}`);
    stat.skipped++;
    return;
  }

  // Inisialisasi: buySeeds pertama kali untuk mendapat 3 plot awal
  let stats = await publicClient.readContract({
    ...contract, functionName: "getStats", args: [w.address],
  });

  if (stats.plotCount === 0n) {
    try {
      const hash = await client.writeContract({
        ...contract, functionName: "buySeeds",
        value: config.buySeedCelo, account,
      });
      await publicClient.waitForTransactionReceipt({ hash });
      stat.bought++;
      log(`#${w.index} ${short(w.address)}  buySeeds INIT ${config.buySeedCeloStr} CELO  ${hash}`);
      stats = await publicClient.readContract({
        ...contract, functionName: "getStats", args: [w.address],
      });
    } catch (e: any) {
      log(`#${w.index} ${short(w.address)}  buySeeds INIT ❌ ${e.shortMessage ?? e.message}`);
      stat.errors++;
      return;
    }
  }

  const plotCount = Number(stats.plotCount);
  if (plotCount === 0) return;

  // Baca state semua plot
  const plots = await publicClient.readContract({
    ...contract, functionName: "getPlots",
    args: [w.address, 0n, BigInt(plotCount)],
  });

  const nowSec = Math.floor(Date.now() / 1000);

  // Harvest semua plot yang sudah matang
  for (let i = 0; i < plots.length; i++) {
    const { cropId: cId, plantedAt } = plots[i];
    if (cId === 0) continue; // kosong

    const readyAt = Number(plantedAt) + (GROW_TIMES[cId] ?? growTime);
    if (nowSec < readyAt) {
      log(`#${w.index} ${short(w.address)}  plot[${i}] tumbuh, sisa ${readyAt - nowSec}s`);
      continue;
    }

    try {
      const hash = await client.writeContract({
        ...contract, functionName: "harvest",
        args: [BigInt(i)], account,
      });
      await publicClient.waitForTransactionReceipt({ hash });
      stat.harvested++;
      log(`#${w.index} ${short(w.address)}  harvest[${i}]  ${hash}`);
    } catch (e: any) {
      log(`#${w.index} ${short(w.address)}  harvest[${i}] ❌ ${e.shortMessage ?? e.message}`);
    }
  }

  // Baca ulang plot setelah harvest → cari yang kosong
  const plots2 = await publicClient.readContract({
    ...contract, functionName: "getPlots",
    args: [w.address, 0n, BigInt(plotCount)],
  });
  const emptyIdxs = plots2
    .map((p, i) => ({ cropId: p.cropId, i }))
    .filter(p => p.cropId === 0)
    .map(p => p.i);

  if (emptyIdxs.length === 0) return;

  // Cek saldo SEED, beli jika kurang
  let seeds = await publicClient.readContract({
    ...contract, functionName: "seedBalance", args: [w.address],
  });
  const seedsNeeded = BigInt(emptyIdxs.length * seedCost);

  if (seeds < seedsNeeded) {
    const nativeNow = await publicClient.getBalance({ address: w.address });
    const canSpend  = nativeNow > config.minGasReserve ? nativeNow - config.minGasReserve : 0n;

    if (canSpend >= config.buySeedCelo) {
      try {
        const hash = await client.writeContract({
          ...contract, functionName: "buySeeds",
          value: config.buySeedCelo, account,
        });
        await publicClient.waitForTransactionReceipt({ hash });
        stat.bought++;
        log(`#${w.index} ${short(w.address)}  buySeeds ${config.buySeedCeloStr} CELO  ${hash}`);
        seeds = await publicClient.readContract({
          ...contract, functionName: "seedBalance", args: [w.address],
        });
      } catch (e: any) {
        log(`#${w.index} ${short(w.address)}  buySeeds ❌ ${e.shortMessage ?? e.message}`);
        return;
      }
    } else {
      log(`#${w.index} ${short(w.address)}  SKIP plant: CELO tidak cukup untuk beli seed`);
      return;
    }
  }

  // Plant di semua plot kosong
  for (const idx of emptyIdxs) {
    if (seeds < BigInt(seedCost)) {
      log(`#${w.index} ${short(w.address)}  STOP plant: SEED habis`);
      break;
    }
    try {
      const hash = await client.writeContract({
        ...contract, functionName: "plant",
        args: [BigInt(idx), cropId], account,
      });
      await publicClient.waitForTransactionReceipt({ hash });
      seeds -= BigInt(seedCost);
      stat.planted++;
      log(`#${w.index} ${short(w.address)}  plant[${idx}] crop${cropId}  ${hash}`);
    } catch (e: any) {
      log(`#${w.index} ${short(w.address)}  plant[${idx}] ❌ ${e.shortMessage ?? e.message}`);
    }
  }
}

await pool(wallets, config.concurrency, async (w) => {
  try {
    await farmWallet(w);
  } catch (e: any) {
    stat.errors++;
    log(`#${w.index} ${short(w.address)}  FATAL: ${e.shortMessage ?? e.message}`);
  }
});

const txTotal = stat.harvested + stat.planted + stat.bought;
log(`Farm selesai. TX total=${txTotal} (harvest=${stat.harvested} plant=${stat.planted} buy=${stat.bought}) skipped=${stat.skipped} errors=${stat.errors}`);
