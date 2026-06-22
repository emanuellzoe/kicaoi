// Pure ranking helpers for the leaderboard. The API route ranks by raw SEED;
// these rank by the composite Farm Score (lib/farmScore) and add the bits a UI
// needs: a player's own position, percentile and medal. No network, no state.

import { farmScore } from "@/lib/farmScore";
import type { PlayerStatsLike } from "@/lib/achievements";

export type LeaderboardEntry = PlayerStatsLike & { address: string };
export type RankedEntry = LeaderboardEntry & { rank: number; score: number; medal: string };

/** Medal for a 1-based rank: gold/silver/bronze for the top three, else "". */
export function medalFor(rank: number): string {
  return rank === 1 ? "🥇" : rank === 2 ? "🥈" : rank === 3 ? "🥉" : "";
}

/**
 * Sorts entries by Farm Score (descending) and assigns 1-based ranks + medals.
 * Ties are broken by address so the order is stable and deterministic. Does not
 * mutate the input array. Pure function.
 */
export function rankEntries(entries: readonly LeaderboardEntry[]): RankedEntry[] {
  return entries
    .map((e) => ({ ...e, score: farmScore(e) }))
    .sort((a, b) => b.score - a.score || a.address.localeCompare(b.address))
    .map((e, i) => ({ ...e, rank: i + 1, medal: medalFor(i + 1) }));
}

/** Case-insensitive lookup of a player's 1-based rank, or null if absent. */
export function findRank(entries: readonly LeaderboardEntry[], address: string): number | null {
  const target = address.toLowerCase();
  const found = rankEntries(entries).find((e) => e.address.toLowerCase() === target);
  return found ? found.rank : null;
}

/**
 * Top-percentile of a player (0–100, higher is better). Rank 1 of 100 players
 * is the 99th percentile; the last place is the 0th. Returns null if absent or
 * if there are no entries.
 */
export function percentile(entries: readonly LeaderboardEntry[], address: string): number | null {
  const total = entries.length;
  if (total === 0) return null;
  const rank = findRank(entries, address);
  if (rank === null) return null;
  if (total === 1) return 100;
  return Math.round(((total - rank) / (total - 1)) * 100);
}
