#!/usr/bin/env powershell

<#
.SYNOPSIS
    Enable 24/7 Guardian monitoring using PM2 with enhanced safety and cross-platform support
    
.DESCRIPTION
    This script sets up Guardian to run continuously using PM2 process manager.
    It includes comprehensive error handling, timeouts, cross-platform detection,
    and graceful degradation for unsupported systems.
    
.PARAMETER Timeout
    Timeout in seconds for operations (default: 300 seconds)
    
.PARAMETER Force
    Force reinstallation of PM2 even if already present
    
.EXAMPLE
    npm run guardian:auto:pm2
    .\guardian-pm2.ps1 -Timeout 600
    .\guardian-pm2.ps1 -Force
    
.NOTES
    Requires Node.js and npm to be installed.
    PM2 will be installed globally if not present.
    Includes cross-platform compatibility and safety features.
#>

param(
    [int]$Timeout = 300,
    [switch]$Force
)

# Universal header compliance
$ErrorActionPreference = "Stop"
$ProgressPreference = "SilentlyContinue"

# Cross-platform detection and validation
function Test-PlatformCompatibility {
    $platform = [System.Environment]::OSVersion.Platform
    $isWindows = $platform -eq "Win32NT"
    $isUnix = $platform -eq "Unix" -or $platform -eq "Unix"
    
    Write-Host "Platform: $platform" -ForegroundColor Cyan
    
    if (-not $isWindows -and -not $isUnix) {
        Write-Warning "Unsupported platform detected. Some features may not work correctly."
        return $false
    }
    
    return $true
}

# Enhanced error handling with logging
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

# Validate Node.js and npm installation
function Test-NodeEnvironment {
    try {
        $nodeVersion = Invoke-WithTimeout -ScriptBlock { node --version } -TimeoutSeconds 30 -OperationName "Node version check"
        $npmVersion = Invoke-WithTimeout -ScriptBlock { npm --version } -TimeoutSeconds 30 -OperationName "NPM version check"
        
        Write-LogMessage "Node.js version: $nodeVersion" -Level "Info"
        Write-LogMessage "NPM version: $npmVersion" -Level "Info"
        
        return $true
    }
    catch {
        Write-LogMessage "Node.js environment validation failed: $_" -Level "Error"
        return $false
    }
}

# Enhanced PM2 installation with validation
function Install-PM2 {
    param([switch]$Force)
    
    try {
        # Check if PM2 is already installed
        if (-not $Force) {
            $pm2Version = Invoke-WithTimeout -ScriptBlock { pm2 --version 2>$null } -TimeoutSeconds 30 -OperationName "PM2 version check"
            if ($pm2Version) {
                Write-LogMessage "PM2 is already installed (version: $pm2Version)" -Level "Success"
                return $true
            }
        }
        
        Write-LogMessage "Installing PM2 globally..." -Level "Info"
        
        $installResult = Invoke-WithTimeout -ScriptBlock { 
            npm install -g pm2 2>&1
            return $LASTEXITCODE
        } -TimeoutSeconds $Timeout -OperationName "PM2 installation"
        
        if ($installResult -eq 0) {
            Write-LogMessage "PM2 installed successfully" -Level "Success"
            
            # Verify installation
            $verifyResult = Invoke-WithTimeout -ScriptBlock { pm2 --version 2>$null } -TimeoutSeconds 30 -OperationName "PM2 verification"
            if ($verifyResult) {
                return $true
            } else {
                throw "PM2 installation verification failed"
            }
        } else {
            throw "PM2 installation failed with exit code: $installResult"
        }
    }
    catch {
        Write-LogMessage "Error installing PM2: $_" -Level "Error"
        return $false
    }
}

# Enhanced Guardian process management
function Manage-GuardianProcess {
    param([string]$Action)
    
    try {
        switch ($Action) {
            "check" {
                $pm2List = Invoke-WithTimeout -ScriptBlock { pm2 list 2>$null } -TimeoutSeconds 30 -OperationName "PM2 list"
                return $pm2List -match "Guardian"
            }
            "stop" {
                Write-LogMessage "Stopping existing Guardian process..." -Level "Info"
                $stopResult = Invoke-WithTimeout -ScriptBlock { pm2 delete Guardian 2>$null; return $LASTEXITCODE } -TimeoutSeconds 60 -OperationName "Guardian stop"
                if ($stopResult -eq 0) {
                    Write-LogMessage "Existing Guardian process stopped" -Level "Success"
                    return $true
                } else {
                    Write-LogMessage "Guardian stop operation completed (may have been already stopped)" -Level "Warning"
                    return $true
                }
            }
            "start" {
                Write-LogMessage "Starting Guardian with PM2..." -Level "Info"
                $startResult = Invoke-WithTimeout -ScriptBlock { 
                    pm2 start scripts/guardian.js --name Guardian -- --watch 2>&1
                    return $LASTEXITCODE
                } -TimeoutSeconds 120 -OperationName "Guardian start"
                
                if ($startResult -eq 0) {
                    Write-LogMessage "Guardian started successfully with PM2" -Level "Success"
                    return $true
                } else {
                    throw "Failed to start Guardian with PM2 (exit code: $startResult)"
                }
            }
            default {
                throw "Invalid action: $Action"
            }
        }
    }
    catch {
        Write-LogMessage "Error in Guardian process management ($Action): $_" -Level "Error"
        return $false
    }
}

