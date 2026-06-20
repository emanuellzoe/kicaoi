import { describe, it, expect, vi, afterEach } from "vitest";
import { getStreak, recordHarvest } from "@/lib/streak";

const ADDR = "0xAbCdEf0000000000000000000000000000000001";
const DAY = 86_400_000;

afterEach(() => {
  vi.useRealTimers();
  localStorage.clear();
});

describe("recordHarvest / getStreak", () => {
  it("starts a streak at 1 on first harvest", () => {
    expect(recordHarvest(ADDR)).toBe(1);
    expect(getStreak(ADDR)).toBe(1);
  });

  it("is idempotent within the same day", () => {
    recordHarvest(ADDR);
    expect(recordHarvest(ADDR)).toBe(1);
  });

  it("increments when harvesting on consecutive days", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-01-01T12:00:00Z"));
    expect(recordHarvest(ADDR)).toBe(1);
    vi.setSystemTime(new Date("2026-01-02T12:00:00Z"));
    expect(recordHarvest(ADDR)).toBe(2);
  });

  it("resets to 1 after skipping a day", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-01-01T12:00:00Z"));
    recordHarvest(ADDR);
    vi.setSystemTime(new Date("2026-01-03T12:00:00Z"));
    expect(recordHarvest(ADDR)).toBe(1);
  });

  it("treats addresses case-insensitively", () => {
    recordHarvest(ADDR);
    expect(getStreak(ADDR.toLowerCase())).toBe(1);
  });
});

describe("getStreak", () => {
  it("returns 0 when nothing is stored", () => {
    expect(getStreak(ADDR)).toBe(0);
  });

  it("returns 0 for corrupt or wrong-shaped stored data", () => {
    localStorage.setItem("kicaoi_streak_" + ADDR.toLowerCase(), "not json");
    expect(getStreak(ADDR)).toBe(0);
    localStorage.setItem("kicaoi_streak_" + ADDR.toLowerCase(), "5");
    expect(getStreak(ADDR)).toBe(0);
    localStorage.setItem(
      "kicaoi_streak_" + ADDR.toLowerCase(),
      JSON.stringify({ lastDate: 123, count: "x" })
    );
    expect(getStreak(ADDR)).toBe(0);
  });

  it("recovers cleanly from corrupt data on the next harvest", () => {
    localStorage.setItem("kicaoi_streak_" + ADDR.toLowerCase(), "garbage");
    expect(recordHarvest(ADDR)).toBe(1);
  });

  it("returns 0 once the streak has expired", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-01-01T12:00:00Z"));
    recordHarvest(ADDR);
    vi.setSystemTime(new Date(Date.now() + 3 * DAY));
    expect(getStreak(ADDR)).toBe(0);
  });
});
