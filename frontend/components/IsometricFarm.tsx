"use client";

import { useEffect, useRef, useCallback } from "react";
import { cropById, CROPS } from "@/lib/contract";

// ─── Constants ────────────────────────────────────────────────────────────────

const TW = 96;
const TH = 48;
const TD = 18;
const CANVAS_H = 420;

// ─── Types ────────────────────────────────────────────────────────────────────

interface PlotState { cropId: number; plantedAt: number; }
interface Firefly { x: number; y: number; vx: number; vy: number; life: number; maxLife: number; size: number; }
interface Star { x: number; y: number; size: number; twinkleOffset: number; }

export interface IsometricFarmProps {
  plots: PlotState[];
  plotCount: number;
  now: number;
  busy: boolean;
  selectedCropId: number;
  onSelectCrop: (id: number) => void;
  onPlant: (plotId: number) => void;
  onHarvest: (plotId: number) => void;
}

// ─── Grid math ────────────────────────────────────────────────────────────────

// The field is always rendered as at least a 3×3 plot of land. Plots the player
// owns are filled in; the remaining tiles render as empty (lockable) land so the
// farm reads as a proper field rather than a lonely row.
const GRID_COLS = 3;
const MIN_GRID_ROWS = 3;

function gridLayout(n: number) {
  const cols = GRID_COLS;
  const rows = Math.max(MIN_GRID_ROWS, Math.ceil(Math.max(n, 1) / cols));
  return { cols, rows };
}

function toScreen(col: number, row: number, ox: number, oy: number) {
  return { x: ox + (col - row) * (TW / 2), y: oy + (col + row) * (TH / 2) };
}

function fromScreen(sx: number, sy: number, ox: number, oy: number) {
  const dx = sx - ox, dy = sy - oy;
  return { col: dx / TW + dy / TH, row: dy / TH - dx / TW };
}

function calcOrigin(w: number, h: number, gc: number, gr: number) {
  return { ox: w / 2, oy: h * 0.45 - (gc + gr - 2) * (TH / 4) };
}

function growthProgress(cropId: number, plantedAt: number, nowSec: number) {
  if (cropId === 0 || plantedAt === 0) return 0;
  const crop = cropById(cropId);
  if (!crop) return 0;
  return Math.min(1, (nowSec - plantedAt) / (crop.growMins * 60));
}

// ─── Tile drawing ─────────────────────────────────────────────────────────────

function drawIsoBox(
  ctx: CanvasRenderingContext2D,
  x: number, y: number,
  top: string, left: string, right: string,
  depth = TD,
) {
  const hw = TW / 2, hh = TH / 2;
  ctx.beginPath();
  ctx.moveTo(x, y - hh); ctx.lineTo(x + hw, y);
  ctx.lineTo(x, y + hh); ctx.lineTo(x - hw, y);
  ctx.closePath(); ctx.fillStyle = top; ctx.fill();

  ctx.beginPath();
  ctx.moveTo(x - hw, y); ctx.lineTo(x, y + hh);
  ctx.lineTo(x, y + hh + depth); ctx.lineTo(x - hw, y + depth);
  ctx.closePath(); ctx.fillStyle = left; ctx.fill();

  ctx.beginPath();
  ctx.moveTo(x + hw, y); ctx.lineTo(x, y + hh);
  ctx.lineTo(x, y + hh + depth); ctx.lineTo(x + hw, y + depth);
  ctx.closePath(); ctx.fillStyle = right; ctx.fill();
}

function drawGrassTile(ctx: CanvasRenderingContext2D, x: number, y: number, hovered: boolean, locked: boolean) {
  if (locked) {
    // Empty / not-yet-unlocked land: muted grass so the field still reads as a
    // 3×3 plot of land rather than a void, but clearly dimmer than active tiles.
    drawIsoBox(ctx, x, y, "#1d3b1d", "#0e220e", "#122a12");
    return;
  }
  const [t, l, r] = hovered
    ? ["#3d8f3d", "#1e4e1e", "#245024"]
    : ["#2e7a2e", "#164216", "#1b4a1b"];
  drawIsoBox(ctx, x, y, t, l, r);
}