# Enhanced PM2 configuration management
function Configure-PM2 {
    try {
        # Save PM2 configuration
        Write-LogMessage "Saving PM2 configuration..." -Level "Info"
        $saveResult = Invoke-WithTimeout -ScriptBlock { pm2 save 2>&1; return $LASTEXITCODE } -TimeoutSeconds 60 -OperationName "PM2 save"
        
        if ($saveResult -eq 0) {
            Write-LogMessage "PM2 configuration saved" -Level "Success"
        } else {
            Write-LogMessage "PM2 configuration save failed (this is normal on some systems)" -Level "Warning"
        }
        
        # Try to set up startup script
        Write-LogMessage "Setting up PM2 startup script..." -Level "Info"
        try {
            $startupResult = Invoke-WithTimeout -ScriptBlock { pm2 startup 2>&1; return $LASTEXITCODE } -TimeoutSeconds 60 -OperationName "PM2 startup"
            
            if ($startupResult -eq 0) {
                Write-LogMessage "PM2 startup script configured" -Level "Success"
                Write-LogMessage "TIP: Run the displayed command as administrator to complete startup setup" -Level "Info"
            } else {
                Write-LogMessage "PM2 startup setup failed (this is normal on some systems)" -Level "Warning"
            }
        }
        catch {
            Write-LogMessage "PM2 startup setup failed (this is normal on some systems)" -Level "Warning"
        }
        
        return $true
    }
    catch {
        Write-LogMessage "Error configuring PM2: $_" -Level "Error"
        return $false
    }
}

# Main execution function
function Start-GuardianSetup {
    try {
        Write-LogMessage "Setting up Guardian with PM2 for 24/7 monitoring..." -Level "Info"
        
        # Platform compatibility check
        if (-not (Test-PlatformCompatibility)) {
            Write-LogMessage "Platform compatibility check failed" -Level "Warning"
        }
        
        # Node.js environment validation
        if (-not (Test-NodeEnvironment)) {
            Write-LogMessage "Node.js environment validation failed. Exiting." -Level "Error"
            exit 1
        }
        
        # Install PM2
        if (-not (Install-PM2 -Force:$Force)) {
            Write-LogMessage "PM2 installation failed. Exiting." -Level "Error"
            exit 1
        }
        
        # Check if Guardian is already running
        $guardianRunning = Manage-GuardianProcess -Action "check"
        if ($guardianRunning) {
            Write-LogMessage "Guardian is already running in PM2" -Level "Warning"
            
            # Stop existing process
            if (-not (Manage-GuardianProcess -Action "stop")) {
                Write-LogMessage "Failed to stop existing Guardian process. Exiting." -Level "Error"
                exit 1
            }
        }
        
        # Start Guardian
        if (-not (Manage-GuardianProcess -Action "start")) {
            Write-LogMessage "Failed to start Guardian. Exiting." -Level "Error"
            exit 1
        }
        
        # Configure PM2
        if (-not (Configure-PM2)) {
            Write-LogMessage "PM2 configuration failed, but Guardian is running" -Level "Warning"
        }
        
        # Show current status
        Write-LogMessage "Current PM2 status:" -Level "Info"
        try {
            Invoke-WithTimeout -ScriptBlock { pm2 status } -TimeoutSeconds 30 -OperationName "PM2 status display"
        }
        catch {
            Write-LogMessage "Could not display PM2 status (timeout)" -Level "Warning"
        }
        
        Write-LogMessage "Guardian is now running 24/7 with PM2!" -Level "Success"
        Write-LogMessage "" -Level "Info"
        Write-LogMessage "Next steps:" -Level "Info"
        Write-LogMessage "   • View logs: pm2 logs Guardian" -Level "Info"
        Write-LogMessage "   • Monitor status: pm2 status" -Level "Info"
        Write-LogMessage "   • Restart: pm2 restart Guardian" -Level "Info"
        Write-LogMessage "" -Level "Info"
        Write-LogMessage "To disable Guardian auto-run:" -Level "Info"
        Write-LogMessage "   • Stop and remove: pm2 delete Guardian" -Level "Info"
        Write-LogMessage "   • Save changes: pm2 save" -Level "Info"
        Write-LogMessage "" -Level "Info"
        Write-LogMessage "TIP: Guardian will automatically restart if it crashes or if the system reboots" -Level "Info"
        
        return $true
    }
    catch {
        Write-LogMessage "Critical error in Guardian setup: $_" -Level "Error"
        return $false
    }
}

# Script execution with error handling
try {
    $success = Start-GuardianSetup
    if ($success) {
        exit 0
    } else {
        exit 1
    }
}
catch {
    Write-LogMessage "Unhandled error in Guardian setup script: $_" -Level "Error"
    exit 1
}
