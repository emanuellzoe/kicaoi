export function formatCountdown(secs: number): string {
  if (secs <= 0) return "00:00";
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const s = secs % 60;
  if (h > 0) return `${h}h ${String(m).padStart(2, "0")}m`;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export function formatHarvestTime(plantedAt: number, growMins: number): string {
  const readyAt = new Date((plantedAt + growMins * 60) * 1000);
  return readyAt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}
