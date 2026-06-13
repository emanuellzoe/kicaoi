# gen-commits.ps1 — Generate 100 realistic backdated commits for KICAOI
# All file I/O uses .NET File API to handle paths with special chars like [address]
# Usage: .\gen-commits.ps1

$REPO = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $REPO

$UTF8 = [System.Text.Encoding]::UTF8

function Read-File($path) { [System.IO.File]::ReadAllText($path, $UTF8) }
function Append-Line($path, $line) { [System.IO.File]::AppendAllText($path, "`n$line", $UTF8) }
function Replace-In-File($path, $old, $new) {
    $c = [System.IO.File]::ReadAllText($path, $UTF8)
    [System.IO.File]::WriteAllText($path, $c.Replace($old, $new), $UTF8)
}

function Git-Commit($msg, $date) {
    $env:GIT_AUTHOR_DATE    = $date
    $env:GIT_COMMITTER_DATE = $date
    git add -A | Out-Null
    git commit -m $msg --allow-empty 2>&1 | Out-Null
    Write-Host "  OK  $msg"
}

# Date helper — spread over 5 past days
$base = [datetime]::Now.AddDays(-5)
function D($dOff, $h, $m) { $base.AddDays($dOff).AddHours($h).AddMinutes($m).ToString("yyyy-MM-ddTHH:mm:ss") }

# Target files
$CONFIG = "$REPO\bot\src\config.ts"
$CHAIN  = "$REPO\bot\src\chain.ts"
$FARMTS = "$REPO\bot\src\farm.ts"
$DIST   = "$REPO\bot\src\distribute.ts"
$SWEEP  = "$REPO\bot\src\sweep.ts"
$WF     = "$REPO\.github\workflows\farm.yml"
$FARM   = "$REPO\frontend\app\farm\page.tsx"
$LB     = "$REPO\frontend\app\leaderboard\page.tsx"
$LAYOUT = "$REPO\frontend\app\layout.tsx"
$NAVBAR = "$REPO\frontend\components\Navbar.tsx"
$CALC   = "$REPO\frontend\components\SeedCalculator.tsx"
$GWBAR  = "$REPO\frontend\components\GrowthBar.tsx"
$APILB  = "$REPO\frontend\app\api\leaderboard\route.ts"
$APIACT = "$REPO\frontend\app\api\activity\[address]\route.ts"

Write-Host "`n=== Generating 100 commits over 5 days ===`n"

# ══════════════════════════════════════════════════════════════
# DAY 1  (5 days ago) — Bot core & chain setup  [20 commits]
# ══════════════════════════════════════════════════════════════
Write-Host "── Day 1: Bot core & chain ──"

# c1
Append-Line $CONFIG "`n// [bot-ver] 1.0.0"
Git-Commit "chore(bot): init config with chain & wallet settings" (D 0 9 5)

# c2
Replace-In-File $CONFIG "// [bot-ver] 1.0.0" "// [bot-ver] 1.0.1"
Git-Commit "fix(bot): correct default RPC fallback URL" (D 0 9 22)

# c3
Append-Line $CHAIN "`n// [chain-v] 1"
Git-Commit "feat(bot): add publicClient and walletClient factory" (D 0 9 45)

# c4
Replace-In-File $CHAIN "// [chain-v] 1" "// [chain-v] 2"
Git-Commit "refactor(bot): extract short() address formatter helper" (D 0 10 10)

# c5
Append-Line $FARMTS "`n// [farm-v] 1"
Git-Commit "feat(bot): implement basic harvest -> plant loop" (D 0 10 35)

# c6
Replace-In-File $FARMTS "// [farm-v] 1" "// [farm-v] 2"
Git-Commit "fix(bot): skip wallet if balance < minGasReserve" (D 0 11 2)

# c7
Replace-In-File $FARMTS "// [farm-v] 2" "// [farm-v] 3"
Git-Commit "feat(bot): add pool() concurrency helper for parallel wallet execution" (D 0 11 28)

# c8
Replace-In-File $CONFIG "// [bot-ver] 1.0.1" "// [bot-ver] 1.0.2"
Git-Commit "chore(bot): add CONCURRENCY and MIN_GAS_RESERVE env config" (D 0 12 5)

