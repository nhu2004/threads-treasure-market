# Script to prepare project for zipping
# Run: powershell -ExecutionPolicy Bypass -File prepare-for-zip.ps1

Write-Host "Preparing project for zipping..." -ForegroundColor Cyan

# Get project path
$projectPath = Split-Path -Parent $MyInvocation.MyCommand.Path

# List of folders/files to delete
$itemsToDelete = @(
    "node_modules",
    "server\node_modules",
    "dist",
    "bun.lock",
    "bun.lockb"
)

$totalSize = 0

# Calculate and delete
foreach ($item in $itemsToDelete) {
    $fullPath = Join-Path $projectPath $item
    
    if (Test-Path $fullPath) {
        $size = if ((Get-Item $fullPath -ErrorAction SilentlyContinue).PSIsContainer) {
            (Get-ChildItem -Path $fullPath -Recurse | Measure-Object -Property Length -Sum).Sum
        } else {
            (Get-Item $fullPath).Length
        }
        
        $sizeInMB = [math]::Round($size / 1MB, 2)
        $totalSize += $sizeInMB
        
        Write-Host "  [X] Deleting: $item ($sizeInMB MB)" -ForegroundColor Yellow
        Remove-Item -Path $fullPath -Recurse -Force -ErrorAction SilentlyContinue
    } else {
        Write-Host "  [~] Not found: $item" -ForegroundColor Gray
    }
}

Write-Host "`n[OK] Complete!" -ForegroundColor Green
Write-Host "Total deleted: $totalSize MB" -ForegroundColor Green
Write-Host "`nNext steps:" -ForegroundColor Cyan
Write-Host "   1. Zip the project now" -ForegroundColor White
Write-Host "   2. After extract, run: npm install" -ForegroundColor White
Write-Host "   3. Run: npm run build (if needed)" -ForegroundColor White
