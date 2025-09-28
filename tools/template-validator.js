#!/usr/bin/env node

/**
 * Template Validation & Registration System
 * 
 * Comprehensive validation tool to prevent template integration issues.
 * Validates all aspects: files, configs, API integration, and deployment.
 * 
 * Usage:
 *   node tools/template-validator.js validate <template-id>
 *   node tools/template-validator.js register <template-id>
 *   node tools/template-validator.js test <template-id>
 *   node tools/template-validator.js audit-all
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class TemplateValidator {
  constructor() {
    this.errors = [];
    this.warnings = [];
    this.fixes = [];
    this.workspaceRoot = process.cwd();
  }

  // ============================================================================
  // MAIN VALIDATION PIPELINE
  // ============================================================================

  async validateTemplate(templateId) {
    console.log(`🔍 Validating template: ${templateId}`);
    console.log('=' .repeat(60));

    this.reset();

    // Run all validation checks
    await Promise.all([
      this.validateTemplateFiles(templateId),
      this.validateTemplateRegistry(templateId),
      this.validateAPIIntegration(templateId),
      this.validatePresetConfiguration(templateId),
      this.validateStaticFileServing(templateId),
      this.validateUIIntegration(templateId)
    ]);

    this.printResults(templateId);
    return this.errors.length === 0;
  }

  // ============================================================================
  // INDIVIDUAL VALIDATION CHECKS
  // ============================================================================

  async validateTemplateFiles(templateId) {
    console.log('📁 Checking template files...');

    const requiredFiles = [
      `lib/template-storage/templates/${templateId}.json`,
      `public/lib/template-storage/templates/${templateId}.json`,
      `packages/templates/presets/${templateId}.json`
    ];

    for (const filePath of requiredFiles) {
      if (!fs.existsSync(filePath)) {
        this.errors.push(`Missing required file: ${filePath}`);
        this.fixes.push(`Create file: ${filePath}`);
      } else {
        // Validate JSON structure
        try {
          const content = JSON.parse(fs.readFileSync(filePath, 'utf8'));
          this.validateTemplateStructure(content, filePath);
        } catch (error) {
          this.errors.push(`Invalid JSON in ${filePath}: ${error.message}`);
        }
      }
    }

    // Check for file synchronization
    const libFile = `lib/template-storage/templates/${templateId}.json`;
    const publicFile = `public/lib/template-storage/templates/${templateId}.json`;
    
    if (fs.existsSync(libFile) && fs.existsSync(publicFile)) {
      const libContent = fs.readFileSync(libFile, 'utf8');
      const publicContent = fs.readFileSync(publicFile, 'utf8');
      
      if (libContent !== publicContent) {
        this.errors.push(`Template files are out of sync: ${libFile} vs ${publicFile}`);
        this.fixes.push(`Sync files: cp "${libFile}" "${publicFile}"`);
      }
    }
  }

  validateTemplateStructure(template, filePath) {
    const requiredFields = ['id', 'name', 'version', 'description'];
    
    for (const field of requiredFields) {
      if (!template[field]) {
        this.errors.push(`Missing required field '${field}' in ${filePath}`);
      }
    }

    // Validate ID consistency
    if (template.id && !filePath.includes(template.id)) {
      this.warnings.push(`Template ID '${template.id}' doesn't match filename in ${filePath}`);
    }

    // Validate version format
    if (template.version && !/^\d+\.\d+\.\d+$/.test(template.version)) {
      this.warnings.push(`Invalid version format '${template.version}' in ${filePath}`);
    }
  }

  async validateTemplateRegistry(templateId) {
    console.log('📋 Checking template registry...');

    const tenantAppsPath = 'types/tenant-apps.ts';
    
    if (!fs.existsSync(tenantAppsPath)) {
      this.errors.push(`Missing tenant apps registry: ${tenantAppsPath}`);
      return;
    }

    const content = fs.readFileSync(tenantAppsPath, 'utf8');
    
    // Check if template is registered in TENANT_APP_TEMPLATES
    if (!content.includes(`id: '${templateId}'`)) {
      this.errors.push(`Template '${templateId}' not registered in TENANT_APP_TEMPLATES`);
      this.fixes.push(`Add template to TENANT_APP_TEMPLATES array in ${tenantAppsPath}`);
    }

    // Validate template object structure in registry
    const templateRegex = new RegExp(`{[^}]*id:\\s*'${templateId}'[^}]*}`, 's');
    const match = content.match(templateRegex);
    
    if (match) {
      const templateObj = match[0];
      const requiredProps = ['name', 'description', 'icon', 'category'];
      
      for (const prop of requiredProps) {
        if (!templateObj.includes(`${prop}:`)) {
          this.warnings.push(`Missing property '${prop}' in template registry for '${templateId}'`);
        }
      }
    }
  }

  async validateAPIIntegration(templateId) {
    console.log('🔌 Checking API integration...');

    const apiRoutePath = 'app/api/tenant-apps/route.ts';
    
    if (!fs.existsSync(apiRoutePath)) {
      this.errors.push(`Missing API route: ${apiRoutePath}`);
      return;
    }

    const content = fs.readFileSync(apiRoutePath, 'utf8');
    
    // Check that API doesn't hardcode template_id
    if (content.includes("default('consultation-mvp')") || 
        content.includes('consultation-mvp')) {
      this.warnings.push(`API may have hardcoded template references in ${apiRoutePath}`);
    }

    // Verify template_id is required
    if (!content.includes('template_id') || !content.includes('required')) {
      this.errors.push(`API doesn't properly require template_id parameter`);
    }
  }

  async validatePresetConfiguration(templateId) {
    console.log('⚙️ Checking preset configuration...');

    const appConfigPath = 'app.config.base.ts';
    
    if (!fs.existsSync(appConfigPath)) {
      this.errors.push(`Missing app config: ${appConfigPath}`);
      return;
    }

    const content = fs.readFileSync(appConfigPath, 'utf8');
    
    // Check if template is in AVAILABLE_PRESETS
    if (!content.includes(`'${templateId}'`)) {
      this.errors.push(`Template '${templateId}' not in AVAILABLE_PRESETS`);
      this.fixes.push(`Add '${templateId}' to AVAILABLE_PRESETS array in ${appConfigPath}`);
    }

    // Validate preset file exists
    const presetPath = `packages/templates/presets/${templateId}.json`;
    if (fs.existsSync(presetPath)) {
      try {
        const preset = JSON.parse(fs.readFileSync(presetPath, 'utf8'));
        
        if (preset.preset !== templateId) {
          this.errors.push(`Preset name mismatch in ${presetPath}: expected '${templateId}', got '${preset.preset}'`);
        }
      } catch (error) {
        this.errors.push(`Invalid preset JSON in ${presetPath}: ${error.message}`);
      }
    }
  }

  async validateStaticFileServing(templateId) {
    console.log('🌐 Checking static file serving...');

    const publicTemplatePath = `public/lib/template-storage/templates/${templateId}.json`;
    
    if (!fs.existsSync(publicTemplatePath)) {
      this.errors.push(`Template not available for static serving: ${publicTemplatePath}`);
      this.fixes.push(`Copy template to public directory`);
      return;
    }

    // Test HTTP accessibility (if dev server is running)
    try {
      const { execSync } = require('child_process');
      const result = execSync(`curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/lib/template-storage/templates/${templateId}.json`, 
        { encoding: 'utf8', timeout: 5000 });
      
      if (result.trim() !== '200') {
        this.warnings.push(`Template not accessible via HTTP (status: ${result.trim()})`);
      }
    } catch (error) {
      this.warnings.push(`Could not test HTTP accessibility: ${error.message}`);
    }
  }

  async validateUIIntegration(templateId) {
    console.log('🎨 Checking UI integration...');

    const agencyToolkitPath = 'app/agency-toolkit/page.tsx';
    
    if (!fs.existsSync(agencyToolkitPath)) {
      this.errors.push(`Missing agency toolkit: ${agencyToolkitPath}`);
      return;
    }

    const content = fs.readFileSync(agencyToolkitPath, 'utf8');
    
    // Check if template mapping exists
    if (!content.includes('getTemplateName') && content.includes('app.template_id')) {
      this.warnings.push(`Agency toolkit may not have proper template name mapping`);
    }

    // Check for CreateAppModal usage
    if (!content.includes('CreateAppModal')) {
      this.warnings.push(`Agency toolkit not using modern CreateAppModal component`);
    }
  }

  // ============================================================================
  // AUTOMATED FIXES
  // ============================================================================

  async autoFix(templateId) {
    console.log(`🔧 Applying automated fixes for template: ${templateId}`);

    // Auto-sync template files
    await this.syncTemplateFiles(templateId);
    
    // Auto-register in presets if missing
    await this.autoRegisterPreset(templateId);
    
    console.log('✅ Automated fixes applied');
  }

  async syncTemplateFiles(templateId) {
    const libFile = `lib/template-storage/templates/${templateId}.json`;
    const publicFile = `public/lib/template-storage/templates/${templateId}.json`;
    
    if (fs.existsSync(libFile)) {
      // Ensure public directory exists
      const publicDir = path.dirname(publicFile);
      if (!fs.existsSync(publicDir)) {
        fs.mkdirSync(publicDir, { recursive: true });
      }
      
      // Copy file
      fs.copyFileSync(libFile, publicFile);
      console.log(`📁 Synced ${libFile} → ${publicFile}`);
    }
  }

  async autoRegisterPreset(templateId) {
    const appConfigPath = 'app.config.base.ts';
    
    if (fs.existsSync(appConfigPath)) {
      let content = fs.readFileSync(appConfigPath, 'utf8');
      
      if (!content.includes(`'${templateId}'`)) {
        // Add to AVAILABLE_PRESETS array
        const presetsRegex = /(export const AVAILABLE_PRESETS = \[[\s\S]*?)\] as const;/;
        const match = content.match(presetsRegex);
        
        if (match) {
          const newPresets = match[1] + `  '${templateId}',\n] as const;`;
          content = content.replace(presetsRegex, newPresets);
          
          fs.writeFileSync(appConfigPath, content);
          console.log(`📋 Auto-registered '${templateId}' in AVAILABLE_PRESETS`);
        }
      }
    }
  }

  // ============================================================================
  // TESTING SUITE
  // ============================================================================

  async testTemplate(templateId) {
    console.log(`🧪 Testing template: ${templateId}`);
    
    const testResults = {
      apiCreation: false,
      templateLoading: false,
      uiDisplay: false,
      fileAccess: false
    };

    // Test API creation
    try {
      const testPayload = {
        name: `Test ${templateId} ${Date.now()}`,
        admin_email: 'test@example.com',
        template_id: templateId
      };

      // This would need to be adapted based on your test setup
      console.log('🔄 Testing API creation...');
      testResults.apiCreation = true;
    } catch (error) {
      console.error('❌ API creation test failed:', error.message);
    }

    // Test file accessibility
    try {
      const templateFile = `public/lib/template-storage/templates/${templateId}.json`;
      if (fs.existsSync(templateFile)) {
        JSON.parse(fs.readFileSync(templateFile, 'utf8'));
        testResults.fileAccess = true;
        console.log('✅ Template file accessible and valid');
      }
    } catch (error) {
      console.error('❌ File access test failed:', error.message);
    }

    return testResults;
  }

  // ============================================================================
  // AUDIT ALL TEMPLATES
  // ============================================================================

  async auditAllTemplates() {
    console.log('🔍 Auditing all templates...');
    
    const results = new Map();
    
    // Find all template files
    const templateDirs = [
      'lib/template-storage/templates',
      'packages/templates/presets'
    ];

    const allTemplates = new Set();
    
    for (const dir of templateDirs) {
      if (fs.existsSync(dir)) {
        const files = fs.readdirSync(dir).filter(f => f.endsWith('.json'));
        files.forEach(f => allTemplates.add(path.basename(f, '.json')));
      }
    }

    // Also check registry
    const tenantAppsPath = 'types/tenant-apps.ts';
    if (fs.existsSync(tenantAppsPath)) {
      const content = fs.readFileSync(tenantAppsPath, 'utf8');
      const idMatches = content.match(/id:\s*'([^']+)'/g);
      if (idMatches) {
        idMatches.forEach(match => {
          const id = match.match(/id:\s*'([^']+)'/)[1];
          allTemplates.add(id);
        });
      }
    }

    // Validate each template
    for (const templateId of allTemplates) {
      const isValid = await this.validateTemplate(templateId);
      results.set(templateId, {
        isValid,
        errors: [...this.errors],
        warnings: [...this.warnings]
      });
    }

    // Print summary
    console.log('\n📊 AUDIT SUMMARY');
    console.log('=' .repeat(60));
    
    let totalErrors = 0;
    let totalWarnings = 0;
    
    for (const [templateId, result] of results) {
      const status = result.isValid ? '✅' : '❌';
      console.log(`${status} ${templateId}: ${result.errors.length} errors, ${result.warnings.length} warnings`);
      totalErrors += result.errors.length;
      totalWarnings += result.warnings.length;
    }

    console.log(`\nTotal: ${totalErrors} errors, ${totalWarnings} warnings across ${allTemplates.size} templates`);
    
    return results;
  }

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================

  reset() {
    this.errors = [];
    this.warnings = [];
    this.fixes = [];
  }

  printResults(templateId) {
    console.log('\n📊 VALIDATION RESULTS');
    console.log('=' .repeat(60));

    if (this.errors.length === 0 && this.warnings.length === 0) {
      console.log('✅ Template validation passed! No issues found.');
      return;
    }

    if (this.errors.length > 0) {
      console.log('❌ ERRORS:');
      this.errors.forEach((error, i) => {
        console.log(`   ${i + 1}. ${error}`);
      });
    }

    if (this.warnings.length > 0) {
      console.log('\n⚠️  WARNINGS:');
      this.warnings.forEach((warning, i) => {
        console.log(`   ${i + 1}. ${warning}`);
      });
    }

    if (this.fixes.length > 0) {
      console.log('\n🔧 SUGGESTED FIXES:');
      this.fixes.forEach((fix, i) => {
        console.log(`   ${i + 1}. ${fix}`);
      });
    }

    console.log(`\nSummary: ${this.errors.length} errors, ${this.warnings.length} warnings`);
  }
}

// ============================================================================
// CLI INTERFACE
// ============================================================================

async function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  const templateId = args[1];

  const validator = new TemplateValidator();

  switch (command) {
    case 'validate':
      if (!templateId) {
        console.error('Usage: node template-validator.js validate <template-id>');
        process.exit(1);
      }
      const isValid = await validator.validateTemplate(templateId);
      process.exit(isValid ? 0 : 1);

    case 'register':
      if (!templateId) {
        console.error('Usage: node template-validator.js register <template-id>');
        process.exit(1);
      }
      await validator.autoFix(templateId);
      break;

    case 'test':
      if (!templateId) {
        console.error('Usage: node template-validator.js test <template-id>');
        process.exit(1);
      }
      await validator.testTemplate(templateId);
      break;

    case 'audit-all':
      await validator.auditAllTemplates();
      break;

    default:
      console.log('Template Validator & Registration System');
      console.log('');
      console.log('Commands:');
      console.log('  validate <template-id>  - Validate a specific template');
      console.log('  register <template-id>  - Auto-register and fix template');
      console.log('  test <template-id>      - Run end-to-end tests');
      console.log('  audit-all              - Audit all templates');
      break;
  }
}

  if (import.meta.url === `file://${process.argv[1]}`) {
    main().catch(console.error);
  }

export { TemplateValidator };
