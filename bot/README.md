# KICAOI Farm Bot

Bot multi-wallet otomatis untuk game **KICAOI** di blockchain Celo.  
Tujuan utama: memperbanyak jumlah transaksi onchain (TX Hash) secara konsisten dari banyak wallet secara paralel.

---

## Mengapa Bot Ini Dibuat

KICAOI mengikuti program **Proof of Ship** dari Celo, di mana salah satu metrik utama yang dinilai adalah **jumlah transaksi onchain**. Setiap aksi di game (beli seed, tanam, panen) adalah satu TX nyata di blockchain.

Bot ini mengotomasi siklus farming dari banyak wallet sekaligus sehingga TX terus mengalir 24 jam tanpa perlu interaksi manual.

---

## Cara Kerja Bot

### Alur Umum

```
generate wallet → distribute CELO → farm loop (harvest + plant) → ulangi
```

### Siklus Farm (Mode Utama)

Setiap wallet menjalankan langkah berikut secara otomatis:

```
1. Cek saldo CELO — skip jika gas tidak cukup
2. Beli SEED (buySeeds) — jika ini pertama kali, sekaligus membuat 3 plot
3. Baca semua plot milik wallet
4. Harvest plot yang sudah matang → TX onchain per plot
5. Beli SEED lagi jika stok habis
6. Plant ulang semua plot kosong → TX onchain per plot
```

Untuk **Wheat** (crop default, grow time 5 menit):
- Setiap siklus 6 menit → harvest + plant → **6 TX per wallet per siklus**
- 10 wallet × 6 TX × 240 siklus/hari = **±14.400 TX/hari**

### Mode Seed Spam (TX Ekstra Murah)

Selain farm loop, ada mode terpisah yang hanya memanggil `buySeeds` berulang kali.  
Tidak perlu menunggu grow time — cocok untuk menambah volume TX dengan gas minimal.

---

## Script yang Tersedia

| Perintah | Fungsi |
|---|---|
| `npm run gen` | Generate N wallet baru (simpan di `wallets.json`) |
| `npm run distribute` | Kirim CELO dari funder ke semua wallet bot |
| `npm run status` | Tampilkan saldo CELO, SEED, plot, dan total harvest per wallet |
| `npm run farm` | Jalankan farm loop: harvest plot matang + plant plot kosong |
| `npm run seed-spam` | Spam `buySeeds` di semua wallet (mode TX murah) |
| `npm run sweep` | Tarik kembali semua CELO dari wallet bot ke funder |

---

## Setup Awal

### 1. Persiapan

```bash
cd bot
npm install
cp .env.example .env
```

Isi `.env`:

```env
CHAIN=celo                    # celo = mainnet | sepolia = testnet
NUM_WALLETS=10                # jumlah wallet bot
FUNDER_PRIVATE_KEY=0x...      # wallet dedicated (BUKAN wallet personal)
FUND_PER_WALLET=0.5           # CELO yang dikirim ke tiap wallet
CROP_ID=1                     # 1=Wheat(5min) | 2=Pumpkin(30min) | 3=Golden(2hr)
BUY_SEED_CELO=0.15            # CELO untuk beli seed per sesi
CONCURRENCY=5                 # berapa wallet jalan paralel
```

### 2. Generate & Dana Wallet

```bash
npm run gen          # buat 10 wallet baru → wallets.json
npm run distribute   # kirim 0.5 CELO ke tiap wallet dari funder
npm run status       # verifikasi saldo semua wallet
```

### 3. Jalankan Bot

```bash
npm run farm         # jalankan sekali
# atau
npm run seed-spam    # mode spam TX murah
```

---

## Otomasi dengan GitHub Actions

Bot berjalan otomatis via **GitHub Actions** tanpa server.

### Setup Secret & Variable di GitHub

Buka repo GitHub → **Settings → Secrets and variables → Actions**

| Tipe | Nama | Nilai |
|---|---|---|
| Secret | `KICAOI_WALLETS` | Isi file `wallets.json` (seluruh teks JSON) |
| Variable | `KICAOI_CHAIN` | `celo` |
| Variable | `CROP_ID` | `1` |
| Variable | `CONCURRENCY` | `5` |

### Jadwal Otomatis

| Workflow | Jadwal | Fungsi |
|---|---|---|
| `farm.yml` | Setiap 6 menit | Harvest + plant semua wallet |
| `seed-spam.yml` | Setiap 10 menit | Spam buySeeds semua wallet |

Setelah push ke GitHub dan secret diisi, kedua workflow langsung aktif.

---

## Tabel Crop

| ID | Nama | Biaya Plant | Grow Time | Yield Harvest |
|---|---|---|---|---|
| 1 | Wheat | 5 SEED | 5 menit | 9 SEED |
| 2 | Pumpkin | 20 SEED | 30 menit | 38 SEED |
| 3 | Golden | 60 SEED | 2 jam | 130 SEED |

Gunakan **Wheat (CROP_ID=1)** untuk frekuensi TX tertinggi.

---

## Estimasi TX

| Wallet | Plot/wallet | Siklus | TX/hari |
|---|---|---|---|
| 5 | 3 | setiap 6 menit | ~7.200 |
| 10 | 3 | setiap 6 menit | ~14.400 |
| 10 | 6 (setelah unlock) | setiap 6 menit | ~28.800 |

---

## Pemulihan Dana

Sebelum mengganti wallet atau mengakhiri bot, tarik semua CELO kembali:

```bash
SWEEP_TO=0xAlamatTujuan npm run sweep
```

---

## Keamanan

- `wallets.json` sudah masuk `.gitignore` — **jangan pernah di-commit**
- Gunakan wallet **dedicated** untuk `FUNDER_PRIVATE_KEY`, bukan wallet personal
- Di GitHub Actions, `wallets.json` disimpan sebagai **secret terenkripsi**
- Bot tidak pernah menarik CELO keluar ke alamat lain — hanya interaksi dengan kontrak KICAOI
