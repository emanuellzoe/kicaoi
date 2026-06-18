// Committed deployment registry so the frontend works out-of-the-box after a
// fresh clone (no .env.local needed). An env override still wins when present.

export type Deployment = {
  chainId: number;
  address: `0x${string}`;
  explorer: string;
  startBlock?: bigint;
};

export const DEPLOYMENTS: Record<number, Deployment> = {
  // Celo Sepolia (testnet) — live & Sourcify-verified
  11142220: {
    chainId: 11142220,
    address: "0x82622F1d43B25DBB2414285FF98c52d694661c61",
    explorer: "https://sepolia.celoscan.io",
  },
  // Celo Mainnet — live & Sourcify-verified
  42220: {
    chainId: 42220,
    address: "0xb8Fb82C02acCbb0cbE613e3633781a67438563d9",
    explorer: "https://celoscan.io",
    startBlock: 69521009n, // contract deploy block (broadcast run-latest)
  },
};

const ENV_CHAIN_ID = Number(process.env.NEXT_PUBLIC_CHAIN_ID ?? 11142220);

/**
 * Returns the deployment config for a given chain ID.
 * Falls back to the active env chain when `chainId` is omitted.
 */
export function deploymentForChain(chainId: number = ENV_CHAIN_ID): Deployment | undefined {
  return DEPLOYMENTS[chainId];
}

/** Returns all chain IDs that have a committed deployment entry. */
export function getAllDeploymentChainIds(): number[] {
  return Object.keys(DEPLOYMENTS).map(Number);
}

/** Returns true if there is a deployment configured for the given chain ID. */
export function hasDeployment(chainId: number): boolean {
  return chainId in DEPLOYMENTS;
}
