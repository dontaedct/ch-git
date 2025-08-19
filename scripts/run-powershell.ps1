#!/usr/bin/env powershell

<#
.SYNOPSIS
    Universal PowerShell Launcher - Works with both pwsh and powershell
    
.DESCRIPTION
    This script automatically detects which PowerShell is available and runs
    the specified script with the appropriate command and parameters.
    
.PARAMETER ScriptPath
    Path to the PowerShell script to run
    
.PARAMETER Arguments
    Additional arguments to pass to the script
    
.EXAMPLE
    .\run-powershell.ps1 scripts\branch-protect.ps1
    .\run-powershell.ps1 scripts\guardian-task.ps1
#>

param(
    [Parameter(Mandatory=$true)]
    [string]$ScriptPath,
    
    [Parameter(ValueFromRemainingArguments=$true)]
    [string[]]$Arguments
)

# Check if script exists
if (-not (Test-Path $ScriptPath)) {
    Write-Error "Script not found: $ScriptPath"
    exit 1
}

# Try pwsh first (PowerShell Core)
try {
    $pwshPath = Get-Command pwsh -ErrorAction SilentlyContinue
    if ($pwshPath) {
        Write-Host "Using PowerShell Core (pwsh)..." -ForegroundColor Green
        $pwshArgs = @("-NoProfile", "-File", $ScriptPath) + $Arguments
        & pwsh @pwshArgs
        exit $LASTEXITCODE
    }
} catch {
    # pwsh not available
}

# Fall back to powershell (Windows PowerShell)
try {
    $powershellPath = Get-Command powershell -ErrorAction SilentlyContinue
    if ($powershellPath) {
        Write-Host "Using Windows PowerShell (powershell)..." -ForegroundColor Yellow
        $powershellArgs = @("-ExecutionPolicy", "Bypass", "-File", $ScriptPath) + $Arguments
        & powershell @powershellArgs
        exit $LASTEXITCODE
    }
} catch {
    # powershell not available
}

# Neither found
Write-Error "No PowerShell found on system"
Write-Host "Please install either PowerShell Core (pwsh) or Windows PowerShell" -ForegroundColor Red
exit 1
