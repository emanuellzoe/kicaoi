import { createPublicClient, http } from "viem";
import { activeChain } from "./chain";

export const publicClient = createPublicClient({
  chain: activeChain,
  transport: http(),
});
