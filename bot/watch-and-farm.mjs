// Monitors Celo gas price and auto-runs farm when gas is affordable.
// Wallets need ~3 TXs per run: harvest + buySeeds + plant (each ~80k gas).
// At <10 gwei: 3 TXs cost <0.0024 CELO — most wallets can afford it.
import "dotenv/config";
import { createPublicClient, http, formatEther, formatGwei, parseGwei } from "viem";
import { celo } from "viem/chains";
import { execSync } from "child_process";

const rpc = process.env.RPC_URL || "https://forno.celo.org";
const pub = createPublicClient({ chain: celo, transport: http(rpc, { timeout: 30000 }) });

const MAX_GWEI = parseGwei("10");   // only run farm if gas <= 10 gwei
const CHECK_INTERVAL_MS = 60_000;  // check every 60 seconds
const FARM_COOLDOWN_MS  = 360_000; // wait 6 min between farm runs (wheat grow time)

let lastFarmRun = 0;

console.log(`[watch-and-farm] Monitoring gas price (threshold: ≤10 gwei)`);
console.log(`[watch-and-farm] Will run farm when gas is low. Press Ctrl+C to stop.\n`);

async function checkAndRun() {
  try {
    const gasPrice = await pub.getGasPrice();
    const ts = new Date().toISOString();
    console.log(`[${ts}] Gas: ${formatGwei(gasPrice)} gwei`);

    if (gasPrice > MAX_GWEI) {
      console.log(`  ⏳ Too high (>${formatGwei(MAX_GWEI)} gwei) — waiting...`);
      return;
    }

    const now = Date.now();
    if (now - lastFarmRun < FARM_COOLDOWN_MS) {
      const waitSec = Math.ceil((FARM_COOLDOWN_MS - (now - lastFarmRun)) / 1000);
      console.log(`  ⏳ Farm cooldown: ${waitSec}s remaining`);
      return;
    }

    console.log(`  ✅ Gas OK! Running farm...`);
    lastFarmRun = now;
    try {
      execSync(`node_modules\\.bin\\tsx src/farm.ts`, {
        cwd: process.cwd(),
        stdio: "inherit",
        timeout: 300_000,
      });
      console.log(`  ✅ Farm run complete!`);
    } catch (e) {
      console.log(`  ❌ Farm run failed: ${e.message}`);
    }
  } catch (e) {
    console.log(`  ❌ RPC error: ${e.message}`);
  }
}

// Run immediately, then on interval
await checkAndRun();
setInterval(checkAndRun, CHECK_INTERVAL_MS);
