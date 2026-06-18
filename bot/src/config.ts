import "dotenv/config";
import { fileURLToPath } from "url";
import { parseEther, type Address } from "viem";
import { resolveChain, type ChainName } from "./chains.js";

const num = (v: string | undefined, d: number) => (!v ? d : Number(v));
const str = (v: string | undefined, d: string) => (!v ? d : v);
const key = (v: string | undefined): `0x${string}` => {
  const k = (v ?? "").trim();
  return (k && !k.startsWith("0x") ? "0x" + k : k) as `0x${string}`;
};

const chainName = (process.env.CHAIN ?? "sepolia") as ChainName;

const HARDCODED_ADDRESSES: Record<ChainName, Address> = {
  celo:    "0xb8Fb82C02acCbb0cbE613e3633781a67438563d9",
  sepolia: "0x82622F1d43B25DBB2414285FF98c52d694661c61",
};

export const config = {
  chainName,
  chain: resolveChain(chainName),
  rpcUrl: process.env.RPC_URL || undefined,

  kicaoiAddress: (process.env.KICAOI_ADDRESS || HARDCODED_ADDRESSES[chainName]) as Address,

  // Wallet fleet
  numWallets:         num(process.env.NUM_WALLETS, 10),
  funderPrivateKey:   key(process.env.FUNDER_PRIVATE_KEY),
  fundPerWallet:      parseEther(str(process.env.FUND_PER_WALLET, "0.5")),
  fundPerWalletStr:   str(process.env.FUND_PER_WALLET, "0.5"),

  // Farm
  cropId:             num(process.env.CROP_ID, 1),   // 1=Wheat 2=Pumpkin 3=Golden
  buySeedCelo:        parseEther(str(process.env.BUY_SEED_CELO, "0.15")),
  buySeedCeloStr:     str(process.env.BUY_SEED_CELO, "0.15"),

  // Seed-spam
  spamBuyMin:         parseEther(str(process.env.SPAM_BUY_MIN, "0.01")),
  spamBuyMinStr:      str(process.env.SPAM_BUY_MIN, "0.01"),
  spamPerRun:         num(process.env.SPAM_PER_RUN, 1),

  // Operational
  concurrency:        num(process.env.CONCURRENCY, 5),
  minGasReserve:      parseEther(str(process.env.MIN_GAS_RESERVE, "0.02")),
  minGasReserveStr:   str(process.env.MIN_GAS_RESERVE, "0.02"),

  // Gas estimates (for headroom checks only; live txs use viem estimation)
  gasPerBuySeeds:     num(process.env.GAS_PER_BUY_SEEDS, 80000),
  gasPerPlant:        num(process.env.GAS_PER_PLANT, 100000),
  gasPerHarvest:      num(process.env.GAS_PER_HARVEST, 80000),

  logFile: fileURLToPath(new URL("../farm-activity.log", import.meta.url)),
};

export const WALLETS_FILE = fileURLToPath(new URL("../wallets.json", import.meta.url));
export const PUBLIC_FILE  = fileURLToPath(new URL("../wallets.public.json", import.meta.url));
export const LOG_FILE     = fileURLToPath(new URL("../farm-activity.log", import.meta.url));


// [bot-ver] 1.5.2