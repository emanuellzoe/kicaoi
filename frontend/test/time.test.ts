import { describe, it, expect } from "vitest";
import { formatCountdown, growthPhase, formatDuration, formatHarvestTime } from "@/lib/time";

describe("formatCountdown", () => {
  it("returns 'Ready' for zero or negative seconds", () => {
    expect(formatCountdown(0)).toBe("Ready");
    expect(formatCountdown(-10)).toBe("Ready");
  });

  it("returns 'Ready' for non-finite input", () => {
    expect(formatCountdown(NaN)).toBe("Ready");
    expect(formatCountdown(Infinity)).toBe("Ready");
  });

  it("formats durations over an hour as 'Hh MMm'", () => {
    expect(formatCountdown(3661)).toBe("1h 01m");
  });

  it("formats sub-hour durations as 'MM:SS'", () => {
    expect(formatCountdown(125)).toBe("02:05");
  });
});

describe("growthPhase", () => {
  it("classifies progress into named phases", () => {
    expect(growthPhase(0)).toBe("seedling");
    expect(growthPhase(0.19)).toBe("seedling");
    expect(growthPhase(0.2)).toBe("growing");
    expect(growthPhase(0.6)).toBe("mature");
    expect(growthPhase(1)).toBe("ready");
    expect(growthPhase(1.5)).toBe("ready");
  });
});

describe("formatDuration", () => {
  it("returns '0s' for zero", () => {
    expect(formatDuration(0)).toBe("0s");
  });

  it("clamps negative input to '0s'", () => {
    expect(formatDuration(-5)).toBe("0s");
  });

  it("formats minutes and seconds", () => {
    expect(formatDuration(90)).toBe("1m 30s");
  });

  it("formats hours and minutes, omitting zero parts", () => {
    expect(formatDuration(3661)).toBe("1h 1m");
    expect(formatDuration(3600)).toBe("1h");
  });

  it("formats bare seconds", () => {
    expect(formatDuration(45)).toBe("45s");
  });
});

describe("formatHarvestTime", () => {
  // Output is locale/timezone dependent, so assert structure rather than a
  // fixed clock value: it should be a non-empty short time string and should
  // advance when the grow duration grows.
  it("returns a non-empty time string", () => {
    expect(formatHarvestTime(0, 60).length).toBeGreaterThan(0);
  });

  it("is stable for the same inputs", () => {
    expect(formatHarvestTime(1000, 30)).toBe(formatHarvestTime(1000, 30));
  });

  it("differs when the ready time crosses into a new hour", () => {
    const planted = 0;
    expect(formatHarvestTime(planted, 0)).not.toBe(formatHarvestTime(planted, 120));
  });
});
