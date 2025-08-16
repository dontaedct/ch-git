#!/usr/bin/env powershell

<#
.SYNOPSIS
    Enhanced Universal PowerShell Launcher with Cross-Platform Support and Safety Features
    
.DESCRIPTION
    This script automatically detects which PowerShell is available and runs
    the specified script with enhanced safety features, error handling,
    timeout protection, and cross-platform compatibility.
    
.PARAMETER ScriptPath
    Path to the PowerShell script to run
    
.PARAMETER Arguments
    Additional arguments to pass to the script
    
.PARAMETER Timeout
    Timeout in seconds for script execution (default: 300)
    
.PARAMETER ValidateOnly
    Only validate script syntax without execution
    
.PARAMETER LogLevel
    Logging level: Debug, Info, Warning, Error (default: Info)
    
.EXAMPLE
    .\run-powershell.ps1 scripts\branch-protect.ps1
    .\run-powershell.ps1 scripts\guardian-task.ps1 -Timeout 600
    .\run-powershell.ps1 scripts\test.ps1 -ValidateOnly
    .\run-powershell.ps1 scripts\script.ps1 -LogLevel Debug
#>

param(
    [Parameter(Mandatory=$true)]
    [string]$ScriptPath,
    
    [Parameter(ValueFromRemainingArguments=$true)]
    [string[]]$Arguments,
    
    [int]$Timeout = 300,
    [switch]$ValidateOnly,
    [ValidateSet("Debug", "Info", "Warning", "Error")]
    [string]$LogLevel = "Info"
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
    
    # Check if message should be displayed based on log level
    $levelPriority = @{
        "Debug" = 1
        "Info" = 2
        "Warning" = 3
        "Error" = 4
    }
    
    $currentLevel = $levelPriority[$LogLevel]
    $messageLevel = $levelPriority[$Level]
    
    if ($messageLevel -ge $currentLevel) {
        switch ($Level) {
            "Error" { 
                Write-Host $logMessage -ForegroundColor Red
                Write-Error $Message -ErrorAction Continue
            }
            "Warning" { Write-Host $logMessage -ForegroundColor Yellow }
            "Success" { Write-Host $logMessage -ForegroundColor Green }
            "Info" { Write-Host $logMessage -ForegroundColor Cyan }
            "Debug" { Write-Host $logMessage -ForegroundColor Gray }
            default { Write-Host $logMessage -ForegroundColor $Color }
        }
    }
}

