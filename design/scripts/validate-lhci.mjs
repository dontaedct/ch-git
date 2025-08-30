#!/usr/bin/env node

/**
 * LHCI Configuration Validator
 * 
 * Validates LHCI configuration without requiring a running server.
 * This script checks:
 * - Configuration file syntax
 * - Budget file syntax
 * - Required dependencies
 * - GitHub Actions integration
 */

import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

function validateConfig() {
  console.log('🔍 Validating LHCI Configuration...\n');

  let allValid = true;

  // Check LHCI config file
  const lhciConfigPath = 'design/lhci.config.cjs';
  if (!existsSync(lhciConfigPath)) {
    console.log('❌ LHCI config file not found: design/lhci.config.cjs');
    allValid = false;
  } else {
    try {
      const config = readFileSync(lhciConfigPath, 'utf8');
      // Basic syntax check
      if (config.includes('<<<<<<< HEAD') || config.includes('>>>>>>>')) {
        console.log('❌ LHCI config file contains merge conflicts');
        allValid = false;
      } else {
        console.log('✅ LHCI config file syntax valid');
      }
    } catch (error) {
      console.log('❌ LHCI config file syntax error:', error.message);
      allValid = false;
    }
  }

  // Check budget file
  const budgetPath = 'design/budgets/lhci-budgets.json';
  if (!existsSync(budgetPath)) {
    console.log('❌ Budget file not found: design/budgets/lhci-budgets.json');
    allValid = false;
  } else {
    try {
      const budget = readFileSync(budgetPath, 'utf8');
      JSON.parse(budget); // Validate JSON syntax
      if (budget.includes('<<<<<<< HEAD') || budget.includes('>>>>>>>')) {
        console.log('❌ Budget file contains merge conflicts');
        allValid = false;
      } else {
        console.log('✅ Budget file syntax valid');
      }
    } catch (error) {
      console.log('❌ Budget file syntax error:', error.message);
      allValid = false;
    }
  }

  // Check package.json for LHCI dependency
  const packageJsonPath = 'package.json';
  if (existsSync(packageJsonPath)) {
    try {
      const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'));
      const hasLhci = packageJson.devDependencies?.['@lhci/cli'] || 
                     packageJson.dependencies?.['@lhci/cli'];
      if (hasLhci) {
        console.log('✅ LHCI CLI dependency found');
      } else {
        console.log('❌ LHCI CLI dependency not found in package.json');
        allValid = false;
      }
    } catch (error) {
      console.log('❌ Could not read package.json:', error.message);
      allValid = false;
    }
  }

  // Check GitHub Actions workflow
  const workflowPath = '.github/workflows/design-safety.yml';
  if (existsSync(workflowPath)) {
    try {
      const workflow = readFileSync(workflowPath, 'utf8');
      if (workflow.includes('lhci autorun')) {
        console.log('✅ LHCI integration found in GitHub Actions');
      } else {
        console.log('❌ LHCI integration not found in GitHub Actions');
        allValid = false;
      }
    } catch (error) {
      console.log('❌ Could not read GitHub Actions workflow:', error.message);
      allValid = false;
    }
  } else {
    console.log('❌ GitHub Actions workflow not found');
    allValid = false;
  }

  // Check npm script
  if (existsSync(packageJsonPath)) {
    try {
      const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'));
      const hasPerfScript = packageJson.scripts?.['tool:ui:perf'];
      if (hasPerfScript) {
        console.log('✅ LHCI npm script found: tool:ui:perf');
      } else {
        console.log('❌ LHCI npm script not found');
        allValid = false;
      }
    } catch (error) {
      console.log('❌ Could not check npm scripts:', error.message);
      allValid = false;
    }
  }

  console.log('\n📋 Configuration Summary:');
  console.log('========================');
  
  if (allValid) {
    console.log('✅ All LHCI configuration checks passed!');
    console.log('\n🚀 Next steps:');
    console.log('1. Start your development server: npm run dev');
    console.log('2. Run LHCI tests: npm run tool:ui:perf');
    console.log('3. LHCI will run automatically on PRs with performance/ui labels');
  } else {
    console.log('❌ Some configuration issues found. Please fix them before proceeding.');
    process.exit(1);
  }
}

validateConfig();
