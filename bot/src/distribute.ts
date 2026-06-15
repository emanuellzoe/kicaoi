import "dotenv/config";
import { createWalletClient, createPublicClient, http, formatEther } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { config } from "./config.js";
import { loadWallets, log, short } from "./chain.js";

if (!process.env.FUNDER_PRIVATE_KEY) {
  console.error("FUNDER_PRIVATE_KEY wajib diisi di .env");
  process.exit(1);
}

const funderAccount = privateKeyToAccount(config.funderPrivateKey);
const funderClient  = createWalletClient({
  account: funderAccount,
  chain: config.chain,
  transport: http(config.rpcUrl),
});
const pub = createPublicClient({ chain: config.chain, transport: http(config.rpcUrl) });

const wallets = loadWallets();
const stat = { funded: 0, skipped: 0, failed: 0 };

const funderBal = await pub.getBalance({ address: funderAccount.address });
log(`Funder: ${short(funderAccount.address)} — ${formatEther(funderBal)} CELO`);
log(`Target: ${config.fundPerWalletStr} CELO/wallet × ${wallets.length} wallet`);
log(`Total dibutuhkan: ~${formatEther(config.fundPerWallet * BigInt(wallets.length))} CELO`);

for (const w of wallets) {
  const bal = await pub.getBalance({ address: w.address });

  if (bal >= config.fundPerWallet) {
    log(`#${w.index} ${short(w.address)}  SKIP: sudah ${formatEther(bal)} CELO`);
    stat.skipped++;
    continue;
  }

  const need = config.fundPerWallet - bal;
  const fBal = await pub.getBalance({ address: funderAccount.address });
  if (fBal < need) {
    log(`❌ Funder kehabisan CELO (${formatEther(fBal)} tersisa). Berhenti.`);
    break;
  }

  try {
    const hash = await funderClient.sendTransaction({ to: w.address, value: need });
    await pub.waitForTransactionReceipt({ hash });
    stat.funded++;
    log(`#${w.index} ${short(w.address)}  ✅ +${formatEther(need)} CELO  ${hash}`);
  } catch (e: any) {
    stat.failed++;
    log(`#${w.index} ${short(w.address)}  ❌ ${e.shortMessage ?? e.message}`);
  }
}

log(`Selesai. funded=${stat.funded} skipped=${stat.skipped} failed=${stat.failed}`);
if (stat.failed > 0 && stat.funded === 0) process.exit(1);


// [dist-v] 1