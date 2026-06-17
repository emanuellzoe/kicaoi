"use client";

import { useChainId } from "wagmi";
import { PulseDot } from "./PulseDot";

export function NetworkBadge() {
  const chainId = useChainId();
  const isMainnet = chainId === 42220;
  return (
    <div className="flex items-center gap-1.5 liquid-glass rounded-full px-2.5 py-1">
      <PulseDot color={isMainnet ? "bg-green-400" : "bg-yellow-400"} />
      <span className="text-[10px] font-body text-white/60">
        {isMainnet ? "Celo Mainnet" : "Testnet"}
      </span>
    </div>
  );
}
