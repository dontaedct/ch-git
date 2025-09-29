# Smart Development Server Manager for Windows
# PowerShell script to permanently fix port conflict issues

param(
    [string]$Action = "start",
    [int]$Port = 3000
)

Write-Host "🚀 Smart Dev Server Manager" -ForegroundColor Cyan
Write-Host "===========================" -ForegroundColor Cyan

function Kill-ProcessOnPort {
    param([int]$PortNumber)

    Write-Host "🔍 Checking port $PortNumber..." -ForegroundColor Yellow

    try {
        $processes = Get-NetTCPConnection -LocalPort $PortNumber -State Listen -ErrorAction SilentlyContinue

        if ($processes) {
            foreach ($process in $processes) {
                $pid = $process.OwningProcess
                Write-Host "🔫 Killing process $pid on port $PortNumber..." -ForegroundColor Red

                try {
                    Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue
                    Write-Host "✅ Successfully killed process $pid" -ForegroundColor Green
                }
                catch {
                    Write-Host "⚠️ Failed to kill process $pid: $($_.Exception.Message)" -ForegroundColor Yellow
                }
            }

            # Wait for processes to die
            Start-Sleep -Seconds 2
        }
        else {
            Write-Host "✅ Port $PortNumber is already free" -ForegroundColor Green
        }
    }
    catch {
        Write-Host "✅ Port $PortNumber is free" -ForegroundColor Green
    }
}

function Kill-AllDevServers {
    Write-Host "🧹 Cleaning up all development servers..." -ForegroundColor Magenta

    # Kill processes on common dev ports
    $ports = @(3000, 3001, 3002, 3003, 3004, 3005)
    foreach ($port in $ports) {
        Kill-ProcessOnPort -PortNumber $port
    }

    # Kill any Node.js processes that might be dev servers
    Write-Host "🔥 Killing any lingering Node.js dev processes..." -ForegroundColor Red
    try {
        Get-Process | Where-Object {
            $_.ProcessName -eq "node" -and
            $_.CommandLine -like "*next*dev*"
        } | Stop-Process -Force -ErrorAction SilentlyContinue

        Get-Process | Where-Object {
            $_.ProcessName -eq "node" -and
            $_.CommandLine -like "*npm*dev*"
        } | Stop-Process -Force -ErrorAction SilentlyContinue
    }
    catch {
        # Ignore errors - processes might not exist
    }

    Write-Host "✅ All development servers cleaned up" -ForegroundColor Green
}

function Start-DevServer {
    param([int]$TargetPort)

    Write-Host "🚀 Starting development server on port $TargetPort..." -ForegroundColor Cyan

    # Build tokens first
    Write-Host "🔧 Building design tokens..." -ForegroundColor Yellow
    npm run tokens:build

    # Start the server
    Write-Host "📡 Starting Next.js development server..." -ForegroundColor Yellow
    npx next dev --port $TargetPort
}

function Find-AvailablePort {
    $defaultPort = 3000
    $backupPorts = @(3001, 3002, 3003, 3004, 3005)

    # Try to free the default port first
    Kill-ProcessOnPort -PortNumber $defaultPort

    # Check if default port is now available
    try {
        $test = Get-NetTCPConnection -LocalPort $defaultPort -State Listen -ErrorAction SilentlyContinue
        if (-not $test) {
            return $defaultPort
        }
    }
    catch {
        return $defaultPort
    }

    # Try backup ports
    foreach ($port in $backupPorts) {
        try {
            $test = Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue
            if (-not $test) {
                return $port
            }
        }
        catch {
            return $port
        }
    }

    # Nuclear option - kill all and use default
    Write-Host "🔥 Nuclear option: killing all Node.js processes..." -ForegroundColor Red
    Get-Process -Name "node" -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
    Start-Sleep -Seconds 3

    return $defaultPort
}

# Main logic
switch ($Action.ToLower()) {
    "kill" {
        Kill-AllDevServers
        Write-Host "🎉 All servers killed successfully!" -ForegroundColor Green
    }
    "clean" {
        Kill-AllDevServers
        Write-Host "🎉 All servers cleaned successfully!" -ForegroundColor Green
    }
    "start" {
        Kill-AllDevServers

        if ($Port -eq 3000) {
            $availablePort = Find-AvailablePort
        }
        else {
            Kill-ProcessOnPort -PortNumber $Port
            $availablePort = $Port
        }

        Write-Host "🌐 Server will start on port $availablePort" -ForegroundColor Cyan
        Write-Host "📂 Open http://localhost:$availablePort in your browser" -ForegroundColor Cyan

        Start-DevServer -TargetPort $availablePort
    }
    default {
        Write-Host "❌ Unknown action: $Action" -ForegroundColor Red
        Write-Host "Valid actions: start, kill, clean" -ForegroundColor Yellow
        Write-Host "Usage: .\smart-dev.ps1 -Action start -Port 3000" -ForegroundColor Yellow
    }
}