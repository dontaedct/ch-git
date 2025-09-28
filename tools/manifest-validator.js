#!/usr/bin/env node

/**
 * @fileoverview Manifest Validator - Validates template and form manifests against JSON schemas
 * @module tools/manifest-validator
 * @version 1.0.0
 *
 * Usage:
 *   node tools/manifest-validator.js <file-path> [--type=template|form] [--verbose]
 *   node tools/manifest-validator.js examples/templates/fitness-trainer-lead.json
 *   node tools/manifest-validator.js examples/forms/contact-simple.json --type=form
 *   node tools/manifest-validator.js examples/ --recursive
 */

const Ajv = require('ajv');
const addFormats = require('ajv-formats');
const fs = require('fs');
const path = require('path');

// AJV configuration for strict validation
const ajv = new Ajv({
  strict: true,
  allErrors: true,
  verbose: true,
  validateFormats: true,
  removeAdditional: false,
  useDefaults: true,
  coerceTypes: false
});

// Add format validation support
addFormats(ajv);

// Load schemas
const TEMPLATE_SCHEMA = require('../schemas/template-manifest.schema.json');
const FORM_SCHEMA = require('../schemas/form-manifest.schema.json');

// Compile validators
const validateTemplate = ajv.compile(TEMPLATE_SCHEMA);
const validateForm = ajv.compile(FORM_SCHEMA);

/**
 * Colors for console output
 */
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m'
};

/**
 * Enhanced error formatting with context
 */
function formatError(error, data) {
  const path = error.instancePath || error.schemaPath || 'root';
  const message = error.message || 'Unknown error';
  const keyword = error.keyword || 'validation';
  const allowedValues = error.params?.allowedValues ?
    ` (allowed: ${error.params.allowedValues.join(', ')})` : '';

  let context = '';
  if (error.instancePath && data) {
    try {
      const pathParts = error.instancePath.slice(1).split('/');
      let current = data;
      for (const part of pathParts) {
        current = current[part];
        if (current === undefined) break;
      }
      if (current !== undefined) {
        context = ` | Current value: ${JSON.stringify(current).slice(0, 100)}`;
      }
    } catch (e) {
      // Ignore context extraction errors
    }
  }

  return `${colors.red}✗${colors.reset} ${colors.bold}${path}${colors.reset}: ${message}${allowedValues}${context}`;
}

/**
 * Enhanced warning detection for best practices
 */
function generateWarnings(manifest, type) {
  const warnings = [];

  if (type === 'template') {
    // Check for missing descriptions
    if (!manifest.description) {
      warnings.push('Template description is missing - recommended for better documentation');
    }

    // Check for missing analytics
    const componentsWithoutAnalytics = manifest.components.filter(c => !c.analytics);
    if (componentsWithoutAnalytics.length > 0) {
      warnings.push(`${componentsWithoutAnalytics.length} components missing analytics tracking`);
    }

    // Check for forms without validation
    const formsWithoutValidation = manifest.components
      .filter(c => c.type === 'form' && c.props.validation === false);
    if (formsWithoutValidation.length > 0) {
      warnings.push('Forms found with validation disabled - consider enabling for better UX');
    }

    // Check for missing theme customization
    if (manifest.theme?.useSiteDefaults && !manifest.theme?.overrides) {
      warnings.push('Using site defaults without any theme overrides - consider brand customization');
    }

    // Check for accessibility
    const formsWithoutAria = manifest.components
      .filter(c => c.type === 'form')
      .flatMap(c => c.props.fields || [])
      .filter(f => !f.accessibility?.ariaLabel);
    if (formsWithoutAria.length > 0) {
      warnings.push(`${formsWithoutAria.length} form fields missing ARIA labels for accessibility`);
    }
  }

  if (type === 'form') {
    // Check for security features
    if (!manifest.security?.honeypot) {
      warnings.push('Honeypot spam protection is disabled - recommended for public forms');
    }

    if (!manifest.security?.rateLimit?.enabled) {
      warnings.push('Rate limiting is disabled - recommended to prevent abuse');
    }

    // Check for GDPR compliance
    if (!manifest.security?.dataRetention?.enabled) {
      warnings.push('Data retention policy not configured - required for GDPR compliance');
    }

    // Check for required fields balance
    const requiredFields = manifest.fields.filter(f => f.required).length;
    const totalFields = manifest.fields.length;
    const requiredRatio = requiredFields / totalFields;

    if (requiredRatio > 0.7) {
      warnings.push(`${requiredFields}/${totalFields} fields are required (${Math.round(requiredRatio * 100)}%) - consider reducing for better conversion`);
    }

    // Check for validation patterns
    const fieldsWithoutValidation = manifest.fields
      .filter(f => f.required && !f.validation && ['text', 'email', 'tel'].includes(f.type));
    if (fieldsWithoutValidation.length > 0) {
      warnings.push(`${fieldsWithoutValidation.length} required fields missing validation rules`);
    }
  }

  return warnings;
}

