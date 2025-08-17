@echo off
REM 🤖 CURSOR AI UNIVERSAL HEADER AUTO-START
REM 
REM This batch file ensures Cursor AI follows the universal header doc
REM at the beginning of each chat. Run this at the start of each session.
REM
REM Usage: Double-click this file or run from command line
REM

echo.
echo 🤖 CURSOR AI UNIVERSAL HEADER AUTO-START
echo ================================================
echo 🎯 Ensuring universal header compliance...
echo ⏰ Started at: %date% %time%
echo ================================================
echo.

REM Run the auto-start automation
call npm run cursor:auto

echo.
echo ================================================
echo 🚀 Cursor AI is now ready with universal header compliance!
echo 💡 You can now start your Cursor AI chat
echo ================================================
echo.

REM Keep window open if double-clicked
if "%1"=="" (
    echo Press any key to close...
    pause >nul
)
