import { celo, celoSepolia as celoSepoliaViem, type Chain } from "viem/chains";
import { CELO_MAINNET_CHAIN_ID } from "./constants";

// Use viem/chains definitions — they include CIP-64 (feeCurrency) formatters
// so users can pay gas with cUSD instead of native CELO.
export const celoMainnet: Chain = celo;
export const celoSepolia: Chain = celoSepoliaViem;

const chainId = Number(process.env.NEXT_PUBLIC_CHAIN_ID ?? 11142220);

/** The active chain selected via NEXT_PUBLIC_CHAIN_ID (defaults to Celo Sepolia). */
export const activeChain: Chain = chainId === CELO_MAINNET_CHAIN_ID ? celoMainnet : celoSepolia;