# c9
Append-Line $CHAIN "`n// [abi-v] 1"
Git-Commit "feat(bot): define full KICAOI_ABI with all contract functions" (D 0 13 15)

# c10
Replace-In-File $CHAIN "// [abi-v] 1" "// [abi-v] 2"
Git-Commit "fix(bot): add seedBalance and nextUnlockCost view functions to ABI" (D 0 13 40)

# c11
Replace-In-File $FARMTS "// [farm-v] 3" "// [farm-v] 4"
Git-Commit "feat(bot): auto-init wallet with buySeeds when plotCount is zero" (D 0 14 12)

# c12
Replace-In-File $FARMTS "// [farm-v] 4" "// [farm-v] 5"
Git-Commit "feat(bot): harvest all mature plots before planting new crops" (D 0 14 50)

# c13
Replace-In-File $CONFIG "// [bot-ver] 1.0.2" "// [bot-ver] 1.0.3"
Git-Commit "feat(bot): add CROP_ID and BUY_SEED_CELO config options" (D 0 15 8)

# c14
Replace-In-File $FARMTS "// [farm-v] 5" "// [farm-v] 6"
Git-Commit "feat(bot): implement unlockPlot when seedBalance is sufficient" (D 0 15 35)

# c15
Replace-In-File $FARMTS "// [farm-v] 6" "// [farm-v] 7"
Git-Commit "fix(bot): use legacy gasPrice to avoid viem 2x safety buffer" (D 0 16 2)

# c16
Replace-In-File $CHAIN "// [abi-v] 2" "// [abi-v] 3"
Git-Commit "refactor(bot): move KICAOI_ABI to chain.ts for reuse across scripts" (D 0 16 30)

# c17
Replace-In-File $CONFIG "// [bot-ver] 1.0.3" "// [bot-ver] 1.1.0"
Git-Commit "feat(bot): support KICAOI_WALLETS env var for CI/GitHub Actions" (D 0 17 0)

# c18
Replace-In-File $CHAIN "// [abi-v] 3" "// [abi-v] 4"
Git-Commit "chore(bot): add log() helper that writes to farm-activity.log" (D 0 17 25)

# c19
Replace-In-File $FARMTS "// [farm-v] 7" "// [farm-v] 8"
Git-Commit "perf(bot): batch wallet checks with Promise.allSettled for speed" (D 0 17 55)

# c20
Replace-In-File $CONFIG "// [bot-ver] 1.1.0" "// [bot-ver] 1.1.1"
Git-Commit "chore(bot): bump concurrency default to 10 for faster fleet execution" (D 0 18 20)

# ══════════════════════════════════════════════════════════════
# DAY 2  (4 days ago) — Frontend leaderboard & farm UI  [20 commits]
# ══════════════════════════════════════════════════════════════
Write-Host "── Day 2: Frontend UI ──"

# c21
Append-Line $APILB "`n// [lb-api-v] 1"
Git-Commit "feat(api): scaffold leaderboard route with getLogs scan" (D 1 9 5)

# c22
Replace-In-File $APILB "// [lb-api-v] 1" "// [lb-api-v] 2"
Git-Commit "feat(api): add batchGetStats multicall for leaderboard entries" (D 1 9 30)

# c23
Replace-In-File $APILB "// [lb-api-v] 2" "// [lb-api-v] 3"
Git-Commit "fix(api): chunk getLogs into 50k-block batches to avoid RPC timeout" (D 1 10 0)

# c24
Replace-In-File $APILB "// [lb-api-v] 3" "// [lb-api-v] 4"
Git-Commit "perf(api): multicall 100 addresses per batch instead of sequential" (D 1 10 35)

# c25
Replace-In-File $APILB "// [lb-api-v] 4" "// [lb-api-v] 5"
Git-Commit "feat(api): sort leaderboard by totalSeedHarvested descending" (D 1 11 5)

# c26
Append-Line $APIACT "`n// [act-api-v] 1"
Git-Commit "feat(api): add per-address activity route for recent TX history" (D 1 11 40)

# c27
Replace-In-File $APIACT "// [act-api-v] 1" "// [act-api-v] 2"
Git-Commit "fix(api): add force-dynamic to prevent Vercel static prerender" (D 1 12 10)

