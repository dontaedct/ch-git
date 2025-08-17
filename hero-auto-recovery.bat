@echo off
echo 🚀 HERO ULTIMATE AUTO-RECOVERY INITIATED
cd /d "C:\Users\Dontae-PC\my-app"
echo 🔄 Restoring critical systems...
copy "hero-backups\*.backup" "scripts\"
echo ✅ Recovery complete! Starting Hero Ultimate...
"C:\nvm4w\nodejs\node.exe" scripts/hero-ultimate.js start
exit