#!/usr/bin/env powershell

<#
.SYNOPSIS
    Enhanced Branch Protection Script with Safety Features and Cross-Platform Support
    
.DESCRIPTION
    This script enables branch protection for the main branch with enhanced safety features:
    - Comprehensive error handling and validation
    - Timeout protection for operations
    - Cross-platform compatibility checks
    - Input sanitization and validation
    - Graceful error recovery and fallback mechanisms
    
.PARAMETER Branch
    Branch name to protect (defaults to "main")
    
.PARAMETER Timeout
    Timeout in seconds for operations (default: 300 seconds)
    
.PARAMETER Force
    Force protection even if warnings are detected
    
.PARAMETER ValidateOnly
    Only validate configuration without applying changes
    
.EXAMPLE
    .\branch-protect.ps1
    .\branch-protect.ps1 -Branch "develop" -Timeout 600
    .\branch-protect.ps1 -Branch "main" -Force
    .\branch-protect.ps1 -ValidateOnly
#>

param(
    [string]$Branch = "main",
    [int]$Timeout = 300,
    [switch]$Force,
    [switch]$ValidateOnly
)

# Universal header compliance
$ErrorActionPreference = "Stop"
$ProgressPreference = "SilentlyContinue"

# Enhanced logging system
function Write-LogMessage {
    param(
        [string]$Message,
        [string]$Level = "Info",
        [string]$Color = "White"
    )
    
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $logMessage = "[$timestamp] [$Level] $Message"
    
    switch ($Level) {
        "Error" { 
            Write-Host $logMessage -ForegroundColor Red
            Write-Error $Message -ErrorAction Continue
        }
        "Warning" { Write-Host $logMessage -ForegroundColor Yellow }
        "Success" { Write-Host $logMessage -ForegroundColor Green }
        "Info" { Write-Host $logMessage -ForegroundColor Cyan }
        default { Write-Host $logMessage -ForegroundColor $Color }
    }
}

# Input validation and sanitization
function Test-InputValidation {
    param([string]$Branch)
    
    try {
        Write-LogMessage "Validating input parameters..." -Level "Info"
        
        # Validate branch name
        if ([string]::IsNullOrWhiteSpace($Branch)) {
            throw "Branch name cannot be empty or whitespace"
        }
        
        # Check for potentially dangerous branch names
        $dangerousPatterns = @(
            "\.\.",           # Directory traversal
            "//",             # Path manipulation
            "\\\\",           # Path manipulation
            ":",              # Invalid characters
            "\*",             # Wildcards
            "\?",             # Wildcards
            "\|",             # Command injection
            "&",              # Command injection
            ";",              # Command injection
            "`"",             # Quote injection
            "'"               # Quote injection
        )
        
        foreach ($pattern in $dangerousPatterns) {
            if ($Branch -match $pattern) {
                throw "Branch name contains potentially dangerous characters: $pattern"
            }
        }
        
        # Check branch name length
        if ($Branch.Length -gt 100) {
            throw "Branch name is too long (max 100 characters)"
        }
        
        Write-LogMessage "Input validation passed" -Level "Success"
        return $true
    }
    catch {
        Write-LogMessage "Input validation failed: $_" -Level "Error"
        return $false
    }
}

# Cross-platform detection
function Test-PlatformCompatibility {
    try {
        $platform = [System.Environment]::OSVersion.Platform
        $isWindows = $platform -eq "Win32NT"
        $isUnix = $platform -eq "Unix" -or $platform -eq "Unix"
        
        Write-LogMessage "Platform: $platform" -Level "Debug"
        
        if (-not $isWindows -and -not $isUnix) {
            Write-LogMessage "Unsupported platform detected. Some features may not work correctly." -Level "Warning"
            return $false
        }
        
        return $true
    }
    catch {
        Write-LogMessage "Error detecting platform: $_" -Level "Error"
        return $false
    }
}

# Timeout wrapper for operations
function Invoke-WithTimeout {
    param(
        [scriptblock]$ScriptBlock,
        [int]$TimeoutSeconds,
        [string]$OperationName
    )
    
    try {
        $job = Start-Job -ScriptBlock $ScriptBlock
        $result = Wait-Job -Job $job -Timeout $TimeoutSeconds
        
        if ($result -eq $null) {
            Stop-Job -Job $job
            Remove-Job -Job $job
            throw "Operation '$OperationName' timed out after $TimeoutSeconds seconds"
        }
        
        $output = Receive-Job -Job $job
        Remove-Job -Job $job
        return $output
    }
    catch {
        Write-LogMessage "Timeout error in $OperationName`: $_" -Level "Error"
        throw
    }
}