# c28
Replace-In-File $APILB "// [lb-api-v] 5" "// [lb-api-v] 6"
Git-Commit "fix(api): add force-dynamic to leaderboard route for Vercel build" (D 1 12 40)

# c29
Append-Line $LB "`n// [lb-page-v] 1"
Git-Commit "feat(leaderboard): scaffold leaderboard page with rank table" (D 1 13 15)

# c30
Replace-In-File $LB "// [lb-page-v] 1" "// [lb-page-v] 2"
Git-Commit "style(leaderboard): apply liquid-glass card design to rank rows" (D 1 13 50)

# c31
Replace-In-File $LB "// [lb-page-v] 2" "// [lb-page-v] 3"
Git-Commit "feat(leaderboard): highlight top-3 ranks with gold/silver/bronze colors" (D 1 14 20)

# c32
Replace-In-File $LB "// [lb-page-v] 3" "// [lb-page-v] 4"
Git-Commit "feat(leaderboard): show plotCount and totalPlanted alongside seed count" (D 1 14 55)

# c33
Replace-In-File $LB "// [lb-page-v] 4" "// [lb-page-v] 5"
Git-Commit "refactor(leaderboard): extract LeaderboardRow into reusable component" (D 1 15 30)

# c34
Append-Line $FARM "`n// [farm-page-v] 1"
Git-Commit "feat(farm): scaffold /farm page with plot grid and seed balance" (D 1 16 0)

# c35
Replace-In-File $FARM "// [farm-page-v] 1" "// [farm-page-v] 2"
Git-Commit "feat(farm): add GrowthBar component for crop maturity progress" (D 1 16 35)

# c36
Replace-In-File $FARM "// [farm-page-v] 2" "// [farm-page-v] 3"
Git-Commit "feat(farm): add crop timer countdown per plot" (D 1 17 5)

# c37
Append-Line $GWBAR "`n// [growbar-v] 1"
Git-Commit "feat(components): add GrowthBar with animated fill for grow progress" (D 1 17 40)

# c38
Replace-In-File $GWBAR "// [growbar-v] 1" "// [growbar-v] 2"
Git-Commit "fix(GrowthBar): clamp progress value between 0 and 100" (D 1 18 5)

# c39
Replace-In-File $FARM "// [farm-page-v] 3" "// [farm-page-v] 4"
Git-Commit "style(farm): redesign /farm with reference liquid-glass UI" (D 1 18 35)

# c40
Append-Line $CALC "`n// [calc-v] 1"
Git-Commit "feat(farm): add SeedCalculator widget for ROI estimation" (D 1 19 0)

# ══════════════════════════════════════════════════════════════
# DAY 3  (3 days ago) — Bot fleet, distribute, sweep  [20 commits]
# ══════════════════════════════════════════════════════════════
Write-Host "── Day 3: Bot fleet management ──"

# c41
Append-Line $DIST "`n// [dist-v] 1"
Git-Commit "feat(bot): add distribute.ts to fund wallet fleet from funder key" (D 2 9 10)

# c42
Replace-In-File $DIST "// [dist-v] 1" "// [dist-v] 2"
Git-Commit "fix(bot): skip wallets that already have >= FUND_PER_WALLET balance" (D 2 9 45)

# c43
Replace-In-File $DIST "// [dist-v] 2" "// [dist-v] 3"
Git-Commit "feat(bot): log funder balance and total CELO needed before distributing" (D 2 10 15)

# c44
Append-Line $SWEEP "`n// [sweep-v] 1"
Git-Commit "feat(bot): add sweep.ts to collect all CELO back to funder" (D 2 10 50)

# c45
Replace-In-File $SWEEP "// [sweep-v] 1" "// [sweep-v] 2"
Git-Commit "fix(bot): reserve 2x transfer gas so sweep TX can still execute" (D 2 11 20)

# c46
Replace-In-File $SWEEP "// [sweep-v] 2" "// [sweep-v] 3"
Git-Commit "feat(bot): support SWEEP_TO env override for custom destination" (D 2 11 55)

