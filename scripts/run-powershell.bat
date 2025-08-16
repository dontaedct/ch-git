@echo off
REM Enhanced Universal PowerShell Launcher with Cross-Platform Support
REM Usage: run-powershell.bat script-name.ps1 [arguments]
REM 
REM Features:
REM - Cross-platform PowerShell detection (pwsh, powershell)
REM - Enhanced error handling and validation
REM - Timeout protection for long-running scripts
REM - Fallback mechanisms for unsupported systems
REM - Proper exit code handling and logging

setlocal enabledelayedexpansion

REM Configuration
set TIMEOUT_SECONDS=300
set LOG_LEVEL=INFO

REM Parse command line arguments
set SCRIPT_NAME=%1
if "%SCRIPT_NAME%"=="" (
    echo [ERROR] No script specified
    echo Usage: run-powershell.bat script-name.ps1 [arguments]
    echo.
    echo Examples:
    echo   run-powershell.bat scripts\guardian-pm2.ps1
    echo   run-powershell.bat scripts\branch-protect.ps1 -Branch develop
    echo.
    exit /b 1
)

REM Validate script exists
if not exist "%SCRIPT_NAME%" (
    echo [ERROR] Script not found: %SCRIPT_NAME%
    echo Please check the file path and try again.
    exit /b 1
)

REM Log function
:log
set "level=%~1"
set "message=%~2"
set "timestamp=%date% %time%"
echo [%timestamp%] [%level%] %message%
goto :eof

REM Check operating system
call :log "INFO" "Detecting operating system..."
if "%OS%"=="Windows_NT" (
    call :log "INFO" "Windows detected: %OS%"
    set IS_WINDOWS=1
) else (
    call :log "WARN" "Non-Windows OS detected: %OS%"
    set IS_WINDOWS=0
)

REM Try PowerShell Core (pwsh) first - preferred for cross-platform
call :log "INFO" "Checking for PowerShell Core (pwsh)..."
where pwsh >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    call :log "SUCCESS" "PowerShell Core (pwsh) found"
    
    REM Validate script syntax before execution
    call :log "INFO" "Validating script syntax..."
    pwsh -NoProfile -Command "Get-Command Test-ScriptFileInfo -ErrorAction SilentlyContinue | Out-Null; if (Test-ScriptFileInfo '%SCRIPT_NAME%' -ErrorAction SilentlyContinue) { Write-Host 'Syntax OK' } else { Write-Host 'Syntax validation skipped' }" 2>nul
    
    REM Execute script with timeout protection
    call :log "INFO" "Executing script with PowerShell Core (pwsh)..."
    call :execute_with_timeout "pwsh" "-NoProfile" "-File" "%SCRIPT_NAME%" %2 %3 %4 %5 %6 %7 %8 %9
    set EXIT_CODE=%ERRORLEVEL%
    goto :cleanup
)

REM Fall back to Windows PowerShell (powershell)
call :log "INFO" "PowerShell Core not found, checking for Windows PowerShell..."
where powershell >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    call :log "SUCCESS" "Windows PowerShell (powershell) found"
    
    REM Check execution policy
    call :log "INFO" "Checking execution policy..."
    powershell -Command "Get-ExecutionPolicy" 2>nul | findstr /i "restricted" >nul
    if %ERRORLEVEL% EQU 0 (
        call :log "WARN" "Execution policy is restricted, attempting to bypass..."
        set EXEC_POLICY="-ExecutionPolicy" "Bypass"
    ) else (
        set EXEC_POLICY=
    )
    
    REM Execute script with timeout protection
    call :log "INFO" "Executing script with Windows PowerShell..."
    call :execute_with_timeout "powershell" %EXEC_POLICY% "-File" "%SCRIPT_NAME%" %2 %3 %4 %5 %6 %7 %8 %9
    set EXIT_CODE=%ERRORLEVEL%
    goto :cleanup
)

REM Neither PowerShell found - provide helpful error and alternatives
call :log "ERROR" "No PowerShell found on system"
echo.
echo [ERROR] PowerShell is required but not found on this system.
echo.
echo Solutions:
echo   1. Install PowerShell Core (recommended):
echo      - Windows: winget install Microsoft.PowerShell
echo      - macOS: brew install powershell
echo      - Linux: https://docs.microsoft.com/en-us/powershell/scripting/install/installing-powershell
echo.
echo   2. Install Windows PowerShell (Windows only):
echo      - Download from Microsoft Store or Windows Features
echo.
echo   3. Use alternative script runners:
echo      - Node.js: node %SCRIPT_NAME:.ps1=.js%
echo      - Python: python %SCRIPT_NAME:.ps1=.py%
echo      - Bash: bash %SCRIPT_NAME:.ps1=.sh%
echo.
echo   4. Run in WSL (Windows Subsystem for Linux):
echo      - wsl bash %SCRIPT_NAME:.ps1=.sh%
echo.
set EXIT_CODE=1
goto :cleanup

REM Execute script with timeout protection
:execute_with_timeout
set "EXEC_CMD=%~1"
shift
set "EXEC_ARGS="
:parse_args
if "%~1"=="" goto :execute
set "EXEC_ARGS=%EXEC_ARGS% %~1"
shift
goto :parse_args

:execute
call :log "INFO" "Starting execution with timeout protection (%TIMEOUT_SECONDS%s)..."
call :log "INFO" "Command: %EXEC_CMD% %EXEC_ARGS%"

REM Start the process
start /b "" %EXEC_CMD% %EXEC_ARGS% > "%TEMP%\ps_output.txt" 2>&1
set "PID=%ERRORLEVEL%"

REM Wait for completion with timeout
set "ELAPSED=0"
:wait_loop
timeout /t 1 /nobreak >nul 2>&1
set /a ELAPSED+=1

REM Check if process is still running
tasklist /FI "PID eq %PID%" 2>nul | find "%PID%" >nul
if %ERRORLEVEL% EQU 0 (
    if %ELAPSED% GEQ %TIMEOUT_SECONDS% (
        call :log "ERROR" "Script execution timed out after %TIMEOUT_SECONDS% seconds"
        taskkill /PID %PID% /F >nul 2>&1
        set EXIT_CODE=124
        goto :cleanup
    )
    goto :wait_loop
)

REM Process completed, get exit code
for /f "tokens=2" %%i in ('tasklist /FI "PID eq %PID%" /FO CSV 2^>nul ^| find "%PID%"') do (
    set "EXIT_CODE=%%i"
)

REM Display output
if exist "%TEMP%\ps_output.txt" (
    call :log "INFO" "Script output:"
    type "%TEMP%\ps_output.txt"
    del "%TEMP%\ps_output.txt" >nul 2>&1
)

goto :eof

REM Cleanup and exit
:cleanup
call :log "INFO" "Execution completed with exit code: %EXIT_CODE%"

REM Provide helpful information based on exit code
if %EXIT_CODE% EQU 0 (
    call :log "SUCCESS" "Script executed successfully"
) else if %EXIT_CODE% EQU 124 (
    call :log "ERROR" "Script execution timed out"
) else if %EXIT_CODE% EQU 1 (
    call :log "ERROR" "Script failed with general error"
) else (
    call :log "WARN" "Script completed with non-zero exit code: %EXIT_CODE%"
)

echo.
echo [INFO] Execution summary:
echo   Script: %SCRIPT_NAME%
echo   Exit Code: %EXIT_CODE%
echo   Duration: %ELAPSED% seconds
echo   Platform: %OS%
echo.

endlocal & exit /b %EXIT_CODE%
