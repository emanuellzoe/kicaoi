import { celo, celoSepolia as celoSepoliaViem } from "viem/chains";

// Use viem/chains definitions — they include CIP-64 (feeCurrency) formatters
// so users can pay gas with cUSD instead of native CELO.
export const celoMainnet = celo;
export const celoSepolia = celoSepoliaViem;

const chainId = Number(process.env.NEXT_PUBLIC_CHAIN_ID ?? 11142220);
export const activeChain = chainId === 42220 ? celoMainnet : celoSepolia;
