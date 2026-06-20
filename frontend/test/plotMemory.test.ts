import { describe, it, expect, afterEach } from "vitest";
import { rememberCrop, recallCrop, clearPlotMemory } from "@/lib/plotMemory";

afterEach(() => {
  clearPlotMemory();
  localStorage.clear();
});

describe("recallCrop", () => {
  it("defaults to Wheat (id 1) when nothing is stored", () => {
    expect(recallCrop(0)).toBe(1);
  });

  it("returns the remembered crop for a plot", () => {
    rememberCrop(3, 7);
    expect(recallCrop(3)).toBe(7);
  });

  it("keeps per-plot memory independent", () => {
    rememberCrop(1, 5);
    rememberCrop(2, 9);
    expect(recallCrop(1)).toBe(5);
    expect(recallCrop(2)).toBe(9);
  });

  it("overwrites a previous value for the same plot", () => {
    rememberCrop(1, 5);
    rememberCrop(1, 8);
    expect(recallCrop(1)).toBe(8);
  });
});

describe("corrupt storage", () => {
  it("falls back to defaults when the stored value is not an object", () => {
    localStorage.setItem("kicaoi:lastCrop", "5");
    expect(recallCrop(1)).toBe(1);
  });

  it("still allows remembering a crop after corrupt data", () => {
    localStorage.setItem("kicaoi:lastCrop", "[1,2,3]");
    expect(() => rememberCrop(1, 4)).not.toThrow();
    expect(recallCrop(1)).toBe(4);
  });
});

describe("clearPlotMemory", () => {
  it("resets all plots back to the default", () => {
    rememberCrop(1, 5);
    clearPlotMemory();
    expect(recallCrop(1)).toBe(1);
  });
});
