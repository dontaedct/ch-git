# 🛡️ GUARDIAN - Automated Safety System

## Overview

Guardian is a comprehensive, fully automated safety system that protects your codebase from corruption, data loss, and other threats. It integrates seamlessly with your existing systems and follows universal header rules perfectly.

## 🚀 Features

### **Automated Protection**
- ✅ **Continuous Monitoring**: 24/7 health checks every minute
- ✅ **Auto-Backup**: Creates backups every 5 minutes automatically
- ✅ **Auto-Recovery**: Attempts to fix issues automatically
- ✅ **Emergency Backup**: One-click emergency backup system
- ✅ **Security Scanning**: Detects exposed secrets and vulnerabilities

### **System Health Monitoring**
- 🔍 **Git Health**: Monitors uncommitted files and remote backup status
- 🔍 **TypeScript Health**: Tracks error counts and system availability
- 🔍 **ESLint Health**: Monitors code quality violations
- 🔍 **Security Health**: Scans for exposed secrets and vulnerabilities
- 🔍 **Backup Health**: Tracks backup frequency and retention

### **Integration**
- 🔗 **Auto-Save Integration**: Works with your existing auto-save system
- 🔗 **Git Hooks**: Integrates with Husky pre-commit and pre-push hooks
- 🔗 **API Endpoints**: RESTful API for programmatic access
- 🔗 **Dashboard Component**: Beautiful React component for monitoring
- 🔗 **Universal Header Compliance**: Follows all universal header rules

## 🛠️ Installation & Setup

### **1. Automatic Integration**
```bash
# Run the integration script to set up everything automatically
node scripts/guardian-integration.js
```

### **2. Manual Setup**
```bash
# Add Guardian scripts to package.json (already done)
npm run guardian:start    # Start monitoring
npm run guardian:health   # Check system health
npm run guardian:backup   # Create backup
npm run guardian:emergency # Emergency backup
```

### **3. Start Monitoring**
```bash
# Start Guardian in the background
npm run guardian:start

# Or run as a service
nohup npm run guardian:start > guardian.log 2>&1 &
```

## 📊 Available Commands

### **Core Commands**
```bash
npm run guardian           # Show Guardian help
npm run guardian:start     # Start monitoring system
npm run guardian:health    # Run health check
npm run guardian:backup    # Create manual backup
npm run guardian:emergency # Emergency backup
npm run guardian:config    # Show configuration
```

### **Integration Commands**
```bash
npm run safe:guardian      # Health check + safe
npm run backup:auto        # Start auto-backup
```

### **Health Check Commands**
```bash
npm run doctor            # TypeScript health check
npm run lint              # ESLint health check
npm run ci                # Full system check
```

## 🔧 Configuration

Guardian configuration is stored in `.guardian.config.json`:

```json
{
  "autoBackup": true,
  "backupInterval": 300000,
  "maxBackups": 10,
  "healthCheckInterval": 60000,
  "gitAutoCommit": true,
  "gitAutoPush": false,
  "notifications": true,
  "criticalThresholds": {
    "typescriptErrors": 10,
    "eslintViolations": 5,
    "uncommittedFiles": 20
  }
}
```

### **Configuration Options**
- **`autoBackup`**: Enable automatic backups
- **`backupInterval`**: Backup frequency in milliseconds (5 minutes default)
- **`maxBackups`**: Maximum number of backups to keep
- **`healthCheckInterval`**: Health check frequency in milliseconds (1 minute default)
- **`gitAutoCommit`**: Automatically commit changes when needed
- **`gitAutoPush`**: Automatically push to remote (manual approval recommended)
- **`notifications`**: Show console notifications
- **`criticalThresholds`**: Define when issues become critical

## 🎯 Usage Examples

### **Start Guardian Monitoring**
```bash
# Start in foreground (see logs)
npm run guardian:start

# Start in background
npm run guardian:start > guardian.log 2>&1 &
```

### **Check System Health**
```bash
# Quick health check
npm run guardian:health

# Full system check
npm run safe:guardian
```

### **Create Backups**
```bash
# Manual backup
npm run guardian:backup

# Emergency backup
npm run guardian:emergency
```

### **View Configuration**
```bash
npm run guardian:config
```

## 🔍 Health Monitoring

### **Git Health**
- **Status**: HEALTHY, WARNING, ERROR
- **Uncommitted Files**: Count of uncommitted changes
- **Remote Backup**: Whether GitHub/remote is configured

### **TypeScript Health**
- **Status**: HEALTHY, WARNING, ERROR
- **Error Count**: Number of TypeScript errors
- **System Availability**: Whether TypeScript is working

### **ESLint Health**
- **Status**: HEALTHY, WARNING, ERROR
- **Violation Count**: Number of ESLint violations
- **Code Quality**: Overall code standards status

### **Security Health**
- **Status**: HEALTHY, WARNING, CRITICAL
- **Issues**: List of detected security problems
- **Secret Exposure**: Checks for exposed API keys/secrets

### **Backup Health**
- **Status**: HEALTHY, WARNING, ERROR
- **Backup Count**: Number of stored backups
- **Last Backup**: Time since last backup

