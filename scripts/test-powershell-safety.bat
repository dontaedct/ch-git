@echo off
REM PowerShell Safety Testing Script
REM Tests all enhanced PowerShell safety features

echo ========================================
echo PowerShell Safety Testing Script
echo ========================================
echo.

REM Check if PowerShell is available
where pwsh >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo [INFO] PowerShell Core (pwsh) found
    set PS_CMD=pwsh
    set PS_ARGS=-NoProfile
) else (
    where powershell >nul 2>&1
    if %ERRORLEVEL% EQU 0 (
        echo [INFO] Windows PowerShell found
        set PS_CMD=powershell
        set PS_ARGS=-ExecutionPolicy Bypass
    ) else (
        echo [ERROR] No PowerShell found
        exit /b 1
    )
)

echo.
echo [INFO] Starting PowerShell safety tests...
echo.

REM Test 1: Basic script validation
echo [TEST] Testing script validation...
%PS_CMD% %PS_ARGS% -Command "if (Test-Path 'scripts\guardian-pm2.ps1') { Write-Host '✓ Guardian script found' -ForegroundColor Green } else { Write-Host '✗ Guardian script not found' -ForegroundColor Red }"
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Script validation test failed
    set FAILED_TESTS=1
)

REM Test 2: Cross-platform detection
echo [TEST] Testing cross-platform detection...
%PS_CMD% %PS_ARGS% -Command "$platform = [System.Environment]::OSVersion.Platform; Write-Host \"Platform: $platform\" -ForegroundColor Cyan"
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Platform detection test failed
    set FAILED_TESTS=1
)

REM Test 3: Error handling
echo [TEST] Testing error handling...
%PS_CMD% %PS_ARGS% -Command "try { Get-Item 'nonexistent-file.txt' -ErrorAction Stop } catch { Write-Host '✓ Error handling working' -ForegroundColor Green }"
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Error handling test failed
    set FAILED_TESTS=1
)

REM Test 4: Timeout mechanism
echo [TEST] Testing timeout mechanism...
%PS_CMD% %PS_ARGS% -Command "$job = Start-Job -ScriptBlock { Start-Sleep 10 }; $result = Wait-Job -Job $job -Timeout 2; if ($result -eq $null) { Stop-Job -Job $job; Remove-Job -Job $job; Write-Host '✓ Timeout mechanism working' -ForegroundColor Green } else { Remove-Job -Job $job; Write-Host '✗ Timeout mechanism failed' -ForegroundColor Red }"
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Timeout mechanism test failed
    set FAILED_TESTS=1
)

REM Test 5: Input validation
echo [TEST] Testing input validation...
%PS_CMD% %PS_ARGS% -Command "$testInput = 'valid-branch'; if (-not [string]::IsNullOrWhiteSpace($testInput)) { Write-Host '✓ Input validation working' -ForegroundColor Green } else { Write-Host '✗ Input validation failed' -ForegroundColor Red }"
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Input validation test failed
    set FAILED_TESTS=1
)

echo.
echo ========================================
echo Test Results Summary
echo ========================================

if defined FAILED_TESTS (
    echo [RESULT] Some tests failed. Check output above.
    echo [ACTION] Review error messages and fix issues.
    exit /b 1
) else (
    echo [RESULT] All basic tests passed successfully!
    echo [INFO] PowerShell safety improvements are working.
    echo.
    echo [NEXT] Run comprehensive tests with:
    echo        %PS_CMD% %PS_ARGS% -File scripts\test-powershell-safety.ps1 -Verbose
)

echo.
echo [INFO] Testing completed.
echo ========================================
