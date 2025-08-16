#!/usr/bin/env node

/**
 * Pre-commit date validation
 */

const { execSync } = require('child_process');
const fs = require('fs');

try {
  // Get staged files
  const stagedFiles = execSync('git diff --cached --name-only', { encoding: 'utf8' })
    .split('\n')
    .filter(file => file.trim() && this.shouldValidateFile(file));
  
  if (stagedFiles.length === 0) {
    process.exit(0);
  }
  
  // Run date validation on staged files
  const result = execSync(`node scripts/date-validation-system.js --files "${stagedFiles.join(' ')}"`, { 
    encoding: 'utf8',
    stdio: 'pipe'
  });
  
  console.log('✅ Pre-commit date validation passed');
  process.exit(0);
  
} catch (error) {
  console.error('❌ Pre-commit date validation failed:', error.message);
  process.exit(1);
}

function shouldValidateFile(filePath) {
  const validExtensions = ['.md', '.ts', '.tsx', '.js', '.json', '.sql', '.txt'];
  return validExtensions.some(ext => filePath.endsWith(ext));
}
