/**
 * Auto Consolidate & Farm — Opsi B
 *
 * Flow:
 *   1. Tunggu gas price <= MAX_GWEI
 *   2. Sweep semua CELO dari 1000 wallet → funder
 *   3. Distribute ke 50 wallet pertama (0.14 CELO masing-masing)
 *   4. Farm loop setiap 6 menit (wheat grow time = 5 menit)
 *
 * Stop: Ctrl+C
 */
import "dotenv/config";
import { createPublicClient, http, formatEther, formatGwei, parseGwei, parseEther } from "viem";
import { celo } from "viem/chains";
import { execSync } from "child_process";

const rpc     = process.env.RPC_URL || "https://forno.celo.org";
const pub     = createPublicClient({ chain: celo, transport: http(rpc, { timeout: 30_000 }) });

const MAX_GWEI          = parseGwei("10");
const POLL_MS           = 30_000;   // cek gas setiap 30 detik
const FARM_INTERVAL_MS  = 360_000;  // farm setiap 6 menit
const TSX               = "node_modules\\.bin\\tsx";

function run(cmd, label) {
  const ts = new Date().toISOString();
  console.log(`\n[${ts}] ▶ ${label}`);
  console.log("─".repeat(60));
  execSync(cmd, { cwd: process.cwd(), stdio: "inherit", timeout: 600_000 });
}

async function waitForLowGas() {
  console.log(`\n⏳  Menunggu gas price ≤ 10 gwei...`);
  while (true) {
    try {
      const gp  = await pub.getGasPrice();
      const ts  = new Date().toLocaleTimeString("id-ID");
      process.stdout.write(`\r[${ts}]  Gas: ${formatGwei(gp)} gwei          `);

      if (gp <= MAX_GWEI) {
        console.log(`\n✅  Gas turun ke ${formatGwei(gp)} gwei — mulai!`);
        return gp;
      }
    } catch (e) {
      process.stdout.write(`\r  RPC error: ${e.message.slice(0, 40)}`);
    }
    await new Promise(r => setTimeout(r, POLL_MS));
  }
}

async function checkFunder() {
  const { privateKeyToAccount } = await import("viem/accounts");
  const key = process.env.FUNDER_PRIVATE_KEY ?? "";
  const pk  = (key.startsWith("0x") ? key : "0x" + key);
  const acc = privateKeyToAccount(pk);
  const bal = await pub.getBalance({ address: acc.address });
  console.log(`\nFunder: ${acc.address}`);
  console.log(`Balance: ${formatEther(bal)} CELO`);
  return { address: acc.address, balance: bal };
}

// ── STEP 1: tunggu gas turun ──────────────────────────────────────
await waitForLowGas();

// ── STEP 2: sweep ────────────────────────────────────────────────
run(`${TSX} src/sweep.ts`, "SWEEP — mengumpulkan semua CELO ke funder");

// Cek saldo funder setelah sweep
const funder = await checkFunder();
const minNeeded = parseEther("7.0");
if (funder.balance < minNeeded) {
  console.log(`\n⚠️  Funder hanya punya ${formatEther(funder.balance)} CELO.`);
  console.log(`    Dibutuhkan minimal 7.0 CELO untuk 50 wallet × 0.14 CELO.`);
  console.log(`    Cek apakah sweep berhasil atau tambah CELO ke funder.`);
  process.exit(1);
}

// ── STEP 3: distribute ke 50 wallet pertama ───────────────────────
console.log(`\n✅  Funder punya ${formatEther(funder.balance)} CELO — distribusi ke 50 wallet`);
run(`${TSX} src/distribute.ts`, "DISTRIBUTE — fund 50 wallet @ 0.14 CELO");

// ── STEP 4: farm loop ─────────────────────────────────────────────
console.log(`\n🌾  Mulai farm loop (interval: 6 menit, crop: Wheat = 5 menit grow)`);
console.log(`    Setiap siklus: harvest → unlock → plant → +15 SEED per wallet`);
console.log(`    Target: ~300 siklus = ~4500 SEED per wallet di leaderboard\n`);

let run_count = 0;
while (true) {
  run_count++;

  // Re-check gas sebelum farm
  try {
    const gp = await pub.getGasPrice();
    console.log(`\n[Run #${run_count}] Gas: ${formatGwei(gp)} gwei`);
    if (gp > parseGwei("50")) {
      console.log(`  ⚠️  Gas tinggi (${formatGwei(gp)} gwei) — skip run ini, tunggu 60s`);
      await new Promise(r => setTimeout(r, 60_000));
      continue;
    }
  } catch {}

  try {
    run(`${TSX} src/farm.ts`, `FARM Run #${run_count}`);
  } catch (e) {
    console.log(`  ❌ Farm error: ${e.message}`);
  }

  const nextRun = new Date(Date.now() + FARM_INTERVAL_MS).toLocaleTimeString("id-ID");
  console.log(`\n⏳  Run #${run_count} selesai. Run berikutnya: ${nextRun}`);
  await new Promise(r => setTimeout(r, FARM_INTERVAL_MS));
}
