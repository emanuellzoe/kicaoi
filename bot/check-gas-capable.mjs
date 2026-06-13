import "dotenv/config";
import { createPublicClient, http, formatEther, formatGwei } from "viem";
import { celo } from "viem/chains";
import { readFileSync } from "fs";

const rpc = process.env.RPC_URL || "https://forno.celo.org";
const pub = createPublicClient({ chain: celo, transport: http(rpc, { timeout: 30000 }) });
const gasPrice = await pub.getGasPrice();
console.log("Gas price:", formatGwei(gasPrice), "gwei");
console.log("Cost per TX (80k gas):", formatEther(gasPrice * 80000n), "CELO");

const wallets = JSON.parse(readFileSync("./wallets.json", "utf8"));
const BATCH = 50;
let rich = [];
for (let i = 0; i < wallets.length; i += BATCH) {
  const slice = wallets.slice(i, i + BATCH);
  const bals = await Promise.all(slice.map(w => pub.getBalance({ address: w.address }).catch(() => 0n)));
  bals.forEach((bal, j) => { if (bal > 0n) rich.push({ ...slice[j], balance: bal }); });
  process.stdout.write(`\r  Checked: ${Math.min(i + BATCH, wallets.length)}/${wallets.length}`);
}
console.log("");

// Need at least 3 TXs worth of gas (harvest + buy + plant per plot)
const minForTx = gasPrice * 300000n;
const capable = rich.filter(w => w.balance >= minForTx);
console.log(`\nWallets with balance > 0: ${rich.length}`);
console.log(`Min CELO needed (3 TXs): ${formatEther(minForTx)} CELO`);
console.log(`Wallets capable of farming: ${capable.length}`);
if (capable.length > 0) {
  const top10 = capable.sort((a,b) => (b.balance > a.balance ? 1 : -1)).slice(0,10);
  top10.forEach(w => console.log(`  #${w.index} ${w.address} — ${formatEther(w.balance)} CELO`));
}
