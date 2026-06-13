# KICAOI Farm Loop — 52 wallet aktif, jalan terus setiap 6 menit
# Stop: Ctrl+C

$BOT_DIR = Split-Path -Parent $MyInvocation.MyCommand.Path
$INTERVAL = 360   # 6 menit (wheat grow = 5 menit)
$run = 0
$TSX = "$BOT_DIR\node_modules\.bin\tsx"

Write-Host "=== KICAOI Farm Loop (52 wallet) ===" -ForegroundColor Green
Write-Host "Bot dir : $BOT_DIR"
Write-Host "Interval: $INTERVAL detik"
Write-Host "Stop    : Ctrl+C"
Write-Host ""

Set-Location $BOT_DIR

while ($true) {
    $run++
    $time = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    Write-Host "[$time] === Run #$run ===" -ForegroundColor Cyan

    & $TSX src/farm.ts

    $time2 = Get-Date -Format "HH:mm:ss"
    Write-Host "[$time2] Run #$run selesai. Next: $([datetime]::Now.AddSeconds($INTERVAL).ToString('HH:mm:ss'))" -ForegroundColor Yellow
    Write-Host ""

    Start-Sleep -Seconds $INTERVAL
}
