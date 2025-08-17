# 🚀 Cursor AI Universal Header Integration Guide

This guide shows you how to integrate and use the universal header automation system in your daily Cursor AI workflow.

## 🎯 Quick Integration

### Option 1: Double-Click Automation (Easiest)
1. **Save the batch file** to your project root: `cursor-ai-start.bat`
2. **Double-click** the file at the start of each Cursor AI chat
3. **Wait for completion** - you'll see "🚀 Cursor AI is now ready..."
4. **Start your Cursor AI chat** - all rules are now enforced

### Option 2: PowerShell Integration (Recommended)
1. **Save the PowerShell script** to your project root: `cursor-ai-start.ps1`
2. **Run from PowerShell**:
   ```powershell
   .\cursor-ai-start.ps1
   ```
3. **For silent mode** (no user interaction):
   ```powershell
   .\cursor-ai-start.ps1 -Silent
   ```

### Option 3: NPM Commands (Developer Friendly)
1. **Auto-start** (recommended for daily use):
   ```bash
   npm run cursor:auto
   ```
2. **Full compliance check**:
   ```bash
   npm run cursor:header
   ```
3. **Auto-fix issues**:
   ```bash
   npm run cursor:header:fix
   ```

## 🔄 Daily Workflow Integration

### Morning Routine
```bash
# 1. Start your development session
cd your-project

# 2. Run universal header automation
npm run cursor:auto
# or double-click cursor-ai-start.bat

# 3. Start Cursor AI chat
# All rules are now automatically enforced!
```

### Before Important Changes
```bash
# Run full compliance check
npm run cursor:header

# Fix any issues automatically
npm run cursor:header:fix

# Generate compliance report
npm run cursor:header:report
```

## 🎨 Customization Options

### Custom Timeouts
Create `.promptops.json` in your project root:
```json
{
  "timeouts": {
    "lint": 45000,
    "typecheck": 90000,
    "build": 180000
  }
}
```

### Environment Detection
Set environment variables for automatic detection:
```bash
# Windows
set CURSOR_AI=true

# PowerShell
$env:CURSOR_AI = "true"

# Linux/Mac
export CURSOR_AI=true
```

## 🔧 Advanced Integration

### With Your Existing Automation
The system automatically integrates with:
- **Automation Master** - Routes Cursor AI tasks
- **Guardian System** - Provides backup capabilities
- **Task Orchestrator** - Manages dependencies
- **Smart Lint** - Ensures code quality
- **Doctor System** - Validates project health

### CI/CD Integration
Add to your CI pipeline:
```yaml
# .github/workflows/cursor-ai-compliance.yml
name: Cursor AI Compliance
on: [push, pull_request]
jobs:
  compliance:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm install
      - run: npm run cursor:header
```

### IDE Integration
Add to VS Code tasks (`.vscode/tasks.json`):
```json
{
  "version": "2.0.0",
  "tasks": [
    {
      "label": "Cursor AI: Universal Header",
      "type": "shell",
      "command": "npm",
      "args": ["run", "cursor:auto"],
      "group": "build",
      "presentation": {
        "echo": true,
        "reveal": "always",
        "focus": false,
        "panel": "shared"
      }
    }
  ]
}
```

## 📱 Mobile/Remote Access

### SSH Integration
```bash
# Connect to your development machine
ssh user@your-dev-machine

# Navigate to project
cd your-project

# Run automation
npm run cursor:auto

# Start Cursor AI chat remotely
# All rules are enforced on the remote machine
```

### Cloud Development
```bash
# In GitHub Codespaces, GitPod, etc.
npm run cursor:auto

# The automation works the same way
# Universal header rules are enforced in the cloud
```

## 🚨 Troubleshooting

### Common Issues

#### "npm command not found"
```bash
# Install Node.js and npm first
# Download from: https://nodejs.org/
```

#### "Execution policy error" (PowerShell)
```powershell
# Run with bypass for this session
Set-ExecutionPolicy -ExecutionPolicy Bypass -Scope Process -Force
.\cursor-ai-start.ps1
```

#### "Package.json not found"
```bash
# Make sure you're in the project root directory
# The script must be run from where package.json exists
```

#### "Scripts not found"
```bash
# Install dependencies first
npm install

# Then run the automation
npm run cursor:auto
```

### Getting Help

1. **Check the logs** - The automation provides detailed output
2. **Run with verbose mode** - Use `npm run cursor:header` for full details
3. **Check system health** - Run `npm run doctor` to verify project health
4. **Review compliance report** - Use `npm run cursor:header:report`

## 🎯 Best Practices

### Daily Usage
- **Run automation at the start** of each Cursor AI session
- **Use auto-start** (`npm run cursor:auto`) for daily work
- **Use full check** (`npm run cursor:header`) before important changes

### Team Integration
- **Share the scripts** with your team
- **Add to onboarding** - new developers run automation first
- **Include in PR checks** - ensure compliance before merging

### Maintenance
- **Update regularly** - keep automation scripts current
- **Monitor reports** - track compliance over time
- **Customize timeouts** - adjust for your project's needs

## 🚀 Pro Tips

1. **Keyboard shortcuts** - Create desktop shortcuts for quick access
2. **Auto-run on startup** - Add to Windows startup folder or macOS login items
3. **Integration with Cursor AI** - Set up pre-chat hooks if supported
4. **Batch processing** - Run automation across multiple projects
5. **Scheduled compliance** - Set up daily/weekly compliance checks

## 📊 Success Metrics

Track your compliance improvement:
- **Before**: Run `npm run cursor:header:report` to see current status
- **After**: Run again to see improvements
- **Monitor**: Check `/reports/` folder for historical data
- **Goal**: Achieve "FULL COMPLIANCE ACHIEVED!" status

---

**🎯 Master rules loaded; ready for universal header automation integration.**
