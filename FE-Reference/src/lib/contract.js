import { deploymentForChain } from "./deployments";

export const CUSD_ADDRESS = {
  42220: "0x765DE816845861e75A25fCA122bb6898B8B1282a",
  44787: "0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1",
};

const ZERO = "0x0000000000000000000000000000000000000000";

const envAddr = import.meta.env.VITE_KICAOI_CONTRACT_ADDRESS;
export const KICAOI_ADDRESS = (
  envAddr && envAddr !== ZERO ? envAddr : deploymentForChain()?.address ?? ZERO
);

export const CROPS = [
  { id: 1, name: "Wheat", emoji: "🌾", cost: 5, growMins: 5, yield: 9 },
  { id: 2, name: "Pumpkin", emoji: "🎃", cost: 20, growMins: 30, yield: 38 },
  { id: 3, name: "Golden", emoji: "✨", cost: 60, growMins: 120, yield: 130 },
];

export function cropById(id) {
  return CROPS.find((c) => c.id === id);
}

export const KICAOI_ABI = [
  { type: "function", name: "buySeeds", stateMutability: "payable", inputs: [], outputs: [] },
  { type: "function", name: "plant", stateMutability: "nonpayable", inputs: [{ name: "plotId", type: "uint256" }, { name: "cropId", type: "uint8" }], outputs: [] },
  { type: "function", name: "harvest", stateMutability: "nonpayable", inputs: [{ name: "plotId", type: "uint256" }], outputs: [] },
  { type: "function", name: "unlockPlot", stateMutability: "nonpayable", inputs: [], outputs: [] },
  { type: "function", name: "seedBalance", stateMutability: "view", inputs: [{ name: "", type: "address" }], outputs: [{ name: "", type: "uint256" }] },
  { type: "function", name: "nextUnlockCost", stateMutability: "view", inputs: [{ name: "user", type: "address" }], outputs: [{ name: "", type: "uint256" }] },
  { type: "function", name: "getStats", stateMutability: "view", inputs: [{ name: "user", type: "address" }], outputs: [{ name: "", type: "tuple", components: [{ name: "plotCount", type: "uint64" }, { name: "totalPlanted", type: "uint64" }, { name: "totalHarvested", type: "uint64" }, { name: "totalSeedHarvested", type: "uint256" }] }] },
  { type: "function", name: "getPlots", stateMutability: "view", inputs: [{ name: "user", type: "address" }, { name: "from", type: "uint256" }, { name: "to", type: "uint256" }], outputs: [{ name: "out", type: "tuple[]", components: [{ name: "cropId", type: "uint8" }, { name: "plantedAt", type: "uint64" }] }] },
  { type: "function", name: "batchHarvest", stateMutability: "nonpayable", inputs: [{ name: "plotIds", type: "uint256[]" }], outputs: [] },
  { type: "function", name: "batchPlant", stateMutability: "nonpayable", inputs: [{ name: "plotIds", type: "uint256[]" }, { name: "cropIds", type: "uint8[]" }], outputs: [] },
];
