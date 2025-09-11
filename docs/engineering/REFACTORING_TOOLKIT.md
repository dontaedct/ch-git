# HT-006 Refactoring Toolkit Guide

**HT-006 Phase 4 Deliverable**  
**Version**: 1.0.0  
**Author**: HT-006 Phase 4 - Refactoring Toolkit  

## Overview

The HT-006 Refactoring Toolkit provides comprehensive, safe refactoring capabilities for the token-driven design system. Built with ts-morph and jscodeshift, it enables confident code transformations with automated backup, rollback, and validation procedures.

## 🛠️ Toolkit Components

### 1. Where-Used Scanner (`scripts/where-used.ts`)

**Purpose**: Comprehensive symbol analysis for safe refactoring decisions

**Features**:
- Symbol usage analysis across entire codebase
- Component-specific JSX usage detection
- Import/export tracking
- Type reference identification
- Detailed context extraction

**Usage**:
```bash
# Basic symbol analysis
npm run where-used Button

# Component-specific analysis
npm run where-used:component Button

# Verbose output with file locations
tsx scripts/where-used.ts Button --verbose

# JSON output for automation
tsx scripts/where-used.ts Button --json
```

**Output Format**:
```typescript
interface WhereUsedResult {
  symbol: string;
  totalUsages: number;
  files: string[];
  usages: UsageInfo[];
  summary: {
    declarations: number;
    imports: number;
    references: number;
    typeReferences: number;
  };
}
```

### 2. Codemod Runner (`scripts/codemod-runner.ts`)

**Purpose**: Safe transformation automation with backup and rollback

**Features**:
- Automated backup creation
- Dry-run validation
- Rollback procedures
- Backup management
- Windows-compatible path handling

**Usage**:
```bash
# Run a codemod with backup
npm run codemod:rename-prop components/ --component=Button --prop=oldProp --new-prop=newProp

# Dry run to preview changes
tsx scripts/codemod-runner.ts run scripts/codemods/rename-component-prop.js components/ --dry-run --component=Button --prop=oldProp --new-prop=newProp

# Rollback to previous state
npm run codemod:rollback .codemod-backups/2024-01-01T12-00-00-000Z components/

# List available backups
npm run codemod:list-backups

# Cleanup old backups
npm run codemod:cleanup 5
```

### 3. Codemod Collection (`scripts/codemods/`)

#### A. Rename Component Prop (`rename-component-prop.js`)

**Purpose**: Safely rename component props across JSX usage

**Transforms**:
- JSX element attributes
- Self-closing JSX elements
- Spread prop objects
- Computed property names

**Usage**:
```bash
npm run codemod:rename-prop components/ --component=Button --prop=variant --new-prop=appearance
```

**Example Transformation**:
```tsx
// Before
<Button variant="primary" size="lg" />

// After
<Button appearance="primary" size="lg" />
```

#### B. Redirect Import (`redirect-import.js`)

**Purpose**: Update import paths across the codebase

**Transforms**:
- Import declarations
- Dynamic imports
- Require statements
- Partial path matching

**Usage**:
```bash
npm run codemod:redirect-import app/ --old-path=@/components/ui --new-path=@/ui
```

**Example Transformation**:
```tsx
// Before
import { Button } from '@/components/ui/button'

// After
import { Button } from '@/ui/button'
```

#### C. Extract Component (`extract-component.js`)

**Purpose**: Extract inline JSX into separate component files

**Transforms**:
- JSX element extraction
- Component import addition
- Prop forwarding
- Class name matching

**Usage**:
```bash
npm run codemod:extract-component components/ --component-name=NewButton --jsx-selector="button.primary"
```

## 🔒 Safety Procedures

### Backup Strategy

**Automatic Backups**:
- Created before each codemod execution
- Timestamped directory structure
- Complete file/directory preservation
- Windows-compatible paths

**Backup Location**: `.codemod-backups/YYYY-MM-DDTHH-mm-ss-sssZ/`

### Rollback Procedures

**Immediate Rollback**:
```bash
# List available backups
npm run codemod:list-backups

# Rollback to specific backup
npm run codemod:rollback .codemod-backups/2024-01-01T12-00-00-000Z components/
```

**Emergency Recovery**:
```bash
# Cleanup and restore from git
git checkout HEAD -- components/
git clean -fd components/
```

### Validation Workflow

**Pre-Transformation**:
1. Run where-used analysis
2. Review impact assessment
3. Create manual backup (optional)
4. Run dry-run validation

**Post-Transformation**:
1. Verify file changes
2. Run type checking
3. Execute linting
4. Run test suite
5. Validate build process

## 📋 Common Refactoring Scenarios

### Scenario 1: Component Prop Rename

**Objective**: Rename `variant` prop to `appearance` in Button component

**Steps**:
```bash
# 1. Analyze current usage
npm run where-used Button --verbose

# 2. Preview changes
npm run codemod:rename-prop components/ --dry-run --component=Button --prop=variant --new-prop=appearance

# 3. Apply transformation
npm run codemod:rename-prop components/ --component=Button --prop=variant --new-prop=appearance

# 4. Validate changes
npm run typecheck
npm run lint
npm run test
```

