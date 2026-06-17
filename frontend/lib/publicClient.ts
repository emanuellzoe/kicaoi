import { createPublicClient, http } from "viem";
import { activeChain } from "./chain";

const RPC: Record<number, string> = {
  42220:    "https://forno.celo.org",
  11142220: "https://alfajores-forno.celo-testnet.org",
};

export const publicClient = createPublicClient({
  chain: activeChain,
  transport: http(RPC[activeChain.id] ?? undefined, { timeout: 20_000 }),
});
