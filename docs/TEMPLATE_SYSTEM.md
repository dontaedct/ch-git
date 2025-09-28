# Template System Documentation

## Overview

The Template System provides a comprehensive, automated workflow for creating, validating, and deploying new templates in the Hero Tasks ecosystem. This system prevents the integration issues that occurred with HT-030 by ensuring all templates are properly registered across all system components.

## Quick Start

### Creating a New Template

```bash
# Interactive creation wizard
npm run template:create

# Or with parameters
node tools/create-template.js --template-id my-template --name "My Template"
```

### Validating Templates

```bash
# Validate a specific template
npm run template:validate my-template

# Audit all templates
npm run template:audit
```

### Fixing Template Issues

```bash
# Auto-fix common issues
npm run template:register my-template
```

## System Architecture

### Required Files for Each Template

Every template requires these files to function correctly:

1. **Template Manifest**: `lib/template-storage/templates/{template-id}.json`
   - Component definitions
   - Metadata and styling
   - Version information

2. **Public Copy**: `public/lib/template-storage/templates/{template-id}.json`
   - Identical copy for HTTP access
   - Required for client-side template loading

3. **Preset Configuration**: `packages/templates/presets/{template-id}.json`
   - Feature flags and routing
   - Dependencies and branding
   - Deployment configuration

### Registration Points

Templates must be registered in multiple locations:

1. **TENANT_APP_TEMPLATES** (`types/tenant-apps.ts`)
   - UI dropdown display
   - Template metadata and features
   - Category and premium status

2. **AVAILABLE_PRESETS** (`app.config.base.ts`)
   - Backend template resolution
   - Preset loading system
   - Configuration mapping

3. **Static File Serving** (`public/` directory)
   - HTTP accessibility
   - Client-side template loading
   - Development and production serving

## Validation System

### Automated Checks

The validation system performs comprehensive checks:

#### 1. File Structure Validation
- ✅ All required files exist
- ✅ JSON syntax is valid
- ✅ File synchronization between lib/ and public/
- ✅ Template ID consistency

#### 2. Registry Validation
- ✅ Template registered in TENANT_APP_TEMPLATES
- ✅ Template added to AVAILABLE_PRESETS
- ✅ Proper metadata structure
- ✅ Required properties present

#### 3. API Integration Validation
- ✅ API accepts template_id parameter
- ✅ No hardcoded template fallbacks
- ✅ Proper error handling

#### 4. UI Integration Validation
- ✅ Template appears in dropdown
- ✅ Display name mapping works
- ✅ Modern component usage

#### 5. Static File Serving Validation
- ✅ HTTP accessibility
- ✅ Correct MIME types
- ✅ No 404 errors

### Error Categories

#### ❌ **Errors** (Must Fix)
- Missing required files
- Invalid JSON syntax
- Missing registry entries
- Broken API integration

#### ⚠️ **Warnings** (Should Fix)
- Inconsistent metadata
- Missing optional properties
- Deprecated patterns
- Performance concerns

#### 🔧 **Auto-Fixable**
- File synchronization
- Registry registration
- Directory creation
- Configuration updates

## Tools and Scripts

### 1. Template Creator (`tools/create-template.js`)

Interactive wizard for creating new templates:

```bash
# Interactive mode
npm run template:create

# Command line mode
node tools/create-template.js \
  --template-id consultation-pro \
  --name "Professional Consultation" \
  --description "Advanced consultation workflow" \
  --category consultation \
  --icon 💼 \
  --premium true
```

**Features:**
- ✅ Guided template information collection
- ✅ Unique ID validation
- ✅ Automatic file generation
- ✅ Complete system registration
- ✅ Post-creation validation

### 2. Template Validator (`tools/template-validator.js`)

Comprehensive validation and fixing tool:

```bash
# Validate specific template
npm run template:validate my-template

# Auto-fix issues
npm run template:register my-template

# Run end-to-end tests
npm run template:test my-template

# Audit all templates
npm run template:audit
```

**Validation Features:**
- 📁 File structure and JSON validation
- 📋 Registry and configuration checks
- 🔌 API integration verification
- 🎨 UI component validation
- 🌐 Static file serving tests
- 🧪 End-to-end functionality tests

### 3. Pre-commit Hooks

Automatic validation before commits:

**Setup:**
```bash
# Enable git hooks
git config core.hooksPath .githooks

# Or copy manually
cp .githooks/pre-commit .git/hooks/pre-commit
```

**Features:**
- ✅ Detects template file changes
- ✅ Validates affected templates
- ✅ Prevents broken commits
- ✅ Provides fix suggestions

## Best Practices

### Template Development

1. **Use the Creation Wizard**
   ```bash
   npm run template:create
   ```
   - Ensures all required files are created
   - Handles registration automatically
   - Validates immediately

