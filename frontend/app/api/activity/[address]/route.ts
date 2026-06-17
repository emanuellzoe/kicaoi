// Per-user activity feed — fetches all 4 event types for one address.
// force-dynamic: never statically pre-render at build time (blockchain fetch would timeout)
export const dynamic = "force-dynamic";

import { createPublicClient, http, parseAbiItem, type Address } from "viem";
import { celo } from "viem/chains";
import { DEPLOYMENTS } from "@/lib/deployments";

const CHAIN_ID = 42220;
const deployment = DEPLOYMENTS[CHAIN_ID];
const CONTRACT = deployment.address;
const START_BLOCK = deployment.startBlock ?? 0n;
const CHUNK = 50_000n;

const client = createPublicClient({
  chain: celo,
  transport: http("https://forno.celo.org", { timeout: 30_000 }),
});

const EVENTS = {
  SeedsBought: parseAbiItem(
    "event SeedsBought(address indexed user, uint256 celoAmount, uint256 seedCredited)"
  ),
  Planted: parseAbiItem(
    "event Planted(address indexed user, uint256 indexed plotId, uint8 cropId, uint256 plantedAt)"
  ),
  Harvested: parseAbiItem(
    "event Harvested(address indexed user, uint256 indexed plotId, uint8 cropId, uint256 yieldAmount)"
  ),
  PlotUnlocked: parseAbiItem(
    "event PlotUnlocked(address indexed user, uint256 newPlotCount, uint256 cost)"
  ),
} as const;

type ActivityItem = {
  type: "SeedsBought" | "Planted" | "Harvested" | "PlotUnlocked";
  blockNumber: string;
  txHash: string;
  data: Record<string, string>;
};

async function getLogsChunked(event: (typeof EVENTS)[keyof typeof EVENTS], user: Address) {
  const latest = await client.getBlockNumber();
  const results: ActivityItem[] = [];

  for (let from = START_BLOCK; from <= latest; from += CHUNK) {
    const to = from + CHUNK - 1n < latest ? from + CHUNK - 1n : latest;
    try {
      const logs = await client.getLogs({
        address: CONTRACT,
        event,
        args: { user } as Record<string, unknown>,
        fromBlock: from,
        toBlock: to,
      });

      for (const l of logs) {
        const type = Object.keys(EVENTS).find(
          (k) => EVENTS[k as keyof typeof EVENTS] === event
        ) as ActivityItem["type"];

        const data: Record<string, string> = {};
        if (l.args) {
          for (const [k, v] of Object.entries(l.args)) {
            if (k !== "user") data[k] = String(v);
          }
        }

        results.push({
          type,
          blockNumber: l.blockNumber?.toString() ?? "0",
          txHash: l.transactionHash ?? "",
          data,
        });
      }
    } catch {
      // skip failed chunk
    }
  }

  return results;
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ address: string }> }
) {
  const { address } = await params;

  if (!address || !/^0x[0-9a-fA-F]{40}$/.test(address)) {
    return Response.json({ error: "Invalid address" }, { status: 400 });
  }

  const user = address as Address;

  try {
    const [bought, planted, harvested, unlocked] = await Promise.all([
      getLogsChunked(EVENTS.SeedsBought, user),
      getLogsChunked(EVENTS.Planted, user),
      getLogsChunked(EVENTS.Harvested, user),
      getLogsChunked(EVENTS.PlotUnlocked, user),
    ]);

    const all = [...bought, ...planted, ...harvested, ...unlocked].sort(
      (a, b) => Number(BigInt(b.blockNumber) - BigInt(a.blockNumber))
    );

    const summary = {
      totalTx: all.length,
      seedsBought: bought.length,
      planted: planted.length,
      harvested: harvested.length,
      plotsUnlocked: unlocked.length,
    };

    return Response.json({
      address: user,
      summary,
      activity: all.slice(0, 200), // cap at 200 most recent
      updatedAt: new Date().toISOString(),
    });
  } catch (e) {
    console.error("[activity]", e);
    return Response.json({ error: "Failed to load activity" }, { status: 500 });
  }
}
