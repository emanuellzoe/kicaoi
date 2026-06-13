# Kicaoi — Frontend

A very simple, mobile-first Next.js MiniApp for the KicaoiFarm contract.
One responsive page works as both a **website** (desktop browser) and a **mobile** app
(inside the MiniPay in-wallet browser).

## What it does

- Detects MiniPay (`window.ethereum.isMiniPay`), auto-connects, and hides the Connect button.
- Shows CELO + SEED balances.
- Buy SEED (`1 CELO = 100 SEED`), plant crops, watch the grow timer, harvest, unlock plots.
- Each action is one onchain transaction.

## Setup

```bash
cd frontend
npm install
cp .env.local.example .env.local
# set NEXT_PUBLIC_KICAOI_CONTRACT_ADDRESS to your deployed contract
npm run dev        # http://localhost:3000
```

## Env

| Var | Meaning |
|---|---|
| `NEXT_PUBLIC_KICAOI_CONTRACT_ADDRESS` | Deployed KicaoiFarm address |
| `NEXT_PUBLIC_CHAIN_ID` | `11142220` = Celo Sepolia, `42220` = Mainnet |

## Stack

Next.js (App Router) · React · wagmi + viem · plain CSS (no UI framework — kept minimal).

## Files

```
frontend/
├── app/
│   ├── layout.tsx        # html shell + providers + viewport
│   ├── providers.tsx     # wagmi + react-query
│   ├── page.tsx          # the whole farm UI
│   └── globals.css       # mobile-first styles
├── hooks/useMiniPay.ts   # MiniPay detect + auto-connect
└── lib/
    ├── chain.ts          # Celo Sepolia / Mainnet
    ├── wagmi.ts          # wagmi config (injected connector)
    └── contract.ts       # address + minimal ABI + crop catalog
```
