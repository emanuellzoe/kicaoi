// seed-spam.ts — Kirim buySeeds TX sebanyak SPAM_PER_RUN kali per wallet.
// Tidak ada harvest/plant — murni untuk generate TX hash dan DAU secepat mungkin.
//
//   npm run seed-spam
import "dotenv/config";
import { config } from "./config.js";
import {
  publicClient, makeWallet, loadWallets,
  contract, pool, formatEther, short, log,
} from "./chain.js";
import type { Wallet } from "./chain.js";

const GAS_BUY_SEEDS = 90_000n;

const wallets  = loadWallets().slice(0, config.numWallets);
const perRun   = config.spamPerRun;
const buyMin   = config.spamBuyMin;

log(`Seed-spam mulai: ${wallets.length} wallet | ${perRun} TX/wallet | value=${formatEther(buyMin)} CELO/TX`);
log(`Target TX: ${wallets.length * perRun} | Chain: ${config.chainName}`);

const stat = { ok: 0, skipped: 0, errors: 0 };
const gasPrice = await publicClient.getGasPrice();
const gp = { type: "legacy" as const, gasPrice };

async function spamWallet(w: Wallet): Promise<void> {
  const { client, account } = makeWallet(w.privateKey);

  const native = await publicClient.getBalance({ address: w.address });
  const costPerTx = gasPrice * GAS_BUY_SEEDS + buyMin;
  const minNeeded = costPerTx + config.minGasReserve;

  if (native < minNeeded) {
    log(`#${w.index} ${short(w.address)}  SKIP: ${formatEther(native)} CELO (need ${formatEther(minNeeded)})`);
    stat.skipped++;
    return;
  }

  // Hitung berapa TX yang bisa dilakukan dengan saldo yang ada
  const spendable = native - config.minGasReserve;
  const maxTx = Number(spendable / costPerTx);
  const txCount = Math.min(perRun, maxTx);

  if (txCount <= 0) {
    log(`#${w.index} ${short(w.address)}  SKIP: saldo tidak cukup untuk 1 TX`);
    stat.skipped++;
    return;
  }

  for (let i = 0; i < txCount; i++) {
    try {
      const hash = await client.writeContract({
        ...contract,
        functionName: "buySeeds",
        value: buyMin,
        account,
        gas: GAS_BUY_SEEDS,
        ...gp,
      });
      await publicClient.waitForTransactionReceipt({ hash });
      stat.ok++;
      log(`#${w.index} ${short(w.address)}  buySeeds [${i + 1}/${txCount}]  ${hash}`);
    } catch (e: any) {
      stat.errors++;
      log(`#${w.index} ${short(w.address)}  buySeeds [${i + 1}/${txCount}] ❌ ${e.shortMessage ?? e.message}`);
      break;
    }
  }
}

await pool(wallets, config.concurrency, async (w) => {
  try {
    await spamWallet(w);
  } catch (e: any) {
    stat.errors++;
    log(`#${w.index} ${short(w.address)}  FATAL: ${e.shortMessage ?? e.message}`);
  }
});

const total = stat.ok + stat.skipped + stat.errors;
log(`Selesai. TX berhasil=${stat.ok} | skipped=${stat.skipped} | errors=${stat.errors} | total wallet=${total}`);
