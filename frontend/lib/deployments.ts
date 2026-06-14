// Committed deployment registry so the frontend works out-of-the-box after a
// fresh clone (no .env.local needed). An env override still wins when present.

export type Deployment = {
  chainId: number;
  address: `0x${string}`;
  explorer: string;
  startBlock?: number;
};

export const DEPLOYMENTS: Record<number, Deployment> = {
  // Celo Sepolia (testnet) — live & Sourcify-verified
  11142220: {
    chainId: 11142220,
    address: "0x82622F1d43B25DBB2414285FF98c52d694661c61",
    explorer: "https://sepolia.celoscan.io",
  },
  // Celo Mainnet — not deployed yet
  // 42220: { chainId: 42220, address: "0x...", explorer: "https://celoscan.io" },
};

const ENV_CHAIN_ID = Number(process.env.NEXT_PUBLIC_CHAIN_ID ?? 11142220);

export function deploymentForChain(chainId: number = ENV_CHAIN_ID): Deployment | undefined {
  return DEPLOYMENTS[chainId];
}
