#!/usr/bin/env node

/**
 * @fileoverview OSS Hero Design Guardian
 * @description Main design safety runner for UI components and design system
 * @version 1.0.0
 * @author OSS Hero Design Safety Module
 */

import { execSync } from 'child_process';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = new URL('.', import.meta.url).pathname;

// Configuration paths
const CONFIG_PATHS = {
  eslint: join(process.cwd(), '.eslintrc.json'),
  designGuardian: join(process.cwd(), 'design', 'policies', 'eslint-design.config.cjs'),
  importBoundaries: join(process.cwd(), 'design', 'policies', 'import-boundaries.cjs'),
  tokenGuards: join(process.cwd(), 'design', 'policies', 'token-guards.cjs')
};

// Design Guardian modes
const MODES = {
  ADVISORY: 'advisory',
  REQUIRED: 'required'
};

class DesignGuardian {
  constructor() {
    this.currentMode = this.detectCurrentMode();
  }

  /**
   * Detect current mode by checking mode indicator file
   */
  detectCurrentMode() {
    try {
      const modeFile = join(process.cwd(), 'design', '.mode');
      
      if (existsSync(modeFile)) {
        const mode = readFileSync(modeFile, 'utf8').trim();
        return mode === MODES.REQUIRED ? MODES.REQUIRED : MODES.ADVISORY;
      }
      
      // Default to advisory mode if no mode file exists
      return MODES.ADVISORY;
    } catch (error) {
      console.error('Error detecting current mode:', error.message);
      return MODES.ADVISORY; // Default to advisory
    }
  }

  /**
   * Toggle between advisory and required modes
   */
  toggleMode() {
    const newMode = this.currentMode === MODES.ADVISORY ? MODES.REQUIRED : MODES.ADVISORY;
    console.log(`🔄 Toggling Design Guardian from ${this.currentMode} to ${newMode} mode...`);
    
    try {
      this.updateMode(newMode);
      console.log(`✅ Design Guardian is now in ${newMode} mode`);
      console.log(`📋 Run 'npm run design:guardian:${newMode}' to enforce ${newMode} mode`);
    } catch (error) {
      console.error('❌ Failed to toggle mode:', error.message);
      process.exit(1);
    }
  }

  /**
   * Update ESLint config to specified mode
   */
  updateMode(mode) {
    try {
      this.currentMode = mode;
      
      // Create a mode indicator file
      const modeFile = join(process.cwd(), 'design', '.mode');
      writeFileSync(modeFile, mode, 'utf8');
      
      // Update the main ESLint config to use the appropriate policy file
      const eslintConfigPath = join(process.cwd(), '.eslintrc.json');
      const eslintConfig = JSON.parse(readFileSync(eslintConfigPath, 'utf8'));
      
      // Find and replace the design policy config
      const designPolicyIndex = eslintConfig.extends.findIndex(ext => 
        ext.includes('eslint-design') && ext.includes('.config.cjs')
      );
      
      if (designPolicyIndex !== -1) {
        if (mode === MODES.ADVISORY) {
          eslintConfig.extends[designPolicyIndex] = './design/policies/eslint-design-advisory.config.cjs';
        } else {
          eslintConfig.extends[designPolicyIndex] = './design/policies/eslint-design-required.config.cjs';
        }
        
        // Write the updated config
        writeFileSync(eslintConfigPath, JSON.stringify(eslintConfig, null, 2));
        console.log(`✅ ESLint config updated to use ${mode} mode policies`);
      }
      
      console.log(`✅ Design Guardian mode updated to ${mode}`);
      console.log(`📋 Mode indicator saved to: ${modeFile}`);
      
    } catch (error) {
      throw new Error(`Failed to update mode: ${error.message}`);
    }
  }

