#!/usr/bin/env powershell

<#
.SYNOPSIS
    Cross-Platform PowerShell Script Launcher with Universal Compatibility
    
.DESCRIPTION
    This script provides a unified interface for running PowerShell scripts across
    different operating systems with automatic fallback mechanisms, alternative
    implementations, and comprehensive error handling.
    
.PARAMETER ScriptName
    Name of the script to run (without extension)
    
.PARAMETER Arguments
    Additional arguments to pass to the script
    
.PARAMETER Platform
    Target platform: Auto, Windows, Unix, CrossPlatform (default: Auto)
    
.PARAMETER Fallback
    Enable fallback to alternative implementations
    
.PARAMETER Timeout
    Timeout in seconds for operations (default: 300)
    
.EXAMPLE
    .\cross-platform-launcher.ps1 guardian-pm2
    .\cross-platform-launcher.ps1 branch-protect -Arguments "-Branch develop"
    .\cross-platform-launcher.ps1 guardian-pm2 -Platform Unix -Fallback
    .\cross-platform-launcher.ps1 test-script -Timeout 600
#>

param(
    [Parameter(Mandatory=$true)]
    [string]$ScriptName,
    
    [Parameter(ValueFromRemainingArguments=$true)]
    [string[]]$Arguments,
    
    [ValidateSet("Auto", "Windows", "Unix", "CrossPlatform")]
    [string]$Platform = "Auto",
    
    [switch]$Fallback,
    [int]$Timeout = 300
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
        "Debug" { Write-Host $logMessage -ForegroundColor Gray }
        default { Write-Host $logMessage -ForegroundColor $Color }
    }
}

# Cross-platform detection
function Get-PlatformInfo {
    try {
        $platform = [System.Environment]::OSVersion.Platform
        $isWindows = $platform -eq "Win32NT"
        $isUnix = $platform -eq "Unix" -or $platform -eq "Unix"
        $isMacOS = $isUnix -and (Get-Command uname -ErrorAction SilentlyContinue) -and (& uname) -eq "Darwin"
        $isLinux = $isUnix -and (Get-Command uname -ErrorAction SilentlyContinue) -and (& uname) -eq "Linux"
        
        $platformInfo = @{
            Platform = $platform
            IsWindows = $isWindows
            IsUnix = $isUnix
            IsMacOS = $isMacOS
            IsLinux = $isLinux
            OSVersion = [System.Environment]::OSVersion.Version.ToString()
        }
        
        Write-LogMessage "Platform: $platform" -Level "Debug"
        Write-LogMessage "OS Version: $($platformInfo.OSVersion)" -Level "Debug"
        Write-LogMessage "Is Windows: $isWindows" -Level "Debug"
        Write-LogMessage "Is Unix: $isUnix" -Level "Debug"
        Write-LogMessage "Is macOS: $isMacOS" -Level "Debug"
        Write-LogMessage "Is Linux: $isLinux" -Level "Debug"
        
        return $platformInfo
    }
    catch {
        Write-LogMessage "Error detecting platform: $_" -Level "Error"
        return $null
    }
}

# Script availability detection
function Test-ScriptAvailability {
    param(
        [string]$ScriptName,
        [object]$PlatformInfo
    )
    
    $availableScripts = @()
    
    try {
        Write-LogMessage "Checking script availability for: $ScriptName" -Level "Info"
        
        # PowerShell script (.ps1)
        $ps1Path = "scripts/$ScriptName.ps1"
        if (Test-Path $ps1Path) {
            $availableScripts += @{
                Type = "PowerShell"
                Path = $ps1Path
                Extension = ".ps1"
                Priority = 1
                Platform = "CrossPlatform"
            }
            Write-LogMessage "Found PowerShell script: $ps1Path" -Level "Debug"
        }
        
        # Node.js script (.js)
        $jsPath = "scripts/$ScriptName.js"
        if (Test-Path $jsPath) {
            $availableScripts += @{
                Type = "Node.js"
                Path = $jsPath
                Extension = ".js"
                Priority = 2
                Platform = "CrossPlatform"
            }
            Write-LogMessage "Found Node.js script: $jsPath" -Level "Debug"
        }
        
        # Python script (.py)
        $pyPath = "scripts/$ScriptName.py"
        if (Test-Path $pyPath) {
            $availableScripts += @{
                Type = "Python"
                Path = $pyPath
                Extension = ".py"
                Priority = 3
                Platform = "CrossPlatform"
            }
            Write-LogMessage "Found Python script: $pyPath" -Level "Debug"
        }
        
        # Bash script (.sh) - Unix only
        if ($PlatformInfo.IsUnix) {
            $shPath = "scripts/$ScriptName.sh"
            if (Test-Path $shPath) {
                $availableScripts += @{
                    Type = "Bash"
                    Path = $shPath
                    Extension = ".sh"
                    Priority = 4
                    Platform = "Unix"
                }
                Write-LogMessage "Found Bash script: $shPath" -Level "Debug"
            }
        }
        
        # Batch script (.bat) - Windows only
        if ($PlatformInfo.IsWindows) {
            $batPath = "scripts/$ScriptName.bat"
            if (Test-Path $batPath) {
                $availableScripts += @{
                    Type = "Batch"
                    Path = $batPath
                    Extension = ".bat"
                    Priority = 5
                    Platform = "Windows"
                }
                Write-LogMessage "Found Batch script: $batPath" -Level "Debug"
            }
        }
        
        # Sort by priority
        $availableScripts = $availableScripts | Sort-Object Priority
        
        Write-LogMessage "Found $($availableScripts.Count) available scripts" -Level "Info"
        return $availableScripts
    }
    catch {
        Write-LogMessage "Error checking script availability: $_" -Level "Error"
        return @()
    }
}

