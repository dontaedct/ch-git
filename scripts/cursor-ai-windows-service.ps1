#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Cursor AI Universal Header Windows Service Setup
    
.DESCRIPTION
    This script sets up the Cursor AI auto-watcher as a Windows service that runs
    automatically on system startup. It ensures universal header compliance runs
    automatically without any manual intervention.
    
.PARAMETER Install
    Install the service
    
.PARAMETER Uninstall
    Uninstall the service
    
.PARAMETER Start
    Start the service
    
.PARAMETER Stop
    Stop the service
    
.PARAMETER Status
    Show service status
    
.EXAMPLE
    .\cursor-ai-windows-service.ps1 -Install
    
.EXAMPLE
    .\cursor-ai-windows-service.ps1 -Start
    
.EXAMPLE
    .\cursor-ai-windows-service.ps1 -Status
    
.NOTES
    Requires administrator privileges to install/uninstall services
    The service will automatically run universal header compliance
    whenever Cursor AI activity is detected.
#>

param(
    [switch]$Install,
    [switch]$Uninstall,
    [switch]$Start,
    [switch]$Stop,
    [switch]$Status
)

# Check if running as administrator
function Test-Administrator {
    $currentUser = [Security.Principal.WindowsIdentity]::GetCurrent()
    $principal = New-Object Security.Principal.WindowsPrincipal($currentUser)
    return $principal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
}

