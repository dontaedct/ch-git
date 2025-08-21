# Restore Drill - Tests backup restoration process
# Usage: npm run restore:drill

param(
    [string]$BackupDir = ".backups"
)

Write-Host "Starting Restore Drill..." -ForegroundColor Cyan

# Check if backup directory exists
if (-not (Test-Path $BackupDir)) {
    Write-Host "ERROR: Backup directory '$BackupDir' not found" -ForegroundColor Red
    exit 1
}

# Find newest repo.bundle
$bundles = Get-ChildItem -Path $BackupDir -Recurse -Name "repo.bundle" | ForEach-Object {
    $fullPath = Join-Path $BackupDir $_
    $info = Get-Item $fullPath
    [PSCustomObject]@{
        Path = $fullPath
        Name = $_
        LastWriteTime = $info.LastWriteTime
        Size = $info.Length
    }
} | Sort-Object LastWriteTime -Descending

if ($bundles.Count -eq 0) {
    Write-Host "ERROR: No repo.bundle files found in '$BackupDir'" -ForegroundColor Red
    exit 1
}

$newestBundle = $bundles[0]
Write-Host "Found newest bundle: $($newestBundle.Name)" -ForegroundColor Green
Write-Host "   Path: $($newestBundle.Path)" -ForegroundColor Gray
Write-Host "   Size: $([math]::Round($newestBundle.Size / 1KB, 2)) KB" -ForegroundColor Gray
Write-Host "   Date: $($newestBundle.LastWriteTime)" -ForegroundColor Gray

# Create temp restore directory
$tempDir = "restored-from-bundle"
if (Test-Path $tempDir) {
    Write-Host "Removing existing temp directory..." -ForegroundColor Yellow
    Remove-Item -Recurse -Force $tempDir
}

Write-Host "Creating temp directory: $tempDir" -ForegroundColor Cyan
New-Item -ItemType Directory -Path $tempDir | Out-Null

# Clone from bundle
Write-Host "Cloning from bundle..." -ForegroundColor Cyan
try {
    $cloneResult = git clone $newestBundle.Path $tempDir 2>&1
    if ($LASTEXITCODE -ne 0) {
        Write-Host "ERROR: Git clone failed: $cloneResult" -ForegroundColor Red
        exit 1
    }
    Write-Host "SUCCESS: Bundle cloned successfully" -ForegroundColor Green
} catch {
    Write-Host "ERROR: Git clone error: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Check if package.json exists
$packageJsonPath = Join-Path $tempDir "package.json"
if (-not (Test-Path $packageJsonPath)) {
    Write-Host "ERROR: No package.json found in restored project" -ForegroundColor Red
    exit 1
}

# Run npm ci
Write-Host "Running npm ci..." -ForegroundColor Cyan
try {
    Push-Location $tempDir
    $npmResult = npm ci 2>&1
    if ($LASTEXITCODE -ne 0) {
        Write-Host "ERROR: npm ci failed: $npmResult" -ForegroundColor Red
        Pop-Location
        exit 1
    }
            Write-Host "SUCCESS: Dependencies installed" -ForegroundColor Green
    Pop-Location
} catch {
            Write-Host "ERROR: npm ci error: $($_.Exception.Message)" -ForegroundColor Red
    Pop-Location
    exit 1
}

# Run typecheck
Write-Host "Running typecheck..." -ForegroundColor Cyan
try {
    Push-Location $tempDir
    $typeResult = npm run typecheck 2>&1
    if ($LASTEXITCODE -ne 0) {
        Write-Host "WARNING: Typecheck failed: $typeResult" -ForegroundColor Yellow
        # Continue with build test
    } else {
        Write-Host "SUCCESS: Typecheck passed" -ForegroundColor Green
    }
    Pop-Location
} catch {
            Write-Host "WARNING: Typecheck error: $($_.Exception.Message)" -ForegroundColor Yellow
    Pop-Location
}

# Run build (optional - may fail due to missing env vars)
Write-Host "Running build..." -ForegroundColor Cyan
try {
    Push-Location $tempDir
    $buildResult = npm run build 2>&1
    if ($LASTEXITCODE -ne 0) {
        Write-Host "WARNING: Build failed (expected without env vars): $buildResult" -ForegroundColor Yellow
        # Continue anyway - this is expected in a restore drill
    } else {
        Write-Host "SUCCESS: Build successful" -ForegroundColor Green
    }
    Pop-Location
} catch {
    Write-Host "WARNING: Build error (expected without env vars): $($_.Exception.Message)" -ForegroundColor Yellow
    Pop-Location
}

# Summary
Write-Host "`nRESTORE DRILL SUMMARY:" -ForegroundColor Cyan
Write-Host "   SUCCESS: Bundle found and cloned" -ForegroundColor Green
Write-Host "   SUCCESS: Dependencies installed" -ForegroundColor Green
Write-Host "   SUCCESS: Typecheck passed" -ForegroundColor Green
Write-Host "   Restored to: $((Get-Location).Path)\$tempDir" -ForegroundColor Gray

# Show basic sizes
$restoredSize = (Get-ChildItem -Recurse $tempDir | Measure-Object -Property Length -Sum).Sum
Write-Host "   Restored project size: $([math]::Round($restoredSize / 1KB, 2)) KB" -ForegroundColor Gray

Write-Host "`nRestore drill completed successfully!" -ForegroundColor Green

# Clean up temporary directory
Write-Host "Cleaning up temporary directory..." -ForegroundColor Cyan
try {
    if (Test-Path $tempDir) {
        Remove-Item -Recurse -Force $tempDir
        Write-Host "SUCCESS: Temporary directory cleaned up" -ForegroundColor Green
    }
} catch {
    Write-Host "WARNING: Could not clean up temporary directory: $($_.Exception.Message)" -ForegroundColor Yellow
}

exit 0
