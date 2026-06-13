import {
  createPublicClient,
  createWalletClient,
  http,
  formatEther,
  type Address,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { readFileSync, appendFileSync } from "fs";
import { config, WALLETS_FILE } from "./config.js";

export { formatEther };

export type Wallet = {
  index: number;
  address: Address;
  privateKey: `0x${string}`;
};

export const KICAOI_ABI = [
  {
    type: "function", name: "buySeeds",
    stateMutability: "payable", inputs: [], outputs: [],
  },
  {
    type: "function", name: "plant",
    stateMutability: "nonpayable",
    inputs: [{ name: "plotId", type: "uint256" }, { name: "cropId", type: "uint8" }],
    outputs: [],
  },
  {
    type: "function", name: "harvest",
    stateMutability: "nonpayable",
    inputs: [{ name: "plotId", type: "uint256" }],
    outputs: [],
  },
  {
    type: "function", name: "unlockPlot",
    stateMutability: "nonpayable", inputs: [], outputs: [],
  },
  {
    type: "function", name: "seedBalance",
    stateMutability: "view",
    inputs: [{ name: "", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    type: "function", name: "nextUnlockCost",
    stateMutability: "view",
    inputs: [{ name: "user", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    type: "function", name: "getStats",
    stateMutability: "view",
    inputs: [{ name: "user", type: "address" }],
    outputs: [{
      name: "", type: "tuple",
      components: [
        { name: "plotCount",         type: "uint64"  },
        { name: "totalPlanted",      type: "uint64"  },
        { name: "totalHarvested",    type: "uint64"  },
        { name: "totalSeedHarvested", type: "uint256" },
      ],
    }],
  },
  {
    type: "function", name: "getPlots",
    stateMutability: "view",
    inputs: [
      { name: "user", type: "address"  },
      { name: "from", type: "uint256"  },
      { name: "to",   type: "uint256"  },
    ],
    outputs: [{
      name: "out", type: "tuple[]",
      components: [
        { name: "cropId",    type: "uint8"  },
        { name: "plantedAt", type: "uint64" },
      ],
    }],
  },
] as const;

export const publicClient = createPublicClient({
  chain: config.chain,
  transport: http(config.rpcUrl),
});

export const contract = {
  address: config.kicaoiAddress,
  abi: KICAOI_ABI,
  chain: config.chain,
} as const;

export function makeWallet(privateKey: `0x${string}`) {
  const account = privateKeyToAccount(privateKey);
  const client  = createWalletClient({
    account,
    chain: config.chain,
    transport: http(config.rpcUrl),
  });
  return { account, client };
}

export function loadWallets(): Wallet[] {
  const raw = process.env.KICAOI_WALLETS ?? readFileSync(WALLETS_FILE, "utf8");
  return JSON.parse(raw) as Wallet[];
}

export function log(msg: string): void {
  const line = `[${new Date().toISOString()}] ${msg}`;
  console.log(line);
  try { appendFileSync(config.logFile, line + "\n"); } catch {}
}

export function short(addr: string): string {
  return addr.slice(0, 6) + "…" + addr.slice(-4);
}

export async function pool<T>(
  items: T[],
  concurrency: number,
  fn: (item: T) => Promise<void>,
): Promise<PromiseSettledResult<void>[]> {
  const results: PromiseSettledResult<void>[] = [];
  for (let i = 0; i < items.length; i += concurrency) {
    const batch = items.slice(i, i + concurrency);
    const batchResults = await Promise.allSettled(batch.map(fn));
    results.push(...batchResults);
  }
  return results;
}


// [chain-v] 2

// [abi-v] 3