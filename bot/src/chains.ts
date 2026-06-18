import { celo, type Chain } from "viem/chains";

const celoSepolia = {
  id: 11142220,
  name: "Celo Sepolia",
  nativeCurrency: { name: "CELO", symbol: "CELO", decimals: 18 },
  rpcUrls: {
    default: { http: ["https://forno.celo-sepolia.celo-testnet.org"] },
  },
  blockExplorers: {
    default: { name: "Celoscan", url: "https://sepolia.celoscan.io" },
  },
} as const;

export type ChainName = "celo" | "sepolia";

export const VALID_CHAIN_NAMES: ChainName[] = ["celo", "sepolia"];

/** Returns true if `name` is a supported ChainName. */
export function isChainName(name: string): name is ChainName {
  return VALID_CHAIN_NAMES.includes(name as ChainName);
}

/**
 * Resolves a ChainName string to its viem Chain definition.
 * Throws if the name is not recognised.
 */
export function resolveChain(name: ChainName): Chain {
  switch (name) {
    case "celo":    return celo;
    case "sepolia": return celoSepolia as unknown as Chain;
    default: throw new Error(`Chain tidak dikenal: "${name}". Pilih: celo | sepolia`);
  }
}
