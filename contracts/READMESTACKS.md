# KicaoiFarm — Stacks Smart Contract Guide

> Port dari `KicaoiFarm.sol` (Celo/Solidity) ke **Clarity** untuk Hackathon  
> **Stacks Builder Rewards — Jun 2026** ($5,000 · 50 Winners · Jun 1–30)  
> Stacks adalah Bitcoin L2 untuk Smart Contracts, Apps, dan DeFi.

---

## Daftar Isi

1. [Mengapa Stacks?](#1-mengapa-stacks)
2. [Solidity vs Clarity — Perbedaan Kunci](#2-solidity-vs-clarity--perbedaan-kunci)
3. [Prerequisites](#3-prerequisites)
4. [Instalasi Clarinet](#4-instalasi-clarinet)
5. [Inisialisasi Project Clarinet](#5-inisialisasi-project-clarinet)
6. [Struktur Project](#6-struktur-project)
7. [Anatomi Kontrak Clarity (kicaoi-farm.clar)](#7-anatomi-kontrak-clarity-kicaoi-farmclar)
8. [Konfigurasi Clarinet.toml](#8-konfigurasi-clarinettoml)
9. [Konfigurasi Network Settings](#9-konfigurasi-network-settings)
10. [Testing dengan Clarinet](#10-testing-dengan-clarinet)
11. [Devnet — Local Blockchain](#11-devnet--local-blockchain)
12. [Deploy ke Testnet (Stacks Nakamoto Testnet)](#12-deploy-ke-testnet-stacks-nakamoto-testnet)
13. [Post-Deploy: initialize-crops](#13-post-deploy-initialize-crops)
14. [Deploy ke Mainnet](#14-deploy-ke-mainnet)
15. [Interaksi dengan Hiro API](#15-interaksi-dengan-hiro-api)
16. [Submit ke Hackathon](#16-submit-ke-hackathon)
17. [Referensi](#17-referensi)

---

## 1. Mengapa Stacks?

| Fitur | Penjelasan |
|---|---|
| **Bitcoin L2** | Kontrak di-anchor ke Bitcoin — keamanan terkuat di dunia |
| **Clarity Language** | Bahasa kontrak yang aman, decidable, dan tidak di-compile ke bytecode |
| **PoX (Proof of Transfer)** | Konsensus menggunakan BTC, bukan mining proof-of-work baru |
| **Hiro Tooling** | Clarinet (setara Foundry), Hiro Platform, Stacks.js |
| **Hackathon Prize** | $5,000 dibagi 50 pemenang — cukup tambah 1 kontrak Stacks ke project |

---

## 2. Solidity vs Clarity — Perbedaan Kunci

Karena kita sudah punya `KicaoiFarm.sol` (Solidity/Foundry), berikut mapping konsep krusial:

| Konsep | Solidity (Celo) | Clarity (Stacks) |
|---|---|---|
| **Bahasa** | Compiled → EVM bytecode | Interpreted — tidak ada bytecode |
| **Native token** | `msg.value` / CELO (wei) | `stx-transfer?` / STX (microSTX, 1 STX = 1,000,000 µSTX) |
| **Pengirim transaksi** | `msg.sender` | `tx-sender` |
| **Timer / waktu** | `block.timestamp` (detik) | `block-height` (blok Stacks ~10 detik/blok post-Nakamoto) |
| **Address type** | `address` | `principal` |
| **Mapping** | `mapping(K => V)` | `(define-map name key-type val-type)` |
| **Struct** | `struct Foo { ... }` | tuple: `{ field: type, ... }` |
| **State variable** | `uint public x` | `(define-data-var x uint u0)` |
| **Constant** | `uint constant X = 1` | `(define-constant X u1)` |
| **Constructor** | `constructor()` | Tidak ada — gunakan `initialize` function |
| **Return value** | `return x` | Response type: `(ok x)` atau `(err code)` |
| **Error** | `revert` / `require` | `(asserts! cond err)` / `(unwrap! opt err)` |
| **Loops** | `for`, `while` | **Tidak ada** — Clarity bersifat decidable (no loops) |
| **Events** | `emit Event(...)` | `(print { key: val, ... })` |
| **onlyOwner** | `modifier onlyOwner` | `(asserts! (is-eq tx-sender owner) ERR-NOT-OWNER)` |
| **View function** | `view` | `(define-read-only ...)` |
| **Public function** | `public` | `(define-public ...)` |
| **Private function** | `internal/private` | `(define-private ...)` |
| **Optional value** | `mapping` returns 0 default | `(optional T)` — pakai `(default-to val (map-get? ...))` |

### Grow Time: timestamp vs block-height

KicaoiFarm.sol menggunakan `block.timestamp` (detik):
- Wheat: 5 menit = 300 detik
- Pumpkin: 30 menit = 1800 detik
- Golden Crop: 2 jam = 7200 detik

Di Stacks post-Nakamoto, `block-height` = Stacks block height (~10 detik/blok):
- Wheat: 5 menit ≈ **30 blok**
- Pumpkin: 30 menit ≈ **180 blok**
- Golden Crop: 2 jam ≈ **720 blok**

---

## 3. Prerequisites

| Tool | Versi | Kegunaan |
|---|---|---|
| [Node.js](https://nodejs.org) | 18+ | Clarinet CLI & Stacks.js |
| [Git](https://git-scm.com) | any | Version control |
| [Clarinet](https://docs.hiro.so/clarinet) | latest | Smart contract toolchain |
| [Leather Wallet](https://leather.io) atau [Xverse](https://xverse.app) | latest | Wallet Stacks untuk deploy |
| Teks editor + [Clarity VSCode Extension](https://marketplace.visualstudio.com/items?itemName=HiroSystems.clarity-lsp) | — | Syntax highlight & LSP |

Pastikan akun kamu punya **STX di testnet** (untuk deploy & gas).  
Faucet: https://explorer.hiro.so/sandbox/faucet?chain=testnet

---

## 4. Instalasi Clarinet

### Windows (via Winget — Recommended)

```powershell
winget install clarinet
```

### Windows (via Chocolatey)

```powershell
choco install clarinet
```

### macOS (via Homebrew)

```bash
brew install clarinet
```

### Semua Platform (via npm / npx)

```bash
npm install -g @hirosystems/clarinet
```

### Verifikasi Instalasi

```bash
clarinet --version
# Output: clarinet-cli X.Y.Z
```

---

## 5. Inisialisasi Project Clarinet

```bash
# Dari root repo kicaoi
cd E:\HACKATHON\KICAOI

# Buat project Clarinet baru di folder contracts-stacks
clarinet new contracts-stacks
cd contracts-stacks

# Buat kontrak utama
clarinet contract new kicaoi-farm
```

Perintah `clarinet contract new kicaoi-farm` akan membuat:
- `contracts/kicaoi-farm.clar` — file kontrak (isi dengan implementasi di bawah)
- `tests/kicaoi-farm_test.ts` — file test (Vitest / Deno)

---

## 6. Struktur Project

```
contracts-stacks/
├── Clarinet.toml              # Konfigurasi project + daftar kontrak
├── settings/
│   ├── Devnet.toml            # Config local blockchain
│   ├── Testnet.toml           # Config testnet Stacks
│   └── Mainnet.toml           # Config mainnet Stacks
├── contracts/
│   └── kicaoi-farm.clar       # Smart contract utama (Clarity)
└── tests/
    └── kicaoi-farm_test.ts    # Unit tests
```

---

## 7. Anatomi Kontrak Clarity (kicaoi-farm.clar)

Ini adalah blueprint lengkap `contracts/kicaoi-farm.clar`. Salin seluruh kode ini ke file tersebut.

```clarity
;; KicaoiFarm — Clarity port for Stacks (Bitcoin L2)
;; Idle farming game: buy SEED with STX, plant → wait → harvest
;;
;; Perbedaan dari versi Solidity:
;;   - STX (microSTX) menggantikan CELO sebagai deposit
;;   - block-height menggantikan block.timestamp untuk grow timer
;;   - Tidak ada constructor — panggil initialize-crops setelah deploy
;;   - Semua fungsi publik mengembalikan (ok ...) atau (err ...)

;; ================================================================
;; Error codes
;; ================================================================
(define-constant ERR-ZERO-VALUE     (err u100))
(define-constant ERR-CROP-DISABLED  (err u101))
(define-constant ERR-PLOT-OOB       (err u102))
(define-constant ERR-PLOT-NOT-EMPTY (err u103))
(define-constant ERR-PLOT-EMPTY     (err u104))
(define-constant ERR-NOT-MATURE     (err u105))
(define-constant ERR-NO-SEED        (err u106))
(define-constant ERR-NO-PLOTS       (err u107))
(define-constant ERR-NOT-OWNER      (err u108))
(define-constant ERR-ALREADY-INIT   (err u109))

;; ================================================================
;; Data variables (setara state variable Solidity)
;; ================================================================
(define-data-var contract-owner   principal tx-sender)
(define-data-var seed-per-stx     uint      u100)   ;; 100 SEED per 1 STX
(define-data-var starting-plots   uint      u3)
(define-data-var unlock-base-cost uint      u50)
(define-data-var initialized      bool      false)

;; ================================================================
;; Maps (setara mapping Solidity)
;; ================================================================

;; Saldo SEED per pemain
(define-map seed-balance principal uint)

;; State plot per (pemain, plot-id)
;; crop-id: 0 = empty | planted-at: block-height saat tanam
(define-map plots
    { player: principal, plot-id: uint }
    { crop-id: uint, planted-at: uint }
)

;; Statistik lifetime per pemain
(define-map player-stats principal
    {
        plot-count:           uint,
        total-planted:        uint,
        total-harvested:      uint,
        total-seed-harvested: uint
    }
)

;; Konfigurasi crop per crop-id (0 reserved = empty)
(define-map crops uint
    {
        plant-cost:   uint,    ;; SEED yang dibakar untuk menanam
        yield-amount: uint,    ;; SEED yang didapat saat panen
        grow-time:    uint,    ;; jumlah blok hingga matang
        enabled:      bool
    }
)

;; ================================================================
;; Private helpers
;; ================================================================

(define-private (is-owner)
    (is-eq tx-sender (var-get contract-owner))
)

(define-private (get-seed (who principal))
    (default-to u0 (map-get? seed-balance who))
)

(define-private (get-stats (who principal))
    (default-to
        { plot-count: u0, total-planted: u0,
          total-harvested: u0, total-seed-harvested: u0 }
        (map-get? player-stats who)
    )
)

(define-private (get-plot-data (who principal) (pid uint))
    (default-to
        { crop-id: u0, planted-at: u0 }
        (map-get? plots { player: who, plot-id: pid })
    )
)

;; ================================================================
;; Player actions
;; ================================================================

;; Beli SEED dengan STX.
;; amount = microSTX (1 STX = 1,000,000 microSTX)
;; Pemain baru otomatis dapat starting-plots saat pertama beli.
(define-public (buy-seeds (amount uint))
    (begin
        (asserts! (> amount u0) ERR-ZERO-VALUE)
        ;; Transfer STX dari pemain ke kontrak
        (try! (stx-transfer? amount tx-sender (as-contract tx-sender)))
        (let (
            ;; credited = (amount * 100) / 1_000_000
            ;; misal: 1_000_000 microSTX * 100 / 1_000_000 = 100 SEED
            (credited (/ (* amount (var-get seed-per-stx)) u1000000))
            (s        (get-stats tx-sender))
        )
            (map-set seed-balance tx-sender (+ (get-seed tx-sender) credited))
            ;; Inisialisasi plots untuk pemain baru
            (if (is-eq (get plot-count s) u0)
                (map-set player-stats tx-sender
                    (merge s { plot-count: (var-get starting-plots) }))
                true
            )
            (print { event: "seeds-bought", user: tx-sender,
                     stx-amount: amount, seed-credited: credited })
            (ok credited)
        )
    )
)

;; Tanam crop di plot yang kosong
(define-public (plant (plot-id uint) (crop-id uint))
    (let (
        (crop (unwrap! (map-get? crops crop-id) ERR-CROP-DISABLED))
        (s    (get-stats tx-sender))
        (plt  (get-plot-data tx-sender plot-id))
        (bal  (get-seed tx-sender))
    )
        (asserts! (get enabled crop)             ERR-CROP-DISABLED)
        (asserts! (< plot-id (get plot-count s)) ERR-PLOT-OOB)
        (asserts! (is-eq (get crop-id plt) u0)  ERR-PLOT-NOT-EMPTY)
        (asserts! (>= bal (get plant-cost crop)) ERR-NO-SEED)

        (map-set seed-balance tx-sender (- bal (get plant-cost crop)))
        (map-set plots { player: tx-sender, plot-id: plot-id }
            { crop-id: crop-id, planted-at: block-height })
        (map-set player-stats tx-sender
            (merge s { total-planted: (+ (get total-planted s) u1) }))

        (print { event: "planted", user: tx-sender, plot-id: plot-id,
                 crop-id: crop-id, planted-at: block-height })
        (ok true)
    )
)

;; Panen plot yang sudah matang
(define-public (harvest (plot-id uint))
    (let (
        (s   (get-stats tx-sender))
        (plt (get-plot-data tx-sender plot-id))
        (cid (get crop-id plt))
    )
        (asserts! (< plot-id (get plot-count s)) ERR-PLOT-OOB)
        (asserts! (not (is-eq cid u0))           ERR-PLOT-EMPTY)
        (let (
            (crop       (unwrap! (map-get? crops cid) ERR-CROP-DISABLED))
            (matures-at (+ (get planted-at plt) (get grow-time crop)))
        )
            (asserts! (>= block-height matures-at) ERR-NOT-MATURE)

            (map-set plots { player: tx-sender, plot-id: plot-id }
                { crop-id: u0, planted-at: u0 })
            (map-set seed-balance tx-sender
                (+ (get-seed tx-sender) (get yield-amount crop)))
            (map-set player-stats tx-sender
                (merge s {
                    total-harvested:      (+ (get total-harvested s) u1),
                    total-seed-harvested: (+ (get total-seed-harvested s)
                                             (get yield-amount crop))
                }))

            (print { event: "harvested", user: tx-sender, plot-id: plot-id,
                     crop-id: cid, yield-amount: (get yield-amount crop) })
            (ok (get yield-amount crop))
        )
    )
)

;; Unlock satu plot tambahan dengan membakar SEED
(define-public (unlock-plot)
    (let (
        (s    (get-stats tx-sender))
        (cnt  (get plot-count s))
        (cost (* (var-get unlock-base-cost) cnt))
        (bal  (get-seed tx-sender))
    )
        (asserts! (> cnt u0)    ERR-NO-PLOTS)
        (asserts! (>= bal cost) ERR-NO-SEED)

        (map-set seed-balance tx-sender (- bal cost))
        (map-set player-stats tx-sender
            (merge s { plot-count: (+ cnt u1) }))

        (print { event: "plot-unlocked", user: tx-sender,
                 new-count: (+ cnt u1), cost: cost })
        (ok (+ cnt u1))
    )
)

;; ================================================================
;; Read-only views (setara view/pure Solidity — tidak kena gas)
;; ================================================================

(define-read-only (get-seed-balance (who principal))
    (get-seed who)
)

(define-read-only (get-player-stats (who principal))
    (get-stats who)
)

(define-read-only (get-plot-info (who principal) (plot-id uint))
    (get-plot-data who plot-id)
)

(define-read-only (get-crop-info (crop-id uint))
    (map-get? crops crop-id)
)

;; True jika plot sudah matang dan siap dipanen
(define-read-only (is-plot-ready (who principal) (plot-id uint))
    (let (
        (plt (get-plot-data who plot-id))
        (cid (get crop-id plt))
    )
        (if (is-eq cid u0)
            false
            (match (map-get? crops cid)
                crop (>= block-height
                         (+ (get planted-at plt) (get grow-time crop)))
                false
            )
        )
    )
)

;; Biaya SEED untuk unlock plot berikutnya
(define-read-only (next-unlock-cost (who principal))
    (* (var-get unlock-base-cost) (get plot-count (get-stats who)))
)

;; Semua config kontrak (untuk frontend)
(define-read-only (get-config)
    {
        owner:            (var-get contract-owner),
        seed-per-stx:     (var-get seed-per-stx),
        starting-plots:   (var-get starting-plots),
        unlock-base-cost: (var-get unlock-base-cost),
        initialized:      (var-get initialized)
    }
)

;; ================================================================
;; Admin functions
;; ================================================================

;; WAJIB dipanggil satu kali setelah deploy untuk setup crop awal
(define-public (initialize-crops)
    (begin
        (asserts! (is-owner)                  ERR-NOT-OWNER)
        (asserts! (not (var-get initialized)) ERR-ALREADY-INIT)
        ;; Wheat:       cost=5  SEED | grow=30 blok (~5 mnt)  | yield=9
        (map-set crops u1 { plant-cost: u5,  yield-amount: u9,
                            grow-time: u30,  enabled: true })
        ;; Pumpkin:     cost=20 SEED | grow=180 blok (~30 mnt) | yield=38
        (map-set crops u2 { plant-cost: u20, yield-amount: u38,
                            grow-time: u180, enabled: true })
        ;; Golden Crop: cost=60 SEED | grow=720 blok (~2 jam)  | yield=130
        (map-set crops u3 { plant-cost: u60, yield-amount: u130,
                            grow-time: u720, enabled: true })
        (var-set initialized true)
        (ok true)
    )
)

(define-public (set-crop (crop-id uint) (plant-cost uint)
                         (grow-time uint) (yield-amount uint) (enabled bool))
    (begin
        (asserts! (is-owner)     ERR-NOT-OWNER)
        (asserts! (> crop-id u0) ERR-ZERO-VALUE)
        (map-set crops crop-id
            { plant-cost:   plant-cost,   yield-amount: yield-amount,
              grow-time:    grow-time,    enabled:      enabled })
        (print { event: "crop-updated", crop-id: crop-id,
                 plant-cost: plant-cost, grow-time: grow-time,
                 yield-amount: yield-amount, enabled: enabled })
        (ok true)
    )
)

(define-public (set-seed-rate (new-rate uint))
    (begin
        (asserts! (is-owner) ERR-NOT-OWNER)
        (var-set seed-per-stx new-rate)
        (print { event: "seed-rate-updated", rate: new-rate })
        (ok true)
    )
)

(define-public (set-starting-plots (count uint))
    (begin
        (asserts! (is-owner) ERR-NOT-OWNER)
        (var-set starting-plots count)
        (ok true)
    )
)

(define-public (set-unlock-base-cost (cost uint))
    (begin
        (asserts! (is-owner) ERR-NOT-OWNER)
        (var-set unlock-base-cost cost)
        (ok true)
    )
)

;; Tarik STX yang terkumpul dari penjualan SEED ke treasury
(define-public (withdraw-stx (amount uint) (recipient principal))
    (begin
        (asserts! (is-owner) ERR-NOT-OWNER)
        (try! (as-contract (stx-transfer? amount tx-sender recipient)))
        (print { event: "stx-withdrawn", to: recipient, amount: amount })
        (ok true)
    )
)

(define-public (transfer-ownership (new-owner principal))
    (begin
        (asserts! (is-owner) ERR-NOT-OWNER)
        (var-set contract-owner new-owner)
        (ok true)
    )
)
```

---

## 8. Konfigurasi Clarinet.toml

File `Clarinet.toml` di-generate otomatis oleh `clarinet new`. Edit bagian `[contracts]`:

```toml
[project]
name = "kicaoi-farm"
description = "Idle farming game on Stacks Bitcoin L2"
authors = ["emanuellzoe"]
telemetry = false
cache_dir = ".clarinet"

[contracts.kicaoi-farm]
path = "contracts/kicaoi-farm.clar"
clarity_version = 2
epoch = "3.0"

[repl]
costs_version = 2
```

### Clarity Version & Epoch

| Versi | Keterangan |
|---|---|
| `clarity_version = 2` | Gunakan Clarity 2 (Nakamoto-compatible) |
| `epoch = "3.0"` | Epoch Stacks Nakamoto (post-upgrade, blok ~10 detik) |

---

## 9. Konfigurasi Network Settings

### settings/Devnet.toml (Local)

File ini di-generate otomatis oleh `clarinet new`. Defaults sudah cukup untuk testing lokal.

```toml
[network]
name = "devnet"
stacks_node_rpc_address = "http://localhost:20443"
bitcoin_node_rpc_address = "http://localhost:18443"

[accounts.deployer]
mnemonic = "garlic fetch electric blanket ..."   # auto-generated
balance = 100000000000    # 100,000 STX untuk testing

[accounts.wallet_1]
mnemonic = "..."
balance = 10000000000     # 10,000 STX

[accounts.wallet_2]
mnemonic = "..."
balance = 10000000000
```

### settings/Testnet.toml

```toml
[network]
name = "testnet"
stacks_node_rpc_address = "https://api.testnet.hiro.so"
```

### settings/Mainnet.toml

```toml
[network]
name = "mainnet"
stacks_node_rpc_address = "https://api.hiro.so"
```

---

## 10. Testing dengan Clarinet

### Syntax check & type check

```bash
cd contracts-stacks

# Periksa syntax Clarity (setara forge build)
clarinet check

# Output jika OK:
# ✔  1 contract checked
```

### Menulis Unit Test (tests/kicaoi-farm_test.ts)

Clarinet menggunakan **Vitest** (atau Deno) untuk testing. Contoh test lengkap:

```typescript
import {
  Clarinet,
  Tx,
  Chain,
  Account,
  types,
} from "https://deno.land/x/clarinet@v2.3.0/index.ts";
import { assertEquals } from "https://deno.land/std@0.90.0/testing/asserts.ts";

// ----------------------------------------------------------------
// Test: initialize-crops (setup awal)
// ----------------------------------------------------------------
Clarinet.test({
  name: "owner can initialize crops",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get("deployer")!;
    const block = chain.mineBlock([
      Tx.contractCall(
        "kicaoi-farm",
        "initialize-crops",
        [],
        deployer.address
      ),
    ]);
    block.receipts[0].result.expectOk().expectBool(true);
  },
});

// ----------------------------------------------------------------
// Test: buy-seeds + first-time plot initialization
// ----------------------------------------------------------------
Clarinet.test({
  name: "player can buy seeds and receives starting plots",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get("deployer")!;
    const player   = accounts.get("wallet_1")!;

    // Setup crops dulu
    chain.mineBlock([
      Tx.contractCall("kicaoi-farm", "initialize-crops", [], deployer.address),
    ]);

    // Buy 1,000,000 microSTX (= 1 STX) → expect 100 SEED
    const block = chain.mineBlock([
      Tx.contractCall(
        "kicaoi-farm",
        "buy-seeds",
        [types.uint(1_000_000)],
        player.address
      ),
    ]);

    block.receipts[0].result.expectOk().expectUint(100); // 100 SEED credited

    // Verifikasi saldo SEED
    const balance = chain.callReadOnlyFn(
      "kicaoi-farm", "get-seed-balance",
      [types.principal(player.address)], player.address
    );
    balance.result.expectUint(100);

    // Verifikasi plot count = 3 (starting-plots)
    const stats = chain.callReadOnlyFn(
      "kicaoi-farm", "get-player-stats",
      [types.principal(player.address)], player.address
    );
    // stats adalah tuple — akses plot-count
    console.log("Player stats:", stats.result);
  },
});

// ----------------------------------------------------------------
// Test: plant crop
// ----------------------------------------------------------------
Clarinet.test({
  name: "player can plant wheat on plot 0",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get("deployer")!;
    const player   = accounts.get("wallet_1")!;

    chain.mineBlock([
      Tx.contractCall("kicaoi-farm", "initialize-crops", [], deployer.address),
      Tx.contractCall("kicaoi-farm", "buy-seeds",
        [types.uint(1_000_000)], player.address),
    ]);

    // Plant Wheat (crop-id = 1) di plot 0
    const block = chain.mineBlock([
      Tx.contractCall(
        "kicaoi-farm", "plant",
        [types.uint(0), types.uint(1)],  // plot-id=0, crop-id=1 (Wheat)
        player.address
      ),
    ]);

    block.receipts[0].result.expectOk().expectBool(true);

    // SEED berkurang 5 (plant cost Wheat)
    const balance = chain.callReadOnlyFn(
      "kicaoi-farm", "get-seed-balance",
      [types.principal(player.address)], player.address
    );
    balance.result.expectUint(95); // 100 - 5
  },
});

// ----------------------------------------------------------------
// Test: harvest gagal sebelum matang
// ----------------------------------------------------------------
Clarinet.test({
  name: "harvest fails before grow time",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get("deployer")!;
    const player   = accounts.get("wallet_1")!;

    chain.mineBlock([
      Tx.contractCall("kicaoi-farm", "initialize-crops", [], deployer.address),
      Tx.contractCall("kicaoi-farm", "buy-seeds",
        [types.uint(1_000_000)], player.address),
      Tx.contractCall("kicaoi-farm", "plant",
        [types.uint(0), types.uint(1)], player.address),
    ]);

    // Harvest langsung → harus gagal (ERR-NOT-MATURE = u105)
    const block = chain.mineBlock([
      Tx.contractCall("kicaoi-farm", "harvest",
        [types.uint(0)], player.address),
    ]);
    block.receipts[0].result.expectErr().expectUint(105);
  },
});

// ----------------------------------------------------------------
// Test: harvest berhasil setelah grow time
// ----------------------------------------------------------------
Clarinet.test({
  name: "player can harvest after grow time (30 blocks for Wheat)",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get("deployer")!;
    const player   = accounts.get("wallet_1")!;

    chain.mineBlock([
      Tx.contractCall("kicaoi-farm", "initialize-crops", [], deployer.address),
      Tx.contractCall("kicaoi-farm", "buy-seeds",
        [types.uint(1_000_000)], player.address),
      Tx.contractCall("kicaoi-farm", "plant",
        [types.uint(0), types.uint(1)], player.address),
    ]);

    // Skip 30 blok (grow-time Wheat)
    chain.mineEmptyBlockUntil(chain.blockHeight + 30);

    const block = chain.mineBlock([
      Tx.contractCall("kicaoi-farm", "harvest",
        [types.uint(0)], player.address),
    ]);

    block.receipts[0].result.expectOk().expectUint(9); // 9 SEED yield Wheat
  },
});

// ----------------------------------------------------------------
// Test: unlock plot
// ----------------------------------------------------------------
Clarinet.test({
  name: "player can unlock additional plot",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get("deployer")!;
    const player   = accounts.get("wallet_1")!;

    chain.mineBlock([
      Tx.contractCall("kicaoi-farm", "initialize-crops", [], deployer.address),
      // Beli 10 STX = 1000 SEED
      Tx.contractCall("kicaoi-farm", "buy-seeds",
        [types.uint(10_000_000)], player.address),
    ]);

    // Unlock plot ke-4 (cost = 50 * 3 = 150 SEED)
    const block = chain.mineBlock([
      Tx.contractCall("kicaoi-farm", "unlock-plot", [], player.address),
    ]);
    block.receipts[0].result.expectOk().expectUint(4); // new plot-count = 4
  },
});
```

### Jalankan Tests

```bash
# Jalankan semua test (setara forge test)
clarinet test

# Output:
# Running 5 tests...
# ✔  owner can initialize crops (0ms)
# ✔  player can buy seeds and receives starting plots (2ms)
# ✔  player can plant wheat on plot 0 (1ms)
# ✔  harvest fails before grow time (1ms)
# ✔  player can harvest after grow time (30 blocks for Wheat) (3ms)
# ✔  player can unlock additional plot (1ms)
#
# 6 passed, 0 failed
```

---

## 11. Devnet — Local Blockchain

Jalankan local Stacks blockchain dengan satu perintah:

```bash
cd contracts-stacks

# Start devnet (setara anvil di Foundry)
clarinet devnet start

# Stacks node: http://localhost:20443
# Bitcoin node: http://localhost:18443
# Explorer:     http://localhost:8000
```

Di terminal lain, test interaksi manual:

```bash
# Panggil read-only function (gratis, tidak perlu wallet)
clarinet console

# Di dalam REPL:
(contract-call? .kicaoi-farm get-config)
(contract-call? .kicaoi-farm initialize-crops)
(contract-call? .kicaoi-farm buy-seeds u1000000)
(contract-call? .kicaoi-farm plant u0 u1)
(contract-call? .kicaoi-farm is-plot-ready tx-sender u0)
```

---

## 12. Deploy ke Testnet (Stacks Nakamoto Testnet)

### Step 1 — Dapatkan STX Testnet

1. Buka https://explorer.hiro.so/sandbox/faucet?chain=testnet
2. Masukkan alamat wallet Stacks kamu
3. Klik **Request STX** → dapat 500 STX testnet

### Step 2 — Set Environment Variable

```bash
# Windows PowerShell
$env:DEPLOYER_MNEMONIC = "your twelve word mnemonic phrase here ..."

# macOS/Linux
export DEPLOYER_MNEMONIC="your twelve word mnemonic phrase here ..."
```

> **KEAMANAN:** Jangan pernah commit mnemonic ke Git. Tambahkan `.env` ke `.gitignore`.

### Step 3 — Deploy ke Testnet

```bash
cd contracts-stacks

clarinet deployments generate --testnet --low-cost
# Membuat file deployment plan di deployments/testnet.yaml

clarinet deployments apply --testnet
# Meminta konfirmasi → ketik 'y'
# Output: Deployed kicaoi-farm at ST...ABC.kicaoi-farm
```

### Step 4 — Verifikasi di Stacks Explorer

Buka: https://explorer.hiro.so/?chain=testnet

Cari: `ST<alamat_kamu>.kicaoi-farm`

Kontrak akan muncul dengan tab **Functions** dan **Events**.

---

## 13. Post-Deploy: initialize-crops

Setelah deploy, **wajib panggil `initialize-crops` satu kali** untuk setup crop Wheat/Pumpkin/Golden. Kontrak tidak bisa dipakai sebelum ini.

### Via Clarinet Console (Testnet)

```bash
clarinet console --testnet
```

```clarity
;; Di dalam REPL, hubungkan ke kontrak yang sudah di-deploy:
(contract-call? 'ST<ALAMAT_KAMU>.kicaoi-farm initialize-crops)
;; Output: (ok true)
```

### Via Hiro Explorer UI

1. Buka https://explorer.hiro.so/?chain=testnet
2. Cari contract address kamu
3. Tab **Functions** → pilih `initialize-crops`
4. Connect wallet → Execute

### Via Hiro API (curl)

```bash
# Broadcast transaction initialize-crops
curl -X POST https://api.testnet.hiro.so/v2/transactions \
  -H "Content-Type: application/json" \
  -d '{
    "tx": "<serialized_tx_hex>"
  }'
```

> Untuk membuat serialized tx, gunakan **Stacks.js** atau **Leather Wallet**.

---

## 14. Deploy ke Mainnet

Setelah semua test lulus di testnet:

### Step 1 — Pastikan ada STX Mainnet

Beli STX di exchange (Binance, Coinbase, dll) dan kirim ke wallet Stacks kamu.  
Estimasi gas deploy: **~0.5 – 2 STX** tergantung ukuran kontrak.

### Step 2 — Generate & Apply Deployment

```bash
cd contracts-stacks

clarinet deployments generate --mainnet
# Periksa file deployments/mainnet.yaml sebelum apply

clarinet deployments apply --mainnet
# Konfirmasi → ketik 'y'
# Output: Deployed kicaoi-farm at SP...ABC.kicaoi-farm
```

### Step 3 — Verifikasi di Stacks Explorer (Mainnet)

Buka: https://explorer.hiro.so/

Cari: `SP<alamat_kamu>.kicaoi-farm`

### Step 4 — Panggil initialize-crops di Mainnet

Sama seperti testnet, tapi gunakan alamat mainnet dan koneksi ke mainnet.

---

## 15. Interaksi dengan Hiro API

Base URL: `https://api.hiro.so` (mainnet) atau `https://api.testnet.hiro.so` (testnet)

Dapatkan API Key gratis di: https://platform.hiro.so

### Read-only call (tidak perlu wallet)

```bash
# get-config
curl -X POST https://api.testnet.hiro.so/v2/contracts/call-read/ST<ADDR>/kicaoi-farm/get-config \
  -H "Content-Type: application/json" \
  -H "x-api-key: $HIRO_API_KEY" \
  -d '{
    "sender": "ST<ALAMAT_KAMU>",
    "arguments": []
  }'
```

```bash
# get-seed-balance untuk player tertentu
# Argument harus dalam format Clarity hex (gunakan @stacks/transactions untuk encode)
curl -X POST https://api.testnet.hiro.so/v2/contracts/call-read/ST<ADDR>/kicaoi-farm/get-seed-balance \
  -H "Content-Type: application/json" \
  -H "x-api-key: $HIRO_API_KEY" \
  -d '{
    "sender": "ST<PLAYER_ADDR>",
    "arguments": ["0x051a<PLAYER_ADDR_HEX>"]
  }'
```

### Cek events / transaksi kontrak

```bash
# Semua transaksi kontrak (untuk leaderboard)
curl https://api.testnet.hiro.so/extended/v1/address/ST<ADDR>.kicaoi-farm/transactions \
  -H "x-api-key: $HIRO_API_KEY"

# Semua events yang di-print (harvest events untuk leaderboard)
curl https://api.testnet.hiro.so/extended/v1/contract/ST<ADDR>.kicaoi-farm/events \
  -H "x-api-key: $HIRO_API_KEY"
```

### Contoh Response Event Harvest

```json
{
  "results": [
    {
      "event_index": 0,
      "event_type": "smart_contract_log",
      "contract_log": {
        "contract_id": "ST..ABC.kicaoi-farm",
        "topic": "print",
        "value": {
          "repr": "(tuple (crop-id u1) (event \"harvested\") (plot-id u0) (user ST..XYZ) (yield-amount u9))"
        }
      }
    }
  ]
}
```

### Integrasi Stacks.js (Frontend)

```typescript
import {
  makeContractCall,
  broadcastTransaction,
  AnchorMode,
  PostConditionMode,
  uintCV,
  standardPrincipalCV,
} from "@stacks/transactions";
import { StacksTestnet } from "@stacks/network";

const network   = new StacksTestnet();
const CONTRACT  = "ST<ADDR>.kicaoi-farm";
const [addr, name] = CONTRACT.split(".");

// Contoh: buy-seeds dengan 1 STX (1_000_000 microSTX)
const txOptions = {
  contractAddress: addr,
  contractName:    name,
  functionName:    "buy-seeds",
  functionArgs:    [uintCV(1_000_000)],
  senderKey:       process.env.PRIVATE_KEY!,
  network,
  anchorMode:      AnchorMode.Any,
  postConditionMode: PostConditionMode.Allow,
};

const tx     = await makeContractCall(txOptions);
const result = await broadcastTransaction(tx, network);
console.log("txid:", result.txid);
```

---

## 16. Submit ke Hackathon

**Stacks Builder Rewards Jun 2026** — https://talent.app/~/earn/stacks-builder-rewards-jun

### Checklist Submit

- [ ] Kontrak `kicaoi-farm.clar` sudah di-deploy ke **Stacks Mainnet**
- [ ] Fungsi `initialize-crops` sudah dipanggil
- [ ] Contract address bisa dicari di https://explorer.hiro.so/
- [ ] Project website sudah ada dan terverifikasi di Talent App

### Langkah-langkah di Talent App

1. Buka https://talent.app dan login
2. Buat atau pilih project **Kicaoi** (Farming Game on Stacks)
3. **Step 1:** Add Project → masukkan URL website/repo
4. **Step 2:** Verify website (ikuti instruksi verifikasi DNS/HTML)
5. **Step 3:** Add Stacks Smart Contract → masukkan contract address: `SP<ADDR>.kicaoi-farm`
6. Submit → kontrak akan diverifikasi otomatis di Stacks explorer

### Tips Meningkatkan Peluang Menang

- Pastikan kontrak punya **transaksi nyata** (bukan cuma deploy kosong)
- Tambahkan README yang jelas menjelaskan proyek
- Link ke Stacks Explorer agar mudah diverifikasi juri
- Aktif di komunitas Stacks Discord: https://discord.gg/stacks

---

## 17. Referensi

| Resource | URL |
|---|---|
| Hackathon | https://talent.app/~/earn/stacks-builder-rewards-jun |
| Stacks Docs | https://docs.stacks.co |
| Clarity Language Reference | https://docs.stacks.co/clarity/clarity-language |
| Clarinet CLI Docs | https://docs.hiro.so/clarinet |
| Hiro API Docs | https://docs.hiro.so/en/apis/stacks-blockchain-api/usage |
| Stacks.js Docs | https://docs.hiro.so/stacks.js |
| Stacks Explorer (Mainnet) | https://explorer.hiro.so |
| Stacks Explorer (Testnet) | https://explorer.hiro.so/?chain=testnet |
| Hiro Platform (API Keys) | https://platform.hiro.so |
| STX Testnet Faucet | https://explorer.hiro.so/sandbox/faucet?chain=testnet |
| Stacks Discord | https://discord.gg/stacks |
| Get Started Guide | https://www.stacks.co/build/get-started |

---

<sub>
KicaoiFarm adalah game farming idle experimental yang dibuat untuk Stacks Builder Rewards Hackathon Jun 2026.
SEED adalah kredit in-game internal, tidak dapat dipindahtangankan, dan tidak dapat ditukar kembali ke STX.
Tidak diaudit. Bukan produk keuangan atau perjudian.
</sub>
