import { celo, celoSepolia as celoSepoliaViem } from "viem/chains";

export const celoMainnet = celo;
export const celoSepolia = celoSepoliaViem;

const chainId = Number(import.meta.env.VITE_CHAIN_ID ?? 11142220);
export const activeChain = chainId === 42220 ? celoMainnet : celoSepolia;
