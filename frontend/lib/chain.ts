import { defineChain } from "viem";

// Celo Sepolia testnet (chainId 11142220)
export const celoSepolia = defineChain({
  id: 11142220,
  name: "Celo Sepolia",
  nativeCurrency: { name: "CELO", symbol: "CELO", decimals: 18 },
  rpcUrls: {
    default: { http: ["https://forno.celo-sepolia.celo-testnet.org"] },
  },
  blockExplorers: {
    default: { name: "Celoscan", url: "https://sepolia.celoscan.io" },
  },
  testnet: true,
});

// Celo Mainnet (chainId 42220)
export const celoMainnet = defineChain({
  id: 42220,
  name: "Celo",
  nativeCurrency: { name: "CELO", symbol: "CELO", decimals: 18 },
  rpcUrls: { default: { http: ["https://forno.celo.org"] } },
  blockExplorers: {
    default: { name: "Celoscan", url: "https://celoscan.io" },
  },
});

const chainId = Number(process.env.NEXT_PUBLIC_CHAIN_ID ?? 11142220);
export const activeChain = chainId === 42220 ? celoMainnet : celoSepolia;
