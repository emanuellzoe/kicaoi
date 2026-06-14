// Leaderboard indexer — Next.js Route Handler
// Chunks getLogs into 50k-block batches, multicalls getStats in groups of 100.
// force-dynamic: never statically pre-render at build time (blockchain fetch would timeout)
export const dynamic = "force-dynamic";

import { createPublicClient, http, parseAbiItem } from "viem";
import { celo } from "viem/chains";
import { DEPLOYMENTS } from "@/lib/deployments";
import { KICAOI_ABI } from "@/lib/contract";

const CHAIN_ID = 42220;
const deployment = DEPLOYMENTS[CHAIN_ID];
const CONTRACT = deployment.address;
const START_BLOCK = deployment.startBlock ?? 0n;
const CHUNK = 1_000n;       // blocks per getLogs call (forno caps the range ~1k)
const LOG_CONCURRENCY = 20; // getLogs chunks fetched in parallel
const BATCH = 100;          // addresses per multicall

const client = createPublicClient({
  chain: celo,
  transport: http("https://forno.celo.org", { timeout: 30_000 }),
});

const SEEDS_BOUGHT = parseAbiItem(
  "event SeedsBought(address indexed user, uint256 celoAmount, uint256 seedCredited)"
);

async function getAllUsers(): Promise<`0x${string}`[]> {
  const latest = await client.getBlockNumber();
  const seen = new Set<string>();

  // Build the list of [from, to] ranges, then fetch them in parallel batches.
  const ranges: { from: bigint; to: bigint }[] = [];
  for (let from = START_BLOCK; from <= latest; from += CHUNK) {
    const to = from + CHUNK - 1n < latest ? from + CHUNK - 1n : latest;
    ranges.push({ from, to });
  }

  for (let i = 0; i < ranges.length; i += LOG_CONCURRENCY) {
    const slice = ranges.slice(i, i + LOG_CONCURRENCY);
    const batches = await Promise.all(
      slice.map(async ({ from, to }) => {
        try {
          return await client.getLogs({
            address: CONTRACT,
            event: SEEDS_BOUGHT,
            fromBlock: from,
            toBlock: to,
          });
        } catch {
          return []; // skip failed chunk — don't abort entire scan
        }
      })
    );
    for (const logs of batches) {
      for (const l of logs) {
        if (l.args.user) seen.add(l.args.user.toLowerCase());
      }
    }
  }

  return [...seen] as `0x${string}`[];
}

async function batchGetStats(addresses: `0x${string}`[]) {
  const results: {
    address: `0x${string}`;
    plotCount: number;
    totalPlanted: number;
    totalHarvested: number;
    totalSeedHarvested: string;
  }[] = [];

  for (let i = 0; i < addresses.length; i += BATCH) {
    const slice = addresses.slice(i, i + BATCH);
    const calls = slice.map((addr) => ({
      address: CONTRACT,
      abi: KICAOI_ABI,
      functionName: "getStats" as const,
      args: [addr] as const,
    }));

    try {
      const res = await client.multicall({ contracts: calls });
      res.forEach((r, j) => {
        if (r.status === "success" && r.result) {
          const s = r.result as {
            plotCount: bigint;
            totalPlanted: bigint;
            totalHarvested: bigint;
            totalSeedHarvested: bigint;
          };
          results.push({
            address: slice[j],
            plotCount: Number(s.plotCount),
            totalPlanted: Number(s.totalPlanted),
            totalHarvested: Number(s.totalHarvested),
            totalSeedHarvested: s.totalSeedHarvested.toString(),
          });
        }
      });
    } catch {
      // skip failed batch
    }
  }

  return results;
}

export async function GET() {
  try {
    const users = await getAllUsers();

    if (users.length === 0) {
      return Response.json({ entries: [], total: 0, updatedAt: new Date().toISOString() });
    }

    const stats = await batchGetStats(users);

    // Sort by totalSeedHarvested desc
    stats.sort((a, b) => {
      const diff = BigInt(b.totalSeedHarvested) - BigInt(a.totalSeedHarvested);
      return diff > 0n ? 1 : diff < 0n ? -1 : 0;
    });

    const entries = stats.map((s, i) => ({ rank: i + 1, ...s }));

    return Response.json({
      entries,
      total: entries.length,
      updatedAt: new Date().toISOString(),
    });
  } catch (e) {
    console.error("[leaderboard]", e);
    return Response.json({ error: "Failed to load leaderboard" }, { status: 500 });
  }
}


// [lb-api-v] 3