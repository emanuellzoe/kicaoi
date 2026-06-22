"use client";

import { farmScore, rankForScore, type ScoreRank } from "@/lib/farmScore";
import type { PlayerStatsLike } from "@/lib/achievements";

interface RankBadgeProps {
  stats: PlayerStatsLike;
  /** Compact pill (default) or a larger card with the numeric score shown. */
  variant?: "pill" | "card";
}

const RANK_COLOR: Record<string, string> = {
  mythic: "text-amber-400",
  diamond: "text-sky-300",
  gold: "text-yellow-400",
  silver: "text-zinc-300",
  bronze: "text-orange-400",
  unranked: "text-white/40",
};

function rankColor(rank: ScoreRank): string {
  return RANK_COLOR[rank.id] ?? "text-white/60";
}

/**
 * Shows a player's composite Farm Score rank. Derived entirely from on-chain
 * stats via lib/farmScore — no extra calls. Use the "card" variant on the
 * profile header and the "pill" variant inline (e.g. leaderboard rows).
 */
export function RankBadge({ stats, variant = "pill" }: RankBadgeProps) {
  const score = farmScore(stats);
  const rank = rankForScore(score);

  if (variant === "card") {
    return (
      <div className="liquid-glass rounded-xl p-3 flex items-center gap-3">
        <span className="text-2xl" aria-hidden>
          {rank.emoji}
        </span>
        <div className="flex flex-col gap-0.5">
          <span className="text-[10px] text-white/40 font-body uppercase tracking-wider">Rank</span>
          <span className={`text-lg font-bold ${rankColor(rank)}`}>{rank.label}</span>
          <span className="text-[10px] text-white/30 font-body">{score.toLocaleString()} pts</span>
        </div>
      </div>
    );
  }

  return (
    <span
      className={`inline-flex items-center gap-1 text-xs font-bold ${rankColor(rank)}`}
      title={`${rank.label} · ${score.toLocaleString()} pts`}
    >
      <span aria-hidden>{rank.emoji}</span>
      {rank.label}
    </span>
  );
}
