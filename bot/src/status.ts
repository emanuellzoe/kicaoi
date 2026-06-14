import "dotenv/config";
import { config } from "./config.js";
import { publicClient, loadWallets, contract, formatEther, short, log } from "./chain.js";

const wallets = loadWallets();

log(`=== KICAOI Bot Status ===`);
log(`Chain:    ${config.chainName}`);
log(`Contract: ${config.kicaoiAddress}`);
log(`Wallets:  ${wallets.length}`);
log(``);

let totalCelo = 0n;
let totalSeed = 0n;
let totalHarvested = 0n;

for (const w of wallets) {
  const [native, seeds, stats] = await Promise.all([
    publicClient.getBalance({ address: w.address }),
    publicClient.readContract({ ...contract, functionName: "seedBalance", args: [w.address] }),
    publicClient.readContract({ ...contract, functionName: "getStats",    args: [w.address] }),
  ]);

  totalCelo     += native;
  totalSeed     += seeds;
  totalHarvested += stats.totalHarvested;

  log(
    `#${String(w.index).padStart(2)} ${short(w.address)}` +
    `  CELO=${Number(formatEther(native)).toFixed(4)}` +
    `  SEED=${String(seeds).padStart(5)}` +
    `  plots=${stats.plotCount}` +
    `  harvests=${stats.totalHarvested}`
  );
}

log(``);
log(`Total CELO: ${formatEther(totalCelo)}`);
log(`Total SEED: ${totalSeed}`);
log(`Total harvests: ${totalHarvested}`);
