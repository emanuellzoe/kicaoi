# KICAOI Farm Loop — jalankan lokal tanpa GitHub Actions
# Usage: .\run-local.ps1
# Stop: Ctrl+C

$BOT_DIR = Split-Path -Parent $MyInvocation.MyCommand.Path
$INTERVAL = 360   # 6 menit (sama dengan farm.yml)
$run = 0

Write-Host "=== KICAOI Local Farm Loop ===" -ForegroundColor Green
Write-Host "Bot dir : $BOT_DIR"
Write-Host "Interval: $INTERVAL detik (6 menit)"
Write-Host "Stop    : Ctrl+C"
Write-Host ""

Set-Location $BOT_DIR

while ($true) {
    $run++
    $time = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    Write-Host "[$time] === Run #$run mulai ===" -ForegroundColor Cyan

    npm run farm

    $time2 = Get-Date -Format "HH:mm:ss"
    Write-Host "[$time2] Run #$run selesai. Menunggu $INTERVAL detik..." -ForegroundColor Yellow
    Write-Host ""

    Start-Sleep -Seconds $INTERVAL
}