# Enhanced GitHub CLI validation
function Test-GitHubCLI {
    try {
        Write-LogMessage "Validating GitHub CLI installation..." -Level "Info"
        
        # Check if GitHub CLI is installed
        $ghCommand = Get-Command gh -ErrorAction SilentlyContinue
        if (-not $ghCommand) {
            throw "GitHub CLI (gh) is not installed. Install from: https://cli.github.com/"
        }
        
        # Check GitHub CLI version
        $ghVersion = Invoke-WithTimeout -ScriptBlock { gh --version } -TimeoutSeconds 30 -OperationName "GitHub CLI version check"
        Write-LogMessage "GitHub CLI version: $ghVersion" -Level "Info"
        
        # Check if user is authenticated
        Write-LogMessage "Checking authentication status..." -Level "Info"
        $authStatus = Invoke-WithTimeout -ScriptBlock { gh auth status 2>&1 } -TimeoutSeconds 30 -OperationName "GitHub authentication check"
        
        if ($LASTEXITCODE -ne 0) {
            throw "Not authenticated with GitHub CLI. Run 'gh auth login' first."
        }
        
        Write-LogMessage "GitHub CLI validation passed" -Level "Success"
        return $true
    }
    catch {
        Write-LogMessage "GitHub CLI validation failed: $_" -Level "Error"
        return $false
    }
}

# Enhanced Git repository validation
function Test-GitRepository {
    try {
        Write-LogMessage "Validating Git repository..." -Level "Info"
        
        # Check if we're in a Git repository
        $gitDir = Invoke-WithTimeout -ScriptBlock { git rev-parse --git-dir 2>$null } -TimeoutSeconds 30 -OperationName "Git directory check"
        if (-not $gitDir) {
            throw "Not in a Git repository. Please run this script from a Git repository root."
        }
        
        # Get repository info from git remote
        $remoteUrl = Invoke-WithTimeout -ScriptBlock { git remote get-url origin } -TimeoutSeconds 30 -OperationName "Git remote check"
        if (-not $remoteUrl) {
            throw "No origin remote found. Make sure you're in a git repository with an origin remote."
        }
        
        # Parse owner/repo from remote URL (supports both HTTPS and SSH)
        if ($remoteUrl -match "github\.com[:/]([^/]+)/([^/]+?)(?:\.git)?$") {
            $owner = $matches[1]
            $repo = $matches[2]
            
            Write-LogMessage "Repository: $owner/$repo" -Level "Info"
            Write-LogMessage "Remote URL: $remoteUrl" -Level "Debug"
            
            return @{
                Owner = $owner
                Repo = $repo
                RemoteUrl = $remoteUrl
            }
        } else {
            throw "Could not parse GitHub repository from remote URL: $remoteUrl"
        }
    }
    catch {
        Write-LogMessage "Git repository validation failed: $_" -Level "Error"
        return $null
    }
}

# Enhanced branch protection configuration
function Get-BranchProtectionConfig {
    param(
        [string]$Branch,
        [string]$Owner,
        [string]$Repo
    )
    
    try {
        Write-LogMessage "Generating branch protection configuration..." -Level "Info"
        
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
        }
        
        Write-LogMessage "Branch protection configuration generated" -Level "Success"
        return $protectionConfig
    }
    catch {
        Write-LogMessage "Error generating branch protection configuration: $_" -Level "Error"
        return $null
    }
}

# Enhanced branch protection application
function Apply-BranchProtection {
    param(
        [string]$Branch,
        [string]$Owner,
        [string]$Repo,
        [object]$ProtectionConfig,
        [int]$Timeout
    )
    
    try {
        Write-LogMessage "Applying branch protection for branch: $Branch" -Level "Info"
        
        # Convert configuration to JSON
        $jsonConfig = $ProtectionConfig | ConvertTo-Json -Depth 10
        
        # Create temporary file for JSON input
        $tempFile = [System.IO.Path]::GetTempFileName()
        try {
            $jsonConfig | Out-File -FilePath $tempFile -Encoding UTF8
            
            Write-LogMessage "Applying protection via GitHub API..." -Level "Info"
            $response = Invoke-WithTimeout -ScriptBlock { 
                gh api repos/$Owner/$Repo/branches/$Branch/protection --method PUT --input $tempFile 2>&1
                return $LASTEXITCODE
            } -TimeoutSeconds $Timeout -OperationName "Branch protection application"
            
            if ($response -eq 0) {
                Write-LogMessage "Branch protection applied successfully!" -Level "Success"
                return $true
            } else {
                throw "Failed to apply branch protection. Exit code: $response"
            }
        }
        finally {
            # Clean up temp file
            if (Test-Path $tempFile) {
                Remove-Item $tempFile -Force
            }
        }
    }
    catch {
        Write-LogMessage "Error applying branch protection: $_" -Level "Error"
        return $false
    }
}

