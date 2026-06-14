// SC <-> FE integration check.
// Uses the SAME committed ABI + deployment address the frontend uses, and reads
// live state from Celo Sepolia. Run: `node scripts/check-integration.mjs`
import { createPublicClient, http } from "viem";
import { readFileSync } from "node:fs";

const abi = JSON.parse(readFileSync(new URL("../lib/abi/KicaoiFarm.json", import.meta.url)));

// Mirror lib/deployments.ts (kept inline so this script has no TS build step).
const ADDRESS = "0x82622F1d43B25DBB2414285FF98c52d694661c61";
const RPC = "https://forno.celo-sepolia.celo-testnet.org";
const OWNER = "0x34b42a1BD9398A0c95812c09F55AD9Dae3d17F08";

const client = createPublicClient({ transport: http(RPC) });
const read = (functionName, args = []) => client.readContract({ address: ADDRESS, abi, functionName, args });

const main = async () => {
  console.log("Contract:", ADDRESS, "@ Celo Sepolia\n");

  const [rate, owner, wheat, stats, balance] = await Promise.all([
    read("seedPerCelo"),
    read("owner"),
    read("crops", [1]),
    read("getStats", [OWNER]),
    read("seedBalance", [OWNER]),
  ]);

  console.log("seedPerCelo        :", rate.toString());
  console.log("owner              :", owner);
  console.log("crop[1] Wheat      :", `cost=${wheat[0]} yield=${wheat[1]} grow=${wheat[2]}s enabled=${wheat[3]}`);
  console.log("owner SEED balance :", balance.toString());
  console.log("owner stats        :", `plots=${stats.plotCount} planted=${stats.totalPlanted} harvested=${stats.totalHarvested} seedHarvested=${stats.totalSeedHarvested}`);

  const ok = rate === 100n && owner.toLowerCase() === OWNER.toLowerCase() && wheat[3] === true;
  console.log("\n" + (ok ? "✅ SC <-> FE bindings read live state correctly." : "❌ Unexpected values — check ABI/address."));
  process.exit(ok ? 0 : 1);
};

main().catch((e) => {
  console.error("❌ Integration read failed:", e.shortMessage || e.message);
  process.exit(1);
});