function drawSoilPatch(ctx: CanvasRenderingContext2D, x: number, y: number, hovered: boolean) {
  const hw = TW / 2 - 9, hh = TH / 2 - 5;
  ctx.beginPath();
  ctx.moveTo(x, y - hh); ctx.lineTo(x + hw, y);
  ctx.lineTo(x, y + hh); ctx.lineTo(x - hw, y);
  ctx.closePath();
  const grad = ctx.createLinearGradient(x - hw, y - hh, x + hw, y + hh);
  grad.addColorStop(0, hovered ? "#8a6040" : "#7a5432");
  grad.addColorStop(0.5, hovered ? "#7a5535" : "#6a4928");
  grad.addColorStop(1, hovered ? "#6a4a2a" : "#5a3e22");
  ctx.fillStyle = grad; ctx.fill();

  ctx.strokeStyle = "rgba(0,0,0,0.18)"; ctx.lineWidth = 1;
  for (let row = -2; row <= 2; row++) {
    const ry = y + row * 6.5;
    const mx2 = hw - Math.abs(row) * (hw / 2.8);
    ctx.beginPath(); ctx.moveTo(x - mx2, ry); ctx.lineTo(x + mx2, ry); ctx.stroke();
  }
}

// ─── Crop sprites ─────────────────────────────────────────────────────────────

function drawCrop(ctx: CanvasRenderingContext2D, cx: number, cy: number, cropId: number, p: number, t: number) {
  const base = cy - 2;
  const sway = Math.sin(t * 0.0012) * Math.min(p * 5, 4);
  if (cropId === 1) drawWheat(ctx, cx, base, p, sway, t);
  else if (cropId === 2) drawPumpkin(ctx, cx, base, p, sway, t);
  else if (cropId === 3) drawGolden(ctx, cx, base, p, sway, t);
}

