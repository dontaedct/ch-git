/**
 * 🚀 MIT HERO SYSTEM - STRUCTURED LOGGER (JavaScript Version)
 * 
 * Advanced structured logging with correlation IDs, performance metrics,
 * and environment-specific configuration for production-grade monitoring.
 * 
 * This is the JavaScript version for use in Node.js scripts.
 */

const { performance } = require('perf_hooks');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

// Log levels with numeric values for filtering
const LogLevel = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3,
  FATAL: 4
};

// Log level names for display
const LOG_LEVEL_NAMES = {
  [LogLevel.DEBUG]: 'DEBUG',
  [LogLevel.INFO]: 'INFO',
  [LogLevel.WARN]: 'WARN',
  [LogLevel.ERROR]: 'ERROR',
  [LogLevel.FATAL]: 'FATAL'
};

// Default configuration
const DEFAULT_CONFIG = {
  level: process.env.NODE_ENV === 'production' ? LogLevel.INFO : LogLevel.DEBUG,
  enableConsole: true,
  enableFile: false,
  maxFileSize: 10 * 1024 * 1024, // 10MB
  maxFiles: 5,
  enablePerformance: process.env.NODE_ENV !== 'production',
  enableCorrelation: true,
  format: process.env.NODE_ENV === 'production' ? 'json' : 'pretty',
  includeStack: process.env.NODE_ENV !== 'production',
  includePerformance: process.env.NODE_ENV !== 'production'
};

// Performance monitoring
class PerformanceMonitor {
  constructor() {
    this.startTimes = new Map();
    this.metrics = new Map();
  }

  startTimer(operationId) {
    this.startTimes.set(operationId, performance.now());
  }

  endTimer(operationId) {
    const startTime = this.startTimes.get(operationId);
    if (startTime) {
      const duration = performance.now() - startTime;
      this.startTimes.delete(operationId);
      
      // Store metric for analysis
      if (!this.metrics.has(operationId)) {
        this.metrics.set(operationId, []);
      }
      this.metrics.get(operationId).push(duration);
      
      return duration;
    }
    return undefined;
  }

  getMetrics(operationId) {
    const durations = this.metrics.get(operationId);
    if (!durations || durations.length === 0) return undefined;

    const sum = durations.reduce((a, b) => a + b, 0);
    return {
      count: durations.length,
      avg: sum / durations.length,
      min: Math.min(...durations),
      max: Math.max(...durations)
    };
  }

  clearMetrics() {
    this.metrics.clear();
    this.startTimes.clear();
  }
}

// File rotation utility
class LogFileManager {
  constructor(config) {
    this.config = config;
    this.currentFileSize = 0;
    this.ensureLogDirectory();
  }

