import { http, createConfig } from "wagmi";
import { injected } from "wagmi/connectors";
import { activeChain, celoMainnet, celoSepolia } from "./chain";

const other = activeChain.id === celoMainnet.id ? celoSepolia : celoMainnet;

export const wagmiConfig = createConfig({
  chains: [activeChain, other],
  connectors: [injected()],
  transports: {
    [celoSepolia.id]: http(),
    [celoMainnet.id]: http(),
  },
});