// Draws one wheat ear (the grain head) starting at the stem tip and rising
// upward, with paired kernels and fine awns (bristles) once it ripens. Ripe
// ears lean/droop in the wind direction for a natural heavy-grain look.
function drawWheatEar(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, lean: number, ripe: number,
  grainColor: string, awnColor: string,
) {
  const earLen = 9 + ripe * 4;
  const segs = 5;
  for (let s = 0; s <= segs; s++) {
    const frac = s / segs;
    const gy = y - earLen * (1 - frac); // build from neck (bottom) up to tip
    // tip (frac→0) bends over most under the weight of ripe grain; neck stays put
    const droop = lean * (1 - frac) * (0.35 + ripe * 0.65);
    const gx = x + droop;
    const w = 2.3 * (1 - frac * 0.35);
    ctx.fillStyle = grainColor;
    ctx.beginPath(); ctx.ellipse(gx - 1.5, gy, w, 1.7, -0.6, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(gx + 1.5, gy, w, 1.7, 0.6, 0, Math.PI * 2); ctx.fill();
    if (ripe > 0.25) {
      const awnLen = 4 + ripe * 4;
      ctx.strokeStyle = awnColor; ctx.lineWidth = 0.7;
      ctx.beginPath(); ctx.moveTo(gx - 1.5, gy); ctx.lineTo(gx - 2.5 + droop * 0.3, gy - awnLen); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(gx + 1.5, gy); ctx.lineTo(gx + 2.5 + droop * 0.3, gy - awnLen); ctx.stroke();
    }
  }
}

function drawWheat(ctx: CanvasRenderingContext2D, cx: number, cy: number, p: number, sway: number, t: number) {
  // Seed → tiny sprout
  if (p < 0.05) {
    ctx.beginPath(); ctx.ellipse(cx, cy, 3, 1.8, 0.3, 0, Math.PI * 2);
    ctx.fillStyle = "#6b4a18"; ctx.fill();
    if (p > 0.02) {
      ctx.strokeStyle = "#4f9a2e"; ctx.lineWidth = 1.3;
      ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + sway * 0.3, cy - 5); ctx.stroke();
    }
    return;
  }

  // ripeness: 0 = green stalks, 1 = fully golden grain
  const ripe = Math.max(0, Math.min(1, (p - 0.45) / 0.45));
  const stemColor = `rgb(${Math.floor(80 + ripe * 150)},${Math.floor(145 - ripe * 25)},${Math.floor(45 - ripe * 30)})`;
  const grainColor = `rgb(${Math.floor(120 + ripe * 135)},${Math.floor(155 + ripe * 50)},${Math.floor(40 - ripe * 10)})`;
  const awnColor = `rgba(${Math.floor(190 + ripe * 65)},${Math.floor(180 + ripe * 40)},90,${0.45 + ripe * 0.4})`;

  // A small clump of stalks spread across the iso soil patch (back rows first).
  const cols = 3, rows = 3;
  const spreadX = 15, spreadY = 6;
  const maxH = 5 + p * 24;

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const idx = row * cols + col;
      const jx = Math.sin(idx * 12.9898) * 2.5;
      const jy = Math.cos(idx * 78.233) * 1.2;
      const ix = col - (cols - 1) / 2;
      const iy = row - (rows - 1) / 2;
      const bx = cx + (ix - iy) * spreadX * 0.5 + jx;
      const by = cy + (ix + iy) * spreadY * 0.5 + jy;

      const hVar = 0.78 + (Math.sin(idx * 3.1) * 0.5 + 0.5) * 0.42;
      const h = maxH * hVar;
      const ph = sway + Math.sin(t * 0.0016 + idx * 1.7) * (1 + ripe);
      const tipX = bx + ph, tipY = by - h;

      // stem
      ctx.strokeStyle = stemColor; ctx.lineWidth = 1.4;
      ctx.beginPath(); ctx.moveTo(bx, by);
      ctx.quadraticCurveTo(bx + ph * 0.4, by - h * 0.5, tipX, tipY); ctx.stroke();

      // a slim leaf blade while still greenish
      if (p > 0.18 && ripe < 0.75) {
        const side = idx % 2 === 0 ? 1 : -1;
        ctx.strokeStyle = `rgb(45,${Math.floor(125 - ripe * 30)},38)`; ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.moveTo(bx, by - h * 0.35);
        ctx.quadraticCurveTo(bx + side * 6, by - h * 0.46, bx + side * 9, by - h * 0.28); ctx.stroke();
      }

      // grain ear once the stalk is established
      if (p > 0.3) drawWheatEar(ctx, tipX, tipY, ph, ripe, grainColor, awnColor);
    }
  }

  if (p >= 0.95) {
    const alpha = 0.2 + Math.sin(t * 0.004) * 0.1;
    const glow = ctx.createRadialGradient(cx, cy - maxH * 0.7, 0, cx, cy - maxH * 0.7, 30);
    glow.addColorStop(0, `rgba(255,210,30,${alpha})`); glow.addColorStop(1, "rgba(255,210,30,0)");
    ctx.fillStyle = glow; ctx.beginPath();
    ctx.ellipse(cx, cy - maxH * 0.7, 30, 24, 0, 0, Math.PI * 2); ctx.fill();
  }
}

