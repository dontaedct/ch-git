# 🚨 Emergency Recovery System

## Overview
The Emergency Recovery System provides automated backup and recovery capabilities for the Coach Hub application. It integrates Guardian backup system with MIT Hero autonomous recovery to automatically detect and fix system issues.

## 🛡️ Components

### 1. Guardian Backup System
- **Location**: `scripts/guardian.js`
- **Purpose**: Creates comprehensive backups (Git, project files, database)
- **Commands**: 
  - `npm run guardian:emergency` - Emergency backup
  - `npm run guardian:backup` - Manual backup
  - `npm run guardian:health` - Health check
  - `npm run guardian:start` - Start monitoring

### 2. MIT Hero Emergency Recovery
- **Location**: `scripts/mit-hero-unified-integration.js`
- **Purpose**: Autonomous system recovery and optimization
- **Commands**:
  - `npm run hero:unified:emergency` - Emergency recovery
  - `npm run hero:unified:heal` - Self-healing
  - `npm run hero:unified:optimize` - System optimization

### 3. API Endpoints
- **Health**: `/api/guardian/health` - System health status
- **Emergency**: `/api/guardian/emergency` - Trigger emergency backup/recovery
- **Status**: `/api/guardian/status` - Backup status information

## 🚀 Quick Start

### 1. Check System Health
```bash
npm run guardian:health
```

### 2. Manual Emergency Backup
```bash
npm run guardian:emergency
```

### 3. Trigger Auto-Fix
```bash
npm run hero:unified:emergency
```

### 4. Run Full Test Suite
```bash
npm run test:emergency
```

## 🔧 How It Works

### Emergency Recovery Flow
1. **Detection**: System monitors health via `/api/guardian/health`
2. **Trigger**: Emergency backup or auto-fix is triggered
3. **Backup**: Guardian creates comprehensive backup
4. **Recovery**: MIT Hero performs autonomous recovery
5. **Verification**: System verifies recovery success
6. **Fallback**: If primary recovery fails, safe mode is activated

### Auto-Fix Capabilities
- **Process Cleanup**: Kills stuck processes
- **State Reset**: Resets system to safe state
- **Health Verification**: Confirms recovery success
- **Fallback Recovery**: Safe mode restart if needed

## 📊 Health Status Levels

- **HEALTHY**: All systems operational
- **WARNING**: Minor issues detected
- **ERROR**: Backup failures or system issues
- **CRITICAL**: System in degraded state

## 🎯 Use Cases

### 1. System Freezing
- Click "🔧 Auto-Fix System" button
- MIT Hero will automatically recover

### 2. Backup Failures
- Click "🚨 Emergency Backup" button
- Guardian will create emergency backup

### 3. Performance Issues
- Run `npm run hero:unified:optimize`
- System will self-optimize

### 4. Health Monitoring
- Dashboard auto-refreshes every 30 seconds
- Real-time status updates

## 🧪 Testing

### Test Emergency Recovery
```bash
npm run test:emergency
```

This will test:
- Guardian health endpoint
- Emergency backup functionality
- MIT Hero recovery system

### Manual Testing
1. Start the application: `npm run dev`
2. Navigate to http://localhost:3000/guardian-demo
3. Click emergency buttons on the Guardian Dashboard
4. Monitor console output

## 🔍 Troubleshooting

### Common Issues

#### 1. Health Endpoint Not Responding
- Check if app is running on port 3000
- Verify Guardian API routes exist
- Check console for errors

#### 2. Emergency Backup Fails
- Ensure Guardian script has permissions
- Check disk space for backups
- Verify Git repository is accessible

#### 3. MIT Hero Recovery Fails
- Check Node.js version compatibility
- Verify script dependencies
- Monitor memory usage

### Debug Mode
```bash
# Enable verbose logging
DEBUG=1 npm run hero:unified:emergency

# Check Guardian logs
npm run guardian:status
```

## 📁 File Structure

```
scripts/
├── guardian.js                           # Guardian backup system
├── mit-hero-unified-integration.js      # MIT Hero recovery
└── test-emergency-recovery.js           # Test suite

app/api/guardian/
├── emergency/route.ts                   # Emergency endpoint
├── health/route.ts                      # Health endpoint
└── status/route.ts                      # Status endpoint

lib/guardian/
└── service.ts                           # Guardian service logic

components/
└── guardian-dashboard.tsx               # Dashboard UI
```

## 🚨 Emergency Procedures

### Immediate Response
1. **Don't Panic**: System has automatic recovery
2. **Check Dashboard**: Monitor Guardian status
3. **Trigger Auto-Fix**: Click auto-fix button
4. **Monitor Progress**: Watch console output

### Manual Recovery
1. **Stop Services**: Kill stuck processes
2. **Run Emergency**: `npm run hero:unified:emergency`
3. **Verify Health**: `npm run guardian:health`
4. **Restart if Needed**: `npm run dev`

## 🔒 Security

- All endpoints require authentication
- Backup files are stored securely
- No sensitive data exposed in logs
- RLS policies maintained

## 📈 Performance

- Health checks: 30-second intervals
- Emergency backup: 30-second timeout
- Auto-fix: 60-second timeout
- Dashboard refresh: Real-time updates

## 🎯 Future Enhancements

- [ ] Machine learning for predictive recovery
- [ ] Cloud backup integration
- [ ] Advanced health metrics
- [ ] Automated performance tuning
- [ ] Cross-system recovery coordination

## 📞 Support

For issues with the Emergency Recovery System:
1. Check this README
2. Run test suite: `npm run test:emergency`
3. Check Guardian logs
4. Review MIT Hero output

---

**Remember**: The Emergency Recovery System is designed to be autonomous. In most cases, it will fix issues automatically. Only intervene manually if auto-recovery fails multiple times.