# Runtime environment detection
function Test-RuntimeEnvironment {
    param([string]$ScriptType)
    
    try {
        Write-LogMessage "Checking runtime environment for: $ScriptType" -Level "Info"
        
        switch ($ScriptType) {
            "PowerShell" {
                # Check PowerShell availability
                $pwsh = Get-Command pwsh -ErrorAction SilentlyContinue
                $powershell = Get-Command powershell -ErrorAction SilentlyContinue
                
                if ($pwsh) {
                    return @{ Available = $true; Command = "pwsh"; Arguments = @("-NoProfile", "-File") }
                } elseif ($powershell) {
                    return @{ Available = $true; Command = "powershell"; Arguments = @("-ExecutionPolicy", "Bypass", "-File") }
                } else {
                    return @{ Available = $false; Error = "No PowerShell found" }
                }
            }
            "Node.js" {
                $node = Get-Command node -ErrorAction SilentlyContinue
                if ($node) {
                    return @{ Available = $true; Command = "node"; Arguments = @() }
                } else {
                    return @{ Available = $false; Error = "Node.js not found" }
                }
            }
            "Python" {
                $python = Get-Command python -ErrorAction SilentlyContinue
                $python3 = Get-Command python3 -ErrorAction SilentlyContinue
                
                if ($python3) {
                    return @{ Available = $true; Command = "python3"; Arguments = @() }
                } elseif ($python) {
                    return @{ Available = $true; Command = "python"; Arguments = @() }
                } else {
                    return @{ Available = $false; Error = "Python not found" }
                }
            }
            "Bash" {
                $bash = Get-Command bash -ErrorAction SilentlyContinue
                if ($bash) {
                    return @{ Available = $true; Command = "bash"; Arguments = @() }
                } else {
                    return @{ Available = $false; Error = "Bash not found" }
                }
            }
            "Batch" {
                # Batch scripts run directly on Windows
                return @{ Available = $true; Command = "cmd"; Arguments = @("/c") }
            }
            default {
                return @{ Available = $false; Error = "Unknown script type: $ScriptType" }
            }
        }
    }
    catch {
        Write-LogMessage "Error checking runtime environment: $_" -Level "Error"
        return @{ Available = $false; Error = $_ }
    }
}