/**
 * Validate a single manifest file
 */
function validateManifest(filePath, options = {}) {
  const startTime = Date.now();

  try {
    // Read and parse manifest
    const content = fs.readFileSync(filePath, 'utf8');
    const manifest = JSON.parse(content);

    // Determine type
    let type = options.type;
    if (!type) {
      if (manifest.id?.startsWith('tpl_')) {
        type = 'template';
      } else if (manifest.id?.startsWith('form_')) {
        type = 'form';
      } else {
        throw new Error('Cannot determine manifest type - use --type=template|form or ensure ID has tpl_ or form_ prefix');
      }
    }

    // Select validator
    const validator = type === 'template' ? validateTemplate : validateForm;
    const schemaName = type === 'template' ? 'Template Manifest' : 'Form Manifest';

    // Validate against schema
    const isValid = validator(manifest);
    const validationTime = Date.now() - startTime;

    // Generate warnings
    const warnings = generateWarnings(manifest, type);

    // Collect performance metrics
    const metrics = {
      fileSize: content.length,
      validationTime,
      componentCount: type === 'template' ? manifest.components?.length || 0 : manifest.fields?.length || 0,
      complexity: calculateComplexity(manifest, type)
    };

    // Output results
    const fileName = path.basename(filePath);

    if (isValid) {
      console.log(`${colors.green}✓${colors.reset} ${colors.bold}${fileName}${colors.reset} ${colors.cyan}(${schemaName})${colors.reset}`);

      if (options.verbose) {
        console.log(`  ${colors.blue}ℹ${colors.reset} File size: ${metrics.fileSize} bytes`);
        console.log(`  ${colors.blue}ℹ${colors.reset} Validation time: ${metrics.validationTime}ms`);
        console.log(`  ${colors.blue}ℹ${colors.reset} Components/Fields: ${metrics.componentCount}`);
        console.log(`  ${colors.blue}ℹ${colors.reset} Complexity score: ${metrics.complexity}/10`);
      }

      // Show warnings
      if (warnings.length > 0) {
        console.log(`  ${colors.yellow}⚠${colors.reset} ${warnings.length} warning(s):`);
        warnings.forEach(warning => {
          console.log(`    ${colors.yellow}•${colors.reset} ${warning}`);
        });
      }

      return { valid: true, errors: [], warnings, metrics, type };
    } else {
      console.log(`${colors.red}✗${colors.reset} ${colors.bold}${fileName}${colors.reset} ${colors.cyan}(${schemaName})${colors.reset}`);
      console.log(`  ${colors.red}${validator.errors.length} validation error(s):${colors.reset}`);

      validator.errors.forEach(error => {
        console.log(`    ${formatError(error, manifest)}`);
      });

      if (warnings.length > 0 && options.verbose) {
        console.log(`  ${colors.yellow}⚠${colors.reset} ${warnings.length} warning(s):`);
        warnings.forEach(warning => {
          console.log(`    ${colors.yellow}•${colors.reset} ${warning}`);
        });
      }

      return { valid: false, errors: validator.errors, warnings, metrics, type };
    }

  } catch (error) {
    const fileName = path.basename(filePath);
    console.log(`${colors.red}✗${colors.reset} ${colors.bold}${fileName}${colors.reset} - ${colors.red}Parse Error${colors.reset}`);
    console.log(`    ${colors.red}${error.message}${colors.reset}`);
    return { valid: false, errors: [{ message: error.message }], warnings: [], type: 'unknown' };
  }
}

/**
 * Calculate complexity score for a manifest
 */
function calculateComplexity(manifest, type) {
  let score = 0;

  if (type === 'template') {
    // Base complexity from component count
    score += Math.min((manifest.components?.length || 0) * 0.5, 3);

    // Conditional logic complexity
    const conditionalComponents = manifest.components?.filter(c => c.conditional) || [];
    score += conditionalComponents.length * 0.3;

    // Form complexity
    const forms = manifest.components?.filter(c => c.type === 'form') || [];
    forms.forEach(form => {
      score += (form.props.fields?.length || 0) * 0.1;
    });

    // Theme customization
    if (manifest.theme?.overrides) {
      score += 0.5;
    }
  }

  if (type === 'form') {
    // Base complexity from field count
    score += Math.min((manifest.fields?.length || 0) * 0.2, 4);

    // Field type diversity
    const fieldTypes = new Set(manifest.fields?.map(f => f.type) || []);
    score += fieldTypes.size * 0.1;

    // Conditional logic
    const conditionalFields = manifest.fields?.filter(f => f.conditional) || [];
    score += conditionalFields.length * 0.3;

    // Validation rules
    const validatedFields = manifest.fields?.filter(f => f.validation) || [];
    score += validatedFields.length * 0.1;

    // Advanced features
    if (manifest.fieldGroups?.length > 0) score += 1;
    if (manifest.settings?.layout === 'wizard') score += 1.5;
    if (manifest.security?.captcha?.enabled) score += 0.5;
    if (manifest.analytics?.enabled) score += 0.5;
  }

  return Math.min(Math.round(score * 10) / 10, 10);
}