# Service configuration
$serviceName = "CursorAIUniversalHeader"
$serviceDisplayName = "Cursor AI Universal Header Auto-Watcher"
$serviceDescription = "Automatically runs universal header compliance when Cursor AI starts a chat"
$servicePath = "powershell.exe"
$serviceArgs = "-ExecutionPolicy Bypass -File `"$PSScriptRoot\cursor-ai-auto-watcher.ps1`""

# Check if we're in the right directory
if (-not (Test-Path "package.json")) {
    Write-Host "❌ Error: package.json not found. Please run this script from your project root." -ForegroundColor Red
    exit 1
}

# Install the service
if ($Install) {
    if (-not (Test-Administrator)) {
        Write-Host "❌ Error: Administrator privileges required to install service" -ForegroundColor Red
        Write-Host "💡 Please run PowerShell as Administrator" -ForegroundColor Yellow
        exit 1
    }
    
    try {
        Write-Host "🔧 Installing Cursor AI Universal Header service..." -ForegroundColor Yellow
        
        # Create the service
        $service = New-Service -Name $serviceName `
                              -DisplayName $serviceDisplayName `
                              -Description $serviceDescription `
                              -StartupType Automatic `
                              -BinaryPathName "$servicePath $serviceArgs"
        
        Write-Host "✅ Service installed successfully!" -ForegroundColor Green
        Write-Host "🎯 Service name: $serviceName" -ForegroundColor Cyan
        Write-Host "🚀 Service will start automatically on system startup" -ForegroundColor Green
        
        # Start the service
        Write-Host "🔄 Starting service..." -ForegroundColor Yellow
        Start-Service -Name $serviceName
        Write-Host "✅ Service started successfully!" -ForegroundColor Green
        
    } catch {
        Write-Host "❌ Failed to install service: $($_.Exception.Message)" -ForegroundColor Red
        exit 1
    }
}

# Uninstall the service
elseif ($Uninstall) {
    if (-not (Test-Administrator)) {
        Write-Host "❌ Error: Administrator privileges required to uninstall service" -ForegroundColor Red
        exit 1
    }
    
    try {
        Write-Host "🛑 Uninstalling Cursor AI Universal Header service..." -ForegroundColor Yellow
        
        # Stop the service if running
        if (Get-Service -Name $serviceName -ErrorAction SilentlyContinue) {
            Stop-Service -Name $serviceName -Force -ErrorAction SilentlyContinue
            Write-Host "⏹️ Service stopped" -ForegroundColor Yellow
        }
        
        # Remove the service
        Remove-Service -Name $serviceName
        Write-Host "✅ Service uninstalled successfully!" -ForegroundColor Green
        
    } catch {
        Write-Host "❌ Failed to uninstall service: $($_.Exception.Message)" -ForegroundColor Red
        exit 1
    }
}

# Start the service
elseif ($Start) {
    try {
        Write-Host "🔄 Starting Cursor AI Universal Header service..." -ForegroundColor Yellow
        
        if (Get-Service -Name $serviceName -ErrorAction SilentlyContinue) {
            Start-Service -Name $serviceName
            Write-Host "✅ Service started successfully!" -ForegroundColor Green
        } else {
            Write-Host "❌ Service not found. Please install it first with -Install" -ForegroundColor Red
        }
        
    } catch {
        Write-Host "❌ Failed to start service: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# Stop the service
elseif ($Stop) {
    try {
        Write-Host "⏹️ Stopping Cursor AI Universal Header service..." -ForegroundColor Yellow
        
        if (Get-Service -Name $serviceName -ErrorAction SilentlyContinue) {
            Stop-Service -Name $serviceName
            Write-Host "✅ Service stopped successfully!" -ForegroundColor Green
        } else {
            Write-Host "❌ Service not found" -ForegroundColor Red
        }
        
    } catch {
        Write-Host "❌ Failed to stop service: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# Show service status
elseif ($Status) {
    try {
        $service = Get-Service -Name $serviceName -ErrorAction SilentlyContinue
        
        if ($service) {
            Write-Host "📊 Cursor AI Universal Header Service Status" -ForegroundColor Cyan
            Write-Host "=".repeat(50) -ForegroundColor DarkGray
            Write-Host "Name: $($service.Name)" -ForegroundColor White
            Write-Host "Display Name: $($service.DisplayName)" -ForegroundColor White
            Write-Host "Status: $($service.Status)" -ForegroundColor $(if($service.Status -eq 'Running'){'Green'}else{'Yellow'})
            Write-Host "Start Type: $($service.StartType)" -ForegroundColor White
            Write-Host "=".repeat(50) -ForegroundColor DarkGray
            
            if ($service.Status -eq 'Running') {
                Write-Host "✅ Service is running and monitoring Cursor AI activity" -ForegroundColor Green
                Write-Host "🚀 Universal header compliance will run automatically" -ForegroundColor Green
            } else {
                Write-Host "⚠️ Service is not running" -ForegroundColor Yellow
                Write-Host "💡 Use -Start to start the service" -ForegroundColor Yellow
            }
        } else {
            Write-Host "❌ Service not found" -ForegroundColor Red
            Write-Host "💡 Use -Install to install the service" -ForegroundColor Yellow
        }
        
    } catch {
        Write-Host "❌ Failed to get service status: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# Show help if no parameters
else {
    Write-Host "🤖 CURSOR AI UNIVERSAL HEADER WINDOWS SERVICE" -ForegroundColor Cyan
    Write-Host "=".repeat(60) -ForegroundColor DarkGray
    Write-Host "This script sets up the Cursor AI auto-watcher as a Windows service" -ForegroundColor White
    Write-Host "that runs automatically on system startup." -ForegroundColor White
    Write-Host "=".repeat(60) -ForegroundColor DarkGray
    Write-Host ""
    Write-Host "Usage:" -ForegroundColor Yellow
    Write-Host "  -Install     Install the service (requires admin)" -ForegroundColor White
    Write-Host "  -Uninstall   Uninstall the service (requires admin)" -ForegroundColor White
    Write-Host "  -Start       Start the service" -ForegroundColor White
    Write-Host "  -Stop        Stop the service" -ForegroundColor White
    Write-Host "  -Status      Show service status" -ForegroundColor White
    Write-Host ""
    Write-Host "Examples:" -ForegroundColor Yellow
    Write-Host "  .\cursor-ai-windows-service.ps1 -Install" -ForegroundColor White
    Write-Host "  .\cursor-ai-windows-service.ps1 -Start" -ForegroundColor White
    Write-Host "  .\cursor-ai-windows-service.ps1 -Status" -ForegroundColor White
    Write-Host ""
    Write-Host "💡 After installation, the service will run automatically" -ForegroundColor Green
    Write-Host "   and ensure universal header compliance without any commands!" -ForegroundColor Green
}
