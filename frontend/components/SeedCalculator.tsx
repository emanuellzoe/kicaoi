"use client";

import { useState } from "react";
import { CROPS } from "@/lib/contract";
import { cropEfficiency } from "@/lib/cropStats";

const rows = CROPS.map((c) => ({ ...c, ...cropEfficiency(c.cost, c.yield, c.growMins) }));
const bestRoi = Math.max(...rows.map((r) => r.roi));

export function SeedCalculator() {
  const [open, setOpen] = useState(false);

  return (
    <div className="liquid-glass rounded-2xl p-4">
      <button
        className="w-full text-left text-xs text-white/40 font-body bg-transparent border-none cursor-pointer flex items-center justify-between"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        <span>📊 Crop Stats</span>
        <span className="text-white/30">{open ? "▲" : "▼"}</span>
      </button>

      {open && (
        <div className="mt-3 overflow-x-auto">
          <table className="w-full text-xs font-body border-collapse" aria-label="Crop efficiency comparison">
            <thead>
              <tr className="text-white/40 text-left">
                <th scope="col" className="py-1.5 pr-2 font-medium">Crop</th>
                <th scope="col" className="py-1.5 px-2 font-medium">Cost</th>
                <th scope="col" className="py-1.5 px-2 font-medium">Yield</th>
                <th scope="col" className="py-1.5 px-2 font-medium">Time</th>
                <th scope="col" className="py-1.5 px-2 font-medium">Profit</th>
                <th scope="col" className="py-1.5 px-2 font-medium">SEED/min</th>
                <th scope="col" className="py-1.5 pl-2 font-medium">ROI</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr
                  key={r.id}
                  className={`border-t border-white/5 ${r.roi === bestRoi ? "text-green-400" : "text-white/70"}`}
                >
                  <td className="py-1.5 pr-2 whitespace-nowrap">
                    {r.emoji} {r.name}
                  </td>
                  <td className="py-1.5 px-2">{r.cost}</td>
                  <td className="py-1.5 px-2">{r.yield}</td>
                  <td className="py-1.5 px-2">{r.growMins}m</td>
                  <td className="py-1.5 px-2">+{r.profit}</td>
                  <td className="py-1.5 px-2">{r.seedPerMin.toFixed(2)}</td>
                  <td className="py-1.5 pl-2 whitespace-nowrap">
                    {r.roi}% {r.roi === bestRoi ? "⭐" : ""}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}


// [calc-v] 2