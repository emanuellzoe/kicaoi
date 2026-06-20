/** Shared display-formatting utilities for addresses, numbers, and SEED amounts. */

// Pin a fixed locale so server-rendered and client-rendered output are byte
// identical — `toLocaleString()` with no locale uses the host's locale, which
// differs between the SSR host and the user's browser and causes React
// hydration mismatches (e.g. "12,345" vs "12.345").
const NUMBER_LOCALE = "en-US";

/**
 * Returns a short display form of an Ethereum address.
 * Example: "0xAbCd…1234"
 */
export function formatAddress(address: string, prefixLen = 6, suffixLen = 4): string {
  if (!address) return "";
  if (address.length <= prefixLen + suffixLen) return address;
  return `${address.slice(0, prefixLen)}…${address.slice(-suffixLen)}`;
}

/**
 * Formats a SEED balance with locale-aware thousands separators.
 * Example: 12345 → "12,345 SEED"
 */
export function formatSeed(amount: number | bigint, showUnit = true): string {
  const raw = typeof amount === "bigint" ? Number(amount) : amount;
  const n = Number.isFinite(raw) ? raw : 0;
  const formatted = n.toLocaleString(NUMBER_LOCALE);
  return showUnit ? `${formatted} SEED` : formatted;
}

/**
 * Formats a CELO balance to a fixed number of decimal places.
 * Example: 1.234567 → "1.2346 CELO"
 */
export function formatCelo(amount: number, decimals = 4, showUnit = true): string {
  const n = Number.isFinite(amount) ? amount : 0;
  const formatted = n.toFixed(decimals);
  return showUnit ? `${formatted} CELO` : formatted;
}

/**
 * Formats a large number with compact notation.
 * Example: 12345 → "12.3K", 1234567 → "1.23M"
 */
export function formatCompact(n: number): string {
  if (!Number.isFinite(n)) return "0";
  const sign = n < 0 ? "-" : "";
  const abs = Math.abs(n);
  if (abs >= 1_000_000) return `${sign}${(abs / 1_000_000).toFixed(2)}M`;
  if (abs >= 1_000) return `${sign}${(abs / 1_000).toFixed(1)}K`;
  return n.toString();
}

/**
 * Formats a percentage value clamped to [0, 100].
 * Example: 0.756 → "75.6%"
 */
export function formatPercent(ratio: number, decimals = 1): string {
  const r = Number.isFinite(ratio) ? ratio : 0;
  return `${(Math.min(1, Math.max(0, r)) * 100).toFixed(decimals)}%`;
}
