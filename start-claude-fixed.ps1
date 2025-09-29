# Claude Code Starter Script - Fixed Version
# This script sets up the environment and starts Claude Code

Write-Host "=== Claude Code Setup ===" -ForegroundColor Cyan
Write-Host ""

# Check if we have a token
if (-not $env:CLAUDE_CODE_OAUTH_TOKEN) {
    Write-Host "❌ No Claude Code OAuth token found!" -ForegroundColor Red
    Write-Host ""
    Write-Host "To get a new token:" -ForegroundColor Yellow
    Write-Host "1. Go to: https://console.anthropic.com/" -ForegroundColor White
    Write-Host "2. Navigate to API Keys section" -ForegroundColor White
    Write-Host "3. Create a new Claude Code OAuth token" -ForegroundColor White
    Write-Host "4. Set it as environment variable:" -ForegroundColor White
    Write-Host "   `$env:CLAUDE_CODE_OAUTH_TOKEN=`"your-new-token-here`"" -ForegroundColor Green
    Write-Host ""
    Write-Host "Or edit this script and add your token on line 25" -ForegroundColor White
    Write-Host ""
    
    # Uncomment and add your new token here:
    # $env:CLAUDE_CODE_OAUTH_TOKEN="your-new-token-here"
    
    if (-not $env:CLAUDE_CODE_OAUTH_TOKEN) {
        Write-Host "Exiting... Please set your OAuth token first." -ForegroundColor Red
        exit 1
    }
}

# Set higher output token limit to handle large responses
$env:CLAUDE_CODE_MAX_OUTPUT_TOKENS="100000"

# Verify environment variables are set
Write-Host "✅ Environment variables configured:" -ForegroundColor Green
Write-Host "   CLAUDE_CODE_MAX_OUTPUT_TOKENS: $env:CLAUDE_CODE_MAX_OUTPUT_TOKENS" -ForegroundColor White
Write-Host "   OAuth token: $(if($env:CLAUDE_CODE_OAUTH_TOKEN) {'✅ Set'} else {'❌ Not set'})" -ForegroundColor White
Write-Host ""

# Clear any cached npm packages that might be causing issues
Write-Host "🧹 Clearing npm cache..." -ForegroundColor Yellow
npm cache clean --force 2>$null

# Start Claude Code with latest version
Write-Host "🚀 Starting Claude Code..." -ForegroundColor Green
Write-Host "You can now interact with Claude in your terminal!" -ForegroundColor Cyan
Write-Host ""

try {
    npx --yes @anthropic-ai/claude-code@latest
} catch {
    Write-Host "❌ Failed to start Claude Code. Please check your token and try again." -ForegroundColor Red
    Write-Host "Error: $_" -ForegroundColor Red
}

