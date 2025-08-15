# 🎮 AUTOMATION SYSTEM - Surgical Task Execution

## Overview

The Automation System provides **fully automatic, safe, and surgical task execution** that prevents freezing and integrates seamlessly with existing Guardian, Git Master Control, and Smart systems.

## 🎯 Key Features

- **Automatic Batching**: Large tasks are automatically broken into manageable batches
- **Timeout Management**: Prevents freezing with configurable timeouts
- **Safety Locks**: Prevents conflicts between automation processes
- **System Health Checks**: Automatic health monitoring and repair
- **Integration**: Works with all existing automation systems
- **Cross-Platform**: Node.js and PowerShell versions available

## 🚀 Quick Start

### Basic Usage

```bash
# Use the automation master (recommended)
npm run automation:master git:status

# Or use individual task orchestrator
npm run task:git:status

# PowerShell version (Windows)
npm run task:ps git:status
```

### Available Tasks

| Task | Description | Automatic Batching |
|------|-------------|-------------------|
| `git:status` | Check git status safely | ✅ Yes |
| `lint` | Run linting with batching | ✅ Yes |
| `typecheck` | TypeScript type checking | ✅ Yes |
| `build` | Build with safety checks | ✅ Yes |
| `doctor` | System health check | ✅ Yes |
| `ci` | Full CI pipeline | ✅ Yes |
| `safe` | Safe execution mode | ✅ Yes |

## 🔧 How It Works

### 1. Task Assessment
The system automatically assesses task complexity:
- **Small tasks** (≤10 files): Execute directly
- **Medium tasks** (≤25 files): Execute with monitoring
- **Large tasks** (≤50 files): Execute in batches
- **Huge tasks** (>50 files): Execute in optimized batches

### 2. Automatic Batching
Large tasks are automatically split:
```bash
# Example: Linting 200 files
📊 Task size: 200, Batch size: 50
🔄 Executing lint in batches of 50
📦 Processing batch 1/4 (50 items)
✅ Batch 1 complete (25.0%)
📦 Processing batch 2/4 (50 items)
✅ Batch 2 complete (50.0%)
# ... continues automatically
```

### 3. Safety Mechanisms
- **Lock Management**: Prevents multiple automation processes
- **Timeout Protection**: Automatic termination of stuck processes
- **Health Checks**: System health monitoring before execution
- **Graceful Fallbacks**: Safe alternatives if primary methods fail

## 🛡️ Safety Features

### Lock System
```bash
# Only one automation process can run at a time
.automation.lock  # Prevents conflicts
```

### Timeout Protection
```bash
# Automatic timeouts prevent freezing
LINT: 30s
TYPECHECK: 60s
BUILD: 120s
TASK: 300s (5 minutes)
```

### Health Monitoring
```bash
# System health is checked before execution
📊 System health: healthy
🔧 Routing Git task: git:status
```

## 🔄 Integration with Existing Systems

### Guardian Integration
```bash
# Automatic backup before risky operations
npm run automation:git:commit "Update dependencies"
# → Guardian backup → Git commit → Health check
```

### Git Master Control
```bash
# Git operations are routed through master control
npm run automation:git:status
# → Health check → Git guardian → Task execution
```

### Smart Lint Integration
```bash
# Linting uses smart-lint when available
npm run automation:lint
# → Smart-lint detection → Optimized execution
```

## 📊 Performance Optimization

### Batch Size Optimization
```bash
# Automatic batch size determination
Task size: 150 files
→ Batch size: 50 (optimal for performance)
→ 3 batches with progress tracking
```

### Memory Management
```bash
# Prevents memory issues on large tasks
📦 Processing batch 1/10 (100 items)
✅ Batch 1 complete (10.0%)
🔄 Memory usage: 45MB (stable)
```

## 🚨 Emergency Recovery

### Automatic Repair
```bash
# System automatically repairs issues
❌ Git system unhealthy, attempting repair...
🔧 Repairing Git system...
✅ Git system repair completed
```

### Manual Recovery
```bash
# Force recovery if needed
npm run automation:emergency
# → Full system repair → Health restoration
```

## 📝 Configuration

### Timeout Configuration
```javascript
// In .promptops.json (optional)
{
  "timeouts": {
    "lint": 45000,        // 45 seconds
    "typecheck": 90000,   // 90 seconds
    "build": 180000       // 3 minutes
  }
}
```

### Batch Size Configuration
```javascript
// In .promptops.json (optional)
{
  "batchSizes": {
    "small": 15,          // 15 files
    "medium": 30,         // 30 files
    "large": 75,          // 75 files
    "huge": 150           // 150 files
  }
}
```

## 🔍 Monitoring and Debugging

### Progress Tracking
```bash
🎯 STEP git:status starting...
📊 Task size: 200, Batch size: 50
🔄 Executing git:status in batches of 50
📦 Processing batch 1/4 (50 items)
✅ Batch 1 complete (25.0%)
STEP git:status 1500ms ok
```

### Health Monitoring
```bash
# Check system health
npm run automation:doctor

# Monitor specific system
npm run automation:health git
```

### Debug Mode
```bash
# Enable debug output
DEBUG=automation npm run automation:master git:status
```

## 🚀 Advanced Usage

### Custom Task Execution
```bash
# Execute with custom options
npm run automation:master custom:task -- --timeout 60000

# PowerShell with custom parameters
npm run task:ps custom:task -Timeout 60000
```

### Batch Execution
```bash
# Execute multiple tasks
npm run automation:master git:status && \
npm run automation:master lint && \
npm run automation:master typecheck
```

### Integration with CI/CD
```bash
# Use in CI pipelines
- name: Run automation system
  run: npm run automation:ci
  
- name: Health check
  run: npm run automation:doctor
```

## 🛠️ Troubleshooting

### Common Issues

#### Task Freezing
```bash
# Check if system is locked
ls -la .automation.lock

# Force unlock (if safe)
rm .automation.lock
```

#### Performance Issues
```bash
# Check system health
npm run automation:doctor

# Monitor resource usage
npm run automation:health
```

#### Integration Errors
```bash
# Check system dependencies
npm run automation:master health

# Repair systems
npm run automation:emergency
```

### Recovery Commands
```bash
# Emergency recovery
npm run automation:emergency

# System repair
npm run automation:repair

# Health restoration
npm run automation:health:restore
```

## 📚 API Reference

### TaskOrchestrator Class
```javascript
const orchestrator = new TaskOrchestrator();

// Execute task with automatic batching
await orchestrator.execute('git:status', {
  message: 'Custom message',
  timeout: 60000
});
```

### AutomationMaster Class
```javascript
const master = new AutomationMaster();

// Execute with system health checks
await master.execute('lint', {
  force: false,
  repair: true
});
```

## 🔒 Security Considerations

- **No secrets exposed**: System never exposes sensitive information
- **Process isolation**: Each task runs in isolated environment
- **Lock protection**: Prevents unauthorized automation access
- **Health validation**: System health is verified before execution

## 🚀 Future Enhancements

- **Machine Learning**: Automatic task optimization
- **Predictive Batching**: Smart batch size prediction
- **Distributed Execution**: Multi-machine task distribution
- **Advanced Monitoring**: Real-time performance analytics

## 📞 Support

For issues or questions:
1. Check system health: `npm run automation:doctor`
2. Review logs: Check console output for error details
3. Emergency mode: `npm run automation:emergency`
4. System repair: `npm run automation:repair`

---

**Remember**: The automation system is designed to be **surgical and precise** - it will automatically choose the best approach and prevent freezing while maintaining safety and performance.
