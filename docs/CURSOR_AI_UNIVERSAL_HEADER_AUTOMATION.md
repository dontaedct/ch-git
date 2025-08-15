# 🤖 Cursor AI Universal Header Automation

This system ensures that Cursor AI automatically follows the universal header doc at the beginning of each chat. It's fully automated, consistent, and precise in rule enforcement.

## 🎯 What It Does

The automation system:

1. **AUDIT** - Analyzes current project state and detects violations
2. **DECIDE** - Determines what actions need to be taken
3. **APPLY** - Enforces universal header rules automatically
4. **VERIFY** - Ensures all rules are followed and compliance is maintained

## 🚀 Quick Start

### Option 1: Auto-start (Recommended)
Run this at the beginning of each Cursor AI chat:

```bash
npm run cursor:auto
```

### Option 2: Manual Header Check
For detailed compliance checking:

```bash
npm run cursor:header
```

### Option 3: Direct Script Execution
```bash
node scripts/cursor-ai-auto-start.js
```

## 📋 Available Commands

| Command | Description |
|---------|-------------|
| `npm run cursor:auto` | Auto-start automation (recommended) |
| `npm run cursor:auto:manual` | Force manual mode |
| `npm run cursor:header` | Full universal header compliance check |
| `npm run cursor:header:fix` | Auto-fix violations where possible |
| `npm run cursor:header:report` | Generate detailed compliance report |

## 🔧 Integration with Existing Systems

The automation integrates seamlessly with your existing systems:

- **Automation Master** - Routes Cursor AI tasks automatically
- **Guardian System** - Provides backup and restore capabilities
- **Task Orchestrator** - Manages task execution and dependencies
- **Smart Lint** - Ensures code quality compliance
- **Doctor System** - Validates overall project health

## 📊 What Gets Checked

### Repository Context
- Git repository detection
- Package.json validation
- Project structure analysis

### Framework Detection
- Next.js framework detection
- Monorepo identification
- Package manager detection

### Import Aliases
- TypeScript path mapping
- Standard alias configuration (@app/*, @data/*, @lib/*, @ui/*)
- Relative import preferences

### Rename Tools
- `rename:symbol` script
- `rename:import` script
- `rename:route` script
- `rename:table` script

### Automation Systems
- Automation master availability
- Guardian system integration
- Task orchestrator presence
- Doctor system availability

## 🎯 Universal Header Rules Enforced

### Governance Pattern
- **AUDIT** → **DECIDE** → **APPLY** → **VERIFY**
- Extract Objective, Constraints, Scope, Deliverables, DoD
- Prefer provable, deterministic changes
- Smallest possible diffs
- Never weaken RLS, auth, or expose secrets

### Runtime & Secrets
- Force Node runtime for sensitive operations
- Detect and prevent secret exposure
- Secure backup handling

### Accessibility Baseline
- Never introduce clickable `<div>` or `<span>` for actions
- Use `<button>` (actions) or `<a>/<Link>` (navigation)
- Enable ESLint a11y rules

### Timeouts
- Lint: 30s
- Typecheck: 60s
- Build: 120s
- Policy: 60s
- Validators: 30s
- Backups: 60s

## 🔍 Compliance Reports

The system generates detailed compliance reports in `/reports/`:

```json
{
  "timestamp": "2025-01-XX...",
  "projectRoot": "/path/to/project",
  "ruleChecks": { ... },
  "violations": [ ... ],
  "recommendations": [ ... ],
  "systemStatus": { ... },
  "duration": 1234
}
```

## 🚨 Error Handling

The system is designed to be resilient:

- **Graceful degradation** - If full compliance fails, shows basic rules
- **Automatic recovery** - Attempts to fix common issues
- **Detailed logging** - Clear error messages and next steps
- **Fallback compliance** - Basic rule enforcement even on failure

## 🔄 Automation Flow

```
Cursor AI Chat Starts
         ↓
   Auto-start Triggered
         ↓
   Environment Detection
         ↓
   Universal Header Check
         ↓
   System Integration Verify
         ↓
   Compliance Status Display
         ↓
   Ready for Development
```

## 📝 Customization

### Custom Timeouts
Create `.promptops.json` in your project root:

```json
{
  "timeouts": {
    "lint": 45000,
    "typecheck": 90000,
    "build": 180000
  }
}
```

### Environment Variables
- `CURSOR_AI=true` - Force Cursor AI mode
- `CURSOR_EDITOR=cursor` - Detect Cursor editor

## 🎉 Benefits

1. **Consistency** - Same rules applied every time
2. **Automation** - No manual intervention needed
3. **Integration** - Works with existing automation systems
4. **Compliance** - Ensures universal header rules are followed
5. **Reporting** - Detailed compliance tracking and history
6. **Resilience** - Graceful handling of failures

## 🚀 Getting Started

1. **First time setup**:
   ```bash
   npm run cursor:header
   ```

2. **Daily usage** (start of each Cursor AI chat):
   ```bash
   npm run cursor:auto
   ```

3. **Check compliance**:
   ```bash
   npm run cursor:header:report
   ```

## 🔗 Related Documentation

- [UNIVERSAL_HEADER.md](../UNIVERSAL_HEADER.md) - Complete rule set
- [AUTOMATION_SYSTEM.md](../AUTOMATION_SYSTEM.md) - Automation overview
- [GUARDIAN_README.md](../GUARDIAN_README.md) - Backup system
- [DOCTOR_SCRIPTS.md](../DOCTOR_SCRIPTS.md) - Health checking

## 💡 Pro Tips

- Run `npm run cursor:auto` at the start of each Cursor AI session
- Use `npm run cursor:header:fix` to automatically fix common issues
- Check compliance reports regularly to track improvements
- Integrate with your CI/CD pipeline for automated compliance checking

---

**🎯 Master rules loaded; standing by for universal header compliance.**
