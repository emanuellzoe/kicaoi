// Mode volume TX termurah: tiap wallet spam buySeeds dengan nilai minimal.
// Gas lebih murah daripada plant/harvest. 0.01 CELO → 1 SEED (valid onchain).
// Gunakan mode ini untuk memaksimalkan jumlah TX tanpa harus menunggu grow time.
//
//   npm run seed-spam
import "dotenv/config";
import { config } from "./config.js";
import {
  publicClient, makeWallet, loadWallets,
  contract, pool, formatEther, short, log,
} from "./chain.js";

const wallets  = loadWallets();
const value    = config.spamBuyMin;
const perRun   = config.spamPerRun;

const gasPrice    = await publicClient.getGasPrice();
const gasHeadroom = BigInt(config.gasPerBuySeeds) * 2n * gasPrice;
const needPerTx   = value + gasHeadroom;

log(`Seed-spam mulai: ${wallets.length} wallet × ${perRun} buySeeds @ ${config.spamBuyMinStr} CELO`);
log(`Chain: ${config.chainName} | Contract: ${config.kicaoiAddress}`);

const stat = { buys: 0, skipped: 0, errors: 0 };

await pool(wallets, config.concurrency, async (w) => {
  const { client, account } = makeWallet(w.privateKey);

  for (let i = 0; i < perRun; i++) {
    const native = await publicClient.getBalance({ address: w.address });

    if (native < needPerTx) {
      log(`#${w.index} ${short(w.address)}  SKIP: ${formatEther(native)} CELO < min`);
      stat.skipped++;
      break;
    }

    try {
      const hash = await client.writeContract({
        ...contract,
        functionName: "buySeeds",
        value,
        account,
      });
      await publicClient.waitForTransactionReceipt({ hash });
      stat.buys++;
      log(`#${w.index} ${short(w.address)}  buySeeds ${config.spamBuyMinStr} CELO  ${hash}`);
    } catch (e: any) {
      stat.errors++;
      log(`#${w.index} ${short(w.address)}  ❌ ${e.shortMessage ?? e.message}`);
    }
  }
});

log(`Seed-spam selesai. buys=${stat.buys} skipped=${stat.skipped} errors=${stat.errors}`);
if (stat.buys === 0 && stat.errors > 0) process.exit(1);
