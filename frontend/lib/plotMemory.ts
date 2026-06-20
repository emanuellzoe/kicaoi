// Persists the last-planted crop per plot across sessions so the UI pre-selects it.
const KEY = "kicaoi:lastCrop";

type PlotMemory = Record<number, number>; // plotId -> cropId

function load(): PlotMemory {
  if (typeof window === "undefined") return {};
  try {
    const parsed = JSON.parse(localStorage.getItem(KEY) ?? "{}");
    // Guard against corrupt values (e.g. "5" or an array) so callers can
    // always safely assign properties on the result.
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      return parsed as PlotMemory;
    }
    return {};
  } catch {
    return {};
  }
}

export function rememberCrop(plotId: number, cropId: number) {
  if (typeof window === "undefined") return;
  const mem = load();
  mem[plotId] = cropId;
  localStorage.setItem(KEY, JSON.stringify(mem));
}

export function recallCrop(plotId: number): number {
  return load()[plotId] ?? 1; // default to Wheat (id=1)
}

export function clearPlotMemory() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(KEY);
}