  ensureLogDirectory() {
    if (this.config.filePath) {
      const dir = path.dirname(this.config.filePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    }
  }

  rotateLogFile() {
    if (!this.config.filePath) return;

    try {
      const stats = fs.statSync(this.config.filePath);
      if (stats.size >= this.config.maxFileSize) {
        this.rotateLogFiles();
      }
    } catch (error) {
      // File doesn't exist or can't be accessed
    }
  }

  rotateLogFiles() {
    if (!this.config.filePath) return;

    try {
      const basePath = this.config.filePath.replace(/\.[^/.]+$/, '');
      const ext = path.extname(this.config.filePath);

      // Remove oldest log file
      const oldestFile = `${basePath}.${this.config.maxFiles - 1}${ext}`;
      if (fs.existsSync(oldestFile)) {
        fs.unlinkSync(oldestFile);
      }

      // Shift existing log files
      for (let i = this.config.maxFiles - 2; i >= 0; i--) {
        const oldFile = `${basePath}.${i}${ext}`;
        const newFile = `${basePath}.${i + 1}${ext}`;
        if (fs.existsSync(oldFile)) {
          fs.renameSync(oldFile, newFile);
        }
      }

      // Rename current log file
      const newFile = `${basePath}.0${ext}`;
      if (fs.existsSync(this.config.filePath)) {
        fs.renameSync(this.config.filePath, newFile);
      }
    } catch (error) {
      console.error('Failed to rotate log files:', error);
    }
  }

  writeLog(entry) {
    if (!this.config.filePath) return;

    try {
      this.rotateLogFile();
      
      const logLine = this.formatLogEntry(entry) + '\n';
      fs.appendFileSync(this.config.filePath, logLine, 'utf8');
      this.currentFileSize += logLine.length;
    } catch (error) {
      console.error('Failed to write to log file:', error);
    }
  }

  formatLogEntry(entry) {
    switch (this.config.format) {
      case 'json':
        return JSON.stringify(entry);
      case 'pretty':
        return this.formatPretty(entry);
      case 'minimal':
        return this.formatMinimal(entry);
      default:
        return JSON.stringify(entry);
    }
  }

  formatPretty(entry) {
    const timestamp = new Date(entry.timestamp).toISOString();
    const level = entry.levelName.padEnd(5);
    const correlation = entry.correlationId.substring(0, 8);
    const operation = entry.operationId ? `[${entry.operationId}]` : '';
    const duration = entry.duration ? ` (${entry.duration.toFixed(2)}ms)` : '';
    
    let result = `${timestamp} ${level} [${correlation}]${operation} ${entry.message}${duration}`;
    
    if (entry.metadata && Object.keys(entry.metadata).length > 0) {
      result += ` | ${JSON.stringify(entry.metadata)}`;
    }
    
    if (entry.error) {
      result += ` | Error: ${entry.error.message}`;
    }
    
    return result;
  }

  formatMinimal(entry) {
    const timestamp = new Date(entry.timestamp).toISOString();
    const level = entry.levelName.charAt(0);
    const correlation = entry.correlationId.substring(0, 6);
    
    return `${timestamp} ${level} [${correlation}] ${entry.message}`;
  }
}

// Main Logger class
class Logger {
  constructor(config = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.performanceMonitor = new PerformanceMonitor();
    this.fileManager = new LogFileManager(this.config);
    this.correlationId = this.generateCorrelationId();
    this.operationId = undefined;
    
    // Set up process exit handlers
    this.setupProcessHandlers();
  }

  setupProcessHandlers() {
    process.on('exit', () => {
      this.info('Logger shutting down');
    });

    process.on('uncaughtException', (error) => {
      this.fatal('Uncaught exception', { error });
    });

    process.on('unhandledRejection', (reason) => {
      this.error('Unhandled rejection', { reason });
    });
  }

  generateCorrelationId() {
    return uuidv4();
  }

  generateOperationId() {
    return uuidv4().substring(0, 8);
  }

  // Create a new logger instance with a specific operation context
  withOperation(operationName) {
    const logger = new Logger(this.config);
    logger.correlationId = this.correlationId;
    logger.operationId = operationName;
    return logger;
  }

  // Create a new logger instance with a new correlation ID
  withCorrelation() {
    const logger = new Logger(this.config);
    logger.correlationId = this.generateCorrelationId();
    return logger;
  }

  // Start timing an operation
  startTimer(operationName) {
    const operationId = this.generateOperationId();
    this.performanceMonitor.startTimer(operationId);
    return operationId;
  }

  // End timing an operation
  endTimer(operationId) {
    return this.performanceMonitor.endTimer(operationId);
  }

  // Get performance metrics for an operation
  getMetrics(operationName) {
    return this.performanceMonitor.getMetrics(operationName);
  }

  // Log methods
  debug(message, metadata) {
    this.log(LogLevel.DEBUG, message, metadata);
  }

  info(message, metadata) {
    this.log(LogLevel.INFO, message, metadata);
  }

  warn(message, metadata) {
    this.log(LogLevel.WARN, message, metadata);
  }

  error(message, metadata) {
    this.log(LogLevel.ERROR, message, metadata);
  }

  fatal(message, metadata) {
    this.log(LogLevel.FATAL, message, metadata);
  }

  // Main logging method
  log(level, message, metadata) {
    if (level < this.config.level) return;

    const entry = {
      timestamp: new Date().toISOString(),
      level,
      levelName: LOG_LEVEL_NAMES[level],
      message,
      correlationId: this.correlationId,
      operationId: this.operationId,
      metadata,
      context: this.getCallerContext(),
      performance: this.config.includePerformance ? this.getPerformanceData() : undefined
    };

    // Add error information if present
    if (metadata && metadata.error instanceof Error) {
      entry.error = metadata.error;
      if (this.config.includeStack) {
        entry.stack = metadata.error.stack;
      }
    }

    // Add duration if operation is being timed
    if (this.operationId) {
      const duration = this.performanceMonitor.endTimer(this.operationId);
      if (duration !== undefined) {
        entry.duration = duration;
      }
    }

    // Output to configured destinations
    if (this.config.enableConsole) {
      this.outputToConsole(entry);
    }

    if (this.config.enableFile) {
      this.fileManager.writeLog(entry);
    }
  }

