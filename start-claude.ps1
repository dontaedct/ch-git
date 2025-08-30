# Claude Code Starter Script
# This script sets up the environment and starts Claude Code

# Set the authentication token
$env:CLAUDE_CODE_OAUTH_TOKEN="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"

# Start Claude Code
Write-Host "Starting Claude Code..." -ForegroundColor Green
Write-Host "You can now interact with Claude in your terminal!" -ForegroundColor Cyan
Write-Host ""

npx @anthropic-ai/claude-code
