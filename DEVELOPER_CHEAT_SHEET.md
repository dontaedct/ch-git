# 🚀 Developer Cheat Sheet
*Your quick reference for development commands*

## 🆘 **When You're Not Sure What to Do**
```bash
npm run helper          # Interactive menu - tells you what each command does
```

## 🔍 **Quick Health Checks (Use These Daily)**
```bash
npm run check:quick     # Fast check (5-10 seconds) - use before committing
npm run workflow:check  # Same as above - easier to remember
```

## 🛡️ **Safety Checks (Use Before Important Changes)**
```bash
npm run check:full      # Full safety check (30-60 seconds)
npm run workflow:safe   # Same as above - easier to remember
```

## 🚀 **Production Ready (Use Before Deploying)**
```bash
npm run workflow:ready  # Everything (lint + test + build)
npm run ci              # Same thing - the full check
```

## 📚 **What Each Command Does**

### **Code Quality**
- `npm run doctor` - Finds TypeScript errors and import problems
- `npm run lint` - Checks code style and finds issues
- `npm run typecheck` - TypeScript type checking only

### **Development**
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run test` - Run all tests

### **Git Safety**
- `npm run git:health` - Check git hooks and safety
- `npm run git:repair` - Fix git problems automatically

## 🎯 **Daily Workflow**

### **Morning (5 minutes)**
```bash
npm run check:quick     # Make sure everything is working
```

### **Before Committing (2 minutes)**
```bash
npm run check:quick     # Quick safety check
```

### **Before Pushing (5 minutes)**
```bash
npm run check:full      # Full safety check
```

### **Before Deploying (10 minutes)**
```bash
npm run workflow:ready  # Production ready check
```

## 🚨 **When Things Go Wrong**

### **TypeScript Errors**
```bash
npm run doctor          # Find the problems
npm run doctor:fix      # Try to fix automatically
```

### **Linting Errors**
```bash
npm run lint            # See what's wrong
npm run lint:fix        # Try to fix automatically
```

### **Git Problems**
```bash
npm run git:repair      # Fix git issues
npm run git:health      # Check if it's fixed
```

## 💡 **Pro Tips**

1. **Always run `npm run check:quick` before committing**
2. **Use `npm run helper` when you forget what to do**
3. **The `workflow:*` commands are easier to remember**
4. **If something breaks, run `npm run git:repair` first**

## 🔄 **Command Aliases (Easier to Remember)**
- `check:quick` = `workflow:check`
- `check:full` = `workflow:safe`  
- `ci` = `workflow:ready`

## 📱 **Quick Reference Card**

**Daily**: `npm run check:quick`
**Before Commit**: `npm run check:quick`
**Before Push**: `npm run check:full`
**Before Deploy**: `npm run workflow:ready`
**Help**: `npm run helper`
**Git Problems**: `npm run git:repair`
