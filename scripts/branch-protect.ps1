#!/usr/bin/env powershell
<#
.SYNOPSIS
    Enable branch protection for main branch using GitHub CLI
    
.DESCRIPTION
    This script enables branch protection for the main branch with:
    - Require pull request before merging
    - Require status checks to pass (including "ci" workflow)
    - Linear history OFF by default
    - Dismiss stale reviews allowed
    
.PARAMETER Branch
    Branch name to protect (defaults to "main")
    
.EXAMPLE
    .\branch-protect.ps1
    .\branch-protect.ps1 -Branch "develop"
#>

param(
    [string]$Branch = "main"
)

# Check if GitHub CLI is installed
if (-not (Get-Command gh -ErrorAction SilentlyContinue)) {
    Write-Error "GitHub CLI (gh) is not installed. Install from: https://cli.github.com/"
    exit 1
}

# Check if user is authenticated
$authStatus = gh auth status 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Error "Not authenticated with GitHub CLI. Run 'gh auth login' first."
    exit 1
}

# Get repository info from git remote
try {
    $remoteUrl = git remote get-url origin
    if (-not $remoteUrl) {
        Write-Error "No origin remote found. Make sure you're in a git repository."
        exit 1
    }
} catch {
    Write-Error "Failed to get origin remote URL. Make sure you're in a git repository."
    exit 1
}

# Parse owner/repo from remote URL (supports both HTTPS and SSH)
if ($remoteUrl -match "github\.com[:/]([^/]+)/([^/]+?)(?:\.git)?$") {
    $owner = $matches[1]
    $repo = $matches[2]
} else {
    Write-Error "Could not parse GitHub repository from remote URL: $remoteUrl"
    exit 1
}

Write-Host "Repository: $owner/$repo" -ForegroundColor Green
Write-Host "Branch: $Branch" -ForegroundColor Green
Write-Host ""

# Enable branch protection
Write-Host "Enabling branch protection..." -ForegroundColor Yellow

$protectionConfig = @{
    required_status_checks = @{
        strict = $false
        contexts = @("ci")
    }
    enforce_admins = $false
    required_pull_request_reviews = @{
        required_approving_review_count = 1
        dismiss_stale_reviews = $true
        require_code_owner_reviews = $false
        required_reviewers = @()
    }
    restrictions = $null
    required_linear_history = $false
    allow_force_pushes = $false
    allow_deletions = $false
    block_creations = $false
    required_conversation_resolution = $false
    lock_branch = $false
    allow_fork_syncing = $false
} | ConvertTo-Json -Depth 10

try {
    # Create temporary file for JSON input
    $tempFile = [System.IO.Path]::GetTempFileName()
    $protectionConfig | Out-File -FilePath $tempFile -Encoding UTF8
    
    $response = gh api repos/$owner/$repo/branches/$Branch/protection --method PUT --input $tempFile
    
    # Clean up temp file
    Remove-Item $tempFile -Force
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Branch protection enabled successfully!" -ForegroundColor Green
        Write-Host ""
        Write-Host "Branch protection settings applied:" -ForegroundColor Cyan
        Write-Host "  • Require pull request before merging" -ForegroundColor White
        Write-Host "  • Require status checks to pass (ci workflow)" -ForegroundColor White
        Write-Host "  • Linear history: OFF" -ForegroundColor White
        Write-Host "  • Dismiss stale reviews: ON" -ForegroundColor White
        Write-Host ""
        Write-Host "View branch protection settings:" -ForegroundColor Cyan
        Write-Host "https://github.com/$owner/$repo/settings/branches" -ForegroundColor Blue
    } else {
        Write-Error "Failed to enable branch protection. Exit code: $LASTEXITCODE"
        exit 1
    }
} catch {
    Write-Error "Error enabling branch protection: $_"
    exit 1
}
