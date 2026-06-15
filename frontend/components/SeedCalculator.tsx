"use client";

import { useState } from "react";
import { CROPS } from "@/lib/contract";
import { cropEfficiency } from "@/lib/cropStats";

const rows = CROPS.map((c) => ({ ...c, ...cropEfficiency(c.cost, c.yield, c.growMins) }));
const bestRoi = Math.max(...rows.map((r) => r.roi));

export function SeedCalculator() {
  const [open, setOpen] = useState(false);

  return (
    <div className="card">
      <button
        className="calc-toggle"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        📊 Crop Stats {open ? "▲" : "▼"}
      </button>

      {open && (
        <table className="calc-table mt">
          <thead>
            <tr>
              <th>Crop</th>
              <th>Cost</th>
              <th>Yield</th>
              <th>Time</th>
              <th>Profit</th>
              <th>SEED/min</th>
              <th>ROI</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className={r.roi === bestRoi ? "best-row" : ""}>
                <td>{r.emoji} {r.name}</td>
                <td>{r.cost}</td>
                <td>{r.yield}</td>
                <td>{r.growMins}m</td>
                <td>+{r.profit}</td>
                <td>{r.seedPerMin.toFixed(2)}</td>
                <td>{r.roi}% {r.roi === bestRoi ? "⭐" : ""}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
