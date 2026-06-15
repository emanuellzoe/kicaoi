// Kumpulkan semua CELO dari wallet bot ke satu alamat tujuan.
// Jalankan SEBELUM npm run gen --force agar dana tidak hilang.
//
//   SWEEP_TO=0x... npm run sweep
import "dotenv/config";
import { createPublicClient, createWalletClient, http, formatEther, type Address } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { config } from "./config.js";
import { makeWallet, loadWallets, log, short } from "./chain.js";

const pub = createPublicClient({ chain: config.chain, transport: http(config.rpcUrl) });

const dest: Address = (
  process.env.SWEEP_TO ||
  (config.funderPrivateKey ? privateKeyToAccount(config.funderPrivateKey).address : undefined)
) as Address;

if (!dest) {
  console.error("Set SWEEP_TO=0x... atau FUNDER_PRIVATE_KEY di .env");
  process.exit(1);
}

const wallets  = loadWallets();
const stat     = { swept: 0n, skipped: 0, errors: 0 };

log(`Sweep ${wallets.length} wallet → ${short(dest)}`);

const gasPrice   = await pub.getGasPrice();
const gasReserve = 21000n * 2n * gasPrice;

for (const w of wallets) {
  const native = await pub.getBalance({ address: w.address });

  if (native <= gasReserve) {
    log(`#${w.index} ${short(w.address)}  SKIP: ${formatEther(native)} CELO`);
    stat.skipped++;
    continue;
  }

  const send = native - gasReserve;
  const { client, account } = makeWallet(w.privateKey);

  try {
    const hash = await client.sendTransaction({ to: dest, value: send, account });
    await pub.waitForTransactionReceipt({ hash });
    stat.swept += send;
    log(`#${w.index} ${short(w.address)}  ✅ ${formatEther(send)} CELO  ${hash}`);
  } catch (e: any) {
    stat.errors++;
    log(`#${w.index} ${short(w.address)}  ❌ ${e.shortMessage ?? e.message}`);
  }
}

log(`Sweep selesai. total=${formatEther(stat.swept)} CELO skipped=${stat.skipped} errors=${stat.errors}`);


// [sweep-v] 1