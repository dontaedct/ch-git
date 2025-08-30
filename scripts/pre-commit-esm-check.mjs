#!/usr/bin/env node

/**
 * Pre-commit ESM check - blocks require() in .js files
 * 
 * This script ensures that .js files use ESM syntax (import/export) 
 * and blocks CommonJS require() statements to maintain ESM hygiene.
 */

import { readFileSync, readdirSync, statSync } from 'fs';
import { join, extname } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

// Directories to scan
const SCAN_DIRS = [
  'scripts',
  'lib',
  'app',
  'components',
  'data',
  'hooks',
  'types'
];

// Files to exclude
const EXCLUDE_PATTERNS = [
  /\.backup$/,
  /\.cjs$/,
  /\.mjs$/,
  /\.ts$/,
  /\.tsx$/,
  /node_modules/,
  /\.git/,
  /dist/,
  /build/,
  /\.next/
];

// Patterns that indicate CommonJS usage
const COMMONJS_PATTERNS = [
  /require\s*\(/,
  /module\.exports/,
  /exports\./,
  /__dirname/,
  /__filename/
];

function shouldExcludeFile(filePath) {
  return EXCLUDE_PATTERNS.some(pattern => pattern.test(filePath));
}

function scanDirectory(dirPath, results = []) {
  try {
    const items = readdirSync(dirPath);
    
    for (const item of items) {
      const fullPath = join(dirPath, item);
      const relativePath = fullPath.replace(projectRoot, '').replace(/\\/g, '/');
      
      if (shouldExcludeFile(relativePath)) {
        continue;
      }
      
      const stat = statSync(fullPath);
      
      if (stat.isDirectory()) {
        scanDirectory(fullPath, results);
      } else if (extname(item) === '.js') {
        results.push(relativePath);
      }
    }
  } catch (error) {
    console.warn(`Warning: Could not scan directory ${dirPath}:`, error.message);
  }
  
  return results;
}

function checkFileForCommonJS(filePath) {
  try {
    const fullPath = join(projectRoot, filePath);
    const content = readFileSync(fullPath, 'utf8');
    const lines = content.split('\n');
    const issues = [];
    
    lines.forEach((line, index) => {
      COMMONJS_PATTERNS.forEach(pattern => {
        if (pattern.test(line)) {
          issues.push({
            line: index + 1,
            pattern: pattern.source,
            content: line.trim()
          });
        }
      });
    });
    
    return issues;
  } catch (error) {
    console.warn(`Warning: Could not read file ${filePath}:`, error.message);
    return [];
  }
}

function main() {
  console.log('🔍 Checking for CommonJS usage in .js files...\n');
  
  const jsFiles = [];
  SCAN_DIRS.forEach(dir => {
    const dirPath = join(projectRoot, dir);
    if (statSync(dirPath).isDirectory()) {
      jsFiles.push(...scanDirectory(dirPath));
    }
  });
  
  let totalIssues = 0;
  const filesWithIssues = [];
  
  for (const file of jsFiles) {
    const issues = checkFileForCommonJS(file);
    if (issues.length > 0) {
      filesWithIssues.push({ file, issues });
      totalIssues += issues.length;
    }
  }
  
  if (filesWithIssues.length === 0) {
    console.log('✅ All .js files use proper ESM syntax!');
    process.exit(0);
  }
  
  console.log(`❌ Found ${totalIssues} CommonJS usage(s) in ${filesWithIssues.length} file(s):\n`);
  
  filesWithIssues.forEach(({ file, issues }) => {
    console.log(`📁 ${file}:`);
    issues.forEach(issue => {
      console.log(`   Line ${issue.line}: ${issue.pattern} - "${issue.content}"`);
    });
    console.log('');
  });
  
  console.log('💡 To fix these issues:');
  console.log('   • Convert require() to import statements');
  console.log('   • Convert module.exports to export statements');
  console.log('   • Use import.meta.url instead of __dirname/__filename');
  console.log('   • Consider renaming .js files to .mjs for clarity');
  console.log('');
  console.log('🔧 Quick fixes:');
  console.log('   • Run: npm run tool:doctor:fix');
  console.log('   • Use: npm run tool:rename:symbol for systematic changes');
  
  process.exit(1);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
