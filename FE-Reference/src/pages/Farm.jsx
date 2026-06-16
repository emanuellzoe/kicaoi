import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
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
} from 'wagmi';
import { injected } from 'wagmi/connectors';
import { formatEther, parseEther } from 'viem';
import { useMiniPay } from '../hooks/useMiniPay';
import { activeChain } from '../lib/chain';
import { CROPS, cropById, CUSD_ADDRESS, KICAOI_ABI, KICAOI_ADDRESS } from '../lib/contract';
import { evaluateAchievements } from '../lib/achievements';
import { SeedCalculator } from '../components/SeedCalculator';

const ZERO = '0x0000000000000000000000000000000000000000';

export default function FarmPage() {
  const { isMiniPay } = useMiniPay();
  const { address, isConnected } = useAccount();
  const { connect } = useConnect();
  const { disconnect } = useDisconnect();
  const chainId = useChainId();
  const { switchChain, switchChainAsync, isPending: switching } = useSwitchChain();

  const configured = KICAOI_ADDRESS.toLowerCase() !== ZERO;
  const wrongChain = isConnected && chainId !== activeChain.id;

  useEffect(() => {
    if (wrongChain) switchChainAsync({ chainId: activeChain.id }).catch(() => {});
  }, [wrongChain]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Ambient gradient */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-green-900/20 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 max-w-md mx-auto px-4 pt-24 pb-16">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <h1 className="text-xl font-heading italic text-white">🌱 Kicaoi</h1>
            <p className="text-xs text-white/40 font-body">Plant · Wait · Harvest — on Celo</p>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/leaderboard" className="liquid-glass rounded-full px-3 py-1.5 text-xs font-medium text-white/80 hover:text-white transition-colors no-underline">
              🏆 Board
            </Link>
            {isConnected && !isMiniPay && (
              <button
                onClick={() => disconnect()}
                className="liquid-glass rounded-full px-3 py-1.5 text-xs text-white/70 hover:text-white transition-colors border-none cursor-pointer font-body"
              >
                Disconnect
              </button>
            )}
          </div>
        </div>

        {!configured && (
          <div className="bg-amber-900/30 border border-amber-700/50 rounded-2xl px-4 py-3 text-amber-300 text-xs mb-4">
            Contract not configured. Set <code>VITE_KICAOI_CONTRACT_ADDRESS</code> in <code>.env</code>.
          </div>
        )}

        {!isConnected ? (
          <LandingConnect isMiniPay={isMiniPay} onConnect={() => connect({ connector: injected(), chainId: activeChain.id })} />
        ) : wrongChain ? (
          <div className="liquid-glass rounded-2xl p-5 text-center">
            <p className="text-white/70 text-sm mb-4">Your wallet is on the wrong network. Kicaoi runs on <strong>{activeChain.name}</strong>.</p>
            <button
              className="w-full rounded-full px-5 py-3 bg-green-500 text-black font-semibold text-sm font-body disabled:opacity-50 cursor-pointer border-none"
              disabled={switching}
              onClick={() => switchChain({ chainId: activeChain.id })}
            >
              {switching ? 'Switching…' : `Switch to ${activeChain.name}`}
            </button>
          </div>
        ) : (
          <Farm address={address} enabled={configured} isMiniPay={isMiniPay} />
        )}

        {isConnected && (
          <p className="text-center text-xs text-white/30 mt-4 font-body">
            SEED is an in-game credit (1 CELO = 100 SEED). Not redeemable for CELO.
          </p>
        )}
      </div>
    </div>
  );
}

function LandingConnect({ isMiniPay, onConnect }) {
  return (
    <div className="flex flex-col gap-6 py-8">
      <div className="text-center">
        <div className="inline-block liquid-glass rounded-full px-3 py-1 text-xs font-body text-white/60 mb-5">
          🌱 On-chain farming · Celo
        </div>
        <h2 className="text-4xl font-heading italic text-white leading-tight mb-4">
          Plant. Grow.<br /><span className="text-green-400">Harvest.</span>
        </h2>
        <p className="text-white/50 text-sm font-body leading-relaxed max-w-xs mx-auto">
          A yield farming game on Celo. Plant crops, wait for them to grow, harvest SEED — all on-chain.
        </p>
      </div>

      <div className="liquid-glass rounded-2xl p-5">
        <div className="grid grid-cols-3 gap-3 mb-5">
          {[
            { emoji: '🌾', name: 'Wheat', time: '5 min' },
            { emoji: '🎃', name: 'Pumpkin', time: '30 min' },
            { emoji: '✨', name: 'Golden', time: '2 hr' },
          ].map((c) => (
            <div key={c.name} className="bg-white/5 rounded-xl p-3 text-center">
              <div className="text-2xl mb-1">{c.emoji}</div>
              <div className="text-xs font-medium text-white/80">{c.name}</div>
              <div className="text-xs text-white/40 mt-0.5">{c.time}</div>
            </div>
          ))}
        </div>

        {!isMiniPay && (
          <button
            onClick={onConnect}
            className="w-full liquid-glass-strong rounded-full py-3.5 text-white font-semibold text-sm font-body hover:scale-105 transition-transform border-none cursor-pointer"
          >
            Connect Wallet to Farm
          </button>
        )}
        {isMiniPay && <p className="text-center text-xs text-green-400/70 font-body mt-2">✓ Gas fees paid in cUSD via MiniPay</p>}
        <p className="text-center text-xs text-white/30 font-body mt-3">
          Works with MetaMask, MiniPay & any injected wallet
        </p>
      </div>
    </div>
  );
}

