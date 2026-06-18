import { http, createConfig } from "wagmi";
import { injected } from "wagmi/connectors";
import { activeChain, celoMainnet, celoSepolia } from "./chain";
import { RPC_URLS } from "./publicClient";

// The non-active chain is included so wagmi can handle cross-chain switching
// without a page reload. activeChain is always listed first (the default).
const other = activeChain.id === celoMainnet.id ? celoSepolia : celoMainnet;

// Single injected connector covers MiniPay (in-wallet browser) and desktop
// wallets like MetaMask. activeChain is listed first (the default).
// Transports use the public Forno RPC; production apps should use a private RPC.
export const wagmiConfig = createConfig({
  chains: [activeChain, other],
  connectors: [injected()],
  transports: {
    [celoSepolia.id]: http(RPC_URLS[celoSepolia.id]),
    [celoMainnet.id]: http(RPC_URLS[celoMainnet.id]),
  },
  ssr: true,
});
