"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  useAccount,
  useBalance,
  useChainId,
  useConnect,
  useDisconnect,
  useReadContract,
  useSwitchChain,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";
import { injected } from "wagmi/connectors";
import { formatEther, parseEther } from "viem";
import { useMiniPay } from "@/hooks/useMiniPay";
import { activeChain } from "@/lib/chain";
import { CROPS, cropById, KICAOI_ABI, KICAOI_ADDRESS } from "@/lib/contract";
import { BlurText } from "@/components/BlurText";

const ZERO = "0x0000000000000000000000000000000000000000";

function shorten(addr: string) {
  return addr.slice(0, 6) + "…" + addr.slice(-4);
}

export default function Page() {
  const { isMiniPay } = useMiniPay();
  const { address, isConnected } = useAccount();
  const { connect } = useConnect();
  const { disconnect } = useDisconnect();
  const chainId = useChainId();
  const { switchChain, isPending: switching } = useSwitchChain();

  const configured = KICAOI_ADDRESS.toLowerCase() !== ZERO;
  const wrongChain = isConnected && chainId !== activeChain.id;

  if (!isConnected) {
    return <HeroSection onConnect={() => connect({ connector: injected() })} isMiniPay={isMiniPay} />;
  }

  return (
    <>
      <div className="hero-bg" />
      <nav className="kicaoi-nav lg">
        <div className="nav-logo">
          <span>🌱</span>
          Kicaoi
        </div>
        <div className="nav-actions">
          <Link href="/leaderboard" className="nav-link">🏆</Link>
          {!isMiniPay && address && (
            <button
              className="secondary"
              style={{ fontSize: "11px", padding: "7px 12px", borderRadius: "10px" }}
              onClick={() => disconnect()}
            >
              {shorten(address)}
            </button>
          )}
        </div>
      </nav>

      <main className="shell">
        {!configured && (
          <div className="warn fade-up">
            Contract address not set. Add{" "}
            <span className="mono">NEXT_PUBLIC_KICAOI_CONTRACT_ADDRESS</span> to{" "}
            <span className="mono">.env.local</span> after deploying.
          </div>
        )}

        {wrongChain ? (
          <div className="card lg fade-up" style={{ textAlign: "center", padding: "28px 16px" }}>
            <div className="warn" style={{ marginBottom: "14px" }}>
              Your wallet is on the wrong network. Kicaoi runs on{" "}
              <b>{activeChain.name}</b>.
            </div>
            <button
              className="fullw"
              disabled={switching}
              onClick={() => switchChain({ chainId: activeChain.id })}
            >
              {switching ? "Switching…" : `Switch to ${activeChain.name}`}
            </button>
          </div>
        ) : (
          <Farm address={address as `0x${string}`} enabled={configured} />
        )}

        <p className="note center mt" style={{ paddingBottom: "20px" }}>
          SEED is an in-game credit (1 CELO = 100 SEED). Not redeemable for CELO.
        </p>
      </main>
    </>
  );
}

