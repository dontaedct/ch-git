@echo off
REM 🤖 CURSOR AI UNIVERSAL HEADER AUTO-STARTUP
REM 
REM This batch file automatically starts the Cursor AI universal header
REM compliance watcher when Windows starts up. It ensures that universal
REM header rules are automatically enforced without any manual commands.
REM
REM To use:
REM 1. Copy this file to: %APPDATA%\Microsoft\Windows\Start Menu\Programs\Startup
REM 2. Or press Win+R, type "shell:startup", and copy this file there
REM

echo.
echo 🤖 CURSOR AI UNIVERSAL HEADER AUTO-STARTUP
echo ================================================
echo 🎯 Starting universal header compliance watcher...
echo ⏰ Started at: %date% %time%
echo ================================================
echo.

REM Change to project directory (adjust path as needed)
cd /d "%~dp0"

REM Check if we're in the right directory
if not exist "package.json" (
    echo ❌ Error: package.json not found
    echo 💡 Please adjust the path in this batch file
    pause
    exit /b 1
)

REM Start the auto-watcher in the background
echo 🔄 Starting auto-watcher...
start /min "Cursor AI Universal Header Watcher" cmd /c "npm run cursor:watch"

REM Wait a moment for the watcher to start
timeout /t 3 /nobreak >nul

REM Check if the watcher started successfully
echo 🔍 Checking watcher status...
npm run cursor:watch:status

echo.
echo ================================================
echo 🚀 Auto-startup completed successfully!
echo 💡 Universal header compliance will run automatically
echo 🎯 No manual commands needed - it runs in the background
echo ================================================
echo.

REM Keep window open briefly then minimize
timeout /t 5 /nobreak >nul
REM Minimize the window
powershell -command "Add-Type -TypeDefinition 'using System; using System.Runtime.InteropServices; public class Win32 { [DllImport(\"user32.dll\")] public static extern bool ShowWindow(IntPtr hWnd, int nCmdShow); }'; $hwnd = (Get-Process -Id $PID).MainWindowHandle; [Win32]::ShowWindow($hwnd, 2);"
