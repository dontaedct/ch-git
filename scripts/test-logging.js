#!/usr/bin/env node

/**
 * 🧪 TEST LOGGING SYSTEM
 * 
 * Demonstrates the new structured logging system with:
 * - Multiple log levels
 * - Correlation IDs
 * - Performance tracking
 * - File logging
 * - Environment-specific configuration
 */

const { logger, LogLevel } = require('../lib/logger.js');

// Enable file logging for testing
logger.enableFileLogging('./logs/test-logging.log');

async function testLogging() {
  const operationId = logger.startTimer('test-operation');
  
  logger.info('Starting logging system test', {
    operationId,
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });

  // Test different log levels
  logger.debug('This is a debug message', { level: 'debug', test: true });
  logger.info('This is an info message', { level: 'info', test: true });
  logger.warn('This is a warning message', { level: 'warn', test: true });
  logger.error('This is an error message', { level: 'error', test: true });

  // Test performance tracking
  const timerId = logger.startTimer('test-timer');
  await new Promise(resolve => setTimeout(resolve, 100)); // Simulate work
  const duration = logger.endTimer(timerId);
  
  logger.info('Timer test completed', {
    operationId,
    timerId,
    duration,
    timestamp: new Date().toISOString()
  });

  // Test error logging with stack traces
  try {
    throw new Error('Test error for logging');
  } catch (error) {
    logger.error('Caught test error', {
      operationId,
      error,
      timestamp: new Date().toISOString()
    });
  }

  // Test correlation IDs
  const newLogger = logger.withCorrelation();
  newLogger.info('New correlation ID test', {
    operationId,
    timestamp: new Date().toISOString()
  });

  // Test operation-specific logger
  const buildLogger = logger.withOperation('build-test');
  buildLogger.info('Build operation test', {
    operationId,
    timestamp: new Date().toISOString()
  });

  // End main operation
  const totalDuration = logger.endTimer(operationId);
  
  logger.info('Logging system test completed', {
    operationId,
    totalDuration,
    timestamp: new Date().toISOString()
  });

  // Show performance metrics
  const metrics = logger.getMetrics('test-timer');
  if (metrics) {
    logger.info('Performance metrics', {
      operationId,
      metrics,
      timestamp: new Date().toISOString()
    });
  }

  console.log('\n✅ Logging system test completed!');
  console.log(`📁 Logs saved to: ./logs/test-logging.log`);
  console.log(`🔗 Operation ID: ${operationId}`);
  console.log(`⏱️  Total duration: ${totalDuration?.toFixed(2)}ms`);
}

// Run the test
testLogging().catch(error => {
  logger.error('Test failed', { error: error.message, stack: error.stack });
  process.exit(1);
});
