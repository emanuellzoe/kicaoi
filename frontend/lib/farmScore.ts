// A single composite "Farm Score" that blends every dimension of a player's
// on-chain PlayerStats into one comparable number, plus a rank tier on top of
// it. levels.ts ranks by raw SEED only; this rewards all-round play (owning
// plots, planting, harvesting and SEED earned) so the leaderboard and profile
// can show one headline figure. Pure — derived entirely from existing stats.

import type { PlayerStatsLike } from "@/lib/achievements";

// Per-stat weights. Harvesting is the core loop so it scores highest; SEED is
// abundant so it is weighted fractionally. Tuned to keep an active player in
// the low thousands. Exported so tests and UI can reason about the formula.
export const SCORE_WEIGHTS = {
  plotCount: 25,
  totalPlanted: 2,
  totalHarvested: 5,
  totalSeedHarvested: 0.1,
} as const;

export type ScoreRank = {
  id: string;
  label: string;
  emoji: string;
  minScore: number;
};

// Ordered highest threshold first so the first match in `rankForScore` wins.
export const SCORE_RANKS: readonly ScoreRank[] = [
  { id: "mythic", label: "Mythic Farmer", emoji: "🏆", minScore: 5000 },
  { id: "diamond", label: "Diamond", emoji: "💎", minScore: 2000 },
  { id: "gold", label: "Gold", emoji: "🥇", minScore: 800 },
  { id: "silver", label: "Silver", emoji: "🥈", minScore: 300 },
  { id: "bronze", label: "Bronze", emoji: "🥉", minScore: 50 },
  { id: "unranked", label: "Unranked", emoji: "🌱", minScore: 0 },
];

/** The fallback rank (Unranked) — always the last entry, matches any score. */
export const UNRANKED: ScoreRank = SCORE_RANKS[SCORE_RANKS.length - 1];

/**
 * Computes the composite Farm Score for a player. Negative inputs are floored
 * at 0 so a malformed stat can never drag the score below zero. Result is
 * rounded to a whole number. Pure function.
 */
export function farmScore(s: PlayerStatsLike): number {
  const clamp = (n: number) => Math.max(0, n);
  const raw =
    clamp(s.plotCount) * SCORE_WEIGHTS.plotCount +
    clamp(s.totalPlanted) * SCORE_WEIGHTS.totalPlanted +
    clamp(s.totalHarvested) * SCORE_WEIGHTS.totalHarvested +
    clamp(s.totalSeedHarvested) * SCORE_WEIGHTS.totalSeedHarvested;
  return Math.round(raw);
}

/** Maps a raw score to its rank tier. Returns Unranked for scores below 50. */
export function rankForScore(score: number): ScoreRank {
  return SCORE_RANKS.find((r) => score >= r.minScore) ?? UNRANKED;
}

/** Convenience: the rank tier for a player's stats in one call. */
export function rankForStats(s: PlayerStatsLike): ScoreRank {
  return rankForScore(farmScore(s));
}
