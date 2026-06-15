"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { parseAbiItem } from "viem";
import { useAccount } from "wagmi";
import { publicClient } from "@/lib/publicClient";
import { KICAOI_ADDRESS, KICAOI_ABI } from "@/lib/contract";
import { DEPLOYMENTS } from "@/lib/deployments";
import { activeChain } from "@/lib/chain";

const SEEDS_BOUGHT_EVENT = parseAbiItem(
  "event SeedsBought(address indexed user, uint256 celoAmount, uint256 seedCredited)"
);

const MEDAL = ["🥇", "🥈", "🥉"];

type Entry = {
  address: `0x${string}`;
  totalSeedHarvested: bigint;
  totalHarvested: number;
  plotCount: number;
};

function shorten(addr: string) {
  return addr.slice(0, 6) + "…" + addr.slice(-4);
}

export default function LeaderboardPage() {
  const { address: me } = useAccount();
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatedAt, setUpdatedAt] = useState<Date | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const deployment = DEPLOYMENTS[activeChain.id];
      const fromBlock = deployment?.startBlock ?? 0n;

      const logs = await publicClient.getLogs({
        address: KICAOI_ADDRESS,
        event: SEEDS_BOUGHT_EVENT,
        fromBlock,
        toBlock: "latest",
      });

      const unique = [...new Set(logs.map((l) => l.args.user as `0x${string}`))];

      if (unique.length === 0) {
        setEntries([]);
        setUpdatedAt(new Date());
        return;
      }

      const results = await publicClient.multicall({
        contracts: unique.map((addr) => ({
          address: KICAOI_ADDRESS,
          abi: KICAOI_ABI,
          functionName: "getStats" as const,
          args: [addr] as const,
        })),
      });

      const parsed: Entry[] = [];
      results.forEach((r, i) => {
        if (r.status === "success" && r.result) {
          const s = r.result as {
            plotCount: bigint;
            totalHarvested: bigint;
            totalSeedHarvested: bigint;
          };
          parsed.push({
            address: unique[i],
            totalSeedHarvested: s.totalSeedHarvested,
            totalHarvested: Number(s.totalHarvested),
            plotCount: Number(s.plotCount),
          });
        }
      });

      parsed.sort((a, b) =>
        b.totalSeedHarvested > a.totalSeedHarvested ? 1 : -1
      );
      setEntries(parsed.slice(0, 50));
      setUpdatedAt(new Date());
    } catch (e) {
      console.error(e);
      setError("Gagal memuat leaderboard. Coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <main className="shell">
      <header className="brand">
        <div>
          <h1>🏆 Leaderboard</h1>
          <div className="tag">Ranked by lifetime SEED harvested</div>
        </div>
        <Link href="/" className="nav-link">🌱 Farm</Link>
      </header>

      <div className="card">
        <div className="row">
          <span className="note">Top farmers on Celo</span>
          <button
            className="secondary"
            onClick={load}
            disabled={loading}
            style={{ padding: "6px 12px", fontSize: "12px" }}
          >
            {loading ? "Loading…" : "↻ Refresh"}
          </button>
        </div>
        {updatedAt && (
          <div className="note mt">
            Updated {updatedAt.toLocaleTimeString()}
          </div>
        )}
      </div>

      {error && <div className="warn">{error}</div>}

      {loading ? (
        <div className="card center" style={{ padding: "32px 16px" }}>
          <p style={{ fontSize: "28px", margin: "0 0 8px" }}>⏳</p>
          <p className="note">Loading farmers…</p>
        </div>
      ) : entries.length === 0 ? (
        <div className="card center" style={{ padding: "32px 16px" }}>
          <p style={{ fontSize: "32px", margin: "0 0 8px" }}>🌱</p>
          <p className="note">Belum ada farmer. Jadilah yang pertama!</p>
          <Link href="/" className="nav-link mt">Mulai Farm</Link>
        </div>
      ) : (
        <div className="card" style={{ padding: 0, overflow: "hidden" }}>
          {entries.map((e, i) => {
            const isMe =
              me && e.address.toLowerCase() === me.toLowerCase();
            return (
              <div
                key={e.address}
                className={`lb-row${isMe ? " lb-me" : ""}`}
              >
                <span className="lb-rank">
                  {i < 3 ? MEDAL[i] : `#${i + 1}`}
                </span>
                <span className="lb-addr">
                  {shorten(e.address)}
                  {isMe && (
                    <span className="lb-you"> you</span>
                  )}
                </span>
                <div className="lb-stats">
                  <span className="lb-seed">
                    {e.totalSeedHarvested.toString()} SEED
                  </span>
                  <span className="note">
                    {e.totalHarvested} harvests · {e.plotCount} plots
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}
