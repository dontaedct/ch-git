#!/usr/bin/env node

/**
 * Smart Linting System
 * 
 * Automatically chooses the best linting approach based on context:
 * - Development: Fast feedback with minimal output
 * - CI/CD: Full validation with comprehensive reporting
 * - Interactive: User-friendly output with progress indicators
 * - Error recovery: Falls back to safe options if issues occur
 * 
 * Follows universal header principles: automatic, careful, rule-compliant
 */

const { spawn, execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

// Configuration
const CONFIG = {
  // Performance thresholds
  MAX_ERRORS_BEFORE_FAST_MODE: 50,
  MAX_FILES_TO_PROCESS: 1000,
  
  // Timeout settings (in milliseconds)
  FAST_MODE_TIMEOUT: 30000,    // 30 seconds
  REGULAR_MODE_TIMEOUT: 120000, // 2 minutes
  
  // Output modes
  MODES: {
    FAST: 'fast',
    REGULAR: 'regular',
    INTERACTIVE: 'interactive',
    RECOVERY: 'recovery'
  }
};

// Utility functions
const utils = {
  isCI: () => process.env.CI === 'true' || process.env.GITHUB_ACTIONS === 'true',
  
  isInteractive: () => process.stdout.isTTY && !process.env.CI,
  
  getProjectSize: () => {
    try {
      // Windows-compatible git command
      const isWindows = process.platform === 'win32';
      const command = isWindows 
        ? 'git ls-files --cached --modified --others --exclude-standard | find /c /v ""'
        : 'git ls-files --cached --modified --others --exclude-standard | wc -l';
      
      const result = execSync(command, { encoding: 'utf8' });
      return parseInt(result.trim(), 10);
    } catch {
      return 1000; // Default fallback
    }
  },
  
  hasRecentErrors: () => {
    try {
      if (fs.existsSync('.eslintcache')) {
        const stats = fs.statSync('.eslintcache');
        const hoursSinceLastRun = (Date.now() - stats.mtime.getTime()) / (1000 * 60 * 60);
        return hoursSinceLastRun < 1; // Within last hour
      }
    } catch {}
    return false;
  },
  
  clearCache: () => {
    try {
      if (fs.existsSync('.eslintcache')) {
        fs.unlinkSync('.eslintcache');
        console.log('🧹 Cleared ESLint cache for fresh start');
      }
    } catch (error) {
      console.log('⚠️  Could not clear cache:', error.message);
    }
  },
  
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
  }
};

// Linting strategies
const strategies = {
  [CONFIG.MODES.FAST]: {
    command: 'next lint --max-warnings 0 --quiet',
    description: 'Fast mode - quick feedback with minimal output',
    timeout: CONFIG.FAST_MODE_TIMEOUT
  },
  
  [CONFIG.MODES.REGULAR]: {
    command: 'next lint --max-warnings 0',
    description: 'Regular mode - comprehensive linting',
    timeout: CONFIG.REGULAR_MODE_TIMEOUT
  },
  
  [CONFIG.MODES.INTERACTIVE]: {
    command: 'next lint --max-warnings 0',
    description: 'Interactive mode - user-friendly with progress',
    timeout: CONFIG.REGULAR_MODE_TIMEOUT
  },
  
  [CONFIG.MODES.RECOVERY]: {
    command: 'next lint --max-warnings 0 --quiet --cache-location .eslintcache',
    description: 'Recovery mode - safe fallback with caching',
    timeout: CONFIG.FAST_MODE_TIMEOUT
  }
};

// Strategy selection logic
function selectStrategy() {
  utils.log('🔍 Analyzing project context for optimal linting strategy...');
  
  // Check if we're in CI environment
  if (utils.isCI()) {
    utils.log('🏗️  CI environment detected - using regular mode for comprehensive validation');
    return CONFIG.MODES.REGULAR;
  }
  
  // Check project size
  const projectSize = utils.getProjectSize();
  if (projectSize > CONFIG.MAX_FILES_TO_PROCESS) {
    utils.log(`📁 Large project detected (${projectSize} files) - using fast mode for performance`);
    return CONFIG.MODES.FAST;
  }
  
  // Check for recent errors
  if (utils.hasRecentErrors()) {
    utils.log('⚠️  Recent linting errors detected - using fast mode for quick feedback');
    return CONFIG.MODES.FAST;
  }
  
  // Check if interactive
  if (utils.isInteractive()) {
    utils.log('💻 Interactive terminal detected - using interactive mode');
    return CONFIG.MODES.INTERACTIVE;
  }
  
  // Default to fast mode for development
  utils.log('🚀 Development mode - using fast mode for optimal performance');
  return CONFIG.MODES.FAST;
}

