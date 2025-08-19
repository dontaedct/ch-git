# Doctor Scripts - TypeScript Error Detection

The doctor scripts analyze your TypeScript project for errors and can automatically fix common issues. Choose the script based on your needs and project size.

## Available Scripts

### 🚀 **Ultra-Lightweight** (Fastest)
```bash
npm run doctor:ultra-light
```
- **Best for**: Quick error checks, large projects, CI/CD
- **Features**: 
  - Only checks TypeScript errors (no exports analysis)
  - No memory-intensive operations
  - 15-30 second timeout
  - Minimal resource usage

### ⚡ **Fast** (Quick Analysis)
```bash
npm run doctor:fast
```
- **Best for**: Medium projects, frequent checks
- **Features**:
  - Processes max 200 files
  - Batch size: 10 files
  - 15 second timeout
  - Basic exports index

### 🐌 **Lightweight** (Balanced)
```bash
npm run doctor:lightweight
```
- **Best for**: Large projects, thorough analysis
- **Features**:
  - Processes max 500 files
  - Batch size: 25 files
  - 30 second timeout
  - Full exports index

### 🛡️ **Safe** (Extended Timeout)
```bash
npm run doctor:safe
```
- **Best for**: Complex projects, debugging
- **Features**:
  - Processes all files
  - 60 second timeout
  - Full analysis with auto-fix suggestions

### 🔧 **Auto-Fix** (Full Analysis + Fixes)
```bash
npm run doctor:fix
```
- **Best for**: Final cleanup, before commits
- **Features**:
  - Full analysis with exports index
  - Automatic fixes for common issues
  - 60 second timeout
  - Comprehensive error reporting

### 🧪 **Test** (Verify Scripts Work)
```bash
npm run doctor:test
```
- **Best for**: Verifying doctor scripts are working
- **Features**:
  - Tests ultra-lightweight and regular doctor
  - 20-30 second timeouts
  - Reports success/failure

## Performance Comparison

| Script | Files | Memory | Speed | Use Case |
|--------|-------|--------|-------|----------|
| `doctor:ultra-light` | Unlimited | Very Low | Fastest | Quick checks, CI |
| `doctor:fast` | 200 | Low | Fast | Development |
| `doctor:lightweight` | 500 | Medium | Medium | Large projects |
| `doctor:safe` | All | High | Slow | Complex projects |
| `doctor:fix` | All | High | Slow | Pre-commit |

## Troubleshooting

### If Scripts Still Freeze:

1. **Start with ultra-lightweight**:
   ```bash
   npm run doctor:ultra-light
   ```

2. **Check system resources**:
   - Available RAM
   - CPU usage
   - Disk space

3. **Use custom parameters**:
   ```bash
   npx tsx scripts/doctor.ts --max-files 100 --batch-size 5 --timeout 10000
   ```

4. **Check for circular dependencies**:
   - Look for files that import each other
   - Check for complex type definitions

### Memory Issues:

- **Reduce batch size**: `--batch-size 5`
- **Limit files**: `--max-files 100`
- **Shorter timeout**: `--timeout 15000`

### Performance Tips:

1. **Close other applications** during large analysis
2. **Use SSD storage** for better file I/O
3. **Increase Node.js memory limit** if needed:
   ```bash
   node --max-old-space-size=4096 scripts/doctor.ts
   ```

## Integration with CI/CD

For continuous integration, use the ultra-lightweight version:

```yaml
# .github/workflows/ci.yml
- name: TypeScript Check
  run: npm run doctor:ultra-light
```

This ensures fast feedback without resource issues in CI environments.

## Custom Configuration

You can create custom doctor configurations by modifying the script parameters:

```json
{
  "scripts": {
    "doctor:custom": "tsx scripts/doctor.ts --max-files 300 --batch-size 15 --timeout 45000"
  }
}
```

## Migration from Old Scripts

If you were using the old doctor scripts that froze:

1. **Replace** `npm run doctor:fix` with `npm run doctor:ultra-light`
2. **For full analysis**, use `npm run doctor:safe` instead
3. **Test first** with `npm run doctor:test`

The new scripts are backward compatible and will provide better performance and reliability.
