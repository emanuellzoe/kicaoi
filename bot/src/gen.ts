import { generatePrivateKey, privateKeyToAccount } from "viem/accounts";
import { writeFileSync, existsSync } from "fs";
import { formatEther } from "viem";
import { config, WALLETS_FILE, PUBLIC_FILE } from "./config.js";

const force = process.argv.includes("--force");

if (existsSync(WALLETS_FILE) && !force) {
  console.error(
    "wallets.json sudah ada.\n" +
    "Gunakan --force untuk regenerasi (DANA DI WALLET LAMA AKAN HILANG SELAMANYA)."
  );
  process.exit(1);
}

const wallets = Array.from({ length: config.numWallets }, (_, i) => {
  const privateKey = generatePrivateKey();
  const { address } = privateKeyToAccount(privateKey);
  return { index: i, address, privateKey };
});

writeFileSync(WALLETS_FILE, JSON.stringify(wallets, null, 2));
writeFileSync(PUBLIC_FILE,  JSON.stringify(
  wallets.map(({ index, address }) => ({ index, address })),
  null, 2
));

const totalFund = config.fundPerWallet * BigInt(wallets.length);
console.log(`✅ ${wallets.length} wallet dibuat.`);
console.log(`   wallets.json        → RAHASIA — jangan di-commit`);
console.log(`   wallets.public.json → aman di-commit`);
console.log(`   Dana dibutuhkan: ~${formatEther(totalFund)} CELO`);
console.log(`\nLangkah berikutnya:`);
console.log(`  1. Isi FUNDER_PRIVATE_KEY di .env`);
console.log(`  2. npm run distribute`);
console.log(`  3. npm run status`);
console.log(`  4. npm run farm`);