# Enhanced validation and preview
function Test-BranchProtectionConfig {
    param(
        [string]$Branch,
        [string]$Owner,
        [string]$Repo,
        [object]$ProtectionConfig
    )
    
    try {
        Write-LogMessage "Validating branch protection configuration..." -Level "Info"
        
        # Check if branch exists
        $branchExists = Invoke-WithTimeout -ScriptBlock { 
            gh api repos/$Owner/$Repo/branches/$Branch 2>$null
            return $LASTEXITCODE
        } -TimeoutSeconds 30 -OperationName "Branch existence check"
        
        if ($branchExists -ne 0) {
            Write-LogMessage "Warning: Branch '$Branch' may not exist or may not be accessible" -Level "Warning"
        }
        
        # Preview configuration
        Write-LogMessage "Branch protection configuration preview:" -Level "Info"
        Write-LogMessage "  • Require pull request before merging: YES" -Level "Info"
        Write-LogMessage "  • Require status checks to pass (ci workflow): YES" -Level "Info"
        Write-LogMessage "  • Linear history: OFF" -Level "Info"
        Write-LogMessage "  • Dismiss stale reviews: ON" -Level "Info"
        Write-LogMessage "  • Allow force pushes: NO" -Level "Info"
        Write-LogMessage "  • Allow deletions: NO" -Level "Info"
        
        Write-LogMessage "Configuration validation completed" -Level "Success"
        return $true
    }
    catch {
        Write-LogMessage "Configuration validation failed: $_" -Level "Error"
        return $false
    }
}

# Main execution function
function Start-BranchProtection {
    try {
        Write-LogMessage "Enhanced Branch Protection Script starting..." -Level "Info"
        
        # Platform compatibility check
        if (-not (Test-PlatformCompatibility)) {
            Write-LogMessage "Platform compatibility check failed" -Level "Warning"
        }
        
        # Input validation
        if (-not (Test-InputValidation -Branch $Branch)) {
            throw "Input validation failed"
        }
        
        # GitHub CLI validation
        if (-not (Test-GitHubCLI)) {
            throw "GitHub CLI validation failed"
        }
        
        # Git repository validation
        $repoInfo = Test-GitRepository
        if (-not $repoInfo) {
            throw "Git repository validation failed"
        }
        
        # Generate protection configuration
        $protectionConfig = Get-BranchProtectionConfig -Branch $Branch -Owner $repoInfo.Owner -Repo $repoInfo.Repo
        if (-not $protectionConfig) {
            throw "Failed to generate protection configuration"
        }
        
        # Validate configuration
        if (-not (Test-BranchProtectionConfig -Branch $Branch -Owner $repoInfo.Owner -Repo $repoInfo.Repo -ProtectionConfig $protectionConfig)) {
            if (-not $Force) {
                throw "Configuration validation failed. Use -Force to override."
            } else {
                Write-LogMessage "Configuration validation failed, but continuing due to -Force flag" -Level "Warning"
            }
        }
        
        # If only validation requested, exit here
        if ($ValidateOnly) {
            Write-LogMessage "Validation completed successfully. No changes applied." -Level "Success"
            return @{ Success = $true; ExitCode = 0 }
        }
        
        # Apply branch protection
        if (-not (Apply-BranchProtection -Branch $Branch -Owner $repoInfo.Owner -Repo $repoInfo.Repo -ProtectionConfig $protectionConfig -Timeout $Timeout)) {
            throw "Failed to apply branch protection"
        }
        
        # Success summary
        Write-LogMessage "" -Level "Info"
        Write-LogMessage "Branch protection settings applied successfully!" -Level "Success"
        Write-LogMessage "" -Level "Info"
        Write-LogMessage "Branch protection settings applied:" -Level "Info"
        Write-LogMessage "  • Require pull request before merging" -Level "Info"
        Write-LogMessage "  • Require status checks to pass (ci workflow)" -Level "Info"
        Write-LogMessage "  • Linear history: OFF" -Level "Info"
        Write-LogMessage "  • Dismiss stale reviews: ON" -Level "Info"
        Write-LogMessage "" -Level "Info"
        Write-LogMessage "View branch protection settings:" -Level "Info"
        Write-LogMessage "https://github.com/$($repoInfo.Owner)/$($repoInfo.Repo)/settings/branches" -Level "Info"
        
        return @{ Success = $true; ExitCode = 0 }
    }
    catch {
        Write-LogMessage "Critical error in branch protection: $_" -Level "Error"
        return @{ Success = $false; ExitCode = 1; Error = $_ }
    }
}

# Script execution with comprehensive error handling
try {
    $result = Start-BranchProtection
    
    if ($result.Success) {
        exit 0
    } else {
        Write-LogMessage "Branch protection failed" -Level "Error"
        if ($result.Error) {
            Write-LogMessage "Error details: $($result.Error)" -Level "Error"
        }
        exit $result.ExitCode
    }
}
catch {
    Write-LogMessage "Unhandled error in branch protection script: $_" -Level "Error"
    exit 1
}
