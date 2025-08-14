# Day of Safety — Daily Runbook

## 🚨 Safety Validation Checklist

Run these commands in order to validate system safety:

### 1) npm run safety:smoke
**Expected PASS**: All smoke tests pass with green output
**If FAILS**: Check logs for specific test failures, review recent changes

### 2) npm run restore:drill
**Expected PASS**: Database restore simulation completes successfully
**If FAILS**: Verify database connectivity and backup integrity

### 3) npm run release:baseline
**Expected PASS**: Release baseline validation passes all checks
**If FAILS**: Review release configuration and environment variables

### 4) npm run guardian:auto:pm2
**Expected PASS**: Guardian service starts and reports healthy status
**Alternative**: npm run guardian:auto:task (if PM2 unavailable)

### 5) pwsh -NoProfile -File scripts/branch-protect.ps1
**Expected PASS**: Branch protection rules applied successfully
**If FAILS**: Check PowerShell execution policy and repository permissions

## 🔧 Troubleshooting

For detailed troubleshooting information, see:
- [Safety Checklist](docs/safety-checklist.md)
- [Guardian Autorun](docs/guardian-autorun.md)  
- [Branch Protection](docs/branch-protection.md)
