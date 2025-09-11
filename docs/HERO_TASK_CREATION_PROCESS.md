# Hero Task Creation Process

## 🎯 Unified Process for Adding New Hero Tasks

This document outlines the **SAFE, NON-DISRUPTIVE** process for creating new hero tasks that maintains consistency with the existing HT-001, HT-002, HT-003 structure.

## 📋 Quick Start

### 1. Create a New Hero Task
```bash
npm run create:hero-task -- "Your Task Title Here"
```

**Example:**
```bash
npm run create:hero-task -- "Database Migration System"
```

### 2. Verify the New Task
```bash
npm run hero:tasks:verify
```

## 🔧 What Gets Created

The script automatically creates:

### Directory Structure
```
docs/hero-tasks/HT-XXX/
├── main-task.ts                    # TypeScript definition
├── HT-XXX_HERO_TASK_STRUCTURE.json # JSON structure (for verification)
├── subtasks/                       # Subtask definitions
└── completion-summaries/          # Completion documentation
```

### Files Generated

1. **`main-task.ts`** - Complete TypeScript definition following HT-001/HT-002/HT-003 patterns
2. **`HT-XXX_HERO_TASK_STRUCTURE.json`** - JSON structure for verification script
3. **Directory structure** - Subtasks and completion-summaries folders

## 📊 Task Structure

Each new task follows the established pattern:

### Main Task Properties
- **Task Number**: Auto-generated (HT-004, HT-005, etc.)
- **Title**: Your provided title
- **Description**: Generated with ADAV methodology
- **Priority**: High (default)
- **Type**: Feature (default)
- **Estimated Hours**: 16 (default)
- **Phases**: 4 (default)

### ADAV Methodology Integration
- **AUDIT** checklist items
- **DECIDE** checklist items  
- **APPLY** checklist items
- **VERIFY** checklist items

### Subtasks
- Automatically generates 4 phases (customizable)
- Each phase follows the established pattern
- Proper task numbering (HT-XXX.1, HT-XXX.2, etc.)

## 🛡️ Safety Features

### Non-Disruptive Design
- ✅ **Only creates new files** - Never modifies existing ones
- ✅ **Follows existing patterns** - Same structure as HT-001, HT-002, HT-003
- ✅ **Preserves verification** - Works with existing verification script
- ✅ **Maintains consistency** - Uses same TypeScript types and interfaces

### Error Handling
- ✅ **Safe directory creation** - Checks for existing directories
- ✅ **Graceful failures** - Clear error messages
- ✅ **No data loss** - Never overwrites existing files

## 🔍 Verification

After creating a task, run:
```bash
npm run hero:tasks:verify
```

This will show your new task in the verification report with:
- ✅ Proper status display
- ✅ Estimated hours and phases
- ✅ Last modified timestamp
- ✅ Integration with existing system

## 📝 Customization

### Modifying Default Values
Edit `scripts/create-hero-task.ts` to change:
- Default priority (currently 'high')
- Default type (currently 'feature') 
- Default estimated hours (currently 16)
- Default phases (currently 4)
- Default tags and deliverables

### Adding More Details
After creation, manually edit:
- `docs/hero-tasks/HT-XXX/main-task.ts` - Add detailed descriptions
- `docs/hero-tasks/HT-XXX/HT-XXX_HERO_TASK_STRUCTURE.json` - Update metadata

## 🎯 Best Practices

### 1. Follow ADAV Methodology
- **AUDIT**: Review current state and requirements
- **DECIDE**: Plan approach and resources
- **APPLY**: Execute implementation
- **VERIFY**: Test and validate results

### 2. Use Descriptive Titles
- ✅ Good: "Database Migration System"
- ❌ Bad: "Fix stuff"

### 3. Update Task Details
After creation, enhance the generated files with:
- Detailed descriptions
- Specific deliverables
- Success criteria
- Timeline estimates

### 4. Regular Verification
Run `npm run hero:tasks:verify` regularly to:
- Check task status
- Ensure consistency
- Track progress

## 🚀 Example Usage

```bash
# Create a new hero task
npm run create:hero-task -- "User Authentication System"

# Verify it was created
npm run hero:tasks:verify

# Expected output:
# ✅ HT-004: HT-004: User Authentication System (16h) [4 phases]
#    Status: pending
#    Modified: 2025-09-05T20:30:00.000Z
```

## 🔧 Troubleshooting

### Task Not Appearing in Verification
- Check that both `.ts` and `.json` files were created
- Ensure JSON file has proper structure
- Run verification script again

### Directory Creation Errors
- Ensure you have write permissions to `docs/hero-tasks/`
- Check that the directory structure is correct

### TypeScript Errors
- Ensure all imports in `main-task.ts` are correct
- Check that TypeScript types are available

---

**Remember**: This process is designed to be **SAFE** and **NON-DISRUPTIVE**. It only creates new files and follows established patterns to maintain system consistency.

