# Guardian Auto-Run Setup

Enable 24/7 Guardian monitoring with one click using either PM2 (recommended) or Windows Task Scheduler.

## 🚀 PM2 (Recommended)

PM2 is a Node.js process manager that provides automatic restarts, monitoring, and system startup integration.

### Enable
```bash
npm run guardian:auto:pm2
```

### What it does
- Installs PM2 globally if not present
- Starts Guardian with `--watch` mode for continuous monitoring
- Configures automatic restart on crashes
- Sets up system startup integration (where supported)
- Saves configuration for persistence

### Disable
```bash
pm2 delete Guardian
pm2 save
```

### Monitor
```bash
pm2 logs Guardian    # View real-time logs
pm2 status           # Check process status
pm2 restart Guardian # Restart if needed
```

## ⏰ Windows Task Scheduler

Windows-native scheduled task that runs Guardian every hour, even when not logged in.

### Enable
```bash
npm run guardian:auto:task
```

**Note:** Requires running PowerShell as Administrator.

### What it does
- Creates/updates "GuardianBackup" scheduled task
- Runs every hour with `--once` flag
- Executes even when user is not logged in
- Logs output to `.backups/meta/task.log`

### Disable
```bash
schtasks /Delete /TN GuardianBackup /F
```

Or via PowerShell:
```powershell
Unregister-ScheduledTask -TaskName GuardianBackup -Confirm:$false
```

### Monitor
- Check Task Scheduler (taskschd.msc)
- View logs in `.backups/meta/task.log`
- Task runs every hour automatically

## 🔄 Comparison

| Feature | PM2 | Task Scheduler |
|---------|-----|----------------|
| **Ease of use** | ✅ One command | ⚠️ Requires admin |
| **Real-time monitoring** | ✅ Live logs & status | ❌ Logs only |
| **Auto-restart** | ✅ On crashes | ❌ Manual only |
| **System startup** | ✅ Automatic | ✅ Automatic |
| **Resource usage** | ✅ Efficient | ✅ Minimal |
| **Cross-platform** | ✅ Yes | ❌ Windows only |

## 🎯 Recommendation

**Use PM2** for development and active monitoring. Use **Task Scheduler** for production servers where you want minimal resource usage and guaranteed execution.

## 🛡️ Safety Features

Both methods are designed to be safe and reversible:
- No permanent system changes
- Clear disable commands
- Preserves existing Guardian processes
- Logs all activities
- Easy to verify and remove
