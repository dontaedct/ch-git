# Safety Checklist

Quick safety automation commands for baseline releases and system validation.

## 🚀 One-Button Operations

### 1. Baseline Release
```bash
npm run release:baseline
```
- Tags v0.1.0 (if not present)
- Pushes tags to remote
- Creates baseline for Guardian + CI + 0 TS errors

### 2. Safety Smoke Test
```bash
npm run safety:smoke
```
- Checks Guardian system health
- Triggers emergency backup if needed
- Validates backup file integrity
- Exits non-zero on failure

### 3. Restore Drill
```bash
npm run restore:drill
```
- Finds newest repo.bundle
- Clones to temp directory
- Runs npm ci, typecheck, build
- Tests backup restoration process

## 📋 When to Use

- **Before major releases**: Run smoke test
- **After system changes**: Verify Guardian health
- **Weekly**: Test backup restoration
- **Emergency**: Validate backup integrity

## 🔍 What Gets Tested

- Guardian API endpoints
- Emergency backup triggers
- Backup file presence and size
- Project restoration from bundles
- Build and dependency processes
