// Summarises what happened on a player's farm while they were away, computed
// PURELY from the plots they already read on-chain plus the crop configs — no
// extra calls. Powers a "welcome back" panel: how many plots ripened, how much
// SEED is waiting to be harvested, and when the next plot is due. All times are
// UNIX seconds, matching lib/time.ts.

export type CropDef = { growMins: number; yield: number };
export type PlotState = { cropId: number; plantedAt: number };

export type OfflineSummary = {
  ready: number; // planted plots that are now harvestable
  growing: number; // planted plots still maturing
  empty: number; // plots with no crop
  pendingYield: number; // total SEED waiting in ready plots
  nextReadySec: number | null; // seconds until the next plot ripens, null if none growing
};

/**
 * Builds an OfflineSummary for the given plots at time `nowSec`.
 *
 * @param plots    Per-plot crop + plantedAt (UNIX seconds).
 * @param getCrop  Resolves a cropId to its config; unknown ids are skipped.
 * @param nowSec   Reference time in UNIX seconds (defaults to current time).
 */
export function offlineSummary(
  plots: readonly PlotState[] | undefined,
  getCrop: (id: number) => CropDef | undefined,
  nowSec: number = Math.floor(Date.now() / 1000)
): OfflineSummary {
  const summary: OfflineSummary = {
    ready: 0,
    growing: 0,
    empty: 0,
    pendingYield: 0,
    nextReadySec: null,
  };
  if (!plots) return summary;

  for (const p of plots) {
    if (p.cropId === 0) {
      summary.empty++;
      continue;
    }
    const crop = getCrop(p.cropId);
    if (!crop) continue; // unknown crop id — ignore rather than miscount

    const readyAt = p.plantedAt + crop.growMins * 60;
    if (nowSec >= readyAt) {
      summary.ready++;
      summary.pendingYield += crop.yield;
    } else {
      summary.growing++;
      const remaining = readyAt - nowSec;
      if (summary.nextReadySec === null || remaining < summary.nextReadySec) {
        summary.nextReadySec = remaining;
      }
    }
  }
  return summary;
}

/** True if there is at least one harvestable plot in the summary. */
export function hasHarvestable(s: OfflineSummary): boolean {
  return s.ready > 0;
}
