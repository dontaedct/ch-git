#!/usr/bin/env node

/**
 * Pre-commit check to ensure no require() statements in .js files
 * Enforces ESM usage in the codebase
 */

import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';

console.log('🔍 Checking for require() statements in .js files...');

// Get list of staged .js files
let stagedFiles = [];
try {
  const output = execSync('git diff --cached --name-only --diff-filter=ACMR', { encoding: 'utf8' });
  stagedFiles = output.trim().split('\n').filter(file => file.endsWith('.js'));
} catch (error) {
  console.log('ℹ️  No staged files or not in a git repository');
  process.exit(0);
}

if (stagedFiles.length === 0) {
  console.log('✅ No .js files staged for commit');
  process.exit(0);
}

console.log(`📁 Checking ${stagedFiles.length} staged .js files...`);

let hasErrors = false;

for (const file of stagedFiles) {
  if (!fs.existsSync(file)) {
    continue; // File was deleted
  }

  try {
    const content = fs.readFileSync(file, 'utf8');
    
    // Check for require() statements
    const requireMatches = content.match(/require\s*\(/g);
    if (requireMatches) {
      console.error(`❌ ${file}: Found ${requireMatches.length} require() statement(s)`);
      console.error(`   Convert to ESM import or rename to .cjs for CommonJS`);
      hasErrors = true;
    } else {
      console.log(`✅ ${file}: No require() statements found`);
    }
  } catch (error) {
    console.error(`❌ ${file}: Error reading file - ${error.message}`);
    hasErrors = true;
  }
}

if (hasErrors) {
  console.error('\n🚫 Commit blocked: Found require() statements in .js files');
  console.error('   Solutions:');
  console.error('   1. Convert to ESM: const x = require("y") → import x from "y"');
  console.error('   2. Rename to .cjs: mv file.js file.cjs');
  console.error('   3. Use .mjs extension for ESM scripts');
  process.exit(1);
}

console.log('\n✅ All .js files are ESM-compliant');
process.exit(0);
