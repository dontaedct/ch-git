# Development Helper Script
# Run this when you're not sure what command to use

Write-Host "Development Helper - What do you want to do?" -ForegroundColor Green
Write-Host ""

Write-Host "Code Quality & Safety:" -ForegroundColor Yellow
Write-Host "  npm run doctor     - Check for TypeScript errors and import issues"
Write-Host "  npm run lint       - Check code style and find problems"
Write-Host "  npm run ci         - Run ALL checks (lint + test + build)"
Write-Host ""

Write-Host "Development:" -ForegroundColor Cyan
Write-Host "  npm run dev        - Start development server"
Write-Host "  npm run build      - Build for production"
Write-Host "  npm run test       - Run tests"
Write-Host ""

Write-Host "Common Workflows:" -ForegroundColor Magenta
Write-Host "  check:quick        - Quick health check (5-10 seconds)"
Write-Host "  check:full         - Full safety check (30-60 seconds)"
Write-Host "  workflow:ready     - Production ready check (everything)"
Write-Host ""

Write-Host "Type one of the commands above, or type 'check', 'safe', or 'ready' for workflows" -ForegroundColor White

$choice = Read-Host "What would you like to do?"

if ($choice -eq "check") {
    Write-Host "Running quick health check..." -ForegroundColor Green
    npm run check:quick
}
elseif ($choice -eq "safe") {
    Write-Host "Running full safety check..." -ForegroundColor Green
    npm run check:full
}
elseif ($choice -eq "ready") {
    Write-Host "Running production readiness check..." -ForegroundColor Green
    npm run workflow:ready
}
else {
    Write-Host "Tip: You can run '$choice' directly in your terminal!" -ForegroundColor Yellow
    Write-Host "Or use one of the workflow commands: check, safe, ready" -ForegroundColor Yellow
}
