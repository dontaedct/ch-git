# Engineer Runbook - Performance Issues & System Health

**Date:** 2025-08-15  
**Purpose:** Guide engineers through performance issues, system health checks, and new npm tasks  

## Quick Reference

### Emergency Commands
```bash
# System health check
npm run doctor:ultra-light

# Guardian backup status
npm run guardian:health

# Stop all hero systems
npm run hero:ultimate:stop

# Emergency system repair
npm run hero:unified:heal
```

### Performance Monitoring
```bash
# Build performance
npm run build:performance

# Memory leak detection
npm run memory:detect

# System health overview
npm run hero:overview
```

## Performance Issue Triage

### 1. System Appears Frozen/Hanging

#### Symptoms
- Cursor appears unresponsive
- Build processes hang indefinitely
- npm commands don't return
- High CPU/memory usage

#### Immediate Actions
1. **Check system resources:**
   ```bash
   # Windows
   taskmgr
   
   # Check Node processes
   tasklist | findstr node
   ```

2. **Stop hanging processes:**
   ```bash
   # Kill all Node processes (emergency)
   taskkill /f /im node.exe
   
   # Restart Cursor
   ```

3. **Check system health:**
   ```bash
   npm run doctor:ultra-light
   ```

#### Root Cause Investigation
1. **Check for memory leaks:**
   ```bash
   npm run memory:report
   ```

2. **Review recent changes:**
   ```bash
   git log --oneline -10
   ```

3. **Check system logs:**
   ```bash
   # Check for error logs
   dir logs\*.log
   ```

### 2. Build Performance Issues

#### Symptoms
- Builds take >30 seconds
- High memory usage during builds
- Build failures with OOM errors
- Inconsistent build times

#### Investigation Steps
1. **Run build performance monitor:**
   ```bash
   npm run build:performance
   ```

2. **Check build configuration:**
   ```bash
   # Review Next.js config
   cat next.config.ts
   
   # Check package.json scripts
   npm run
   ```

3. **Analyze bundle size:**
   ```bash
   # Enable bundle analyzer
   set ANALYZE=true
   npm run build
   ```

#### Common Fixes
1. **Memory optimization:**
   ```bash
   # Use memory-optimized build
   npm run build:memory
   ```

2. **Fast build mode:**
   ```bash
   npm run build:fast
   ```

3. **Clear build cache:**
   ```bash
   # Remove .next directory
   rmdir /s .next
   npm run build
   ```

### 3. Memory Leaks & High Usage

#### Symptoms
- Memory usage >4GB
- Gradual performance degradation
- OOM crashes
- High heap usage

#### Investigation Steps
1. **Run memory leak detector:**
   ```bash
   npm run memory:detect
   ```

2. **Check memory usage:**
   ```bash
   # Monitor memory in real-time
   npm run memory:report
   ```

3. **Generate heap snapshot:**
   ```bash
   # Create heap dump
   npm run memory:fix
   ```

#### Common Fixes
1. **Clear memory:**
   ```bash
   # Restart Node processes
   npm run hero:ultimate:stop
   npm run hero:ultimate:start
   ```

2. **Check for memory leaks:**
   ```bash
   npm run memory:detect --fix
   ```

3. **Optimize build process:**
   ```bash
   npm run build:memory
   ```

### 4. CI Pipeline Failures

#### Symptoms
- CI jobs timeout
- Build failures in CI
- Inconsistent CI results
- Slow CI feedback

#### Investigation Steps
1. **Check CI configuration:**
   ```bash
   # Review CI workflow
   cat .github/workflows/ci.yml
   ```

2. **Run CI locally:**
   ```bash
   npm run ci:fast
   ```

3. **Check for CI-specific issues:**
   ```bash
   npm run ci:memory
   ```

#### Common Fixes
1. **Optimize CI:**
   ```bash
   # Use fast CI mode
   npm run ci:fast
   ```

2. **Check dependencies:**
   ```bash
   npm ci
   npm run ci
   ```

3. **Review CI logs:**
   - Check GitHub Actions logs
   - Look for timeout or memory issues
   - Verify environment variables

## New NPM Tasks & Usage

### Performance Monitoring Tasks

#### Build Performance
```bash
# Monitor build performance
npm run build:performance

# Fast build with monitoring
npm run build:monitor:fast

# Memory-optimized build
npm run build:memory

# Ultra-fast build
npm run build:ultra-fast
```

#### System Health
```bash
# Quick health check
npm run doctor:ultra-light

# Full health check
npm run doctor

# Auto-fix issues
npm run doctor:fix

# Memory health
npm run memory:report
```

#### Hero System Management
```bash
# System overview
npm run hero:overview

# Unified system status
npm run hero:unified:status

# System health
npm run hero:unified:health

# Execute autonomous mode
npm run hero:unified:execute
```

