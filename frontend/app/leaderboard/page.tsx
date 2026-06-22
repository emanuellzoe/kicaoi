"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useAccount } from "wagmi";
import { formatAddress } from "@/lib/format";
import { LEADERBOARD_MAX_ENTRIES, LEADERBOARD_REFRESH_SECS } from "@/lib/constants";
import { rankEntries, findRank, percentile, medalFor } from "@/lib/leaderboard";

type Entry = {
  rank: number;
  address: `0x${string}`;
  totalSeedHarvested: string;
  totalPlanted: number;
  totalHarvested: number;
  plotCount: number;
};

export default function LeaderboardPage() {
  const { address: me } = useAccount();
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatedAt, setUpdatedAt] = useState<Date | null>(null);
  const [countdown, setCountdown] = useState(LEADERBOARD_REFRESH_SECS);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const meNormalised = useMemo(() => me?.toLowerCase(), [me]);

  // Re-rank client-side by composite Farm Score (lib/leaderboard) rather than
  // the raw-SEED order the API returns, and reuse its medal/percentile helpers.
  const lbEntries = useMemo(
    () =>
      entries.map((e) => ({
        address: e.address,
        plotCount: e.plotCount,
        totalPlanted: e.totalPlanted,
        totalHarvested: e.totalHarvested,
        totalSeedHarvested: Number(e.totalSeedHarvested),
      })),
    [entries]
  );
  const ranked = useMemo(() => rankEntries(lbEntries), [lbEntries]);
  const myRank = useMemo(() => (me ? findRank(lbEntries, me) : null), [lbEntries, me]);
  const myPct = useMemo(() => (me ? percentile(lbEntries, me) : null), [lbEntries, me]);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      // The /api/leaderboard route does the chunked on-chain scan server-side
      // (forno caps eth_getLogs to ~1k blocks), so the client just consumes it.
      const res = await fetch("/api/leaderboard");
      if (!res.ok) throw new Error(`leaderboard request failed: ${res.status}`);
      const data: { entries?: Entry[]; error?: string } = await res.json();
      if (data.error) throw new Error(data.error);

      setEntries(data.entries ?? []);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    countdownRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          load();
          return LEADERBOARD_REFRESH_SECS;
        }
        return prev - 1;
      });
    }, 1000);
    return () => {
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Ambient glow */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[350px] bg-yellow-900/15 rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10 max-w-md mx-auto px-4 pt-24 pb-16">
        {/* Back nav */}
        <Link
          href="/farm"
          className="inline-flex items-center gap-2 liquid-glass rounded-full px-4 py-2 text-sm text-white/70 hover:text-white transition-colors no-underline mb-6"
        >
          ← Farm
        </Link>

        {/* Title */}
        <div className="text-center mb-6">
          <div className="inline-block liquid-glass rounded-full px-3 py-1 text-xs font-body text-white/50 mb-4">
            Top Farmers · Celo
          </div>
          <h1 className="text-5xl font-heading italic text-white">Leaderboard</h1>
        </div>

        {/* Controls */}
        <div className="liquid-glass rounded-2xl p-4 mb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs text-white/40 font-body">Ranked by Farm Score</span>
              {entries.length > 0 && (
                <span className="text-xs text-white/30 font-body">({entries.length} farmers)</span>
              )}
            </div>
            <button
              onClick={load}
              disabled={loading}
              className="liquid-glass rounded-full px-3 py-1.5 text-xs text-white/70 hover:text-white transition-colors border-none cursor-pointer disabled:opacity-40"
            >
              {loading ? "Loading…" : `↻ Refresh (${countdown}s)`}
            </button>
          </div>
          {updatedAt && (
            <div className="text-xs text-white/30 font-body mt-2">Updated {updatedAt.toLocaleTimeString()}</div>
          )}
        </div>

        {me &&
          entries.length > 0 &&
          (() => {
            return myRank !== null ? (
              <div className="liquid-glass rounded-2xl p-3 mb-3 flex items-center justify-between">
                <span className="text-xs text-white/50 font-body">Your rank</span>
                <span className="text-sm font-bold text-green-400">
                  #{myRank} of {entries.length}
                  {myPct !== null && (
                    <span className="text-xs text-white/40 font-body ml-2">{myPct}th percentile</span>
                  )}
                </span>
              </div>
            ) : (
              <div className="liquid-glass rounded-2xl p-3 mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-lg">🌱</span>
                  <span className="text-xs text-white/40 font-body">
                    You haven&apos;t farmed yet — start to appear on the board
                  </span>
                </div>
              </div>
            );
          })()}

        {error && (
          <div className="bg-red-900/30 border border-red-700/50 rounded-2xl px-4 py-3 text-red-300 text-xs mb-3">
            {error}
          </div>
        )}

        {loading ? (
          <div className="liquid-glass rounded-2xl p-10 text-center">
            <p className="text-4xl mb-3">⏳</p>
            <p className="text-xs text-white/40 font-body">Loading farmers…</p>
          </div>
        ) : entries.length === 0 ? (
          <div className="liquid-glass rounded-2xl p-10 text-center">
            <p className="text-4xl mb-3">🌱</p>
            <p className="text-xs text-white/40 font-body mb-4">No farmers yet. Be the first!</p>
            <Link
              href="/farm"
              className="liquid-glass-strong rounded-full px-5 py-2.5 text-sm font-semibold text-white no-underline hover:scale-105 transition-transform"
            >
              Start Farming
            </Link>
          </div>
        ) : (
          <div className="liquid-glass rounded-2xl overflow-hidden">
            {ranked.slice(0, LEADERBOARD_MAX_ENTRIES).map((e) => {
              const isMe = me && e.address.toLowerCase() === meNormalised;
              const medal = medalFor(e.rank);
              return (
                <div
                  key={e.address}
                  className={`flex items-center gap-3 px-4 py-3.5 border-b border-white/5 last:border-b-0 ${isMe ? "bg-green-900/20" : ""} ${e.rank <= 3 ? "bg-gradient-to-r from-white/5 to-transparent" : ""}`}
                >
                  <span className="text-base font-bold min-w-[32px] text-center text-white/60">
                    {medal || `#${e.rank}`}
                  </span>
                  <span className="flex-1 font-mono text-sm text-white/80 flex items-center gap-1">
                    {formatAddress(e.address)}
                    {isMe && (
                      <span className="ml-2 text-[10px] bg-green-500 text-black rounded px-1.5 py-0.5 font-bold font-body">
                        you
                      </span>
                    )}
                    <button
                      onClick={() => navigator.clipboard.writeText(e.address)}
                      className="text-white/20 hover:text-white/60 transition-colors bg-transparent border-none cursor-pointer text-xs p-0 ml-1"
                      title="Copy address"
                    >
                      ⎘
                    </button>
                  </span>
                  <div className="text-right">
                    <div className="text-sm font-bold text-green-400">{e.score.toLocaleString()} pts</div>
                    <div className="text-[11px] text-white/40 font-body">
                      {e.totalSeedHarvested.toLocaleString()} SEED · {e.totalHarvested} harvests
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}


// [lb-page-v] 11