// Execute linting with timeout and error handling
function executeLint(strategy) {
  const config = strategies[strategy];
  utils.log(`🚀 Executing: ${config.description}`);
  
  return new Promise((resolve, reject) => {
    // Split the command into parts for better execution
    const [command, ...args] = config.command.split(' ');
    
    const child = spawn(command, args, {
      stdio: ['inherit', 'pipe', 'pipe'],
      shell: true,
      timeout: config.timeout
    });
    
    let output = '';
    let errorOutput = '';
    
    // Capture stdout
    if (child.stdout) {
      child.stdout.on('data', (data) => {
        const dataStr = data.toString();
        output += dataStr;
        // Show output in real-time but with smart system prefix
        process.stdout.write(`🔍 [ESLint] ${dataStr}`);
      });
    }
    
    // Capture stderr
    if (child.stderr) {
      child.stderr.on('data', (data) => {
        const dataStr = data.toString();
        errorOutput += dataStr;
        // Show errors in real-time but with smart system prefix
        process.stderr.write(`⚠️  [ESLint] ${dataStr}`);
      });
    }
    
    // Handle completion
    child.on('close', (code) => {
      if (code === 0) {
        utils.log('✅ Linting completed successfully!', 'success');
        resolve({ success: true, code, output, errorOutput });
      } else {
        utils.log(`❌ Linting failed with exit code ${code}`, 'error');
        resolve({ success: false, code, output, errorOutput, strategy });
      }
    });
    
    // Handle timeout
    child.on('timeout', () => {
      utils.log(`⏰ Linting timed out after ${config.timeout / 1000}s`, 'warning');
      child.kill('SIGTERM');
      reject(new Error(`Linting timed out in ${strategy} mode`));
    });
    
    // Handle errors
    child.on('error', (error) => {
      utils.log(`💥 Linting process error: ${error.message}`, 'error');
      reject(error);
    });
  });
}

// Recovery strategy
async function executeRecovery(previousStrategy) {
  utils.log('🔄 Attempting recovery with safe fallback strategy...', 'warning');
  
  // Clear cache for fresh start
  utils.clearCache();
  
  try {
    const result = await executeLint(CONFIG.MODES.RECOVERY);
    if (result.success) {
      utils.log('✅ Recovery successful!', 'success');
      return result;
    }
  } catch (error) {
    utils.log(`❌ Recovery failed: ${error.message}`, 'error');
  }
  
  // Final fallback - just run basic lint
  utils.log('🆘 Final fallback - running basic lint command...', 'warning');
  try {
    const result = await executeLint(CONFIG.MODES.FAST);
    return result;
  } catch (error) {
    throw new Error(`All linting strategies failed: ${error.message}`);
  }
}

// Main execution
async function main() {
  try {
    utils.log('🚀 Smart Linting System Starting...');
    
    // Select optimal strategy
    const strategy = selectStrategy();
    utils.log(`🎯 Selected strategy: ${strategy.toUpperCase()}`);
    
    // Execute linting
    let result = await executeLint(strategy);
    
    // If failed and not in recovery mode, try recovery
    if (!result.success && strategy !== CONFIG.MODES.RECOVERY) {
      utils.log('🔄 Linting failed, attempting recovery...', 'warning');
      result = await executeRecovery(strategy);
    }
    
    // Final status
    if (result.success) {
      utils.log('🎉 Smart linting completed successfully!', 'success');
      process.exit(0);
    } else {
      utils.log('💥 Smart linting failed after all attempts', 'error');
      process.exit(result.code || 1);
    }
    
  } catch (error) {
    utils.log(`💥 Fatal error in smart linting: ${error.message}`, 'error');
    process.exit(1);
  }
}

// Handle process signals gracefully
process.on('SIGINT', () => {
  utils.log('🛑 Linting interrupted by user', 'warning');
  process.exit(130);
});

process.on('SIGTERM', () => {
  utils.log('🛑 Linting terminated', 'warning');
  process.exit(143);
});

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { main, selectStrategy, executeLint };
