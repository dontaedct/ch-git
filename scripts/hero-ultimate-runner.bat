@echo off
echo Starting Hero Ultimate in background...
start /B node scripts/hero-ultimate-simple.js start
echo Hero Ultimate started in background!
echo Use 'npm run hero:ultimate:status' to check status
pause
