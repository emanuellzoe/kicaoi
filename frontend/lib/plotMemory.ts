// Persists the last-planted crop per plot across sessions so the UI pre-selects it.
const KEY = "kicaoi:lastCrop";

type PlotMemory = Record<number, number>; // plotId â†’ cropId

function load(): PlotMemory {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? "{}");
  } catch {
    return {};
  }
}

export function rememberCrop(plotId: number, cropId: number) {
  const mem = load();
  mem[plotId] = cropId;
  localStorage.setItem(KEY, JSON.stringify(mem));
}

export function recallCrop(plotId: number): number {
  return load()[plotId] ?? 1; // default to Wheat (id=1)
}

export function clearPlotMemory() {
  localStorage.removeItem(KEY);
}