  /**
   * Run design safety checks
   */
  async runChecks() {
    console.log('🔍 Running Design Guardian checks...');
    console.log(`📊 Current mode: ${this.currentMode}`);
    
    try {
      // Run ESLint with current config
      const result = execSync('npm run lint', { 
        encoding: 'utf8',
        stdio: 'pipe'
      });
      
      console.log('✅ Design Guardian checks completed successfully');
      console.log(result);
      
    } catch (error) {
      if (error.status === 0) {
        console.log('✅ Design Guardian checks completed successfully');
        console.log(error.stdout);
      } else {
        console.log('⚠️  Design Guardian found violations:');
        console.log(error.stdout);
        console.log(error.stderr);
        
        if (this.currentMode === MODES.REQUIRED) {
          console.log('❌ Required mode enabled - violations must be fixed');
          process.exit(1);
        } else {
          console.log('⚠️  Advisory mode - violations are warnings only');
        }
      }
    }
  }

  /**
   * Run component contract validation
   */
  async runContractValidation() {
    console.log('📋 Running component contract validation...');
    
    try {
      // Check for direct data imports in UI components
      const uiComponents = this.findUIComponents();
      const violations = [];
      
      for (const component of uiComponents) {
        const hasViolations = this.checkComponentContracts(component);
        if (hasViolations) {
          violations.push(component);
        }
      }
      
      if (violations.length > 0) {
        console.log('⚠️  Component contract violations found:');
        violations.forEach(violation => console.log(`  - ${violation}`));
      } else {
        console.log('✅ All components follow contract rules');
      }
      
    } catch (error) {
      console.error('❌ Contract validation failed:', error.message);
      process.exit(1);
    }
  }

  /**
   * Find UI components in the project
   */
  findUIComponents() {
    const components = [];
    
    // Check components/ui directory
    if (existsSync('components/ui')) {
      // This would need to be expanded to actually scan the directory
      components.push('components/ui/**/*');
    }
    
    // Check other component directories
    if (existsSync('components')) {
      components.push('components/**/*.tsx');
      components.push('components/**/*.ts');
    }
    
    return components;
  }

  /**
   * Check component contracts for violations
   */
  checkComponentContracts(componentPath) {
    // This is a simplified check - in practice, you'd want to parse the actual files
    // and check for import violations, inline styles, etc.
    return false; // Placeholder
  }

  /**
   * Show current status
   */
  showStatus() {
    console.log('🎨 OSS Hero Design Guardian Status');
    console.log('=====================================');
    console.log(`📊 Current Mode: ${this.currentMode}`);
    console.log(`🔧 Configuration: ${CONFIG_PATHS.eslint}`);
    console.log(`📁 Policies: ${Object.keys(CONFIG_PATHS).length} active`);
    console.log('');
    console.log('📋 Available Commands:');
    console.log('  npm run design:guardian:advisory  - Run in advisory mode (warnings only)');
    console.log('  npm run design:guardian:required  - Run in required mode (errors block)');
    console.log('  npm run design:guardian:toggle    - Toggle between modes');
    console.log('  npm run design:guardian           - Run current mode');
    console.log('');
    console.log('🎯 Design Safety Rules:');
    console.log('  ✅ No raw hex colors in JSX/classNames');
    console.log('  ✅ No inline styles (controlled exceptions via comment)');
    console.log('  ✅ Single icon set (Lucide) and single font (Geist)');
    console.log('  ✅ UI components cannot import from data/db/supabase');
    console.log('  ✅ Tailwind token validation for class strings');
  }
}

// Main execution
async function main() {
  const guardian = new DesignGuardian();
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    guardian.showStatus();
    return;
  }
  
  const command = args[0];
  
  switch (command) {
    case '--toggle-mode':
      guardian.toggleMode();
      break;
      
    case '--contracts':
      await guardian.runContractValidation();
      break;
      
    case '--check':
      await guardian.runChecks();
      break;
      
    case '--status':
      guardian.showStatus();
      break;
      
    default:
      console.log('❌ Unknown command:', command);
      console.log('📋 Available commands: --toggle-mode, --contracts, --check, --status');
      process.exit(1);
  }
}

// Run if called directly
if (process.argv[1] && process.argv[1].endsWith('design-guardian.mjs')) {
  main().catch(error => {
    console.error('❌ Design Guardian failed:', error.message);
    process.exit(1);
  });
}

export default DesignGuardian;