/**
 * Recursively find manifest files in a directory
 */
function findManifestFiles(dir) {
  const files = [];

  function traverse(currentDir) {
    const items = fs.readdirSync(currentDir);

    for (const item of items) {
      const fullPath = path.join(currentDir, item);
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory() && !item.startsWith('.')) {
        traverse(fullPath);
      } else if (stat.isFile() && item.endsWith('.json')) {
        files.push(fullPath);
      }
    }
  }

  traverse(dir);
  return files;
}

/**
 * Main execution function
 */
function main() {
  const args = process.argv.slice(2);

  if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
    console.log(`
${colors.bold}Manifest Validator${colors.reset}
Validates DCT Micro-App template and form manifests against JSON schemas

${colors.bold}Usage:${colors.reset}
  node tools/manifest-validator.js <file-or-directory> [options]

${colors.bold}Options:${colors.reset}
  --type=template|form    Force manifest type (auto-detected if not specified)
  --recursive             Validate all JSON files in directory recursively
  --verbose              Show detailed validation information
  --help, -h             Show this help message

${colors.bold}Examples:${colors.reset}
  node tools/manifest-validator.js examples/templates/fitness-trainer-lead.json
  node tools/manifest-validator.js examples/forms/contact-simple.json --type=form
  node tools/manifest-validator.js examples/ --recursive --verbose
`);
    process.exit(0);
  }

  const targetPath = args[0];
  const options = {
    type: args.find(arg => arg.startsWith('--type='))?.split('=')[1],
    recursive: args.includes('--recursive'),
    verbose: args.includes('--verbose')
  };

  // Check if target exists
  if (!fs.existsSync(targetPath)) {
    console.error(`${colors.red}Error:${colors.reset} Path not found: ${targetPath}`);
    process.exit(1);
  }

  const stat = fs.statSync(targetPath);
  let filesToValidate = [];

  if (stat.isFile()) {
    filesToValidate = [targetPath];
  } else if (stat.isDirectory()) {
    if (options.recursive) {
      filesToValidate = findManifestFiles(targetPath);
    } else {
      filesToValidate = fs.readdirSync(targetPath)
        .filter(file => file.endsWith('.json'))
        .map(file => path.join(targetPath, file));
    }
  }

  if (filesToValidate.length === 0) {
    console.log(`${colors.yellow}⚠${colors.reset} No JSON files found to validate`);
    process.exit(0);
  }

  // Validate files
  console.log(`${colors.bold}Validating ${filesToValidate.length} file(s)...${colors.reset}\n`);

  const results = filesToValidate.map(file => validateManifest(file, options));

  // Summary
  const validCount = results.filter(r => r.valid).length;
  const invalidCount = results.length - validCount;
  const totalWarnings = results.reduce((sum, r) => sum + r.warnings.length, 0);

  console.log(`\n${colors.bold}Summary:${colors.reset}`);
  console.log(`  ${colors.green}✓${colors.reset} Valid: ${validCount}`);
  if (invalidCount > 0) {
    console.log(`  ${colors.red}✗${colors.reset} Invalid: ${invalidCount}`);
  }
  if (totalWarnings > 0) {
    console.log(`  ${colors.yellow}⚠${colors.reset} Total warnings: ${totalWarnings}`);
  }

  // Performance summary
  if (options.verbose && results.length > 1) {
    const avgValidationTime = results.reduce((sum, r) => sum + (r.metrics?.validationTime || 0), 0) / results.length;
    const totalFileSize = results.reduce((sum, r) => sum + (r.metrics?.fileSize || 0), 0);

    console.log(`\n${colors.bold}Performance:${colors.reset}`);
    console.log(`  Average validation time: ${avgValidationTime.toFixed(1)}ms`);
    console.log(`  Total file size: ${totalFileSize} bytes`);
  }

  // Exit with error code if any validation failed
  process.exit(invalidCount > 0 ? 1 : 0);
}

// Error handling
process.on('uncaughtException', (error) => {
  console.error(`${colors.red}Uncaught Exception:${colors.reset} ${error.message}`);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error(`${colors.red}Unhandled Rejection:${colors.reset} ${reason}`);
  process.exit(1);
});

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = {
  validateManifest,
  validateTemplate,
  validateForm,
  formatError,
  generateWarnings,
  calculateComplexity
};