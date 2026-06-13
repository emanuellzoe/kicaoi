// Append N new wallets to existing wallets.json without overwriting existing ones.
// Usage: node expand-wallets.mjs <total_target>
// Example: node expand-wallets.mjs 1000  → expands to 1000 wallets total
import { generatePrivateKey, privateKeyToAccount } from "viem/accounts";
import { readFileSync, writeFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dir = dirname(fileURLToPath(import.meta.url));
const WALLETS_FILE = join(__dir, "wallets.json");
const PUBLIC_FILE  = join(__dir, "wallets.public.json");

const target = parseInt(process.argv[2] ?? "1000", 10);
if (isNaN(target) || target < 1) {
  console.error("Usage: node expand-wallets.mjs <total_target>");
  process.exit(1);
}

const existing = JSON.parse(readFileSync(WALLETS_FILE, "utf8"));
console.log(`Existing wallets: ${existing.length}`);

if (existing.length >= target) {
  console.log(`Already at ${existing.length} wallets — no expansion needed.`);
  process.exit(0);
}

const toAdd = target - existing.length;
console.log(`Generating ${toAdd} new wallets (index ${existing.length} → ${target - 1})...`);

const newWallets = Array.from({ length: toAdd }, (_, i) => {
  const privateKey = generatePrivateKey();
  const { address } = privateKeyToAccount(privateKey);
  return { index: existing.length + i, address, privateKey };
});

const all = [...existing, ...newWallets];
writeFileSync(WALLETS_FILE, JSON.stringify(all, null, 2));
writeFileSync(PUBLIC_FILE,  JSON.stringify(
  all.map(({ index, address }) => ({ index, address })),
  null, 2
));

console.log(`✅ wallets.json now has ${all.length} wallets.`);
console.log(`   New wallets added: ${toAdd} (index ${existing.length}–${target - 1})`);
