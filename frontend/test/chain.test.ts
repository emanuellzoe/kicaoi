import { describe, it, expect } from "vitest";
import { activeChain, celoMainnet, celoSepolia } from "@/lib/chain";
import { CELO_MAINNET_CHAIN_ID } from "@/lib/constants";

describe("chain definitions", () => {
  it("exposes the Celo mainnet chain", () => {
    expect(celoMainnet.id).toBe(CELO_MAINNET_CHAIN_ID);
  });

  it("exposes a distinct Sepolia testnet chain", () => {
    expect(celoSepolia.id).not.toBe(celoMainnet.id);
  });

  it("defaults the active chain to Sepolia when NEXT_PUBLIC_CHAIN_ID is unset", () => {
    // The test runner sets no NEXT_PUBLIC_CHAIN_ID, so the default applies.
    expect(activeChain.id).toBe(celoSepolia.id);
  });
});
