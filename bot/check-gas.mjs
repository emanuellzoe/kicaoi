import "dotenv/config";
import { createPublicClient, http, formatEther, formatGwei } from "viem";
import { celo } from "viem/chains";

const rpc = process.env.RPC_URL || "https://forno.celo.org";
const pub = createPublicClient({ chain: celo, transport: http(rpc, { timeout: 15000 }) });

const gasPrice = await pub.getGasPrice();
const gasCostBuySeeds = 80000n * gasPrice;  // estimasi 1 TX buySeeds
const gasCostFarm6tx  = 6n * 90000n * gasPrice; // harvest 3 + plant 3

console.log("RPC         :", rpc);
console.log("Gas price   :", formatGwei(gasPrice), "Gwei");
console.log("1 TX cost   :", formatEther(gasCostBuySeeds), "CELO");
console.log("6 TX (farm) :", formatEther(gasCostFarm6tx), "CELO");
console.log("Min wallet  :", formatEther(gasCostBuySeeds + 1000n), "CELO (untuk 1 seed-spam TX)");
