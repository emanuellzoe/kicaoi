/** Shared display-formatting utilities for addresses, numbers, and SEED amounts. */

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
  const n = typeof amount === "bigint" ? Number(amount) : amount;
  const formatted = n.toLocaleString();
  return showUnit ? `${formatted} SEED` : formatted;
}

/**
 * Formats a CELO balance to a fixed number of decimal places.
 * Example: 1.234567 → "1.2346 CELO"
 */
export function formatCelo(amount: number, decimals = 4, showUnit = true): string {
  const formatted = amount.toFixed(decimals);
  return showUnit ? `${formatted} CELO` : formatted;
}

/**
 * Formats a large number with compact notation.
 * Example: 12345 → "12.3K", 1234567 → "1.23M"
 */
export function formatCompact(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toString();
}

/**
 * Formats a percentage value clamped to [0, 100].
 * Example: 0.756 → "75.6%"
 */
export function formatPercent(ratio: number, decimals = 1): string {
  return `${(Math.min(1, Math.max(0, ratio)) * 100).toFixed(decimals)}%`;
}
