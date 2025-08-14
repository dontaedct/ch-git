#!/usr/bin/env node

/**
 * Pre-commit check script for Windows compatibility
 * Run this manually before committing: node scripts/pre-commit-check.js
 */

const { execSync } = require('child_process');

console.log('🔍 Running pre-commit checks...\n');

try {
  // Run linting
  console.log('📋 Step 1/3: Running linting checks...');
  execSync('npm run lint', { stdio: 'inherit' });
  console.log('✅ Linting completed successfully!\n');

  // Run type checking
  console.log('📋 Step 2/3: Running type checking...');
  execSync('npm run typecheck', { stdio: 'inherit' });
  console.log('✅ Type checking completed successfully!\n');

  // Run policy enforcement
  console.log('📋 Step 3/3: Running policy enforcement...');
  execSync('npm run policy:enforce', { stdio: 'inherit' });
  console.log('✅ Policy enforcement completed successfully!\n');

  console.log('🎉 All pre-commit checks passed!');
  console.log('💡 Tip: Use "git commit --no-verify" to bypass hooks on Windows');
  process.exit(0);
} catch (error) {
  console.error('❌ Pre-commit checks failed!');
  console.error('💡 Fix the issues above before committing');
  process.exit(1);
}
