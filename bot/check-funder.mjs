import "dotenv/config";
import { createPublicClient, http, formatEther } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { celo } from "viem/chains";

const rawKey = process.env.FUNDER_PRIVATE_KEY?.trim() ?? "";
const key = rawKey.startsWith("0x") ? rawKey : "0x" + rawKey;
const account = privateKeyToAccount(key);
const pub = createPublicClient({ chain: celo, transport: http() });
const bal = await pub.getBalance({ address: account.address });
console.log("Funder:", account.address);
console.log("Balance:", formatEther(bal), "CELO");