# Cross-platform detection and validation
function Test-PlatformCompatibility {
    try {
        $platform = [System.Environment]::OSVersion.Platform
        $isWindows = $platform -eq "Win32NT"
        $isUnix = $platform -eq "Unix" -or $platform -eq "Unix"
        
        Write-LogMessage "Platform: $platform" -Level "Debug"
        Write-LogMessage "OS Version: $([System.Environment]::OSVersion.Version)" -Level "Debug"
        
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

# Enhanced script validation
function Test-ScriptValidity {
    param([string]$ScriptPath)
    
    try {
        Write-LogMessage "Validating script: $ScriptPath" -Level "Info"
        
        # Check if script exists
        if (-not (Test-Path $ScriptPath)) {
            throw "Script not found: $ScriptPath"
        }
        
        # Check file extension
        $extension = [System.IO.Path]::GetExtension($ScriptPath)
        if ($extension -ne ".ps1") {
            Write-LogMessage "Warning: File extension is $extension, expected .ps1" -Level "Warning"
        }
        
        # Check file size
        $fileInfo = Get-Item $ScriptPath
        if ($fileInfo.Length -eq 0) {
            throw "Script file is empty"
        }
        
        if ($fileInfo.Length -gt 10MB) {
            Write-LogMessage "Warning: Script file is very large ($([math]::Round($fileInfo.Length / 1MB, 2)) MB)" -Level "Warning"
        }
        
        # Try to parse script syntax
        try {
            $null = [System.Management.Automation.PSParser]::Tokenize((Get-Content $ScriptPath -Raw), [ref]$null)
            Write-LogMessage "Script syntax validation passed" -Level "Success"
        }
        catch {
            Write-LogMessage "Script syntax validation failed: $_" -Level "Warning"
            # Continue execution as some scripts may have complex syntax
        }
        
        # Check for potentially dangerous commands
        $content = Get-Content $ScriptPath -Raw
        $dangerousPatterns = @(
            "Remove-Item.*-Recurse.*-Force",
            "Format-Volume",
            "Clear-Disk",
            "Stop-Computer.*-Force",
            "Restart-Computer.*-Force"
        )
        
        foreach ($pattern in $dangerousPatterns) {
            if ($content -match $pattern) {
                Write-LogMessage "Warning: Potentially dangerous command detected: $pattern" -Level "Warning"
            }
        }
        
        return $true
    }
    catch {
        Write-LogMessage "Script validation failed: $_" -Level "Error"
        return $false
    }
}

# Enhanced PowerShell detection
function Get-PowerShellInfo {
    $powershellVersions = @()
    
    # Try PowerShell Core (pwsh) first
    try {
        $pwshPath = Get-Command pwsh -ErrorAction SilentlyContinue
        if ($pwshPath) {
            $pwshVersion = & pwsh -Command '$PSVersionTable.PSVersion.ToString()' 2>$null
            $powershellVersions += @{
                Name = "PowerShell Core (pwsh)"
                Path = $pwshPath.Source
                Version = $pwshVersion
                Priority = 1
                Arguments = @("-NoProfile", "-File")
            }
            Write-LogMessage "Found PowerShell Core: $pwshVersion" -Level "Debug"
        }
    }
    catch {
        Write-LogMessage "PowerShell Core detection failed: $_" -Level "Debug"
    }
    
    # Try Windows PowerShell (powershell)
    try {
        $powershellPath = Get-Command powershell -ErrorAction SilentlyContinue
        if ($powershellPath) {
            $powershellVersion = & powershell -Command '$PSVersionTable.PSVersion.ToString()' 2>$null
            $powershellVersions += @{
                Name = "Windows PowerShell (powershell)"
                Path = $powershellPath.Source
                Version = $powershellVersion
                Priority = 2
                Arguments = @("-ExecutionPolicy", "Bypass", "-File")
            }
            Write-LogMessage "Found Windows PowerShell: $powershellVersion" -Level "Debug"
        }
    }
    catch {
        Write-LogMessage "Windows PowerShell detection failed: $_" -Level "Debug"
    }
    
    # Sort by priority (PowerShell Core preferred)
    $powershellVersions = $powershellVersions | Sort-Object Priority
    
    return $powershellVersions
}

# Enhanced execution with timeout protection
function Invoke-ScriptWithTimeout {
    param(
        [string]$PowerShellPath,
        [string[]]$Arguments,
        [string]$ScriptPath,
        [string[]]$ScriptArguments,
        [int]$TimeoutSeconds
    )
    
    try {
        Write-LogMessage "Executing script with timeout protection ($TimeoutSeconds seconds)..." -Level "Info"
        Write-LogMessage "PowerShell: $PowerShellPath" -Level "Debug"
        Write-LogMessage "Arguments: $($Arguments -join ' ')" -Level "Debug"
        Write-LogMessage "Script: $ScriptPath" -Level "Debug"
        Write-LogMessage "Script Arguments: $($ScriptArguments -join ' ')" -Level "Debug"
        
        # Build complete argument array
        $allArgs = $Arguments + $ScriptPath + $ScriptArguments
        
        # Start job with timeout
        $job = Start-Job -ScriptBlock {
            param($Path, $Args)
            & $Path @Args
        } -ArgumentList $PowerShellPath, $allArgs
        
        # Wait for completion with timeout
        $result = Wait-Job -Job $job -Timeout $TimeoutSeconds
        
        if ($result -eq $null) {
            Stop-Job -Job $job
            Remove-Job -Job $job
            throw "Script execution timed out after $TimeoutSeconds seconds"
        }
        
        # Get output and exit code
        $output = Receive-Job -Job $job
        $exitCode = $job.ExitCode
        Remove-Job -Job $job
        
        Write-LogMessage "Script execution completed with exit code: $exitCode" -Level "Info"
        
        return @{
            Output = $output
            ExitCode = $exitCode
            Success = $exitCode -eq 0
        }
    }
    catch {
        Write-LogMessage "Error executing script: $_" -Level "Error"
        throw
    }
}

# Main execution function
function Start-ScriptExecution {
    try {
        Write-LogMessage "Enhanced PowerShell Launcher starting..." -Level "Info"
        
        # Platform compatibility check
        if (-not (Test-PlatformCompatibility)) {
            Write-LogMessage "Platform compatibility check failed" -Level "Warning"
        }
        
        # Script validation
        if (-not (Test-ScriptValidity -ScriptPath $ScriptPath)) {
            throw "Script validation failed"
        }
        
        # If only validation requested, exit here
        if ($ValidateOnly) {
            Write-LogMessage "Script validation completed successfully" -Level "Success"
            return @{ Success = $true; ExitCode = 0 }
        }
        
        # Get available PowerShell versions
        $powershellVersions = Get-PowerShellInfo
        if ($powershellVersions.Count -eq 0) {
            throw "No PowerShell found on system"
        }
        
        # Try each PowerShell version
        foreach ($psVersion in $powershellVersions) {
            try {
                Write-LogMessage "Attempting to use $($psVersion.Name)..." -Level "Info"
                
                $result = Invoke-ScriptWithTimeout -PowerShellPath $psVersion.Path -Arguments $psVersion.Arguments -ScriptPath $ScriptPath -ScriptArguments $Arguments -TimeoutSeconds $Timeout
                
                if ($result.Success) {
                    Write-LogMessage "Script executed successfully using $($psVersion.Name)" -Level "Success"
                    return $result
                } else {
                    Write-LogMessage "Script failed with exit code: $($result.ExitCode)" -Level "Warning"
                    # Continue to next PowerShell version
                }
            }
            catch {
                Write-LogMessage "Failed to execute with $($psVersion.Name): $_" -Level "Warning"
                # Continue to next PowerShell version
            }
        }
        
        # If we get here, all PowerShell versions failed
        throw "All PowerShell versions failed to execute the script"
    }
    catch {
        Write-LogMessage "Critical error in script execution: $_" -Level "Error"
        return @{ Success = $false; ExitCode = 1; Error = $_ }
    }
}

# Script execution with comprehensive error handling
try {
    $result = Start-ScriptExecution
    
    if ($result.Success) {
        # Display output if any
        if ($result.Output) {
            Write-LogMessage "Script output:" -Level "Info"
            $result.Output | ForEach-Object { Write-Host $_ }
        }
        
        exit $result.ExitCode
    } else {
        Write-LogMessage "Script execution failed" -Level "Error"
        if ($result.Error) {
            Write-LogMessage "Error details: $($result.Error)" -Level "Error"
        }
        exit $result.ExitCode
    }
}
catch {
    Write-LogMessage "Unhandled error in PowerShell launcher: $_" -Level "Error"
    exit 1
}
