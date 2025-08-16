# 🚀 DOCTOR QUICK REFERENCE GUIDE

## 🎯 **WHICH COMMAND TO USE WHEN**

### **🟢 Daily Development (Safe & Fast)**
```bash
npm run doctor:fast                # Quick check with enhanced protection
npm run doctor:enhanced            # Full analysis with circuit breakers
```

### **🟡 Troubleshooting (When Issues Occur)**
```bash
npm run doctor:ultra-light         # Fastest possible, minimal processing
npm run doctor:timeout-protected   # Basic timeout protection
```

### **🔴 Emergency (When Doctor Hangs)**
```bash
npm run doctor:safe-infinite-loop-protected  # Maximum protection system
```

---

## ⚡ **COMMAND COMPARISON**

| Command | Speed | Protection | Use Case |
|---------|-------|------------|----------|
| `doctor:ultra-light` | ⚡⚡⚡ | 🛡️ | Daily quick checks |
| `doctor:fast` | ⚡⚡ | 🛡️🛡️ | Regular development |
| `doctor:enhanced` | ⚡ | 🛡️🛡️🛡️ | Full analysis |
| `doctor:timeout-protected` | ⚡ | 🛡️🛡️🛡️ | Basic hanging prevention |
| `doctor:safe-infinite-loop-protected` | ⚡ | 🛡️🛡️🛡️🛡️ | Maximum protection |

---

## 🚨 **IF DOCTOR STILL HANGS**

### **Step 1: Force Kill (Windows)**
```bash
taskkill /F /IM node.exe /T
```

### **Step 2: Force Kill (macOS/Linux)**
```bash
pkill -f "npm run doctor"
```

### **Step 3: Use Maximum Protection**
```bash
npm run doctor:safe-infinite-loop-protected
```

---

## 📊 **WHAT EACH COMMAND DOES**

### **`npm run doctor:ultra-light`**
- ✅ Fastest execution (15 seconds max)
- ✅ Minimal file processing (50 files max)
- ✅ Basic TypeScript diagnostics only
- ✅ No exports index building
- ✅ No import compliance checks

### **`npm run doctor:fast`**
- ✅ Quick execution (30 seconds max)
- ✅ Limited file processing (100 files max)
- ✅ Enhanced protection with circuit breakers
- ✅ Basic import compliance checks
- ✅ Resource monitoring

### **`npm run doctor:enhanced`**
- ✅ Full execution (60 seconds max)
- ✅ Complete file processing (200 files max)
- ✅ Circuit breaker protection
- ✅ Full import compliance checks
- ✅ Comprehensive resource monitoring
- ✅ Graceful degradation

### **`npm run doctor:timeout-protected`**
- ✅ Wraps doctor with timeout protection
- ✅ Process monitoring
- ✅ Automatic cleanup
- ✅ Cross-platform support

### **`npm run doctor:safe-infinite-loop-protected`**
- ✅ Maximum protection system
- ✅ Heartbeat monitoring
- ✅ Resource limits enforcement
- ✅ File processing timeouts
- ✅ Automatic process termination

---

## 🔧 **CUSTOMIZATION OPTIONS**

### **Adjust Timeouts**
```bash
npm run doctor:enhanced --timeout 30000    # 30 seconds
npm run doctor:enhanced --timeout 120000   # 2 minutes
```

### **Adjust File Limits**
```bash
npm run doctor:enhanced --max-files 100    # Process 100 files max
npm run doctor:enhanced --max-files 500    # Process 500 files max
```

### **Adjust Circuit Breaker**
```bash
npm run doctor:enhanced --circuit-breaker 5  # 5 failures before stopping
npm run doctor:enhanced --circuit-breaker 2  # 2 failures before stopping
```

---

## 📈 **MONITORING & METRICS**

### **Real-Time Status**
- Resource usage displayed every 10 seconds
- Circuit breaker status shown
- File processing progress tracked
- Failure counts displayed

### **Performance Indicators**
- ✅ **Good**: Memory < 500MB, Runtime < 30s
- ⚠️ **Warning**: Memory 500-800MB, Runtime 30-60s
- ❌ **Critical**: Memory > 800MB, Runtime > 60s

---

## 🎯 **BEST PRACTICES**

### **For Daily Development**
1. Start with `npm run doctor:fast`
2. Use `npm run doctor:enhanced` for full analysis
3. Monitor resource usage during execution

### **For CI/CD Pipelines**
1. Use `npm run doctor:enhanced` with appropriate timeouts
2. Set resource limits based on CI environment
3. Implement circuit breaker thresholds

### **For Troubleshooting**
1. Start with `npm run doctor:ultra-light`
2. Escalate to enhanced protection if needed
3. Use maximum protection for persistent issues

---

## 🚀 **QUICK START**

### **First Time Setup**
```bash
# Test basic functionality
npm run doctor:ultra-light

# Test enhanced protection
npm run doctor:enhanced

# Verify maximum protection
npm run doctor:safe-infinite-loop-protected
```

### **Daily Usage**
```bash
# Quick check
npm run doctor:fast

# Full analysis
npm run doctor:enhanced
```

### **When Issues Occur**
```bash
# Force kill if hanging
taskkill /F /IM node.exe /T  # Windows
pkill -f "npm run doctor"     # macOS/Linux

# Use maximum protection
npm run doctor:safe-infinite-loop-protected
```

---

## 📚 **MORE INFORMATION**

- **Complete Documentation**: `DOCTOR_INFINITE_LOOP_COMPREHENSIVE_FIX.md`
- **Technical Details**: `DOCTOR_INFINITE_LOOP_FIX.md`
- **Package Scripts**: Check `package.json` for all available commands

---

## 🎉 **SUCCESS INDICATORS**

- ✅ Command completes within timeout
- ✅ No infinite loops or hanging
- ✅ Resource usage within limits
- ✅ Circuit breakers remain closed
- ✅ All processes clean up properly

**The doctor command now never hangs indefinitely and always completes or fails safely!**