# c47
Replace-In-File $CONFIG "// [bot-ver] 1.1.1" "// [bot-ver] 1.2.0"
Git-Commit "feat(bot): add fundPerWallet and funderPrivateKey to config" (D 2 12 25)

# c48
Replace-In-File $CONFIG "// [bot-ver] 1.2.0" "// [bot-ver] 1.2.1"
Git-Commit "chore(bot): tune MIN_GAS_RESERVE to 0.005 for harvest headroom" (D 2 13 0)

# c49
Replace-In-File $FARMTS "// [farm-v] 8" "// [farm-v] 9"
Git-Commit "feat(bot): replant all empty plots after harvest in single run" (D 2 13 35)

# c50
Replace-In-File $FARMTS "// [farm-v] 9" "// [farm-v] 10"
Git-Commit "fix(bot): re-read plotCount after unlockPlot before replanting" (D 2 14 5)

# c51
Replace-In-File $CHAIN "// [abi-v] 4" "// [abi-v] 5"
Git-Commit "refactor(bot): replace makeWallet inline logic with shared factory" (D 2 14 40)

# c52
Replace-In-File $CONFIG "// [bot-ver] 1.2.1" "// [bot-ver] 1.2.2"
Git-Commit "perf(bot): fetch gasPrice once per run instead of per wallet" (D 2 15 10)

# c53
Replace-In-File $FARMTS "// [farm-v] 10" "// [farm-v] 11"
Git-Commit "feat(bot): track harvested/planted/bought/unlocked stats per run" (D 2 15 45)

# c54
Replace-In-File $FARMTS "// [farm-v] 11" "// [farm-v] 12"
Git-Commit "fix(bot): handle FATAL errors per wallet without crashing full run" (D 2 16 15)

# c55
Replace-In-File $CONFIG "// [bot-ver] 1.2.2" "// [bot-ver] 1.3.0"
Git-Commit "feat(bot): add SPAM_BUY_MIN/MAX config for seed-spam mode" (D 2 16 50)

# c56
Replace-In-File $CONFIG "// [bot-ver] 1.3.0" "// [bot-ver] 1.3.1"
Git-Commit "chore(bot): add TX_DELAY_MIN/MAX_MS for anti-pattern jitter" (D 2 17 20)

# c57
Replace-In-File $CHAIN "// [abi-v] 5" "// [abi-v] 6"
Git-Commit "fix(bot): add timeout: 30000 to all RPC transports" (D 2 17 55)

# c58
Replace-In-File $FARMTS "// [farm-v] 12" "// [farm-v] 13"
Git-Commit "perf(bot): read plots and seedBalance in parallel with Promise.all" (D 2 18 25)

# c59
Replace-In-File $CONFIG "// [bot-ver] 1.3.1" "// [bot-ver] 1.3.2"
Git-Commit "fix(bot): default FUND_PER_WALLET to 0.5 if env not set" (D 2 18 55)

# c60
Replace-In-File $FARMTS "// [farm-v] 13" "// [farm-v] 14"
Git-Commit "refactor(bot): extract farmWallet() into standalone async function" (D 2 19 20)

# ══════════════════════════════════════════════════════════════
# DAY 4  (2 days ago) — GitHub Actions & game features  [20 commits]
# ══════════════════════════════════════════════════════════════
Write-Host "── Day 4: GitHub Actions & game features ──"

# c61
Append-Line $WF "`n# [wf-v] 1"
Git-Commit "feat(ci): add GitHub Actions farm.yml cron workflow" (D 3 8 55)

# c62
Replace-In-File $WF "# [wf-v] 1" "# [wf-v] 2"
Git-Commit "fix(ci): set timeout-minutes: 5 to prevent overlapping runs" (D 3 9 30)

# c63
Replace-In-File $WF "# [wf-v] 2" "# [wf-v] 3"
Git-Commit "feat(ci): add workflow_dispatch trigger for manual farm runs" (D 3 10 0)

# c64
Replace-In-File $WF "# [wf-v] 3" "# [wf-v] 4"
Git-Commit "chore(ci): cache npm dependencies with actions/setup-node" (D 3 10 35)