## 🚨 Auto-Recovery

Guardian automatically attempts to fix issues:

### **Git Issues**
- Auto-commit uncommitted changes
- Guide you through remote backup setup

### **TypeScript Issues**
- Run `npm run doctor:fix` automatically
- Attempt to resolve type errors

### **ESLint Issues**
- Run `npm run lint:fix` automatically
- Fix code quality violations

### **Security Issues**
- Detect exposed secrets
- Alert you to vulnerabilities

## 📱 Dashboard Component

Use the Guardian dashboard in your app:

```tsx
import { GuardianDashboard } from '@components/guardian-dashboard';

export default function SafetyPage() {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">System Safety</h1>
      <GuardianDashboard />
    </div>
  );
}
```

## 🔌 API Endpoints

### **Health Check**
```http
GET /api/guardian/health
```

### **Create Backup**
```http
POST /api/guardian/backup
```

### **Emergency Backup**
```http
POST /api/guardian/emergency
```

## 🛡️ Security Features

### **Secret Detection**
- Scans for exposed API keys
- Detects hardcoded secrets
- Monitors environment files

### **Vulnerability Scanning**
- npm audit integration
- Dependency vulnerability detection
- Security best practices enforcement

### **Access Control**
- API endpoint protection
- Secure backup storage
- Audit logging

## 📁 File Structure

```
scripts/
├── guardian.js              # Main Guardian system
├── guardian-integration.js  # Integration script
components/
├── guardian-dashboard.tsx   # Dashboard component
app/api/guardian/
├── health/route.ts         # Health check API
├── backup/route.ts         # Backup API
├── emergency/route.ts      # Emergency backup API
.guardian.config.json        # Configuration file
.guardian-backups/          # Backup storage
.guardian.log               # System logs
```

## 🔄 Integration Points

### **Auto-Save System**
- Triggers backups after auto-saves
- Monitors file changes
- Integrates with existing hooks

### **Git Hooks**
- Pre-commit health checks
- Pre-push safety validation
- Automatic safety enforcement

### **Development Workflow**
- Integrates with existing npm scripts
- Works with universal header rules
- Follows project conventions

## 🚨 Emergency Procedures

### **Critical Issues Detected**
1. **Immediate Action**: Guardian will auto-commit and create backup
2. **Emergency Backup**: Use `npm run guardian:emergency`
3. **Health Check**: Run `npm run guardian:health`
4. **System Recovery**: Follow Guardian's auto-recovery suggestions

### **System Failure**
1. **Check Logs**: Review `.guardian.log`
2. **Manual Backup**: Run `npm run guardian:backup`
3. **Health Assessment**: Run `npm run doctor` and `npm run lint`
4. **Recovery**: Use Guardian's recovery tools

## 📊 Monitoring & Alerts

### **Real-time Monitoring**
- Health checks every minute
- Backup creation every 5 minutes
- File change monitoring
- Git status monitoring

### **Alert System**
- Console notifications
- Log file entries
- Critical issue alerts
- Recovery attempt notifications

### **Dashboard Updates**
- Real-time health status
- Live backup information
- Critical issue display
- Action buttons for manual control

## 🔧 Troubleshooting

### **Common Issues**

#### **Guardian Won't Start**
```bash
# Check Node.js version
node --version

# Check script permissions
chmod +x scripts/guardian.js

# Check configuration
npm run guardian:config
```

#### **Health Check Fails**
```bash
# Run individual checks
npm run doctor
npm run lint
git status

# Check Guardian logs
tail -f .guardian.log
```

#### **Backup Creation Fails**
```bash
# Check disk space
df -h

# Check backup directory
ls -la .guardian-backups/

# Manual backup test
npm run guardian:backup
```

### **Log Analysis**
```bash
# View recent logs
tail -f .guardian.log

# Search for errors
grep ERROR .guardian.log

# Search for critical issues
grep CRITICAL .guardian.log
```

## 🎯 Best Practices

### **Configuration**
- Set appropriate thresholds for your project
- Enable auto-commit for development
- Keep auto-push disabled for safety
- Regular backup retention management

### **Monitoring**
- Check Guardian dashboard regularly
- Review logs for patterns
- Monitor critical thresholds
- Set up alerts for important issues

### **Maintenance**
- Regular health check reviews
- Backup verification
- Configuration updates
- System optimization

## 🔮 Future Enhancements

### **Planned Features**
- Cloud backup integration (AWS S3, Google Cloud)
- Email/SMS alerts for critical issues
- Team collaboration features
- Advanced security scanning
- Performance optimization

### **Integration Roadmap**
- CI/CD pipeline integration
- Slack/Discord notifications
- Advanced analytics dashboard
- Machine learning issue prediction
- Automated issue resolution

## 📞 Support

### **Getting Help**
1. Check this documentation
2. Review Guardian logs
3. Run health checks
4. Check system status

### **Reporting Issues**
- Document the problem
- Include relevant logs
- Provide system information
- Describe expected behavior

---

**🛡️ Guardian is your codebase's first line of defense against corruption, loss, and security threats. Stay safe, stay protected!**