/* ─── HERO (disconnected) ─────────────────────────────────────── */
function HeroSection({
  onConnect,
  isMiniPay,
}: {
  onConnect: () => void;
  isMiniPay: boolean;
}) {
  return (
    <>
      <div className="hero-bg" />
      <nav className="kicaoi-nav lg">
        <div className="nav-logo">
          <span>🌱</span>
          Kicaoi
        </div>
        <Link href="/leaderboard" className="nav-link">🏆 Leaderboard</Link>
      </nav>

      <section className="hero-section">
        <div style={{ position: "relative", zIndex: 1, width: "100%" }}>
          <div className="fade-up-1" style={{ display: "flex", justifyContent: "center" }}>
            <span className="hero-eyebrow lg">
              🌍 Onchain · Celo Network
            </span>
          </div>

          <div className="fade-up-2" style={{ marginBottom: "20px" }}>
            <BlurText
              text="Kicaoi Farm"
              className="hero-title font-heading"
              delay={0.25}
              stagger={0.12}
            />
          </div>

          <p className="hero-sub fade-up-3">
            Plant crops. Watch them grow. Harvest rewards — fully onchain on Celo.
          </p>

          <div className="feature-grid fade-up-4">
            {CROPS.map((crop) => (
              <div key={crop.id} className="feature-card lg">
                <div className="feature-emoji">{crop.emoji}</div>
                <div className="feature-name">{crop.name}</div>
                <div className="feature-detail">
                  {crop.cost} SEED<br />
                  {crop.growMins}m grow<br />
                  +{crop.yield} yield
                </div>
              </div>
            ))}
          </div>

          {!isMiniPay && (
            <div className="fade-up-5" style={{ display: "flex", justifyContent: "center" }}>
              <button className="hero-cta" onClick={onConnect}>
                Connect Wallet to Farm
              </button>
            </div>
          )}
        </div>
      </section>
    </>
  );
}