### Scenario 2: Import Path Migration

**Objective**: Migrate from `@/components/ui` to `@/ui`

**Steps**:
```bash
# 1. Find all affected files
npm run where-used @/components/ui --verbose

# 2. Preview import changes
npm run codemod:redirect-import app/ --dry-run --old-path=@/components/ui --new-path=@/ui

# 3. Apply transformation
npm run codemod:redirect-import app/ --old-path=@/components/ui --new-path=@/ui

# 4. Update tsconfig paths
# (Manual step - update tsconfig.json paths)

# 5. Validate changes
npm run typecheck
npm run lint
```

### Scenario 3: Component Extraction

**Objective**: Extract inline button into reusable component

**Steps**:
```bash
# 1. Identify extraction target
# (Manual analysis of JSX patterns)

# 2. Preview extraction
npm run codemod:extract-component components/ --dry-run --component-name=PrimaryButton --jsx-selector="button.primary"

# 3. Apply extraction
npm run codemod:extract-component components/ --component-name=PrimaryButton --jsx-selector="button.primary"

# 4. Create component file
# (Manual step - create the extracted component)

# 5. Validate changes
npm run typecheck
npm run lint
```

## 🚨 Error Handling

### Common Issues

**1. Codemod Fails**:
- Check backup availability
- Review error messages
- Use rollback procedure
- Investigate edge cases

**2. Type Errors After Transformation**:
- Run `npm run typecheck` for details
- Check import paths
- Verify prop names
- Update type definitions

**3. Build Failures**:
- Check for syntax errors
- Verify all imports resolve
- Run `npm run lint` for issues
- Check for missing dependencies

### Recovery Procedures

**Immediate Recovery**:
```bash
# Rollback to last backup
npm run codemod:rollback <backup-path> <target-path>

# Or restore from git
git checkout HEAD -- <path>
```

**Full Recovery**:
```bash
# Reset entire working directory
git reset --hard HEAD
git clean -fd
```

## 🔧 Advanced Usage

### Custom Codemods

**Creating New Codemods**:
1. Create new file in `scripts/codemods/`
2. Follow jscodeshift transformer pattern
3. Add npm script in `package.json`
4. Test with dry-run first

**Example Custom Codemod**:
```javascript
// scripts/codemods/custom-transform.js
module.exports = function transformer(fileInfo, api, options) {
  const j = api.jscodeshift;
  const source = j(fileInfo.source);
  
  // Your transformation logic here
  
  return source.toSource({ quote: 'single' });
};
```

### Integration with CI/CD

**Pre-commit Validation**:
```bash
# Add to pre-commit hooks
npm run where-used <symbol> --json > usage-report.json
npm run codemod:cleanup 3
```

**Automated Testing**:
```bash
# Test codemod safety
npm run codemod:rename-prop test-components/ --dry-run --component=TestButton --prop=test --new-prop=newTest
```

## 📊 Performance Considerations

### Optimization Tips

**1. Targeted Analysis**:
- Use specific file patterns
- Limit scope to relevant directories
- Use component-specific analysis

**2. Backup Management**:
- Regular cleanup of old backups
- Compress large backup directories
- Monitor disk usage

**3. Batch Operations**:
- Group related transformations
- Use single codemod for multiple changes
- Minimize file system operations

### Resource Usage

**Memory Usage**:
- ts-morph loads entire project into memory
- Large codebases may require chunked processing
- Consider using file-by-file analysis for very large projects

**Disk Usage**:
- Backups can consume significant space
- Implement regular cleanup procedures
- Monitor `.codemod-backups/` directory size

## 🎯 Best Practices

### Before Refactoring

1. **Analyze Impact**: Always run where-used analysis first
2. **Plan Rollback**: Ensure backup procedures are in place
3. **Test Dry-Run**: Preview changes before applying
4. **Document Changes**: Record transformation rationale

### During Refactoring

1. **Incremental Changes**: Apply transformations in small batches
2. **Validate Each Step**: Run checks after each transformation
3. **Monitor Progress**: Use verbose output for large changes
4. **Handle Edge Cases**: Be prepared for manual intervention

### After Refactoring

1. **Comprehensive Testing**: Run full test suite
2. **Code Review**: Have changes reviewed by team
3. **Documentation Update**: Update relevant documentation
4. **Cleanup**: Remove old backups and temporary files

## 🔮 Future Enhancements

### Planned Features

**1. Interactive Mode**:
- CLI interface for guided refactoring
- Interactive conflict resolution
- Step-by-step transformation wizard

**2. Advanced Analysis**:
- Dependency graph visualization
- Impact radius calculation
- Risk assessment scoring

**3. Integration Enhancements**:
- IDE plugin development
- VS Code extension
- GitHub Actions integration

**4. Performance Improvements**:
- Incremental analysis
- Caching mechanisms
- Parallel processing

---

*This guide represents the completion of HT-006 Phase 4, establishing a comprehensive refactoring toolkit that enables safe, confident code transformations with automated safety procedures and rollback capabilities.*