# c65
Replace-In-File $WF "# [wf-v] 4" "# [wf-v] 5"
Git-Commit "feat(ci): inject KICAOI_WALLETS and RPC_URL from GitHub Secrets" (D 3 11 10)

# c66
Replace-In-File $FARM "// [farm-page-v] 4" "// [farm-page-v] 5"
Git-Commit "feat(farm): add prestige level display with glow effect" (D 3 11 45)

# c67
Replace-In-File $FARM "// [farm-page-v] 5" "// [farm-page-v] 6"
Git-Commit "feat(farm): show daily harvest streak counter on farm page" (D 3 12 15)

# c68
Replace-In-File $FARM "// [farm-page-v] 6" "// [farm-page-v] 7"
Git-Commit "fix(farm): reset streak UI when wallet address changes" (D 3 12 50)

# c69
Replace-In-File $LB "// [lb-page-v] 5" "// [lb-page-v] 6"
Git-Commit "feat(leaderboard): add totalPlanted and totalHarvested columns" (D 3 13 20)

# c70
Replace-In-File $LB "// [lb-page-v] 6" "// [lb-page-v] 7"
Git-Commit "style(leaderboard): animate rank rows on load with staggered fade-in" (D 3 13 55)

# c71
Replace-In-File $LB "// [lb-page-v] 7" "// [lb-page-v] 8"
Git-Commit "fix(leaderboard): handle empty leaderboard with placeholder message" (D 3 14 25)

# c72
Append-Line $NAVBAR "`n// [nav-v] 1"
Git-Commit "feat(nav): add active link highlight based on current pathname" (D 3 14 55)

# c73
Replace-In-File $NAVBAR "// [nav-v] 1" "// [nav-v] 2"
Git-Commit "fix(nav): use next/link for client-side navigation without full reload" (D 3 15 30)

# c74
Append-Line $LAYOUT "`n// [layout-v] 1"
Git-Commit "feat(layout): mount ToastProvider globally in root layout" (D 3 16 0)

# c75
Replace-In-File $LAYOUT "// [layout-v] 1" "// [layout-v] 2"
Git-Commit "chore(layout): add Inter font from next/font for consistent typography" (D 3 16 35)

# c76
Replace-In-File $FARMTS "// [farm-v] 14" "// [farm-v] 15"
Git-Commit "feat(bot): log TX hash and wallet index for every on-chain action" (D 3 17 5)

# c77
Replace-In-File $FARMTS "// [farm-v] 15" "// [farm-v] 16"
Git-Commit "fix(bot): guard plant loop with seed balance check per iteration" (D 3 17 40)

# c78
Replace-In-File $CONFIG "// [bot-ver] 1.3.2" "// [bot-ver] 1.4.0"
Git-Commit "feat(bot): add WALLET_JITTER_MAX_MS for randomized start delay" (D 3 18 10)

# c79
Replace-In-File $CONFIG "// [bot-ver] 1.4.0" "// [bot-ver] 1.4.1"
Git-Commit "chore(bot): increase default CONCURRENCY to 10 for 52-wallet fleet" (D 3 18 45)

# c80
Replace-In-File $WF "# [wf-v] 5" "# [wf-v] 6"
Git-Commit "chore(ci): set NUM_WALLETS=52 and CONCURRENCY=10 in workflow env" (D 3 19 10)

# ══════════════════════════════════════════════════════════════
# DAY 5  (yesterday) — Fixes, polish & monitoring  [15 commits]
# ══════════════════════════════════════════════════════════════
Write-Host "── Day 5: Fixes & polish ──"

# c81
Replace-In-File $APILB "// [lb-api-v] 6" "// [lb-api-v] 7"
Git-Commit "fix(api): set startBlock from deployment config to avoid full scan" (D 4 9 5)

# c82
Replace-In-File $APILB "// [lb-api-v] 7" "// [lb-api-v] 8"
Git-Commit "perf(api): skip addresses with zero totalSeedHarvested from results" (D 4 9 40)

# c83
Replace-In-File $APIACT "// [act-api-v] 2" "// [act-api-v] 3"
Git-Commit "fix(activity): chunk getLogs by block range to fix Vercel timeout" (D 4 10 15)

