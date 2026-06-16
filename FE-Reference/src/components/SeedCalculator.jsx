import React, { useState } from 'react';
import { CROPS } from '../lib/contract';
import { cropEfficiency } from '../lib/cropStats';

const rows = CROPS.map((c) => ({ ...c, ...cropEfficiency(c.cost, c.yield, c.growMins) }));
const bestRoi = Math.max(...rows.map((r) => r.roi));

export function SeedCalculator() {
  const [open, setOpen] = useState(false);

  return (
    <div className="liquid-glass rounded-2xl p-4 mb-3">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full text-left text-sm font-medium text-white/80 hover:text-white transition-colors bg-transparent border-none cursor-pointer p-0"
      >
        📊 Crop Stats {open ? '▲' : '▼'}
      </button>

      {open && (
        <div className="overflow-x-auto mt-3">
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr className="text-white/50">
                <th className="text-left py-1.5 px-2 border-b border-white/10 font-medium">Crop</th>
                <th className="text-left py-1.5 px-2 border-b border-white/10 font-medium">Cost</th>
                <th className="text-left py-1.5 px-2 border-b border-white/10 font-medium">Yield</th>
                <th className="text-left py-1.5 px-2 border-b border-white/10 font-medium">Time</th>
                <th className="text-left py-1.5 px-2 border-b border-white/10 font-medium">Profit</th>
                <th className="text-left py-1.5 px-2 border-b border-white/10 font-medium">SEED/min</th>
                <th className="text-left py-1.5 px-2 border-b border-white/10 font-medium">ROI</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className={r.roi === bestRoi ? 'text-green-400' : 'text-white/70'}>
                  <td className="py-1.5 px-2">{r.emoji} {r.name}</td>
                  <td className="py-1.5 px-2">{r.cost}</td>
                  <td className="py-1.5 px-2">{r.yield}</td>
                  <td className="py-1.5 px-2">{r.growMins}m</td>
                  <td className="py-1.5 px-2">+{r.profit}</td>
                  <td className="py-1.5 px-2">{r.seedPerMin.toFixed(2)}</td>
                  <td className="py-1.5 px-2">{r.roi}% {r.roi === bestRoi ? '⭐' : ''}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
