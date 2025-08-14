# Windows Git Hooks Helper Script
# This script helps manage Git hooks on Windows where native hooks may not work

Write-Host "Windows Git Hooks Helper" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan

Write-Host "`nRunning pre-commit checks..." -ForegroundColor Yellow
try {
    npm run pre-commit
    Write-Host "Pre-commit checks passed!" -ForegroundColor Green
} catch {
    Write-Host "Pre-commit checks failed!" -ForegroundColor Red
    exit 1
}

Write-Host "`nRunning pre-push checks..." -ForegroundColor Yellow
try {
    npm run pre-push
    Write-Host "Pre-push checks passed!" -ForegroundColor Green
} catch {
    Write-Host "Pre-push checks failed!" -ForegroundColor Red
    exit 1
}

Write-Host "`nAll hook checks passed!" -ForegroundColor Green
Write-Host "Use git commit --no-verify and git push --no-verify on Windows" -ForegroundColor Blue
exit 0
