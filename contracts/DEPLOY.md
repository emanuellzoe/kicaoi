# Deploying KicaoiFarm

## Prerequisites

- [Foundry](https://book.getfoundry.sh) installed (`forge`, `cast`).
- A **dedicated, non-personal** wallet (never your main wallet).
- Testnet CELO on **Celo Sepolia** for that wallet (faucet: https://faucet.celo.org → Celo Sepolia).

## 1. Configure secrets

```bash
cd contracts
cp .env.example .env
# edit .env and set:
#   PRIVATE_KEY=<deployer key, hex>
#   CELOSCAN_API_KEY=<from celoscan.io, for --verify>
```

`.env` is gitignored — never commit it.

## 2. Sanity checks

```bash
forge build
forge test            # 26 tests should pass
```

## 3. Deploy to Celo Sepolia (testnet)

```bash
source .env
forge script script/KicaoiFarm.s.sol:KicaoiFarmScript \
  --rpc-url "$CELO_SEPOLIA_RPC_URL" \
  --private-key "$PRIVATE_KEY" \
  --broadcast
```

The console prints `KicaoiFarm deployed at: 0x...`. Crops (Wheat/Pumpkin/Golden) and the
`1 CELO = 100 SEED` rate are seeded in the constructor, so the contract is playable immediately —
no post-deploy config required.

## 4. Verify on Celoscan (optional but recommended for Proof of Ship)

```bash
forge verify-contract <DEPLOYED_ADDRESS> src/KicaoiFarm.sol:KicaoiFarm \
  --chain 11142220 \
  --etherscan-api-key "$CELOSCAN_API_KEY" \
  --verifier-url https://api-sepolia.celoscan.io/api
```

## 5. Smoke test the live contract

```bash
# Buy 0.1 CELO worth of SEED (expect 10 SEED)
cast send <ADDR> "buySeeds()" --value 0.1ether --rpc-url "$CELO_SEPOLIA_RPC_URL" --private-key "$PRIVATE_KEY"
cast call <ADDR> "seedBalance(address)(uint256)" <YOUR_ADDR> --rpc-url "$CELO_SEPOLIA_RPC_URL"

# Plant Wheat on plot 0, then (after 5 min) harvest
cast send <ADDR> "plant(uint256,uint8)" 0 1 --rpc-url "$CELO_SEPOLIA_RPC_URL" --private-key "$PRIVATE_KEY"
cast send <ADDR> "harvest(uint256)" 0 --rpc-url "$CELO_SEPOLIA_RPC_URL" --private-key "$PRIVATE_KEY"
```

## Mainnet (later — only after H-1 mitigations in AUDIT.md)

Swap `$CELO_SEPOLIA_RPC_URL` → `$CELO_RPC_URL` and `--chain 11142220` → `--chain 42220`.
Move ownership to a multisig + timelock first.
