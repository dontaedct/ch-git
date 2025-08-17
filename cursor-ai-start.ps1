#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Cursor AI Universal Header Auto-Start Automation
    
.DESCRIPTION
    This PowerShell script ensures Cursor AI follows the universal header doc
    at the beginning of each chat. It's fully automated, consistent, and precise.
    
.PARAMETER Silent
    Run silently without user interaction
    
.PARAMETER Report
    Generate detailed compliance report
    
.PARAMETER Fix
    Auto-fix violations where possible
    
.EXAMPLE
    .\cursor-ai-start.ps1
    
.EXAMPLE
    .\cursor-ai-start.ps1 -Silent
    
.EXAMPLE
    .\cursor-ai-start.ps1 -Report -Fix
    
.NOTES
    Run this script at the start of each Cursor AI chat session
    to ensure universal header compliance.
#>

param(
    [switch]$Silent,
    [switch]$Report,
    [switch]$Fix
)

Write-Host ""
Write-Host "🤖 CURSOR AI UNIVERSAL HEADER AUTO-START" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor DarkGray
Write-Host "🎯 Ensuring universal header compliance..." -ForegroundColor Yellow
Write-Host "⏰ Started at: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" -ForegroundColor Gray
Write-Host "================================================" -ForegroundColor DarkGray
Write-Host ""

try {
    # Check if we're in the right directory
    if (-not (Test-Path "package.json")) {
        Write-Host "❌ Error: package.json not found. Please run this script from your project root." -ForegroundColor Red
        exit 1
    }
    
    # Check if npm is available
    if (-not (Get-Command "npm" -ErrorAction SilentlyContinue)) {
        Write-Host "❌ Error: npm is not installed or not in PATH. Please install Node.js and npm." -ForegroundColor Red
        exit 1
    }
    
    # Check if Node.js is available
    if (-not (Get-Command "node" -ErrorAction SilentlyContinue)) {
        Write-Host "❌ Error: Node.js is not installed or not in PATH. Please install Node.js." -ForegroundColor Red
        exit 1
    }
    
    # Build npm command based on parameters
    $npmCommand = "cursor:auto"
    if ($Report) {
        $npmCommand = "cursor:header:report"
    } elseif ($Fix) {
        $npmCommand = "cursor:header:fix"
    }
    
    # Run the automation
    Write-Host "🔄 Running universal header automation..." -ForegroundColor Yellow
    Write-Host "📋 Command: npm run $npmCommand" -ForegroundColor Gray
    Write-Host ""
    
    # Execute npm command and capture output
    $output = & npm run $npmCommand 2>&1
    $exitCode = $LASTEXITCODE
    
    # Display output
    if ($output) {
        Write-Host $output
    }
    
    if ($exitCode -eq 0) {
        Write-Host ""
        Write-Host "================================================" -ForegroundColor DarkGray
        Write-Host "🚀 Cursor AI is now ready with universal header compliance!" -ForegroundColor Green
        Write-Host "💡 You can now start your Cursor AI chat" -ForegroundColor Green
        Write-Host "================================================" -ForegroundColor DarkGray
        Write-Host ""
        
        if (-not $Silent) {
            Write-Host "🎉 Automation completed successfully!" -ForegroundColor Green
        }
    } else {
        Write-Host ""
        Write-Host "⚠️ Automation completed with warnings or errors (Exit code: $exitCode)" -ForegroundColor Yellow
        Write-Host "💡 Check the output above for details" -ForegroundColor Yellow
        Write-Host ""
    }
    
} catch {
    Write-Host ""
    Write-Host "❌ Automation failed: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "💡 Check that npm and Node.js are properly installed" -ForegroundColor Yellow
    Write-Host ""
    exit 1
}

# Keep window open if not silent and not running from command line
if (-not $Silent -and $Host.Name -eq "ConsoleHost") {
    Write-Host "Press any key to continue..." -ForegroundColor Gray
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
}
