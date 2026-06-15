"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { parseAbiItem } from "viem";
import { useAccount } from "wagmi";
import { publicClient } from "@/lib/publicClient";
import { KICAOI_ADDRESS, KICAOI_ABI } from "@/lib/contract";
import { DEPLOYMENTS } from "@/lib/deployments";
import { activeChain } from "@/lib/chain";
import { BlurText } from "@/components/BlurText";

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
      setError("Failed to load leaderboard. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <>
      <div className="hero-bg" />

      <nav className="kicaoi-nav lg">
        <div className="nav-logo">
          <span>🌱</span>
          Kicaoi
        </div>
        <Link href="/" className="nav-link">← Farm</Link>
      </nav>

      <main className="shell">
        {/* Header */}
        <div className="fade-up-1" style={{ textAlign: "center", marginBottom: "24px", paddingTop: "8px" }}>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: "12px" }}>
            <span className="hero-eyebrow lg">Top Farmers · Celo</span>
          </div>
          <BlurText
            text="Leaderboard"
            className="font-heading"
            delay={0.1}
            stagger={0.1}
          />
        </div>

        {/* Controls */}
        <div className="card lg fade-up-2">
          <div className="row">
            <span className="note">Ranked by lifetime SEED harvested</span>
            <button
              className="secondary"
              onClick={load}
              disabled={loading}
              style={{ padding: "7px 12px", fontSize: "12px", borderRadius: "10px" }}
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

        {error && <div className="warn fade-up">{error}</div>}

        {loading ? (
          <div className="card lg fade-up center" style={{ padding: "40px 16px" }}>
            <p style={{ fontSize: "30px", marginBottom: "10px" }}>⏳</p>
            <p className="note">Loading farmers…</p>
          </div>
        ) : entries.length === 0 ? (
          <div className="card lg fade-up center" style={{ padding: "40px 16px" }}>
            <p style={{ fontSize: "34px", marginBottom: "10px" }}>🌱</p>
            <p className="note" style={{ marginBottom: "16px" }}>
              No farmers yet. Be the first!
            </p>
            <Link href="/" className="nav-link">Start Farming</Link>
          </div>
        ) : (
          <div
            className="card lg fade-up-3"
            style={{ padding: 0, overflow: "hidden" }}
          >
            {entries.map((e, i) => {
              const isMe = me && e.address.toLowerCase() === me.toLowerCase();
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
                    {isMe && <span className="lb-you">you</span>}
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
    </>
  );
}
