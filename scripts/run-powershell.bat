@echo off
REM Universal PowerShell Launcher - Works with both pwsh and powershell
REM Usage: run-powershell.bat script-name.ps1 [arguments]

set SCRIPT_NAME=%1
if "%SCRIPT_NAME%"=="" (
    echo ERROR: No script specified
    echo Usage: run-powershell.bat script-name.ps1 [arguments]
    exit /b 1
)

REM Try pwsh first (PowerShell Core)
where pwsh >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo Using PowerShell Core (pwsh)...
    pwsh -NoProfile -File "%SCRIPT_NAME%" %2 %3 %4 %5 %6 %7 %8 %9
    exit /b %ERRORLEVEL%
)

REM Fall back to powershell (Windows PowerShell)
where powershell >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo Using Windows PowerShell (powershell)...
    powershell -ExecutionPolicy Bypass -File "%SCRIPT_NAME%" %2 %3 %4 %5 %6 %7 %8 %9
    exit /b %ERRORLEVEL%
)

REM Neither found
echo ERROR: No PowerShell found on system
echo Please install either PowerShell Core (pwsh) or Windows PowerShell
exit /b 1
