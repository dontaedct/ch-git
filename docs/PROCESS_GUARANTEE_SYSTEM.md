# Process Guarantee System

## 🎯 Ensuring Process Compliance in New Chats

This document outlines the **Process Guarantee System** that ensures AI follows the correct **AUDIT → DECIDE → APPLY → VERIFY** process in every new chat session.

## 🛡️ Process Enforcement

### **CRITICAL REQUIREMENT**
Every new chat session MUST begin with process verification and compliance checking.

### **Required Actions for New Chats:**

1. **🔍 AUDIT PHASE**
   - Read `UNIVERSAL_HEADER.md`
   - Read `docs/AI_RULES.md` and `docs/COACH_HUB.md`
   - Run `npm run hero:tasks:verify`
   - Analyze current system state
   - Identify issues and requirements

2. **🎯 DECIDE PHASE**
   - State clear reasoning for decisions
   - Document strategy and approach
   - Consider constraints and limitations
   - Plan minimal diffs approach

3. **🔧 APPLY PHASE**
   - Use only approved rename scripts
   - Use only alias imports (@app/*, @data/*, etc.)
   - Make minimal, focused changes
   - Follow security guidelines

4. **✅ VERIFY PHASE**
   - Run `npm run doctor`
   - Run `npm run ci`
   - Fix-forward until green
   - Verify all functionality works

## 🚀 Quick Start Commands

### **Process Verification**
```bash
# Run full process verification
npm run process:guarantee

# Check compliance only
npm run process:guarantee --check

# Generate enforcement prompt
npm run process:guarantee --prompt
```

### **Hero Tasks Verification**
```bash
# Verify all hero tasks
npm run hero:tasks:verify
```

## 📋 Process Compliance Checklist

### **🔍 AUDIT PHASE CHECKLIST:**
- [ ] Read and acknowledge `UNIVERSAL_HEADER.md`
- [ ] Read `docs/AI_RULES.md`
- [ ] Run `npm run hero:tasks:verify`
- [ ] Analyze current system state
- [ ] Identify issues and requirements
- [ ] Gather comprehensive information

### **🎯 DECIDE PHASE CHECKLIST:**
- [ ] State clear reasoning for decisions
- [ ] Document strategy and approach
- [ ] Consider constraints and limitations
- [ ] Plan minimal diffs approach
- [ ] Define success criteria

### **🔧 APPLY PHASE CHECKLIST:**
- [ ] Use only approved rename scripts (if needed)
- [ ] Use only alias imports (@app/*, @data/*, etc.)
- [ ] Make minimal, focused changes
- [ ] Follow security guidelines
- [ ] Update `CHANGE_JOURNAL.md` (if touching registries)

### **✅ VERIFY PHASE CHECKLIST:**
- [ ] Run `npm run doctor`
- [ ] Run `npm run ci`
- [ ] Fix-forward until green
- [ ] Verify all functionality works
- [ ] Confirm no regressions
- [ ] Do not commit if red

### **🛡️ SAFETY CHECKLIST:**
- [ ] Never weaken RLS or expose secrets
- [ ] Never use manual renames/moves
- [ ] Never use relative imports (../)
- [ ] Always validate external inputs
- [ ] Follow policy fences and ESLint rules

## 🚨 Process Violations

### **What Constitutes a Violation:**
- Skipping any required phase
- Not running verification commands
- Using manual renames instead of scripts
- Using relative imports instead of aliases
- Committing with red CI status
- Not following security guidelines

### **Consequences of Violations:**
- Session compliance score reduction
- Process restart requirement
- Potential session termination
- Documentation of violations

## 📊 Compliance Scoring

### **Scoring System:**
- **100%**: All phases completed correctly
- **75%**: Most phases completed, minor issues
- **50%**: Half phases completed, some violations
- **25%**: Few phases completed, major violations
- **0%**: No process compliance

### **Required Score:**
- **Minimum**: 75% compliance score
- **Target**: 100% compliance score
- **Action Required**: < 75% requires process restart

## 🔧 Implementation Details

### **Process Guarantee System Features:**
- ✅ **Automatic verification** of required files
- ✅ **Step-by-step tracking** of process phases
- ✅ **Compliance scoring** and reporting
- ✅ **Violation detection** and documentation
- ✅ **Process enforcement** prompts
- ✅ **Comprehensive checklists**

### **Integration Points:**
- ✅ **Universal Header** compliance checking
- ✅ **Hero Tasks** verification integration
- ✅ **AI Rules** enforcement
- ✅ **Security guidelines** validation
- ✅ **CI/CD pipeline** integration

## 📚 Usage Examples

### **Starting a New Chat Session:**
```bash
# 1. Run process verification
npm run process:guarantee

# 2. Verify hero tasks
npm run hero:tasks:verify

# 3. Begin AUDIT phase
# Read UNIVERSAL_HEADER.md and docs/AI_RULES.md
```

### **During Development:**
```bash
# After each phase, verify compliance
npm run process:guarantee --check

# Before committing, ensure verification
npm run doctor && npm run ci
```

### **Process Enforcement Prompt:**
```bash
# Generate enforcement prompt for new chats
npm run process:guarantee --prompt
```

## 🎯 Best Practices

### **1. Always Start with Process Verification**
- Run `npm run process:guarantee` at the beginning of every chat
- Verify all required files exist
- Check compliance score

### **2. Follow Phase Sequence**
- Complete AUDIT before DECIDE
- Complete DECIDE before APPLY
- Complete APPLY before VERIFY
- Never skip phases

### **3. Document Evidence**
- Keep track of what was done in each phase
- Document decisions and reasoning
- Maintain audit trail

### **4. Regular Compliance Checks**
- Check compliance score regularly
- Address violations immediately
- Maintain high compliance standards

## 🚀 Future Enhancements

### **Planned Features:**
- **Automated process enforcement** in CI/CD
- **Real-time compliance monitoring**
- **Process analytics and reporting**
- **Integration with development tools**
- **Process optimization recommendations**

---

**Remember**: The Process Guarantee System ensures consistency, safety, and quality in every development session. Always follow the AUDIT → DECIDE → APPLY → VERIFY methodology for optimal results.
