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

/** Creates a wallet client + account pair from a raw private key. */
export function makeWallet(privateKey: `0x${string}`) {
  const account = privateKeyToAccount(privateKey);
  const client  = createWalletClient({
    account,
    chain: config.chain,
    transport: http(config.rpcUrl),
  });
  return { account, client };
}

/** Loads the wallet fleet from KICAOI_WALLETS env or the wallets.json file.
 *
 * KICAOI_WALLETS may be either:
 *  - A JSON array (legacy full format)
 *  - Newline-separated private keys, one per line (compact format for GitHub
 *    Actions secrets, which have a 48 KB limit — 52 keys ≈ 3.4 KB vs ~120 KB
 *    for the full JSON).  Addresses are derived on-the-fly via viem.
 */
export function loadWallets(): Wallet[] {
  const raw = (process.env.KICAOI_WALLETS ?? readFileSync(WALLETS_FILE, "utf8")).trim();

  // Compact format: each line is a private key (starts with 0x or is 64 hex chars)
  if (!raw.startsWith("[")) {
    return raw
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean)
      .map((pk, i) => {
        const privateKey = (pk.startsWith("0x") ? pk : "0x" + pk) as `0x${string}`;
        const { address } = privateKeyToAccount(privateKey);
        return { index: i, address, privateKey };
      });
  }

  return JSON.parse(raw) as Wallet[];
}

/** Appends a timestamped message to stdout and to the activity log file. */
export function log(msg: string): void {
  const line = `[${new Date().toISOString()}] ${msg}`;
  console.log(line);
  try { appendFileSync(config.logFile, line + "\n"); } catch {}
}

/** Returns a short display form of an address: `0xABCD…1234`. */
export function short(addr: string): string {
  return addr.slice(0, 6) + "…" + addr.slice(-4);
}

/**
 * Processes `items` with limited concurrency using Promise.allSettled per batch.
 * Returns all settled results in input order.
 */
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

// [abi-v] 7