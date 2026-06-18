import { createPublicClient, http } from "viem";
import { activeChain } from "./chain";

/** Public RPC URLs keyed by chain ID. Override with NEXT_PUBLIC_RPC_URL if needed. */
export const RPC_URLS: Record<number, string> = {
  42220:    "https://forno.celo.org",
  11142220: "https://alfajores-forno.celo-testnet.org",
};

const RPC_TIMEOUT_MS = 20_000;

/** Pre-configured viem public client for the active chain. */
export const publicClient = createPublicClient({
  chain: activeChain,
  transport: http(RPC_URLS[activeChain.id] ?? undefined, { timeout: RPC_TIMEOUT_MS }),
});
