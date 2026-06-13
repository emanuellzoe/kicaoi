import "dotenv/config";
import { createPublicClient, http, formatEther } from "viem";
import { celo } from "viem/chains";
import { readFileSync } from "fs";

const rpc = process.env.RPC_URL || "https://forno.celo.org";
const pub = createPublicClient({ chain: celo, transport: http(rpc, { timeout: 30000 }) });

const wallets = JSON.parse(readFileSync("./wallets.json", "utf8"));
console.log(`Checking ${wallets.length} wallets...\n`);

// Batch ke 50 per round untuk tidak flood RPC
const BATCH = 50;
let totalWei = 0n;
let nonZero = [];

for (let i = 0; i < wallets.length; i += BATCH) {
  const slice = wallets.slice(i, i + BATCH);
  const balances = await Promise.all(
    slice.map(w => pub.getBalance({ address: w.address }).catch(() => 0n))
  );
  balances.forEach((bal, j) => {
    totalWei += bal;
    if (bal > 0n) nonZero.push({ ...slice[j], balance: bal });
  });
  process.stdout.write(`\r  Progress: ${Math.min(i + BATCH, wallets.length)}/${wallets.length}`);
}

console.log("\n");
console.log("=".repeat(50));
console.log(`Wallets dengan saldo > 0 : ${nonZero.length}`);
console.log(`Total CELO di bot wallets: ${formatEther(totalWei)} CELO`);
console.log("=".repeat(50));

if (nonZero.length > 0) {
  console.log("\nTop 10 wallet (by balance):");
  nonZero
    .sort((a, b) => (b.balance > a.balance ? 1 : -1))
    .slice(0, 10)
    .forEach(w => console.log(`  #${w.index} ${w.address}  ${formatEther(w.balance)} CELO`));
}
