import { http, createConfig } from "wagmi";
import { injected } from "wagmi/connectors";
import { activeChain, celoMainnet, celoSepolia } from "./chain";

const other = activeChain.id === celoMainnet.id ? celoSepolia : celoMainnet;

// Single injected connector covers MiniPay (in-wallet browser) and desktop
// wallets like MetaMask. activeChain is listed first (the default).
export const wagmiConfig = createConfig({
  chains: [activeChain, other],
  connectors: [injected()],
  transports: {
    [celoSepolia.id]: http(),
    [celoMainnet.id]: http(),
  },
  ssr: true,
});
