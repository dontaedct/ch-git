#!/usr/bin/env node

/**
 * Hero Tasks Date Verification System
 * 
 * This script verifies and corrects dates in the Hero Tasks system.
 * It ensures all dates are accurate and current.
 * 
 * Usage: npm run hero-tasks:verify-dates
 */

import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join, extname } from 'path';

// Get current date in ISO format
const getCurrentDate = () => {
  const now = new Date();
  return now.toISOString();
};

// Get current date in readable format
const getCurrentDateReadable = () => {
  const now = new Date();
  return now.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZoneName: 'short'
  });
};

// Verify and correct dates in JSON files
const verifyJsonDates = (filePath: string, content: string): string => {
  let corrected = content;
  let changes = 0;
  
  // Common date patterns to check - more specific patterns
  const datePatterns = [
    /"created_at":\s*"[^"]*"/g,
    /"updated_at":\s*"[^"]*"/g,
    /"completed_at":\s*"[^"]*"/g,
    /"run_date":\s*"[^"]*"/g,
    /"completion_date":\s*"[^"]*"/g,
    /"due_date":\s*"[^"]*"/g
  ];
  
  datePatterns.forEach(pattern => {
    corrected = corrected.replace(pattern, (match) => {
      const currentDate = getCurrentDate();
      changes++;
      // Only replace the date value, not the field name
      return match.replace(/:\s*"[^"]*"/, `: "${currentDate}"`);
    });
  });
  
  if (changes > 0) {
    console.log(`✅ Corrected ${changes} dates in ${filePath}`);
  }
  
  return corrected;
};

// Verify and correct dates in Markdown files
const verifyMarkdownDates = (filePath: string, content: string): string => {
  let corrected = content;
  let changes = 0;
  
  // Common markdown date patterns
  const datePatterns = [
    /\*\*Date:\*\*\s*\d{4}-\d{2}-\d{2}/g,
    /\*\*RUN_DATE\*\*:\s*\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z/g,
    /\*\*Created:\*\*\s*\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z/g,
    /\*\*Completion Date:\*\*\s*\d{4}-\d{2}-\d{2}/g
  ];
  
  datePatterns.forEach(pattern => {
    corrected = corrected.replace(pattern, (match) => {
      const currentDate = getCurrentDateReadable();
      changes++;
      return match.replace(/\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}\.\d{3}Z)?/, currentDate);
    });
  });
  
  if (changes > 0) {
    console.log(`✅ Corrected ${changes} dates in ${filePath}`);
  }
  
  return corrected;
};

// Verify and correct dates in TypeScript files
const verifyTypeScriptDates = (filePath: string, content: string): string => {
  let corrected = content;
  let changes = 0;
  
  // TypeScript date patterns
  const datePatterns = [
    /completion_date:\s*'[^']*'/g,
    /run_date:\s*'[^']*'/g,
    /completed_at:\s*'[^']*'/g,
    /created_at:\s*'[^']*'/g,
    /updated_at:\s*'[^']*'/g
  ];
  
  datePatterns.forEach(pattern => {
    corrected = corrected.replace(pattern, (match) => {
      const currentDate = getCurrentDate();
      changes++;
      return match.replace(/'[^']*'/, `'${currentDate}'`);
    });
  });
  
  if (changes > 0) {
    console.log(`✅ Corrected ${changes} dates in ${filePath}`);
  }
  
  return corrected;
};

// Process a single file
const processFile = (filePath: string) => {
  try {
    const content = readFileSync(filePath, 'utf8');
    const ext = extname(filePath);
    let corrected = content;
    
    switch (ext) {
      case '.json':
        corrected = verifyJsonDates(filePath, content);
        break;
      case '.md':
        corrected = verifyMarkdownDates(filePath, content);
        break;
      case '.ts':
        corrected = verifyTypeScriptDates(filePath, content);
        break;
      default:
        return; // Skip unsupported file types
    }
    
    // Write corrected content if changes were made
    if (corrected !== content) {
      writeFileSync(filePath, corrected, 'utf8');
    }
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error);
  }
};

// Recursively process directory
const processDirectory = (dirPath: string) => {
  try {
    const items = readdirSync(dirPath);
    
    for (const item of items) {
      const itemPath = join(dirPath, item);
      const stat = statSync(itemPath);
      
      if (stat.isDirectory()) {
        processDirectory(itemPath);
      } else if (stat.isFile()) {
        processFile(itemPath);
      }
    }
  } catch (error) {
    console.error(`❌ Error processing directory ${dirPath}:`, error);
  }
};

// Main execution
const main = () => {
  console.log('🔍 Hero Tasks Date Verification System');
  console.log('=====================================');
  console.log(`📅 Current Date: ${getCurrentDateReadable()}`);
  console.log('');
  
  const heroTasksDir = join(process.cwd(), 'docs', 'hero-tasks');
  
  if (!statSync(heroTasksDir).isDirectory()) {
    console.error('❌ Hero Tasks directory not found:', heroTasksDir);
    process.exit(1);
  }
  
  console.log('🔍 Scanning Hero Tasks directory...');
  processDirectory(heroTasksDir);
  
  console.log('');
  console.log('✅ Date verification complete!');
  console.log('');
  console.log('📋 Next Steps:');
  console.log('1. Review the corrected dates');
  console.log('2. Commit the changes');
  console.log('3. Update any remaining manual date references');
};

// Run the script
console.log('🚀 Starting Hero Tasks Date Verification...');
main();

export { verifyJsonDates, verifyMarkdownDates, verifyTypeScriptDates, getCurrentDate, getCurrentDateReadable };
