#!/usr/bin/env node

/**
 * Simple Build Script with Core Optimizations
 * Focuses on reliability and basic performance improvements
 * 
 * Enhanced with timeout handling to prevent hanging processes
 * Now includes heartbeat monitoring for progress updates
 * Uses structured logging with correlation IDs
 * 
 * TODO: MIT-HERO-MOD: Future integration with @dct/mit-hero-core package
 * Currently using lib/ imports until package build issues are resolved
 */

const { spawnWithTimeout } = require('./timeout-wrapper');

// Import structured logging system
let logger;
try {
  const { buildLogger } = require('../lib/logger');
  logger = buildLogger;
} catch (error) {
  // Fallback to console if logger not available
  logger = {
    info: (msg, meta) => console.log(msg, meta),
    error: (msg, meta) => console.error(msg, meta),
    warn: (msg, meta) => console.warn(msg, meta),
    startTimer: () => 'fallback-timer',
    endTimer: () => undefined
  };
}

// Import heartbeat system
let heartbeat;
try {
  const heartbeatModule = require('../lib/heartbeat.js');
  heartbeat = heartbeatModule.heartbeat;
} catch (error) {
  // Fallback if heartbeat system not available
  heartbeat = {
    start: () => {},
    update: () => {},
    complete: () => {},
    stop: () => {}
  };
}

async function runBuild(buildType = 'build') {
  const operationId = logger.startTimer('build-process');
  logger.info(`Starting ${buildType} with optimizations`, { 
    buildType, 
    operationId,
    timestamp: new Date().toISOString()
  });
  
  // Start heartbeat monitoring for the build
  const buildId = `build-${buildType}-${Date.now()}`;
  heartbeat.start(buildId, `Next.js ${buildType}`, 5);
  
  try {
    heartbeat.update(buildId, 1, 'Initializing build process...');
    
    // Use timeout wrapper with 10 minute timeout for builds
    const result = await spawnWithTimeout(
      'next', 
      ['build', '--debug'], 
      {
        stdio: 'inherit',
        shell: true,
        env: {
          ...process.env,
          // Basic memory optimization
          NODE_OPTIONS: '--max-old-space-size=4096'
        }
      },
      10 * 60 * 1000 // 10 minute timeout
    );

    heartbeat.update(buildId, 4, 'Build process completed, finalizing...');

    if (result.success) {
      heartbeat.complete(buildId, 'Build completed successfully');
      const duration = logger.endTimer(operationId);
      logger.info(`${buildType} completed successfully`, { 
        buildType, 
        operationId,
        duration,
        buildId,
        exitCode: result.exitCode,
        timestamp: new Date().toISOString()
      });
    } else {
      heartbeat.complete(buildId, `Build failed with exit code ${result.exitCode}`);
      const duration = logger.endTimer(operationId);
      logger.error(`${buildType} failed`, { 
        buildType, 
        operationId,
        duration,
        buildId,
        exitCode: result.exitCode,
        stderr: result.stderr,
        timestamp: new Date().toISOString()
      });
      process.exit(result.exitCode);
    }
  } catch (error) {
    if (error.message.includes('timeout')) {
      heartbeat.complete(buildId, 'Build timed out');
      const duration = logger.endTimer(operationId);
      logger.error('Build timeout', { 
        buildType, 
        operationId,
        duration,
        buildId,
        error: error.message,
        timestamp: new Date().toISOString()
      });
      process.exit(124); // SIGTERM exit code
    } else {
      heartbeat.complete(buildId, `Build error: ${error.message}`);
      const duration = logger.endTimer(operationId);
      logger.error('Build error', { 
        buildType, 
        operationId,
        duration,
        buildId,
        error: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString()
      });
      process.exit(1);
    }
  }
}

// CLI interface
const args = process.argv.slice(2);
const buildType = args[0] || 'build';

runBuild(buildType);
