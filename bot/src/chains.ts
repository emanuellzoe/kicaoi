import { celo } from "viem/chains";

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

export function resolveChain(name: ChainName) {
  switch (name) {
    case "celo":    return celo;
    case "sepolia": return celoSepolia;
    default: throw new Error(`Chain tidak dikenal: "${name}". Pilih: celo | sepolia`);
  }
}
