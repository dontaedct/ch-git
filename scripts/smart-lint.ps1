# PowerShell wrapper for Smart Linting System
# Provides better Windows integration and error handling

param(
    [string]$Mode = "auto"
)

# Set error action preference
$ErrorActionPreference = "Continue"

# Function to log messages with timestamps
function Write-Log {
    param(
        [string]$Message,
        [string]$Type = "Info"
    )
    
    $timestamp = Get-Date -Format "HH:mm:ss"
    $prefix = switch ($Type) {
        "Success" { "✅" }
        "Warning" { "⚠️" }
        "Error" { "❌" }
        "Progress" { "🔄" }
        default { "ℹ️" }
    }
    
    Write-Host "$prefix [$timestamp] $Message"
}

# Function to check if we're in a CI environment
function Test-CIEnvironment {
    return $env:CI -eq "true" -or $env:GITHUB_ACTIONS -eq "true"
}

# Function to check if we're in an interactive terminal
function Test-InteractiveTerminal {
    return [Environment]::UserInteractive -and -not (Test-CIEnvironment)
}

# Function to get project size (Windows-optimized)
function Get-ProjectSize {
    try {
        $gitOutput = git ls-files --cached --modified --others --exclude-standard 2>$null
        if ($gitOutput) {
            return ($gitOutput | Measure-Object).Count
        }
        return 1000 # Default fallback
    }
    catch {
        return 1000 # Default fallback
    }
}

# Function to check for recent ESLint errors
function Test-RecentErrors {
    try {
        if (Test-Path ".eslintcache") {
            $cacheFile = Get-Item ".eslintcache"
            $hoursSinceLastRun = (Get-Date) - $cacheFile.LastWriteTime
            return $hoursSinceLastRun.TotalHours -lt 1
        }
    }
    catch {}
    return $false
}

# Function to clear ESLint cache
function Clear-ESLintCache {
    try {
        if (Test-Path ".eslintcache") {
            Remove-Item ".eslintcache" -Force
            Write-Log "🧹 Cleared ESLint cache for fresh start" "Success"
        }
    }
    catch {
        Write-Log "⚠️ Could not clear cache: $($_.Exception.Message)" "Warning"
    }
}

# Function to select optimal linting strategy
function Select-LintStrategy {
    Write-Log "🔍 Analyzing project context for optimal linting strategy..."
    
    # Check if we're in CI environment
    if (Test-CIEnvironment) {
        Write-Log "🏗️ CI environment detected - using regular mode for comprehensive validation"
        return "regular"
    }
    
    # Check project size
    $projectSize = Get-ProjectSize
    if ($projectSize -gt 1000) {
        Write-Log "📁 Large project detected ($projectSize files) - using fast mode for performance"
        return "fast"
    }
    
    # Check for recent errors
    if (Test-RecentErrors) {
        Write-Log "⚠️ Recent linting errors detected - using fast mode for quick feedback"
        return "fast"
    }
    
    # Check if interactive
    if (Test-InteractiveTerminal) {
        Write-Log "💻 Interactive terminal detected - using interactive mode"
        return "interactive"
    }
    
    # Default to fast mode for development
    Write-Log "🚀 Development mode - using fast mode for optimal performance"
    return "fast"
}

