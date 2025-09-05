# PROCESS ENFORCEMENT PROMPT FOR NEW CHATS

## 🎯 CRITICAL: Process Compliance Required

**You MUST follow the AUDIT → DECIDE → APPLY → VERIFY process in this chat session.**

### **REQUIRED ACTIONS:**

1. **🔍 AUDIT PHASE**
   - Read `UNIVERSAL_HEADER.md`
   - Read `docs/AI_RULES.md`
   - Run `npm run hero:tasks:verify`
   - Analyze current system state
   - Identify issues and requirements

2. **🎯 DECIDE PHASE**
   - State clear reasoning for decisions
   - Document strategy and approach
   - Consider constraints and limitations
   - Plan minimal diffs approach

3. **🔧 APPLY PHASE**
   - Use only approved rename scripts (if needed)
   - Use only alias imports (@app/*, @data/*, etc.)
   - Make minimal, focused changes
   - Follow security guidelines

4. **✅ VERIFY PHASE**
   - Run `npm run doctor`
   - Run `npm run ci`
   - Fix-forward until green
   - Verify all functionality works

### **ACKNOWLEDGEMENT REQUIRED:**
Reply with exactly one:
- "Master rules loaded; standing by for <TASK_ID>."
- "Master rules loaded; proceeding with <TASK_ID>."

### **PROCESS VIOLATIONS WILL RESULT IN:**
- Session termination
- Compliance score reduction
- Process restart requirement

### **QUICK VERIFICATION:**
```bash
# Run process verification
npm run process:guarantee

# Verify hero tasks
npm run hero:tasks:verify
```

**BEGIN WITH AUDIT PHASE NOW.**