function Farm({ address, enabled, isMiniPay }) {
  const base = { address: KICAOI_ADDRESS, abi: KICAOI_ABI, chainId: activeChain.id };
  const query = { enabled };

  const celo = useBalance({ address, chainId: activeChain.id });
  const seed = useReadContract({ ...base, functionName: 'seedBalance', args: [address], query });
  const stats = useReadContract({ ...base, functionName: 'getStats', args: [address], query });
  const unlockCost = useReadContract({ ...base, functionName: 'nextUnlockCost', args: [address], query });

  const plotCount = stats.data ? Number(stats.data.plotCount) : 0;
  const plots = useReadContract({
    ...base,
    functionName: 'getPlots',
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
  }, [receipt.isSuccess]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const t = setInterval(() => plots.refetch(), 30000);
    return () => clearInterval(t);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const busy = isPending || receipt.isLoading;
  const seedBal = seed.data ? Number(seed.data) : 0;

  const achievements = useMemo(
    () =>
      stats.data
        ? evaluateAchievements({
            plotCount: Number(stats.data.plotCount),
            totalPlanted: Number(stats.data.totalPlanted),
            totalHarvested: Number(stats.data.totalHarvested),
            totalSeedHarvested: Number(stats.data.totalSeedHarvested),
          })
        : [],
    [stats.data]
  );

  const feeCurrency = isMiniPay ? CUSD_ADDRESS[activeChain.id] : undefined;

  const send = (functionName, args, value) =>
    writeContract({ ...base, functionName, args, value, ...(feeCurrency ? { feeCurrency } : {}) });

  const [amount, setAmount] = useState('0.1');
  const [now, setNow] = useState(() => Math.floor(Date.now() / 1000));
  useEffect(() => {
    const t = setInterval(() => setNow(Math.floor(Date.now() / 1000)), 5000);
    return () => clearInterval(t);
  }, []);

  const readyPlotIds = useMemo(() => {
    if (!plots.data) return [];
    const ids = [];
    for (let i = 0; i < plotCount; i++) {
      const p = plots.data[i];
      if (!p || p.cropId === 0) continue;
      const crop = cropById(Number(p.cropId));
      if (crop && now >= Number(p.plantedAt) + crop.growMins * 60) ids.push(BigInt(i));
    }
    return ids;
  }, [plots.data, plotCount, now]);

  return (
    <div className="flex flex-col gap-3">
      {/* Balances */}
      <div className="liquid-glass rounded-2xl p-4 grid grid-cols-2 gap-4">
        <div>
          <div className="text-xs text-white/40 font-body mb-1">CELO</div>
          <div className="text-2xl font-bold font-heading">
            {celo.data ? Number(formatEther(celo.data.value)).toFixed(3) : '—'}
          </div>
        </div>
        <div>
          <div className="text-xs text-white/40 font-body mb-1">SEED</div>
          <div className="text-2xl font-bold font-heading text-green-400">
            {seed.isLoading ? '—' : seedBal}
          </div>
        </div>
      </div>

      {/* Buy Seeds */}
      <div className="liquid-glass rounded-2xl p-4">
        <div className="text-xs text-white/40 font-body mb-3">Buy SEED with CELO</div>
        <div className="flex gap-2">
          <input
            type="number"
            min="0"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="flex-1 bg-white/5 border border-white/10 rounded-full px-4 py-2.5 text-sm text-white font-body focus:outline-none focus:border-white/25"
          />
          <button
            disabled={busy || !amount || Number(amount) <= 0}
            onClick={() => send('buySeeds', [], parseEther(amount || '0'))}
            className="liquid-glass-strong rounded-full px-5 py-2.5 text-sm font-semibold text-white font-body disabled:opacity-40 cursor-pointer border-none hover:scale-105 transition-transform"
          >
            Buy
          </button>
        </div>
        {amount && <div className="text-xs text-white/30 font-body mt-2">≈ {Math.floor(Number(amount) * 100)} SEED &nbsp;·&nbsp; rate: 100 SEED/CELO</div>}
      </div>

      {/* Plots */}
      <div className="liquid-glass rounded-2xl p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="text-xs text-white/40 font-body">Your plots ({plotCount})</div>
          <div className="flex gap-2">
            {readyPlotIds.length > 1 && (
              <button
                disabled={busy}
                onClick={() => send('batchHarvest', [readyPlotIds])}
                aria-label={`Harvest all ${readyPlotIds.length} ready plots`}
                className="liquid-glass-strong rounded-full px-3 py-1.5 text-xs font-semibold text-white border-none cursor-pointer hover:scale-105 transition-transform disabled:opacity-40"
              >
                Harvest All ({readyPlotIds.length})
              </button>
            )}
            <button
              disabled={busy || seedBal < Number(unlockCost.data ?? 0n) || plotCount === 0}
              onClick={() => send('unlockPlot', [])}
              aria-label="Unlock a new plot"
              className="bg-white/5 border border-white/10 rounded-full px-3 py-1.5 text-xs font-semibold text-white/70 border-none cursor-pointer hover:text-white transition-colors disabled:opacity-40"
            >
              + Plot ({unlockCost.data ? Number(unlockCost.data) : '…'} SEED)
            </button>
          </div>
        </div>

        {plotCount === 0 ? (
          <p className="text-xs text-white/40 font-body text-center py-4">Buy SEED once to receive your first 3 plots.</p>
        ) : (
          <div className="grid grid-cols-2 gap-2.5">
            {Array.from({ length: plotCount }).map((_, i) => (
              <PlotCard
                key={i}
                plotId={i}
                cropId={plots.data?.[i] ? Number(plots.data[i].cropId) : 0}
                plantedAt={plots.data?.[i] ? Number(plots.data[i].plantedAt) : 0}
                seedBal={seedBal}
                busy={busy}
                onPlant={(cropId) => send('plant', [BigInt(i), cropId])}
                onHarvest={() => send('harvest', [BigInt(i)])}
              />
            ))}
          </div>
        )}
      </div>

      <SeedCalculator />

      {achievements.length > 0 && <Achievements items={achievements} />}

      {busy && <p className="text-center text-xs text-white/40 font-body">Confirming transaction…</p>}
    </div>
  );
}

function Achievements({ items }) {
  const unlocked = items.filter((a) => a.unlocked).length;
  return (
    <div className="liquid-glass rounded-2xl p-4">
      <div className="text-xs text-white/40 font-body mb-3">
        Achievements ({unlocked}/{items.length})
      </div>
      <div className="grid gap-2" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(90px, 1fr))' }}>
        {items.map((a) => (
          <div
            key={a.id}
            title={a.desc}
            className={`rounded-xl p-2.5 text-center bg-white/5 border ${a.unlocked ? 'border-green-500/50' : 'border-white/5 opacity-50 grayscale'}`}
          >
            <div className="text-2xl leading-none">{a.emoji}</div>
            <div className="text-xs font-semibold text-white mt-1.5">{a.name}</div>
            {a.unlocked ? (
              <div className="text-[10px] text-white/40 mt-1 leading-tight">{a.desc}</div>
            ) : (
              <div className="h-1 bg-white/10 rounded-full mt-2 overflow-hidden">
                <div className="h-full bg-green-500 rounded-full" style={{ width: `${Math.round(a.progress * 100)}%` }} />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function PlotCard({ plotId, cropId, plantedAt, seedBal, busy, onPlant, onHarvest }) {
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

  const mmss = `${String(Math.floor(remaining / 60)).padStart(2, '0')}:${String(remaining % 60).padStart(2, '0')}`;

  return (
    <div title={empty ? 'Empty plot' : crop?.name} className={`bg-white/5 border rounded-2xl p-3 text-center flex flex-col justify-between min-h-[130px] ${ready ? 'border-green-500/60' : 'border-white/5'}`}>
      <div className="text-3xl leading-none mb-1">{empty ? '🟫' : crop?.emoji}</div>

      {empty ? (
        <>
          <div className="text-[10px] text-white/30 font-body mb-2">Plot #{plotId} · empty</div>
          <div className="flex gap-1 mb-2">
            {CROPS.map((c) => (
              <button
                key={c.id}
                onClick={() => setPick(c.id)}
                className={`flex-1 rounded-lg py-1.5 text-sm border-none cursor-pointer transition-colors ${pick === c.id ? 'bg-green-500 text-black' : 'bg-white/5 text-white/70 hover:bg-white/10'}`}
              >
                {c.emoji}
              </button>
            ))}
          </div>
          <button
            disabled={busy || seedBal < (cropById(pick)?.cost ?? 0)}
            onClick={() => onPlant(pick)}
            className="w-full liquid-glass-strong rounded-full py-2 text-xs font-semibold text-white border-none cursor-pointer disabled:opacity-40 hover:scale-105 transition-transform"
          >
            Plant ({cropById(pick)?.cost} SEED)
          </button>
        </>
      ) : (
        <>
          <div className="text-[10px] text-white/40 font-body mb-2">
            {crop?.name} · {ready ? '✅ ready!' : mmss}
          </div>
          <button
            disabled={busy || !ready}
            onClick={onHarvest}
            className={`w-full rounded-full py-2 text-xs font-semibold border-none cursor-pointer disabled:opacity-40 transition-all ${ready ? 'bg-green-500 text-black hover:scale-105' : 'bg-white/5 text-white/50'}`}
          >
            {ready ? `Harvest (+${crop?.yield})` : 'Growing…'}
          </button>
        </>
      )}
    </div>
  );
}