### Performance Testing Tasks

#### Automated Testing
```bash
# Performance tests
npm run test:performance

# Preview tests
npm run test:preview

# Smoke tests
npm run test:smoke
```

#### Build Testing
```bash
# Test build performance
npm run build:performance

# Test build with memory monitoring
npm run build:monitor:memory

# Test optimized build
npm run build:optimized
```

## System Health Monitoring

### Daily Health Checks
```bash
# Morning health check
npm run doctor:ultra-light
npm run guardian:health
npm run hero:unified:status

# Afternoon check
npm run memory:report
npm run build:performance
```

### Weekly Health Review
```bash
# Full system audit
npm run doctor
npm run hero:audit:full

# Performance review
npm run build:performance
npm run test:performance

# System optimization
npm run hero:unified:optimize
```

### Monthly Health Assessment
```bash
# Comprehensive audit
npm run hero:audit:full
npm run compliance:report

# Performance analysis
npm run build:performance
npm run test:performance

# System upgrade
npm run hero:unified:upgrade
```

## Troubleshooting Common Issues

### PowerShell Issues
```bash
# Check PowerShell execution policy
Get-ExecutionPolicy

# Set execution policy for current user
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser

# Run PowerShell script with bypass
powershell -ExecutionPolicy Bypass -File scripts/script.ps1
```

### Node.js Issues
```bash
# Check Node version
node --version

# Check npm version
npm --version

# Clear npm cache
npm cache clean --force

# Reinstall dependencies
rmdir /s node_modules
del package-lock.json
npm install
```

### Git Issues
```bash
# Check git status
git status

# Check git health
npm run git:health

# Auto-repair git
npm run git:repair

# Emergency git recovery
npm run git:emergency
```

## Performance Optimization

### Build Optimization
1. **Use appropriate build mode:**
   ```bash
   # Development
   npm run build:fast
   
   # Production
   npm run build:memory
   
   # Performance testing
   npm run build:performance
   ```

2. **Monitor build metrics:**
   ```bash
   npm run build:monitor
   ```

3. **Analyze bundle:**
   ```bash
   set ANALYZE=true
   npm run build
   ```

### Memory Optimization
1. **Regular memory checks:**
   ```bash
   npm run memory:detect
   ```

2. **Memory leak prevention:**
   ```bash
   npm run memory:fix
   ```

3. **Monitor memory usage:**
   ```bash
   npm run memory:report
   ```

### System Optimization
1. **Regular health checks:**
   ```bash
   npm run doctor:ultra-light
   ```

2. **System optimization:**
   ```bash
   npm run hero:unified:optimize
   ```

3. **Performance monitoring:**
   ```bash
   npm run build:performance
   ```

## Emergency Procedures

### System Down
1. **Stop all processes:**
   ```bash
   npm run hero:ultimate:stop
   ```

2. **Check system health:**
   ```bash
   npm run doctor:ultra-light
   ```

3. **Emergency repair:**
   ```bash
   npm run hero:unified:heal
   ```

4. **Restart system:**
   ```bash
   npm run hero:ultimate:start
   ```

### Data Loss
1. **Check backup status:**
   ```bash
   npm run guardian:health
   ```

2. **Restore from backup:**
   ```bash
   npm run guardian:backup
   ```

3. **Verify data integrity:**
   ```bash
   npm run doctor
   ```

### Performance Crisis
1. **Immediate assessment:**
   ```bash
   npm run doctor:ultra-light
   npm run memory:report
   ```

2. **Stop non-essential processes:**
   ```bash
   npm run hero:ultimate:stop
   ```

3. **Emergency optimization:**
   ```bash
   npm run hero:unified:heal
   ```

4. **Gradual restart:**
   ```bash
   npm run hero:ultimate:start
   ```

## Best Practices

### Daily Operations
1. **Start with health check:**
   ```bash
   npm run doctor:ultra-light
   ```

2. **Monitor performance:**
   ```bash
   npm run build:performance
   ```

3. **Check system status:**
   ```bash
   npm run hero:unified:status
   ```

### Before Commits
1. **Run quick checks:**
   ```bash
   npm run check:quick
   ```

2. **Verify build:**
   ```bash
   npm run build:fast
   ```

3. **Run tests:**
   ```bash
   npm test
   ```

### After Pulls
1. **Update dependencies:**
   ```bash
   npm install
   ```

2. **Check for issues:**
   ```bash
   npm run doctor:ultra-light
   ```

3. **Verify system health:**
   ```bash
   npm run hero:unified:health
   ```

---

**Note:** This runbook provides immediate guidance for common performance issues. For complex problems, refer to the performance audit report and implementation prompts for detailed solutions.