# Script execution with timeout
function Invoke-ScriptWithTimeout {
    param(
        [string]$Command,
        [string[]]$Arguments,
        [string]$ScriptPath,
        [string[]]$ScriptArguments,
        [int]$TimeoutSeconds
    )
    
    try {
        Write-LogMessage "Executing script with timeout protection ($TimeoutSeconds seconds)..." -Level "Info"
        Write-LogMessage "Command: $Command" -Level "Debug"
        Write-LogMessage "Arguments: $($Arguments -join ' ')" -Level "Debug"
        Write-LogMessage "Script: $ScriptPath" -Level "Debug"
        Write-LogMessage "Script Arguments: $($ScriptArguments -join ' ')" -Level "Debug"
        
        # Build complete argument array
        $allArgs = $Arguments + $ScriptPath + $ScriptArguments
        
        # Start job with timeout
        $job = Start-Job -ScriptBlock {
            param($Cmd, $Args)
            & $Cmd @Args
        } -ArgumentList $Command, $allArgs
        
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

# Alternative implementation finder
function Find-AlternativeImplementation {
    param(
        [string]$ScriptName,
        [object]$PlatformInfo
    )
    
    try {
        Write-LogMessage "Looking for alternative implementations..." -Level "Info"
        
        $alternatives = @()
        
        # Check for alternative script names
        $alternativeNames = @(
            "$ScriptName-unix",
            "$ScriptName-linux",
            "$ScriptName-macos",
            "$ScriptName-windows",
            "$ScriptName-cross",
            "$ScriptName-alt"
        )
        
        foreach ($altName in $alternativeNames) {
            $altScripts = Test-ScriptAvailability -ScriptName $altName -PlatformInfo $PlatformInfo
            if ($altScripts.Count -gt 0) {
                $alternatives += $altScripts
            }
        }
        
        # Check for platform-specific directories
        $platformDirs = @()
        if ($PlatformInfo.IsWindows) { $platformDirs += "windows" }
        if ($PlatformInfo.IsUnix) { $platformDirs += "unix" }
        if ($PlatformInfo.IsMacOS) { $platformDirs += "macos" }
        if ($PlatformInfo.IsLinux) { $platformDirs += "linux" }
        
        foreach ($dir in $platformDirs) {
            $platformScriptPath = "scripts/$dir/$ScriptName.ps1"
            if (Test-Path $platformScriptPath) {
                $alternatives += @{
                    Type = "PowerShell"
                    Path = $platformScriptPath
                    Extension = ".ps1"
                    Priority = 1
                    Platform = $dir
                    IsAlternative = $true
                }
            }
        }
        
        Write-LogMessage "Found $($alternatives.Count) alternative implementations" -Level "Info"
        return $alternatives
    }
    catch {
        Write-LogMessage "Error finding alternatives: $_" -Level "Error"
        return @()
    }
}

# Main execution function
function Start-CrossPlatformExecution {
    try {
        Write-LogMessage "Cross-Platform Launcher starting..." -Level "Info"
        
        # Get platform information
        $platformInfo = Get-PlatformInfo
        if (-not $platformInfo) {
            throw "Failed to detect platform information"
        }
        
        # Check script availability
        $availableScripts = Test-ScriptAvailability -ScriptName $ScriptName -PlatformInfo $platformInfo
        
        if ($availableScripts.Count -eq 0) {
            Write-LogMessage "No scripts found for: $ScriptName" -Level "Warning"
            
            if ($Fallback) {
                Write-LogMessage "Looking for alternative implementations..." -Level "Info"
                $alternatives = Find-AlternativeImplementation -ScriptName $ScriptName -PlatformInfo $platformInfo
                
                if ($alternatives.Count -gt 0) {
                    Write-LogMessage "Using alternative implementation" -Level "Info"
                    $availableScripts = $alternatives
                } else {
                    throw "No scripts or alternatives found for: $ScriptName"
                }
            } else {
                throw "No scripts found for: $ScriptName. Use -Fallback to look for alternatives."
            }
        }
        
        # Try each available script
        foreach ($script in $availableScripts) {
            try {
                Write-LogMessage "Attempting to run: $($script.Type) script at $($script.Path)" -Level "Info"
                
                # Check runtime environment
                $runtime = Test-RuntimeEnvironment -ScriptType $script.Type
                if (-not $runtime.Available) {
                    Write-LogMessage "Runtime not available for $($script.Type): $($runtime.Error)" -Level "Warning"
                    continue
                }
                
                # Execute script
                $result = Invoke-ScriptWithTimeout -Command $runtime.Command -Arguments $runtime.Arguments -ScriptPath $script.Path -ScriptArguments $Arguments -TimeoutSeconds $Timeout
                
                if ($result.Success) {
                    Write-LogMessage "Script executed successfully using $($script.Type)" -Level "Success"
                    return $result
                } else {
                    Write-LogMessage "Script failed with exit code: $($result.ExitCode)" -Level "Warning"
                    # Continue to next script
                }
            }
            catch {
                Write-LogMessage "Failed to execute $($script.Type) script: $_" -Level "Warning"
                # Continue to next script
            }
        }
        
        # If we get here, all scripts failed
        throw "All available scripts failed to execute"
    }
    catch {
        Write-LogMessage "Critical error in cross-platform execution: $_" -Level "Error"
        return @{ Success = $false; ExitCode = 1; Error = $_ }
    }
}

# Script execution with comprehensive error handling
try {
    $result = Start-CrossPlatformExecution
    
    if ($result.Success) {
        # Display output if any
        if ($result.Output) {
            Write-LogMessage "Script output:" -Level "Info"
            $result.Output | ForEach-Object { Write-Host $_ }
        }
        
        exit $result.ExitCode
    } else {
        Write-LogMessage "Cross-platform execution failed" -Level "Error"
        if ($result.Error) {
            Write-LogMessage "Error details: $($result.Error)" -Level "Error"
        }
        exit $result.ExitCode
    }
}
catch {
    Write-LogMessage "Unhandled error in cross-platform launcher: $_" -Level "Error"
    exit 1
}
