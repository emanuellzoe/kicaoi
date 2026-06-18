"use client";

import { useChainId } from "wagmi";
import { PulseDot } from "./PulseDot";

const CHAIN_LABELS: Record<number, string> = {
  42220:    "Celo Mainnet",
  11142220: "Celo Sepolia Testnet",
  44787:    "Celo Alfajores Testnet",
};

export function NetworkBadge() {
  const chainId = useChainId();
  const isMainnet = chainId === 42220;
  const label = CHAIN_LABELS[chainId] ?? `Chain ${chainId}`;

  return (
    <div
      className="flex items-center gap-1.5 liquid-glass rounded-full px-2.5 py-1"
      role="status"
      aria-label={`Connected to ${label}`}
      title={label}
    >
      <PulseDot color={isMainnet ? "bg-green-400" : "bg-yellow-400"} />
      <span className="text-[10px] font-body text-white/60">
        {isMainnet ? "Celo Mainnet" : "Testnet"}
      </span>
    </div>
  );
}