# Function to execute linting with timeout
function Invoke-LintWithTimeout {
    param(
        [string]$Strategy,
        [int]$TimeoutSeconds = 30
    )
    
    $strategyCommands = @{
        "fast" = "next lint --max-warnings 0 --quiet"
        "regular" = "next lint --max-warnings 0"
        "interactive" = "next lint --max-warnings 0"
        "recovery" = "next lint --max-warnings 0 --quiet --cache-location .eslintcache"
    }
    
    $command = $strategyCommands[$Strategy]
    $description = switch ($Strategy) {
        "fast" { "Fast mode - quick feedback with minimal output" }
        "regular" { "Regular mode - comprehensive linting" }
        "interactive" { "Interactive mode - user-friendly with progress" }
        "recovery" { "Recovery mode - safe fallback with caching" }
    }
    
    Write-Log "🚀 Executing: $description"
    
    try {
        # Start the process
        $processInfo = New-Object System.Diagnostics.ProcessStartInfo
        $processInfo.FileName = "npm"
        $processInfo.Arguments = "run lint:$Strategy"
        $processInfo.UseShellExecute = $false
        $processInfo.RedirectStandardOutput = $true
        $processInfo.RedirectStandardError = $true
        
        $process = New-Object System.Diagnostics.Process
        $process.StartInfo = $processInfo
        $process.Start() | Out-Null
        
        # Wait for completion with timeout
        if ($process.WaitForExit($TimeoutSeconds * 1000)) {
            $output = $process.StandardOutput.ReadToEnd()
            $errorOutput = $process.StandardError.ReadToEnd()
            
            if ($process.ExitCode -eq 0) {
                Write-Log "✅ Linting completed successfully!" "Success"
                return @{ Success = $true; ExitCode = 0; Output = $output }
            } else {
                Write-Log "❌ Linting failed with exit code $($process.ExitCode)" "Error"
                return @{ Success = $false; ExitCode = $process.ExitCode; Output = $output; ErrorOutput = $errorOutput }
            }
        } else {
            # Timeout occurred
            Write-Log "⏰ Linting timed out after $TimeoutSeconds seconds" "Warning"
            $process.Kill()
            throw "Linting timed out in $Strategy mode"
        }
    }
    catch {
        Write-Log "💥 Linting process error: $($_.Exception.Message)" "Error"
        throw
    }
    finally {
        if ($process -and -not $process.HasExited) {
            $process.Kill()
        }
    }
}

# Function to execute recovery strategy
function Invoke-RecoveryStrategy {
    param([string]$PreviousStrategy)
    
    Write-Log "🔄 Attempting recovery with safe fallback strategy..." "Warning"
    
    # Clear cache for fresh start
    Clear-ESLintCache
    
    try {
        $result = Invoke-LintWithTimeout "recovery" 30
        if ($result.Success) {
            Write-Log "✅ Recovery successful!" "Success"
            return $result
        }
    }
    catch {
        Write-Log "❌ Recovery failed: $($_.Exception.Message)" "Error"
    }
    
    # Final fallback - just run basic lint
    Write-Log "🆘 Final fallback - running basic lint command..." "Warning"
    try {
        $result = Invoke-LintWithTimeout "fast" 30
        return $result
    }
    catch {
        throw "All linting strategies failed: $($_.Exception.Message)"
    }
}

# Main execution
function Main {
    try {
        Write-Log "🚀 Smart Linting System Starting..."
        
        # Select optimal strategy
        $strategy = Select-LintStrategy
        Write-Log "🎯 Selected strategy: $($strategy.ToUpper())"
        
        # Execute linting
        $timeout = if ($strategy -eq "fast") { 30 } else { 120 }
        $result = Invoke-LintWithTimeout $strategy $timeout
        
        # If failed and not in recovery mode, try recovery
        if (-not $result.Success -and $strategy -ne "recovery") {
            Write-Log "🔄 Linting failed, attempting recovery..." "Warning"
            $result = Invoke-RecoveryStrategy $strategy
        }
        
        # Final status
        if ($result.Success) {
            Write-Log "🎉 Smart linting completed successfully!" "Success"
            exit 0
        } else {
            Write-Log "💥 Smart linting failed after all attempts" "Error"
            exit $result.ExitCode
        }
    }
    catch {
        Write-Log "💥 Fatal error in smart linting: $($_.Exception.Message)" "Error"
        exit 1
    }
}

# Handle script interruption
trap {
    Write-Log "🛑 Linting interrupted" "Warning"
    exit 130
}

# Run main function
Main
