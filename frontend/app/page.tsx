"use client";

import { useEffect, useMemo, useState } from "react";
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

const ZERO = "0x0000000000000000000000000000000000000000";

export default function Page() {
  const { isMiniPay } = useMiniPay();
  const { address, isConnected } = useAccount();
  const { connect } = useConnect();
  const { disconnect } = useDisconnect();
  const chainId = useChainId();
  const { switchChain, isPending: switching } = useSwitchChain();

  const configured = KICAOI_ADDRESS.toLowerCase() !== ZERO;
  const wrongChain = isConnected && chainId !== activeChain.id;

  return (
    <main className="shell">
      <header className="brand">
        <div>
          <h1>🌱 Kicaoi</h1>
          <div className="tag">Plant · Wait · Harvest — on Celo</div>
        </div>
        {isConnected && !isMiniPay && (
          <button className="secondary" onClick={() => disconnect()}>
            Disconnect
          </button>
        )}
      </header>

      {!configured && (
        <div className="warn">
          Contract address not set. Add <span className="mono">NEXT_PUBLIC_KICAOI_CONTRACT_ADDRESS</span>{" "}
          to <span className="mono">.env.local</span> after deploying.
        </div>
      )}

      {!isConnected ? (
        <div className="card center">
          <p className="note">Connect your wallet to start farming.</p>
          {/* Inside MiniPay this auto-connects and the button stays hidden */}
          {!isMiniPay && (
            <button className="fullw mt" onClick={() => connect({ connector: injected() })}>
              Connect Wallet
            </button>
          )}
        </div>
      ) : wrongChain ? (
        <div className="card center">
          <div className="warn">
            Your wallet is on the wrong network. Kicaoi runs on <b>{activeChain.name}</b>.
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

      <p className="note center mt">
        SEED is an in-game credit (1 CELO = 100 SEED). It is not redeemable for CELO.
      </p>
    </main>
  );
}

function Farm({ address, enabled }: { address: `0x${string}`; enabled: boolean }) {
  const base = { address: KICAOI_ADDRESS, abi: KICAOI_ABI } as const;
  const query = { enabled } as const;

  const celo = useBalance({ address });
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

  // Refetch everything once a tx confirms.
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

  // Loosely typed wrapper so the UI stays simple; the ABI is the source of truth.
  const send = (functionName: string, args: unknown[], value?: bigint) =>
    (writeContract as any)({ ...base, functionName, args, value });

  // Buy form
  const [amount, setAmount] = useState("0.1");

  return (
    <>
      <div className="card balances">
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

      <div className="card">
        <div className="label note">Buy SEED with CELO</div>
        <div className="row mt">
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
          >
            Buy
          </button>
        </div>
        <div className="note mt">{amount ? `≈ ${Math.floor(Number(amount) * 100)} SEED` : ""}</div>
      </div>

      <div className="card">
        <div className="row">
          <div className="label note">Your plots ({plotCount})</div>
          <button
            className="secondary"
            disabled={busy || seedBal < Number(unlockCost.data ?? 0n) || plotCount === 0}
            onClick={() => send("unlockPlot", [])}
          >
            + Plot ({unlockCost.data ? Number(unlockCost.data) : "…"} SEED)
          </button>
        </div>

        {plotCount === 0 ? (
          <p className="note mt">Buy SEED once to receive your first 3 plots.</p>
        ) : (
          <div className="plots mt">
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

      {busy && <p className="note center">Confirming transaction…</p>}
    </>
  );
}

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
    <div className={`plot ${ready ? "ready" : ""}`}>
      <div className="emoji">{empty ? "🟫" : crop?.emoji}</div>

      {empty ? (
        <>
          <div className="state">Plot #{plotId} · empty</div>
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
            disabled={busy || seedBal < (cropById(pick)?.cost ?? 0)}
            onClick={() => onPlant(pick)}
          >
            Plant ({cropById(pick)?.cost} SEED)
          </button>
        </>
      ) : (
        <>
          <div className="state">
            {crop?.name} · {ready ? "ready!" : mmss}
          </div>
          <button className="mt" disabled={busy || !ready} onClick={onHarvest}>
            {ready ? `Harvest (+${crop?.yield})` : "Growing…"}
          </button>
        </>
      )}
    </div>
  );
}
