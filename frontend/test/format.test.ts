import { describe, it, expect } from "vitest";
import {
  formatAddress,
  formatSeed,
  formatCelo,
  formatCompact,
  formatPercent,
} from "@/lib/format";

describe("formatAddress", () => {
  it("shortens a full address with an ellipsis", () => {
    expect(formatAddress("0x1234567890abcdef1234567890abcdef12345678")).toBe("0x1234…5678");
  });

  it("returns an empty string for empty input", () => {
    expect(formatAddress("")).toBe("");
  });

  it("returns the input unchanged when shorter than prefix+suffix", () => {
    expect(formatAddress("0x1234")).toBe("0x1234");
  });

  it("respects custom prefix/suffix lengths", () => {
    expect(formatAddress("0xABCDEF123456", 4, 2)).toBe("0xAB…56");
  });
});

describe("formatSeed", () => {
  // Output is pinned to the en-US locale, so grouping is deterministic
  // regardless of the host locale (guards against SSR hydration mismatch).
  it("groups with commas and appends the SEED unit", () => {
    expect(formatSeed(12345)).toBe("12,345 SEED");
  });

  it("omits the unit when showUnit is false", () => {
    expect(formatSeed(12345, false)).toBe("12,345");
  });

  it("accepts bigint amounts", () => {
    expect(formatSeed(1000n)).toBe("1,000 SEED");
  });
});

describe("formatCelo", () => {
  it("formats to four decimals by default", () => {
    expect(formatCelo(1.234567)).toBe("1.2346 CELO");
  });

  it("honours a custom decimal count and showUnit flag", () => {
    expect(formatCelo(1.234567, 2, false)).toBe("1.23");
  });
});

describe("formatCompact", () => {
  it("formats millions", () => {
    expect(formatCompact(1_234_567)).toBe(`${(1_234_567 / 1_000_000).toFixed(2)}M`);
  });

  it("formats thousands", () => {
    expect(formatCompact(12_345)).toBe(`${(12_345 / 1_000).toFixed(1)}K`);
  });

  it("leaves small numbers untouched", () => {
    expect(formatCompact(999)).toBe("999");
  });

  it("compacts large negative magnitudes with a sign", () => {
    expect(formatCompact(-1_500_000)).toBe("-1.50M");
    expect(formatCompact(-12_345)).toBe("-12.3K");
  });

  it("leaves small negative numbers untouched", () => {
    expect(formatCompact(-999)).toBe("-999");
  });
});

describe("formatPercent", () => {
  it("converts a ratio to a percentage", () => {
    expect(formatPercent(0.756)).toBe("75.6%");
  });

  it("clamps ratios above 1 and below 0", () => {
    expect(formatPercent(1.5)).toBe("100.0%");
    expect(formatPercent(-0.5)).toBe("0.0%");
  });
});
