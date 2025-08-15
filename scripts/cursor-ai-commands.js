#!/usr/bin/env node

/**
 * Cursor AI Command Integration
 * This script automatically shows the command library when you ask for commands
 * Usage: Just type "show commands" or "commands" in Cursor AI
 */

const fs = require('fs');
const path = require('path');

// Trigger phrases that should show the command library
const TRIGGER_PHRASES = [
  'show commands',
  'show me commands', 
  'commands',
  'command list',
  'command library',
  'what commands',
  'help commands',
  'npm commands',
  'available commands',
  'list commands'
];

function showCommandLibrary() {
  try {
    const libraryPath = path.join(process.cwd(), 'COMMAND_LIBRARY.md');
    
    // Check if library exists, if not generate it
    if (!fs.existsSync(libraryPath)) {
      console.log('📚 Command library not found. Generating it now...');
      const { generateCommandLibrary } = require('./generate-command-library');
      generateCommandLibrary();
    }
    
    // Read and display the library
    const content = fs.readFileSync(libraryPath, 'utf8');
    
    console.log('\n' + '='.repeat(80));
    console.log('🚀 COMPLETE COMMAND LIBRARY');
    console.log('='.repeat(80));
    console.log(content);
    console.log('='.repeat(80));
    
    console.log('\n💡 **Quick Access Commands:**');
    console.log('• npm run helper          - Interactive menu');
    console.log('• npm run check:quick     - Daily health check');
    console.log('• npm run commands        - Regenerate this library');
    
    console.log('\n🎯 **Pro Tip**: Keep this file open while developing!');
    console.log('📁 File location: COMMAND_LIBRARY.md');
    
  } catch (error) {
    console.error('❌ Error showing command library:', error.message);
    console.log('🔄 Trying to generate a fresh library...');
    
    try {
      const { generateCommandLibrary } = require('./generate-command-library');
      generateCommandLibrary();
      console.log('✅ Library generated! Run this command again to view it.');
    } catch (genError) {
      console.error('❌ Failed to generate library:', genError.message);
    }
  }
}

// Auto-detect if this is being run from Cursor AI
function isCursorAI() {
  return process.env.CURSOR_AI === 'true' || 
         process.argv.includes('--cursor-ai') ||
         process.argv.includes('--ai');
}

// Main execution
if (require.main === module) {
  if (isCursorAI()) {
    console.log('🤖 Cursor AI detected! Showing command library...');
  }
  showCommandLibrary();
}

module.exports = { showCommandLibrary, TRIGGER_PHRASES };
