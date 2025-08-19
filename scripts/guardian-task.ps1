#!/usr/bin/env powershell

<#
.SYNOPSIS
    Enable 24/7 Guardian monitoring using Windows Task Scheduler
    
.DESCRIPTION
    This script creates or updates a Windows Scheduled Task called "GuardianBackup"
    that runs Guardian hourly to perform backups. The task will run even when
    the user is not logged in.
    
.PARAMETER None
    
.EXAMPLE
    npm run guardian:auto:task
    
.NOTES
    Requires administrative privileges to create/modify scheduled tasks.
    The task will run every hour and log output to .backups/meta/task.log
#>

param()

Write-Host "Setting up Guardian with Windows Task Scheduler for 24/7 monitoring..." -ForegroundColor Cyan

# Check if running as administrator
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole] "Administrator")
if (-not $isAdmin) {
    Write-Host "ERROR: This script requires administrative privileges" -ForegroundColor Red
    Write-Host "TIP: Please run PowerShell as Administrator and try again" -ForegroundColor Yellow
    exit 1
}

# Get current directory and ensure backup directories exist
$currentDir = Get-Location
$backupsDir = Join-Path $currentDir ".backups"
$metaDir = Join-Path $backupsDir "meta"

    if (-not (Test-Path $backupsDir)) {
        New-Item -ItemType Directory -Path $backupsDir -Force | Out-Null
        Write-Host "SUCCESS: Created backups directory" -ForegroundColor Green
    }
    
    if (-not (Test-Path $metaDir)) {
        New-Item -ItemType Directory -Path $metaDir -Force | Out-Null
        Write-Host "SUCCESS: Created meta directory" -ForegroundColor Green
    }

# Check if task already exists
$taskExists = $false
try {
    $existingTask = Get-ScheduledTask -TaskName "GuardianBackup" -ErrorAction SilentlyContinue
    if ($existingTask) {
        $taskExists = $true
        Write-Host "WARNING: GuardianBackup task already exists" -ForegroundColor Yellow
    }
} catch {
    # Task doesn't exist
}

# Define task properties
$taskName = "GuardianBackup"
$taskDescription = "Guardian backup system - runs every hour to create project backups"
$taskAction = New-ScheduledTaskAction -Execute "node.exe" -Argument "scripts\guardian.js --once" -WorkingDirectory $currentDir
$taskTrigger = New-ScheduledTaskTrigger -Once -At (Get-Date) -RepetitionInterval (New-TimeSpan -Hours 1) -RepetitionDuration (New-TimeSpan -Days 365)
$taskSettings = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -StartWhenAvailable -RunOnlyIfNetworkAvailable
$taskPrincipal = New-ScheduledTaskPrincipal -UserId "SYSTEM" -LogonType ServiceAccount -RunLevel Highest

# Create or update the task
if ($taskExists) {
    Write-Host "Updating existing GuardianBackup task..." -ForegroundColor Yellow
    try {
        Set-ScheduledTask -TaskName $taskName -Action $taskAction -Trigger $taskTrigger -Settings $taskSettings -Principal $taskPrincipal -Description $taskDescription
        Write-Host "SUCCESS: GuardianBackup task updated successfully" -ForegroundColor Green
    } catch {
        Write-Host "ERROR: Failed to update task: $_" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "Creating new GuardianBackup task..." -ForegroundColor Cyan
    try {
        Register-ScheduledTask -TaskName $taskName -Action $taskAction -Trigger $taskTrigger -Settings $taskSettings -Principal $taskPrincipal -Description $taskDescription
        Write-Host "SUCCESS: GuardianBackup task created successfully" -ForegroundColor Green
    } catch {
        Write-Host "ERROR: Failed to create task: $_" -ForegroundColor Red
        exit 1
    }
}

# Enable the task
Write-Host "Enabling GuardianBackup task..." -ForegroundColor Cyan
try {
    Enable-ScheduledTask -TaskName $taskName
    Write-Host "SUCCESS: Task enabled successfully" -ForegroundColor Green
} catch {
    Write-Host "ERROR: Failed to enable task: $_" -ForegroundColor Red
    exit 1
}

# Get task information
Write-Host "Task information:" -ForegroundColor Cyan
try {
    $task = Get-ScheduledTask -TaskName $taskName
    Write-Host "   Name: $($task.TaskName)" -ForegroundColor White
    Write-Host "   State: $($task.State)" -ForegroundColor White
    Write-Host "   Enabled: $($task.Settings.Enabled)" -ForegroundColor White
    Write-Host "   Last Run: $($task.LastRunTime)" -ForegroundColor White
    Write-Host "   Next Run: $($task.NextRunTime)" -ForegroundColor White
} catch {
    Write-Host "WARNING: Could not retrieve task details" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "SUCCESS: Guardian is now scheduled to run every hour!" -ForegroundColor Green
Write-Host ""
Write-Host "Task details:" -ForegroundColor Cyan
Write-Host "   • Name: GuardianBackup" -ForegroundColor White
Write-Host "   • Schedule: Every hour" -ForegroundColor White
Write-Host "   • Command: node scripts\guardian.js --once" -ForegroundColor White
Write-Host "   • Working Directory: $currentDir" -ForegroundColor White
Write-Host "   • Logs: .backups\meta\task.log" -ForegroundColor White
Write-Host ""
Write-Host "To disable Guardian auto-run:" -ForegroundColor Red
Write-Host "   • Delete task: schtasks /Delete /TN GuardianBackup /F" -ForegroundColor White
Write-Host "   • Or use PowerShell: Unregister-ScheduledTask -TaskName GuardianBackup -Confirm:$false" -ForegroundColor White
Write-Host ""
Write-Host "TIP: Guardian will run automatically every hour, even when you're not logged in" -ForegroundColor Cyan
Write-Host "TIP: Check .backups\meta\task.log for execution history" -ForegroundColor Cyan