function drawPumpkin(ctx: CanvasRenderingContext2D, cx: number, cy: number, p: number, sway: number, t: number) {
  if (p < 0.04) {
    ctx.beginPath(); ctx.ellipse(cx, cy, 3.5, 2, 0.3, 0, Math.PI * 2);
    ctx.fillStyle = "#7a5010"; ctx.fill(); return;
  }
  if (p < 0.18) {
    ctx.beginPath(); ctx.moveTo(cx, cy);
    ctx.quadraticCurveTo(cx + 4, cy - 8, cx + sway, cy - 16);
    ctx.strokeStyle = "#3a8a18"; ctx.lineWidth = 2; ctx.stroke();
    ctx.beginPath(); ctx.ellipse(cx + sway + 6, cy - 11, 5.5, 3, 0.6, 0, Math.PI * 2);
    ctx.fillStyle = "#3a8a18"; ctx.fill(); return;
  }
  const size = 7 + p * 28;
  const bodyY = cy - size * 0.65;
  const sw = sway * 0.4;
  for (let l = 0; l < 3; l++) {
    const lx = cx + (l - 1) * size * 0.55 + sw;
    const leafAlpha = p < 0.85 ? 1 : 1 - (p - 0.85) / 0.15;
    ctx.beginPath(); ctx.ellipse(lx, cy - 4, size * 0.4, size * 0.25, (l - 1) * 0.4, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(30,110,15,${leafAlpha})`; ctx.fill();
  }
  const orange = Math.max(0, (p - 0.5) / 0.5);
  const rr = Math.floor(30 + orange * 225), gg = Math.floor(120 - orange * 80);
  for (let seg = -1; seg <= 1; seg++) {
    const segX = cx + seg * size * 0.38 + sw;
    const bright = seg === 0 ? 1 : 0.78;
    ctx.beginPath(); ctx.ellipse(segX, bodyY, size * 0.44, size * 0.58, 0, 0, Math.PI * 2);
    ctx.fillStyle = `rgb(${Math.floor(rr * bright)},${Math.floor(gg * bright)},10)`; ctx.fill();
  }
  if (orange > 0.3) {
    ctx.beginPath(); ctx.ellipse(cx + sw - 4, bodyY - size * 0.2, size * 0.12, size * 0.2, -0.3, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255,200,100,${orange * 0.28})`; ctx.fill();
  }
  ctx.beginPath(); ctx.moveTo(cx + sw, bodyY - size * 0.55);
  ctx.bezierCurveTo(cx + sw + 4, bodyY - size * 0.65, cx + sw + 8, bodyY - size * 0.7, cx + sw + 5, bodyY - size * 0.8);
  ctx.strokeStyle = "#5a3010"; ctx.lineWidth = 3; ctx.stroke();
  if (p > 0.4) {
    ctx.beginPath(); ctx.arc(cx + sw + 7, bodyY - size * 0.68, 5, 0, Math.PI * 1.5);
    ctx.strokeStyle = "#3a8018"; ctx.lineWidth = 1.5; ctx.stroke();
  }
  if (p >= 0.95) {
    const alpha = 0.28 + Math.sin(t * 0.004) * 0.14;
    const glow = ctx.createRadialGradient(cx, bodyY, 0, cx, bodyY, 32);
    glow.addColorStop(0, `rgba(255,120,20,${alpha})`); glow.addColorStop(1, "rgba(255,80,10,0)");
    ctx.fillStyle = glow; ctx.beginPath();
    ctx.ellipse(cx, bodyY, 32, 28, 0, 0, Math.PI * 2); ctx.fill();
  }
}

function drawGolden(ctx: CanvasRenderingContext2D, cx: number, cy: number, p: number, sway: number, t: number) {
  if (p < 0.04) {
    const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, 7);
    glow.addColorStop(0, "rgba(255,220,50,0.8)"); glow.addColorStop(1, "rgba(255,220,50,0)");
    ctx.fillStyle = glow; ctx.beginPath(); ctx.arc(cx, cy, 7, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(cx, cy, 2.5, 0, Math.PI * 2); ctx.fillStyle = "#FFD700"; ctx.fill(); return;
  }
  const height = 12 + p * 42;
  const tipX = cx + sway, tipY = cy - height;
  const numSparkles = Math.floor(3 + p * 5);
  for (let s = 0; s < numSparkles; s++) {
    const angle = (s / numSparkles) * Math.PI * 2 + t * 0.002 + s;
    const dist = 8 + p * 18;
    const sx = cx + Math.cos(angle) * dist, sy = cy - height * 0.4 + Math.sin(angle) * dist * 0.4;
    const a2 = (0.4 + Math.sin(t * 0.006 + s * 1.3) * 0.35) * Math.min(1, p * 3);
    ctx.beginPath(); ctx.arc(sx, sy, 1.5 + Math.sin(t * 0.005 + s) * 0.8, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255,220,50,${a2})`; ctx.fill();
  }
  const goldAmount = Math.max(0, (p - 0.4) / 0.6);
  const stemR = Math.floor(40 + goldAmount * 200), stemG = Math.floor(160 - goldAmount * 30);
  ctx.beginPath(); ctx.moveTo(cx, cy);
  ctx.quadraticCurveTo(cx + sway * 0.5, cy - height * 0.6, tipX, tipY);
  ctx.strokeStyle = `rgb(${stemR},${stemG},30)`; ctx.lineWidth = 3; ctx.stroke();
  if (p > 0.2) {
    for (let l = 0; l < 2; l++) {
      const ly = cy - height * (0.35 + l * 0.25), lx = cx + sway * (0.3 + l * 0.2);
      const side = l % 2 === 0 ? 1 : -1;
      ctx.beginPath(); ctx.ellipse(lx + side * 10, ly, 9, 3.5, side * 0.4, 0, Math.PI * 2);
      ctx.fillStyle = `rgb(${stemR},${stemG},30)`; ctx.fill();
    }
  }
  if (p > 0.4) {
    const hp = (p - 0.4) / 0.6;
    const pColor = `rgb(${Math.floor(220 + hp * 35)},${Math.floor(170 + hp * 30)},20)`;
    for (let pp = 0; pp < 6; pp++) {
      const angle = (pp / 6) * Math.PI * 2 + t * 0.001;
      ctx.beginPath(); ctx.moveTo(tipX, tipY);
      ctx.lineTo(tipX + Math.cos(angle) * (4 + hp * 9), tipY + Math.sin(angle) * (4 + hp * 9) * 0.6);
      ctx.strokeStyle = pColor; ctx.lineWidth = 2.5; ctx.stroke();
    }
    ctx.beginPath(); ctx.arc(tipX, tipY, 3 + hp * 3, 0, Math.PI * 2);
    ctx.fillStyle = pColor; ctx.fill();
  }
  if (p >= 0.95) {
    const alpha = 0.28 + Math.sin(t * 0.004) * 0.18;
    const glow = ctx.createRadialGradient(tipX, tipY, 0, tipX, tipY, 30);
    glow.addColorStop(0, `rgba(255,220,50,${alpha})`); glow.addColorStop(1, "rgba(255,220,50,0)");
    ctx.fillStyle = glow; ctx.beginPath(); ctx.arc(tipX, tipY, 30, 0, Math.PI * 2); ctx.fill();
  }
}

// ─── Tooltip ──────────────────────────────────────────────────────────────────

function drawTooltip(ctx: CanvasRenderingContext2D, text: string, x: number, y: number) {
  ctx.font = "11px -apple-system, BlinkMacSystemFont, sans-serif";
  const tw = ctx.measureText(text).width;
  const pad = 8, r = 5, bx = x - tw / 2 - pad, by = y - 28, bw = tw + pad * 2, bh = 20;
  ctx.beginPath();
  ctx.moveTo(bx + r, by); ctx.lineTo(bx + bw - r, by);
  ctx.arcTo(bx + bw, by, bx + bw, by + r, r); ctx.lineTo(bx + bw, by + bh - r);
  ctx.arcTo(bx + bw, by + bh, bx + bw - r, by + bh, r); ctx.lineTo(bx + r, by + bh);
  ctx.arcTo(bx, by + bh, bx, by + bh - r, r); ctx.lineTo(bx, by + r);
  ctx.arcTo(bx, by, bx + r, by, r); ctx.closePath();
  ctx.fillStyle = "rgba(0,0,0,0.8)"; ctx.fill();
  ctx.fillStyle = "rgba(255,255,255,0.92)"; ctx.textAlign = "center";
  ctx.fillText(text, x, by + 13.5); ctx.textAlign = "left";
}

// ─── Component ────────────────────────────────────────────────────────────────

function countReadyPlots(plots: PlotState[], nowSec: number): number {
  return plots.filter((p) => {
    if (!p || p.cropId === 0 || p.plantedAt === 0) return false;
    const crop = cropById(p.cropId);
    return crop ? nowSec >= p.plantedAt + crop.growMins * 60 : false;
  }).length;
}

export function IsometricFarm({
  plots, plotCount, busy, selectedCropId, onSelectCrop, onPlant, onHarvest,
}: IsometricFarmProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const hoverRef = useRef<{ col: number; row: number } | null>(null);
  const animRef = useRef<number>(0);
  const flyRef = useRef<Firefly[]>([]);
  const starsRef = useRef<Star[]>([]);
  const startRef = useRef(Date.now());

  const plotsRef = useRef(plots);
  const plotCountRef = useRef(plotCount);
  const selectedRef = useRef(selectedCropId);
  plotsRef.current = plots;
  plotCountRef.current = plotCount;
  selectedRef.current = selectedCropId;

  // Canvas resize
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const resize = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      canvas.width = parent.clientWidth;
      canvas.height = CANVAS_H;
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas.parentElement!);
    return () => ro.disconnect();
  }, []);

  // Stars + fireflies init
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    starsRef.current = Array.from({ length: 40 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height * 0.55,
      size: 0.5 + Math.random() * 1.2,
      twinkleOffset: Math.random() * Math.PI * 2,
    }));
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    flyRef.current = Array.from({ length: 14 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height * 0.8 + canvas.height * 0.1,
      vx: (Math.random() - 0.5) * 0.5,
      vy: (Math.random() - 0.5) * 0.3,
      life: Math.random() * 200,
      maxLife: 160 + Math.random() * 140,
      size: 1.5 + Math.random() * 1.5,
    }));
  }, []);

  // Animation loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;

    const frame = () => {
      const t = Date.now() - startRef.current;
      const w = canvas.width, h = canvas.height;
      const nowSec = Date.now() / 1000;
      const pc = plotCountRef.current;
      const plts = plotsRef.current;
      const sel = selectedRef.current;
      const { cols: gc, rows: gr } = gridLayout(Math.max(pc, 1));
      const { ox, oy } = calcOrigin(w, h, gc, gr);

      ctx.clearRect(0, 0, w, h);

      // Background — slow day/night cycle (full cycle ~120 seconds)
      const dayPhase = (Math.sin(t * 0.000052) + 1) / 2; // 0=night, 1=day
      const skyTop = `rgb(${Math.floor(4 + dayPhase * 8)},${Math.floor(8 + dayPhase * 22)},${Math.floor(4 + dayPhase * 14)})`;
      const skyMid = `rgb(${Math.floor(13 + dayPhase * 12)},${Math.floor(32 + dayPhase * 28)},${Math.floor(13 + dayPhase * 14)})`;
      const bg = ctx.createRadialGradient(w * 0.5, h * 0.4, 0, w * 0.5, h * 0.4, Math.max(w, h) * 0.9);
      bg.addColorStop(0, skyMid); bg.addColorStop(1, skyTop);
      ctx.fillStyle = bg; ctx.fillRect(0, 0, w, h);

      // Stars — brighter at night, fade during day
      const starAlpha = (1 - dayPhase) * 0.7;
      if (starAlpha > 0.05) {
        for (const s of starsRef.current) {
          const twinkle = 0.5 + Math.sin(t * 0.003 + s.twinkleOffset) * 0.5;
          ctx.beginPath();
          ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(200,220,255,${starAlpha * twinkle})`;
          ctx.fill();
        }
      }

      // Draw in painter's order (back to front)
      const hover = hoverRef.current;
      for (let row = 0; row < gr; row++) {
        for (let col = 0; col < gc; col++) {
          const plotId = row * gc + col;
          const active = plotId < pc;
          const plot = active ? plts[plotId] : undefined;
          const { x, y } = toScreen(col, row, ox, oy);
          const isHov = hover?.col === col && hover?.row === row && active;

          drawGrassTile(ctx, x, y, isHov, !active);
          if (!active) continue;

          drawSoilPatch(ctx, x, y, isHov);

          if (plot && plot.cropId !== 0) {
            const prog = growthProgress(plot.cropId, plot.plantedAt, nowSec);
            const crop = cropById(plot.cropId);
            const isReady = crop ? nowSec >= plot.plantedAt + crop.growMins * 60 : false;

            if (isReady) {
              const pulse = 0.4 + Math.sin(t * 0.005) * 0.25;
              ctx.beginPath();
              ctx.ellipse(x, y + TH / 2 - 1, TW / 2 - 5, TH / 2 - 1, 0, 0, Math.PI * 2);
              ctx.strokeStyle = `rgba(80,255,80,${pulse * 0.7})`; ctx.lineWidth = 2; ctx.stroke();
            }

            // soft drop shadow under the crop
            const shadowAlpha = 0.18 + prog * 0.12;
            ctx.beginPath();
            ctx.ellipse(x, y + 2, (TW / 2 - 10) * (0.4 + prog * 0.6), (TH / 2 - 4) * (0.3 + prog * 0.4), 0, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(0,0,0,${shadowAlpha})`;
            ctx.fill();
            drawCrop(ctx, x, y, plot.cropId, prog, t);

            if (isHov && crop) {
              let label: string;
              if (isReady) {
                label = `✓ Harvest ${crop.name} (+${crop.yield} SEED)`;
              } else {
                const secsLeft = Math.max(0, (plot.plantedAt + crop.growMins * 60) - nowSec);
                const mLeft = Math.ceil(secsLeft / 60);
                const timeStr = mLeft >= 60 ? `${Math.floor(mLeft / 60)}h ${mLeft % 60}m` : `${mLeft}m`;
                label = `${crop.name} ${Math.round(prog * 100)}% · ${timeStr} left`;
              }
              drawTooltip(ctx, label, x, y - TH / 2);
            }
          } else if (isHov && active) {
            const selCrop = cropById(sel);
            if (selCrop) {
              ctx.globalAlpha = 0.35;
              drawCrop(ctx, x, y, sel, 0.08, t);
              ctx.globalAlpha = 1;
              drawTooltip(ctx, `Plant ${selCrop.name} (${selCrop.cost} SEED)`, x, y - TH / 2);
            }
          }
        }
      }

      // Fireflies
      for (const f of flyRef.current) {
        f.x += f.vx + Math.sin(t * 0.001 + f.y * 0.05) * 0.2;
        f.y += f.vy + Math.cos(t * 0.0008 + f.x * 0.05) * 0.15;
        f.vx *= 0.99; f.vy *= 0.99; f.life++;
        if (f.life > f.maxLife || f.x < -10 || f.x > w + 10 || f.y < -10 || f.y > h + 10) {
          f.x = Math.random() * w; f.y = Math.random() * h * 0.7 + h * 0.1;
          f.vx = (Math.random() - 0.5) * 0.5; f.vy = (Math.random() - 0.5) * 0.3;
          f.life = 0; f.maxLife = 160 + Math.random() * 140;
        }
        const phase = f.life / f.maxLife;
        const alpha = Math.sin(phase * Math.PI) * (0.5 + Math.sin(t * 0.006 + f.x * 0.1) * 0.3);
        ctx.beginPath(); ctx.arc(f.x, f.y, f.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(190,240,100,${alpha})`; ctx.fill();
      }

      animRef.current = requestAnimationFrame(frame);
    };

    animRef.current = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(animRef.current);
  }, []);

  // Shared coord converter (used in both move and click)
  const screenToGrid = useCallback((clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    const mx = (clientX - rect.left) * (canvas.width / rect.width);
    const my = (clientY - rect.top) * (canvas.height / rect.height);
    const pc = plotCountRef.current;
    const { cols: gc, rows: gr } = gridLayout(Math.max(pc, 1));
    const { ox, oy } = calcOrigin(canvas.width, canvas.height, gc, gr);
    const { col, row } = fromScreen(mx, my, ox, oy);
    return { ci: Math.round(col), ri: Math.round(row), gc, gr };
  }, []);

  const handleMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const g = screenToGrid(e.clientX, e.clientY);
    if (!g) return;
    const { ci, ri, gc, gr } = g;
    const plotId = ri * gc + ci;
    if (ci >= 0 && ci < gc && ri >= 0 && ri < gr && plotId < plotCountRef.current) {
      hoverRef.current = { col: ci, row: ri };
    } else {
      hoverRef.current = null;
    }
  }, [screenToGrid]);

  const handleLeave = useCallback(() => { hoverRef.current = null; }, []);

  const handleClick = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (busy) return;
    const g = screenToGrid(e.clientX, e.clientY);
    if (!g) return;
    const { ci, ri, gc } = g;
    const plotId = ri * gc + ci;
    if (plotId < 0 || plotId >= plotCountRef.current) return;
    const plot = plotsRef.current[plotId];
    if (!plot || plot.cropId === 0) {
      onPlant(plotId);
    } else {
      const crop = cropById(plot.cropId);
      if (crop && Date.now() / 1000 >= plot.plantedAt + crop.growMins * 60) {
        onHarvest(plotId);
      }
    }
  }, [busy, onPlant, onHarvest, screenToGrid]);

  const handleTouch = useCallback((e: React.TouchEvent<HTMLCanvasElement>) => {
    if (busy || e.touches.length !== 1) return;
    e.preventDefault();
    const touch = e.touches[0];
    const g = screenToGrid(touch.clientX, touch.clientY);
    if (!g) return;
    const { ci, ri, gc, gr } = g;
    if (ci >= 0 && ci < gc && ri >= 0 && ri < gr) {
      hoverRef.current = { col: ci, row: ri };
    }
  }, [busy, screenToGrid]);

  const handleTouchEnd = useCallback((e: React.TouchEvent<HTMLCanvasElement>) => {
    if (busy) return;
    e.preventDefault();
    const touch = e.changedTouches[0];
    const g = screenToGrid(touch.clientX, touch.clientY);
    if (!g) return;
    const { ci, ri, gc } = g;
    const plotId = ri * gc + ci;
    if (plotId < 0 || plotId >= plotCountRef.current) return;
    const plot = plotsRef.current[plotId];
    if (!plot || plot.cropId === 0) {
      onPlant(plotId);
    } else {
      const crop = cropById(plot.cropId);
      if (crop && Date.now() / 1000 >= plot.plantedAt + crop.growMins * 60) {
        onHarvest(plotId);
      }
    }
    hoverRef.current = null;
  }, [busy, onPlant, onHarvest, screenToGrid]);

  return (
    <div className="relative rounded-2xl overflow-hidden border border-white/10">
      <canvas
        ref={canvasRef}
        role="img"
        aria-label={`Isometric farm view with ${plotCount} plot${plotCount !== 1 ? "s" : ""}. Click a plot to plant or harvest.`}
        className="w-full block"
        style={{ height: CANVAS_H, cursor: busy ? "wait" : "pointer", touchAction: "none" }}
        onMouseMove={handleMove}
        onMouseLeave={handleLeave}
        onClick={handleClick}
        onTouchStart={handleTouch}
        onTouchMove={handleTouch}
        onTouchEnd={handleTouchEnd}
      />
      {/* Crop selector overlay */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2 bg-black/70 backdrop-blur-md rounded-full px-3 py-2 border border-white/10">
        {CROPS.map((c) => (
          <button
            key={c.id}
            onClick={() => onSelectCrop(c.id)}
            title={`${c.name} — ${c.cost} SEED — grows in ${c.growMins >= 60 ? `${c.growMins / 60}h` : `${c.growMins}m`} — yields ${c.yield} SEED`}
            aria-pressed={selectedCropId === c.id}
            className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-all border-none cursor-pointer ${
              selectedCropId === c.id
                ? "bg-green-500 text-black scale-105 shadow-lg shadow-green-500/40"
                : "bg-white/10 text-white/70 hover:bg-white/20 hover:scale-102"
            }`}
          >
            <span>{c.emoji}</span>
            <span className="hidden sm:inline font-body">{c.name}</span>
            <span className="opacity-60 text-[10px] font-body">{c.cost}S</span>
          </button>
        ))}
      </div>
      {/* Plot count */}
      <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-sm rounded-full px-3 py-1 text-xs text-white/50 border border-white/10 font-body">
        {plotCount} plot{plotCount !== 1 ? "s" : ""}
      </div>
      {/* Harvest-ready badge */}
      {(() => {
        const ready = countReadyPlots(plots, Date.now() / 1000);
        return ready > 0 ? (
          <div className="absolute top-3 right-3 bg-green-500 text-black rounded-full px-2.5 py-1 text-xs font-bold flex items-center gap-1 shadow-lg shadow-green-500/30 animate-pulse">
            <span>✓</span>
            <span>{ready} ready</span>
          </div>
        ) : null;
      })()}
    </div>
  );
}
