export const DEPLOYMENTS = {
  11142220: {
    chainId: 11142220,
    address: "0x82622F1d43B25DBB2414285FF98c52d694661c61",
    explorer: "https://sepolia.celoscan.io",
    startBlock: 0n,
  },
  42220: {
    chainId: 42220,
    address: "0xb8Fb82C02acCbb0cbE613e3633781a67438563d9",
    explorer: "https://celoscan.io",
    startBlock: 38700000n,
  },
};

const ENV_CHAIN_ID = Number(import.meta.env.VITE_CHAIN_ID ?? 11142220);

export function deploymentForChain(chainId = ENV_CHAIN_ID) {
  return DEPLOYMENTS[chainId];
}
