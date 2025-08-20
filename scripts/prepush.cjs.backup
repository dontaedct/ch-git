#!/usr/bin/env node

/**
 * Pre-push Runner - Windows-safe with timeouts
 * 
 * Runs the essential checks in order:
 * 1. Lint (8 min timeout)
 * 2. Typecheck (8 min timeout) 
 * 3. Build (12 min timeout)
 * 
 * Never traverses outside process.cwd()
 */

const { spawn } = require('child_process');
const path = require('path');

// Configuration
const CONFIG = {
  TIMEOUTS: {
    LINT: 8 * 60 * 1000,      // 8 minutes
    TYPECHECK: 8 * 60 * 1000, // 8 minutes
    BUILD: 12 * 60 * 1000      // 12 minutes
  },
  COMMANDS: {
    LINT: 'npm run lint',
    TYPECHECK: 'npm run typecheck',
    BUILD: 'npm run build'
  }
};

// Utility functions
const utils = {
  log: (message, type = 'info') => {
    const timestamp = new Date().toLocaleTimeString();
    const prefix = {
      info: 'ℹ️',
      success: '✅',
      warning: '⚠️',
      error: '❌',
      progress: '🔄'
    }[type] || 'ℹ️';
    
    console.log(`${prefix} [${timestamp}] ${message}`);
  },
  
  formatTime: (ms) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  }
};

// Execute command with timeout
function executeCommand(command, description, timeout) {
  return new Promise((resolve, reject) => {
    utils.log(`🚀 Starting: ${description}`);
    
    const startTime = Date.now();
    const [cmd, ...args] = command.split(' ');
    
    const child = spawn(cmd, args, {
      stdio: ['inherit', 'pipe', 'pipe'],
      shell: true,
      cwd: process.cwd(), // Ensure we stay in repo
      timeout: timeout
    });
    
    let output = '';
    let errorOutput = '';
    
    // Capture stdout
    if (child.stdout) {
      child.stdout.on('data', (data) => {
        const dataStr = data.toString();
        output += dataStr;
        // Stream output in real-time
        process.stdout.write(dataStr);
      });
    }
    
    // Capture stderr
    if (child.stderr) {
      child.stderr.on('data', (data) => {
        const dataStr = data.toString();
        errorOutput += dataStr;
        // Stream errors in real-time
        process.stderr.write(dataStr);
      });
    }
    
    // Handle completion
    child.on('close', (code) => {
      const duration = Date.now() - startTime;
      if (code === 0) {
        utils.log(`✅ ${description} completed in ${utils.formatTime(duration)}`, 'success');
        resolve({ success: true, code, output, errorOutput, duration });
      } else {
        utils.log(`❌ ${description} failed with exit code ${code} after ${utils.formatTime(duration)}`, 'error');
        resolve({ success: false, code, output, errorOutput, duration });
      }
    });
    
    // Handle timeout
    child.on('timeout', () => {
      const duration = Date.now() - startTime;
      utils.log(`⏰ ${description} timed out after ${utils.formatTime(timeout)}`, 'warning');
      child.kill('SIGTERM');
      reject(new Error(`${description} timed out after ${utils.formatTime(timeout)}`));
    });
    
    // Handle errors
    child.on('error', (error) => {
      const duration = Date.now() - startTime;
      utils.log(`💥 ${description} process error after ${utils.formatTime(duration)}: ${error.message}`, 'error');
      reject(error);
    });
  });
}

// Main execution
async function main() {
  try {
    utils.log('🚀 Pre-push checks starting...');
    utils.log(`📁 Working directory: ${process.cwd()}`);
    
    // Step 1: Lint
    utils.log('📋 Step 1/3: Running linting checks...');
    const lintResult = await executeCommand(
      CONFIG.COMMANDS.LINT,
      'Linting',
      CONFIG.TIMEOUTS.LINT
    );
    
    if (!lintResult.success) {
      utils.log('❌ Linting failed - push blocked', 'error');
      process.exit(lintResult.code || 1);
    }
    
    // Step 2: Typecheck
    utils.log('📋 Step 2/3: Running type checking...');
    const typecheckResult = await executeCommand(
      CONFIG.COMMANDS.TYPECHECK,
      'Type checking',
      CONFIG.TIMEOUTS.TYPECHECK
    );
    
    if (!typecheckResult.success) {
      utils.log('❌ Type checking failed - push blocked', 'error');
      process.exit(typecheckResult.code || 1);
    }
    
    // Step 3: Build
    utils.log('📋 Step 3/3: Running build...');
    const buildResult = await executeCommand(
      CONFIG.COMMANDS.BUILD,
      'Build',
      CONFIG.TIMEOUTS.BUILD
    );
    
    if (!buildResult.success) {
      utils.log('❌ Build failed - push blocked', 'error');
      process.exit(buildResult.code || 1);
    }
    
    // All checks passed
    const totalTime = lintResult.duration + typecheckResult.duration + buildResult.duration;
    utils.log(`🎉 All pre-push checks passed in ${utils.formatTime(totalTime)}!`, 'success');
    utils.log('✅ Ready to push!');
    process.exit(0);
    
  } catch (error) {
    utils.log(`💥 Fatal error in pre-push checks: ${error.message}`, 'error');
    process.exit(1);
  }
}

// Handle process signals gracefully
process.on('SIGINT', () => {
  utils.log('🛑 Pre-push checks interrupted by user', 'warning');
  process.exit(130);
});

process.on('SIGTERM', () => {
  utils.log('🛑 Pre-push checks terminated', 'warning');
  process.exit(143);
});

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { main, executeCommand };
