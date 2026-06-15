"use client";
import { useCallback } from "react";
import { rememberCrop, recallCrop, clearPlotMemory } from "@/lib/plotMemory";

export function usePlotMemory(plotId: number) {
  const remember = useCallback((cropId: number) => rememberCrop(plotId, cropId), [plotId]);
  const recall = useCallback(() => recallCrop(plotId), [plotId]);
  return { remember, recall, clearAll: clearPlotMemory };
}
