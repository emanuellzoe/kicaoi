/**
 * Formats a countdown in seconds as `HHh MMm` or `MM:SS`.
 * Returns `"Ready"` for non-positive values.
 */
export function formatCountdown(secs: number): string {
  if (secs <= 0) return "Ready";
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const s = secs % 60;
  if (h > 0) return `${h}h ${String(m).padStart(2, "0")}m`;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

/**
 * Classifies a growth progress value (0–1) into a named phase.
 */
export function growthPhase(progress: number): "seedling" | "growing" | "mature" | "ready" {
  if (progress >= 1) return "ready";
  if (progress >= 0.6) return "mature";
  if (progress >= 0.2) return "growing";
  return "seedling";
}

/**
 * Returns the wall-clock time when a crop will be ready to harvest,
 * formatted as a locale time string (e.g. "03:45 PM").
 */
export function formatHarvestTime(plantedAt: number, growMins: number): string {
  const readyAt = new Date((plantedAt + growMins * 60) * 1000);
  return readyAt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

/**
 * Converts a duration in seconds to a compact human-readable string.
 * Examples: 90s → "1m 30s", 3661s → "1h 1m", 45s → "45s"
 */
export function formatDuration(secs: number): string {
  if (secs <= 0) return "0s";
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const s = secs % 60;
  if (h > 0) return `${h}h ${m > 0 ? `${m}m` : ""}`.trim();
  if (m > 0) return `${m}m ${s > 0 ? `${s}s` : ""}`.trim();
  return `${s}s`;
}