/* ─── FARM (connected) ────────────────────────────────────────── */
function Farm({ address, enabled }: { address: `0x${string}`; enabled: boolean }) {
  const base = { address: KICAOI_ADDRESS, abi: KICAOI_ABI, chainId: activeChain.id } as const;
  const query = { enabled } as const;

  const celo = useBalance({ address, chainId: activeChain.id });
  const seed = useReadContract({ ...base, functionName: "seedBalance", args: [address], query });
  const stats = useReadContract({ ...base, functionName: "getStats", args: [address], query });
  const unlockCost = useReadContract({ ...base, functionName: "nextUnlockCost", args: [address], query });

  const plotCount = stats.data ? Number(stats.data.plotCount) : 0;
  const plots = useReadContract({
    ...base,
    functionName: "getPlots",
    args: [address, 0n, BigInt(plotCount)],
    query: { enabled: enabled && plotCount > 0 },
  });

  const { writeContract, data: txHash, isPending, reset } = useWriteContract();
  const receipt = useWaitForTransactionReceipt({ hash: txHash });

  useEffect(() => {
    if (receipt.isSuccess) {
      celo.refetch();
      seed.refetch();
      stats.refetch();
      unlockCost.refetch();
      plots.refetch();
      reset();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [receipt.isSuccess]);

  const busy = isPending || receipt.isLoading;
  const seedBal = seed.data ? Number(seed.data) : 0;

  const send = (functionName: string, args: unknown[], value?: bigint) =>
    (writeContract as any)({ ...base, functionName, args, value });

  const [amount, setAmount] = useState("0.1");

  return (
    <>
      {/* Balances */}
      <div className="card lg balances fade-up-1">
        <div className="stat">
          <div className="label">CELO</div>
          <div className="value">
            {celo.data ? Number(formatEther(celo.data.value)).toFixed(3) : "—"}
          </div>
        </div>
        <div className="stat">
          <div className="label">SEED</div>
          <div className="value">{seed.isLoading ? "—" : seedBal}</div>
        </div>
      </div>

      {/* Buy SEED */}
      <div className="card lg fade-up-2">
        <div className="section-label lg" style={{ marginBottom: "10px" }}>
          Buy SEED
        </div>
        <div className="row">
          <input
            type="number"
            min="0"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
          <button
            disabled={busy || !amount || Number(amount) <= 0}
            onClick={() => send("buySeeds", [], parseEther(amount || "0"))}
            style={{ whiteSpace: "nowrap", flexShrink: 0 }}
          >
            Buy
          </button>
        </div>
        <div className="note mt">
          {amount && Number(amount) > 0 ? `≈ ${Math.floor(Number(amount) * 100)} SEED` : "1 CELO = 100 SEED"}
        </div>
      </div>

      {/* Plots */}
      <div className="card lg fade-up-3">
        <div className="row">
          <div className="section-label lg">
            Your Plots ({plotCount})
          </div>
          <button
            className="secondary"
            style={{ fontSize: "12px", padding: "7px 12px", borderRadius: "10px" }}
            disabled={busy || seedBal < Number(unlockCost.data ?? 0n) || plotCount === 0}
            onClick={() => send("unlockPlot", [])}
          >
            + Plot ({unlockCost.data ? Number(unlockCost.data) : "…"} SEED)
          </button>
        </div>

        {plotCount === 0 ? (
          <p className="note mt" style={{ textAlign: "center", padding: "16px 0" }}>
            Buy SEED once to receive your first 3 plots. 🌱
          </p>
        ) : (
          <div className="plots">
            {Array.from({ length: plotCount }).map((_, i) => (
              <PlotCard
                key={i}
                plotId={i}
                cropId={plots.data?.[i] ? Number(plots.data[i].cropId) : 0}
                plantedAt={plots.data?.[i] ? Number(plots.data[i].plantedAt) : 0}
                seedBal={seedBal}
                busy={busy}
                onPlant={(cropId) => send("plant", [BigInt(i), cropId])}
                onHarvest={() => send("harvest", [BigInt(i)])}
              />
            ))}
          </div>
        )}
      </div>

      {busy && (
        <p className="note center fade-up" style={{ marginTop: "8px" }}>
          ⏳ Confirming transaction…
        </p>
      )}
    </>
  );
}

/* ─── PLOT CARD ───────────────────────────────────────────────── */
function PlotCard({
  plotId,
  cropId,
  plantedAt,
  seedBal,
  busy,
  onPlant,
  onHarvest,
}: {
  plotId: number;
  cropId: number;
  plantedAt: number;
  seedBal: number;
  busy: boolean;
  onPlant: (cropId: number) => void;
  onHarvest: () => void;
}) {
  const [now, setNow] = useState(() => Math.floor(Date.now() / 1000));
  useEffect(() => {
    const t = setInterval(() => setNow(Math.floor(Date.now() / 1000)), 1000);
    return () => clearInterval(t);
  }, []);

  const [pick, setPick] = useState(1);
  const crop = cropById(cropId);
  const empty = cropId === 0;

  const ready = useMemo(() => {
    if (empty || !crop) return false;
    return now >= plantedAt + crop.growMins * 60;
  }, [empty, crop, now, plantedAt]);

  const remaining = useMemo(() => {
    if (empty || !crop) return 0;
    return Math.max(0, plantedAt + crop.growMins * 60 - now);
  }, [empty, crop, now, plantedAt]);

  const mmss = `${String(Math.floor(remaining / 60)).padStart(2, "0")}:${String(
    remaining % 60
  ).padStart(2, "0")}`;

  return (
    <div className={`plot lg${ready ? " ready" : ""}`}>
      <div className="emoji">{empty ? "🟫" : crop?.emoji}</div>

      {empty ? (
        <>
          <div className="state">Plot #{plotId + 1} · empty</div>
          <div className="crop-pick">
            {CROPS.map((c) => (
              <button
                key={c.id}
                className={pick === c.id ? "active" : ""}
                onClick={() => setPick(c.id)}
              >
                {c.emoji}
              </button>
            ))}
          </div>
          <button
            className="mt"
            style={{ fontSize: "12px", padding: "8px 6px" }}
            disabled={busy || seedBal < (cropById(pick)?.cost ?? 0)}
            onClick={() => onPlant(pick)}
          >
            Plant ({cropById(pick)?.cost} SEED)
          </button>
        </>
      ) : (
        <>
          <div className="state">
            {crop?.name} · {ready ? "✅ ready!" : mmss}
          </div>
          <button
            className="mt"
            style={{ fontSize: "12px", padding: "8px 6px" }}
            disabled={busy || !ready}
            onClick={onHarvest}
          >
            {ready ? `Harvest +${crop?.yield}` : "Growing…"}
          </button>
        </>
      )}
    </div>
  );
}