  getCallerContext() {
    if (!this.config.includeStack) return undefined;

    try {
      const stack = new Error().stack;
      if (!stack) return undefined;

      const lines = stack.split('\n');
      // Skip the first few lines (Error constructor, this method, log method)
      const callerLine = lines[3] || lines[2];
      
      if (callerLine) {
        const match = callerLine.match(/at\s+(.+?)\s+\((.+):(\d+):(\d+)\)/);
        if (match) {
          return {
            function: match[1],
            file: match[2],
            line: parseInt(match[3], 10),
            column: parseInt(match[4], 10)
          };
        }
      }
    } catch (error) {
      // Ignore errors in context extraction
    }

    return undefined;
  }

  getPerformanceData() {
    if (!this.config.enablePerformance) return undefined;

    try {
      return {
        memory: process.memoryUsage(),
        cpu: process.cpuUsage().user / 1000 // Convert to milliseconds
      };
    } catch (error) {
      return undefined;
    }
  }

  outputToConsole(entry) {
    if (process.env.NODE_ENV === 'production' && entry.level === LogLevel.DEBUG) {
      return; // Skip debug logs in production
    }

    const prefix = `[${entry.levelName}] [${entry.correlationId.substring(0, 8)}]`;
    const operation = entry.operationId ? ` [${entry.operationId}]` : '';
    const duration = entry.duration ? ` (${entry.duration.toFixed(2)}ms)` : '';
    
    const message = `${prefix}${operation} ${entry.message}${duration}`;
    
    switch (entry.level) {
      case LogLevel.DEBUG:
        console.debug(message);
        break;
      case LogLevel.INFO:
        console.info(message);
        break;
      case LogLevel.WARN:
        console.warn(message);
        break;
      case LogLevel.ERROR:
      case LogLevel.FATAL:
        console.error(message);
        if (entry.error && this.config.includeStack) {
          console.error(entry.error.stack);
        }
        break;
    }

    // Output metadata if present
    if (entry.metadata && Object.keys(entry.metadata).length > 0) {
      console.log('Metadata:', entry.metadata);
    }
  }

  // Utility methods
  setLevel(level) {
    this.config.level = level;
  }

  enableFileLogging(filePath) {
    this.config.enableFile = true;
    this.config.filePath = filePath;
    this.fileManager = new LogFileManager(this.config);
  }

  disableFileLogging() {
    this.config.enableFile = false;
  }

  clearPerformanceMetrics() {
    this.performanceMonitor.clearMetrics();
  }

  // Get current configuration
  getConfig() {
    return { ...this.config };
  }
}

// Create default logger instance
const logger = new Logger();

// Create specialized loggers
const routeLogger = logger.withOperation('route');
const apiLogger = logger.withOperation('api');
const buildLogger = logger.withOperation('build');
const guardianLogger = logger.withOperation('guardian');
const doctorLogger = logger.withOperation('doctor');

// Back-compat exports
function log(...args) {
  logger.info(args.join(' '));
}

function error(...args) {
  logger.error(args.join(' '));
}

/** Route-specific logger for API endpoints */
function createRouteLogger(method, path) {
  const routeLogger = logger.withOperation(`route:${method}:${path}`);
  
  return {
    log: (status, startTime) => {
      const duration = Date.now() - startTime;
      routeLogger.info(`${method} ${path} - ${status}`, { 
        status, 
        duration,
        method,
        path 
      });
    }
  };
}

/** Back-compat default export for sites that import default */
const legacyLogger = { log, error };

// Export everything
module.exports = {
  Logger,
  LogLevel,
  LOG_LEVEL_NAMES,
  logger,
  routeLogger,
  apiLogger,
  buildLogger,
  guardianLogger,
  doctorLogger,
  log,
  error,
  createRouteLogger,
  default: legacyLogger
};
