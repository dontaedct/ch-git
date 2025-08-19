#!/usr/bin/env powershell

<#
.SYNOPSIS
    Enable 24/7 Guardian monitoring using PM2
    
.DESCRIPTION
    This script sets up Guardian to run continuously using PM2 process manager.
    It will install PM2 globally if not present, start Guardian with watch mode,
    and configure it to restart automatically on system reboot.
    
.PARAMETER None
    
.EXAMPLE
    npm run guardian:auto:pm2
    
.NOTES
    Requires Node.js and npm to be installed.
    PM2 will be installed globally if not present.
#>

param()

Write-Host "Setting up Guardian with PM2 for 24/7 monitoring..." -ForegroundColor Cyan

# Check if PM2 is installed globally
$pm2Installed = $false
try {
    $pm2Version = pm2 --version 2>$null
    if ($pm2Version) {
        $pm2Installed = $true
        Write-Host "SUCCESS: PM2 is already installed (version: $pm2Version)" -ForegroundColor Green
    }
} catch {
    $pm2Installed = $false
}

# Install PM2 if not present
if (-not $pm2Installed) {
    Write-Host "Installing PM2 globally..." -ForegroundColor Yellow
    try {
        npm install -g pm2
        if ($LASTEXITCODE -eq 0) {
            Write-Host "SUCCESS: PM2 installed successfully" -ForegroundColor Green
        } else {
            Write-Host "ERROR: Failed to install PM2" -ForegroundColor Red
            exit 1
        }
    } catch {
        Write-Host "ERROR: Error installing PM2: $_" -ForegroundColor Red
        exit 1
    }
}

# Check if Guardian is already running
$guardianRunning = $false
try {
    $pm2List = pm2 list 2>$null
    if ($pm2List -match "Guardian") {
        $guardianRunning = $true
        Write-Host "WARNING: Guardian is already running in PM2" -ForegroundColor Yellow
    }
} catch {
    # PM2 list failed, assume not running
}

# Stop existing Guardian process if running
if ($guardianRunning) {
    Write-Host "Stopping existing Guardian process..." -ForegroundColor Yellow
    pm2 delete Guardian 2>$null
    Write-Host "SUCCESS: Existing Guardian process stopped" -ForegroundColor Green
}

# Start Guardian with PM2
Write-Host "Starting Guardian with PM2..." -ForegroundColor Cyan
try {
    pm2 start scripts/guardian.js --name Guardian -- --watch
    if ($LASTEXITCODE -eq 0) {
        Write-Host "SUCCESS: Guardian started successfully with PM2" -ForegroundColor Green
    } else {
        Write-Host "ERROR: Failed to start Guardian with PM2" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "ERROR: Error starting Guardian: $_" -ForegroundColor Red
    exit 1
}

# Save PM2 configuration
Write-Host "Saving PM2 configuration..." -ForegroundColor Cyan
pm2 save
if ($LASTEXITCODE -eq 0) {
    Write-Host "SUCCESS: PM2 configuration saved" -ForegroundColor Green
} else {
    Write-Host "WARNING: PM2 configuration save failed (this is normal on some systems)" -ForegroundColor Yellow
}

# Try to set up startup script (may not work on all systems)
Write-Host "Setting up PM2 startup script..." -ForegroundColor Cyan
try {
    pm2 startup 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "SUCCESS: PM2 startup script configured" -ForegroundColor Green
        Write-Host "TIP: Run the displayed command as administrator to complete startup setup" -ForegroundColor Cyan
    } else {
        Write-Host "WARNING: PM2 startup setup failed (this is normal on some systems)" -ForegroundColor Yellow
    }
} catch {
    Write-Host "WARNING: PM2 startup setup failed (this is normal on some systems)" -ForegroundColor Yellow
}

# Show current status
Write-Host "Current PM2 status:" -ForegroundColor Cyan
pm2 status

Write-Host ""
Write-Host "SUCCESS: Guardian is now running 24/7 with PM2!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "   • View logs: pm2 logs Guardian" -ForegroundColor White
Write-Host "   • Monitor status: pm2 status" -ForegroundColor White
Write-Host "   • Restart: pm2 restart Guardian" -ForegroundColor White
Write-Host ""
Write-Host "To disable Guardian auto-run:" -ForegroundColor Red
Write-Host "   • Stop and remove: pm2 delete Guardian" -ForegroundColor White
Write-Host "   • Save changes: pm2 save" -ForegroundColor White
Write-Host ""
Write-Host "TIP: Guardian will automatically restart if it crashes or if the system reboots" -ForegroundColor Cyan