2. **Validate Early and Often**
   ```bash
   npm run template:validate my-template
   ```
   - Run after any changes
   - Use pre-commit hooks
   - Include in CI/CD pipeline

3. **Follow Naming Conventions**
   - Template IDs: kebab-case (`my-template`)
   - File names: match template ID exactly
   - Display names: human-readable

### Template Structure

#### Template Manifest Structure
```json
{
  "id": "template-id",
  "name": "Human Readable Name",
  "slug": "template-id",
  "description": "Template description",
  "category": "consultation",
  "version": "1.0.0",
  "components": [
    {
      "id": "header-1",
      "type": "header",
      "version": "1.0.0",
      "props": { ... }
    }
  ],
  "meta": {
    "version": "1.0.0",
    "created": "2025-01-01T00:00:00.000Z",
    "author": "Author Name",
    "tags": ["category", "feature"]
  },
  "styles": {
    "theme": "modern",
    "primaryColor": "#3B82F6",
    "fontFamily": "Inter, sans-serif"
  }
}
```

#### Preset Configuration Structure
```json
{
  "id": "template-id-preset",
  "name": "Template Name",
  "version": "1.0.0",
  "description": "Template description",
  "tier": "standard",
  "preset": "template-id",
  "features": {
    "database": true,
    "email": true,
    "payments": false,
    // ... feature flags
  },
  "routing": {
    "landing_page": "/template-id",
    "admin_panel": "/template-id/admin",
    "api_base": "/api/template-id"
  }
}
```

### Error Prevention

1. **Never Manual File Creation**
   - Use `npm run template:create`
   - Avoid manual JSON editing
   - Let tools handle registration

2. **Always Validate Changes**
   - Run validation after edits
   - Use pre-commit hooks
   - Include in pull requests

3. **Keep Files Synchronized**
   - lib/ and public/ must match
   - Use auto-sync tools
   - Validate synchronization

## Troubleshooting

### Common Issues

#### 1. Template Not Appearing in Dropdown
**Cause:** Not registered in TENANT_APP_TEMPLATES
**Fix:**
```bash
npm run template:register template-id
```

#### 2. "Loading template system..." Forever
**Cause:** Template file not accessible via HTTP
**Fix:**
```bash
# Check file exists in public/
ls public/lib/template-storage/templates/template-id.json

# If missing, sync files
npm run template:register template-id
```

#### 3. API Returns Wrong Template
**Cause:** Hardcoded template_id in API
**Fix:** Update `app/api/tenant-apps/route.ts` to use provided template_id

#### 4. Template Shows Raw ID Instead of Name
**Cause:** Missing template mapping in Agency Toolkit
**Fix:** Add template to mapping array in `app/agency-toolkit/page.tsx`

### Diagnostic Commands

```bash
# Full system audit
npm run template:audit

# Validate specific template
npm run template:validate my-template

# Test HTTP accessibility
curl http://localhost:3000/lib/template-storage/templates/my-template.json

# Check registry entries
grep -r "my-template" types/ app.config.base.ts
```

## Migration Guide

### Existing Templates

To update existing templates to use the new system:

1. **Audit Current State**
   ```bash
   npm run template:audit
   ```

2. **Fix Issues Automatically**
   ```bash
   npm run template:register existing-template
   ```

3. **Validate Results**
   ```bash
   npm run template:validate existing-template
   ```

### Legacy Template Files

If you have legacy template files:

1. Move to standard locations
2. Update to new JSON structure
3. Register in all systems
4. Validate functionality

## Contributing

### Adding New Validation Checks

1. Update `tools/template-validator.js`
2. Add test cases
3. Document new checks
4. Update this documentation

### Extending Template Creation

1. Update `tools/create-template.js`
2. Add new template types
3. Update validation logic
4. Test end-to-end workflow

## Maintenance

### Regular Tasks

1. **Weekly Audits**
   ```bash
   npm run template:audit
   ```

2. **Update Pre-commit Hooks**
   ```bash
   git config core.hooksPath .githooks
   ```

3. **Validate Production Templates**
   ```bash
   for template in $(ls public/lib/template-storage/templates/*.json | xargs -n1 basename -s .json); do
     npm run template:validate $template
   done
   ```

### Monitoring

- Set up CI/CD validation
- Monitor template creation errors
- Track validation failures
- Review pre-commit hook usage

---

## Summary

The Template System provides:

✅ **Automated Creation** - Zero-configuration template setup  
✅ **Comprehensive Validation** - Catch issues before deployment  
✅ **Consistent Registration** - Ensure all systems are updated  
✅ **Error Prevention** - Pre-commit hooks and validation  
✅ **Easy Maintenance** - Audit and fix tools  
✅ **Developer Experience** - Simple CLI commands  

This system eliminates the manual, error-prone process that led to the HT-030 integration issues and ensures all future templates work correctly from creation to deployment.