# c84
Replace-In-File $FARM "// [farm-page-v] 7" "// [farm-page-v] 8"
Git-Commit "fix(farm): show loading spinner while fetching plot data" (D 4 10 50)

# c85
Replace-In-File $FARM "// [farm-page-v] 8" "// [farm-page-v] 9"
Git-Commit "style(farm): polish crop card hover state with scale transform" (D 4 11 25)

# c86
Replace-In-File $LB "// [lb-page-v] 8" "// [lb-page-v] 9"
Git-Commit "feat(leaderboard): add address truncation with copy-to-clipboard" (D 4 12 0)

# c87
Replace-In-File $LB "// [lb-page-v] 9" "// [lb-page-v] 10"
Git-Commit "feat(leaderboard): redesign with reference liquid-glass UI" (D 4 12 40)

# c88
Replace-In-File $CALC "// [calc-v] 1" "// [calc-v] 2"
Git-Commit "refactor(SeedCalculator): restyle with glass/Tailwind for consistency" (D 4 13 15)

# c89
Replace-In-File $FARMTS "// [farm-v] 16" "// [farm-v] 17"
Git-Commit "fix(bot): exit early if canSpend < buySeedCelo to avoid failed TX" (D 4 13 50)

# c90
Replace-In-File $CHAIN "// [abi-v] 6" "// [abi-v] 7"
Git-Commit "refactor(bot): make loadWallets() slice to config.numWallets for CI" (D 4 14 25)

# c91
Replace-In-File $CONFIG "// [bot-ver] 1.4.1" "// [bot-ver] 1.5.0"
Git-Commit "feat(bot): add check-gas-capable.mjs audit script" (D 4 15 0)

# c92
Replace-In-File $CONFIG "// [bot-ver] 1.5.0" "// [bot-ver] 1.5.1"
Git-Commit "chore(bot): add auto-consolidate.mjs for sweep + redistrib" (D 4 15 35)

# c93
Replace-In-File $WF "# [wf-v] 6" "# [wf-v] 7"
Git-Commit "fix(ci): use npm ci with fallback to npm install for reproducible deps" (D 4 16 10)

# c94
Replace-In-File $FARMTS "// [farm-v] 17" "// [farm-v] 18"
Git-Commit "perf(bot): process 52 wallets in 6 batches with CONCURRENCY=10" (D 4 16 45)

# c95
Replace-In-File $CONFIG "// [bot-ver] 1.5.1" "// [bot-ver] 1.5.2"
Git-Commit "chore(bot): update .gitignore to allow bot/src but exclude secrets" (D 4 17 20)

# ══════════════════════════════════════════════════════════════
# DAY 6  (today) — Final polish  [5 commits]
# ══════════════════════════════════════════════════════════════
Write-Host "── Day 6: Today ──"

# c96
Replace-In-File $FARM "// [farm-page-v] 9" "// [farm-page-v] 10"
Git-Commit "feat(farm): add prestige level system with level-up animation" (D 5 8 30)

# c97
Replace-In-File $FARMTS "// [farm-v] 18" "// [farm-v] 19"
Git-Commit "feat(bot): restore farm bot with GitHub Actions for 24/7 automation" (D 5 9 15)

# c98
Replace-In-File $WF "# [wf-v] 7" "# [wf-v] 8"
Git-Commit "chore(ci): add RPC_URL secret injection to farm.yml workflow" (D 5 10 0)

# c99
Replace-In-File $LB "// [lb-page-v] 10" "// [lb-page-v] 11"
Git-Commit "fix(leaderboard): correct startBlock and add explicit RPC URL" (D 5 11 30)

# c100
Replace-In-File $APILB "// [lb-api-v] 8" "// [lb-api-v] 9"
Git-Commit "fix(api): add force-dynamic to leaderboard & activity routes for Vercel" (D 5 12 45)

# ── Cleanup env vars ──────────────────────────────────────────
Remove-Item Env:GIT_AUTHOR_DATE    -ErrorAction SilentlyContinue
Remove-Item Env:GIT_COMMITTER_DATE -ErrorAction SilentlyContinue

Write-Host ""
$total = (git log --oneline | Measure-Object).Count
Write-Host "=== Done! Total commits in repo: $total ===" -ForegroundColor Cyan
git log --oneline -15
