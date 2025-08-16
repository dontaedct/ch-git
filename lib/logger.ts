/**
 * 🚀 MIT HERO SYSTEM - STRUCTURED LOGGER
 * 
 * Advanced structured logging with correlation IDs, performance metrics,
 * and environment-specific configuration for production-grade monitoring.
 * 
 * Features:
 * - Multiple log levels (debug, info, warn, error, fatal)
 * - Structured JSON output with metadata
 * - Correlation IDs for operation tracking
 * - Performance metrics and timing
 * - Environment-specific configuration
 * - File and console output options
 * - Memory leak prevention
 * - Production-safe logging
 */

import { performance } from 'perf_hooks';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

// Log levels with numeric values for filtering
export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  FATAL = 4
}

// Log level names for display
export const LOG_LEVEL_NAMES: Record<LogLevel, string> = {
  [LogLevel.DEBUG]: 'DEBUG',
  [LogLevel.INFO]: 'INFO',
  [LogLevel.WARN]: 'WARN',
  [LogLevel.ERROR]: 'ERROR',
  [LogLevel.FATAL]: 'FATAL'
};

// Log entry interface
export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  levelName: string;
  message: string;
  correlationId: string;
  operationId?: string;
  duration?: number;
  metadata?: Record<string, any>;
  error?: Error;
  stack?: string;
  context?: {
    file?: string;
    function?: string;
    line?: number;
    column?: number;
  };
  performance?: {
    memory: NodeJS.MemoryUsage;
    cpu: number;
  };
}

// Logger configuration
export interface LoggerConfig {
  level: LogLevel;
  enableConsole: boolean;
  enableFile: boolean;
  filePath?: string;
  maxFileSize: number;
  maxFiles: number;
  enablePerformance: boolean;
  enableCorrelation: boolean;
  format: 'json' | 'pretty' | 'minimal';
  includeStack: boolean;
  includePerformance: boolean;
}

// Default configuration
const DEFAULT_CONFIG: LoggerConfig = {
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
  private startTimes = new Map<string, number>();
  private metrics = new Map<string, number[]>();

  startTimer(operationId: string): void {
    this.startTimes.set(operationId, performance.now());
  }

  endTimer(operationId: string): number | undefined {
    const startTime = this.startTimes.get(operationId);
    if (startTime) {
      const duration = performance.now() - startTime;
      this.startTimes.delete(operationId);
      
      // Store metric for analysis
      if (!this.metrics.has(operationId)) {
        this.metrics.set(operationId, []);
      }
      this.metrics.get(operationId)!.push(duration);
      
      return duration;
    }
    return undefined;
  }

  getMetrics(operationId: string): { count: number; avg: number; min: number; max: number } | undefined {
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

  clearMetrics(): void {
    this.metrics.clear();
    this.startTimes.clear();
  }
}

// File rotation utility
class LogFileManager {
  private config: LoggerConfig;
  private currentFileSize = 0;

  constructor(config: LoggerConfig) {
    this.config = config;
    this.ensureLogDirectory();
  }

  private ensureLogDirectory(): void {
    if (this.config.filePath) {
      const dir = path.dirname(this.config.filePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    }
  }

  private rotateLogFile(): void {
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

  private rotateLogFiles(): void {
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

  writeLog(entry: LogEntry): void {
    if (!this.config.filePath) return;

    try {
      this.rotateLogFile();
      
      const logLine = `${this.formatLogEntry(entry)}\n`;
      fs.appendFileSync(this.config.filePath, logLine, 'utf8');
      this.currentFileSize += logLine.length;
    } catch (error) {
      console.error('Failed to write to log file:', error);
    }
  }

  private formatLogEntry(entry: LogEntry): string {
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

  private formatPretty(entry: LogEntry): string {
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

  private formatMinimal(entry: LogEntry): string {
    const timestamp = new Date(entry.timestamp).toISOString();
    const level = entry.levelName.charAt(0);
    const correlation = entry.correlationId.substring(0, 6);
    
    return `${timestamp} ${level} [${correlation}] ${entry.message}`;
  }
}

// Main Logger class
export class Logger {
  private config: LoggerConfig;
  private performanceMonitor: PerformanceMonitor;
  private fileManager: LogFileManager;
  private correlationId: string;
  private operationId?: string;

  constructor(config: Partial<LoggerConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.performanceMonitor = new PerformanceMonitor();
    this.fileManager = new LogFileManager(this.config);
    this.correlationId = this.generateCorrelationId();
    
    // Set up process exit handlers
    this.setupProcessHandlers();
  }

  private setupProcessHandlers(): void {
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

  private generateCorrelationId(): string {
    return uuidv4();
  }

  private generateOperationId(): string {
    return uuidv4().substring(0, 8);
  }

  // Create a new logger instance with a specific operation context
  withOperation(operationName: string): Logger {
    const logger = new Logger(this.config);
    logger.correlationId = this.correlationId;
    logger.operationId = operationName;
    return logger;
  }

  // Create a new logger instance with a new correlation ID
  withCorrelation(): Logger {
    const logger = new Logger(this.config);
    logger.correlationId = this.generateCorrelationId();
    return logger;
  }

  // Start timing an operation
  startTimer(operationName: string): string {
    const operationId = this.generateOperationId();
    this.performanceMonitor.startTimer(operationId);
    return operationId;
  }

  // End timing an operation
  endTimer(operationId: string): number | undefined {
    return this.performanceMonitor.endTimer(operationId);
  }

  // Get performance metrics for an operation
  getMetrics(operationName: string) {
    return this.performanceMonitor.getMetrics(operationName);
  }

  // Log methods
  debug(message: string, metadata?: Record<string, any>): void {
    this.log(LogLevel.DEBUG, message, metadata);
  }

  info(message: string, metadata?: Record<string, any>): void {
    this.log(LogLevel.INFO, message, metadata);
  }

  warn(message: string, metadata?: Record<string, any>): void {
    this.log(LogLevel.WARN, message, metadata);
  }

  error(message: string, metadata?: Record<string, any>): void {
    this.log(LogLevel.ERROR, message, metadata);
  }

  fatal(message: string, metadata?: Record<string, any>): void {
    this.log(LogLevel.FATAL, message, metadata);
  }

  // Main logging method
  private log(level: LogLevel, message: string, metadata?: Record<string, any>): void {
    if (level < this.config.level) return;

    const entry: LogEntry = {
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
    if (metadata?.error instanceof Error) {
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

  private getCallerContext(): LogEntry['context'] {
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

  private getPerformanceData(): LogEntry['performance'] {
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

  private outputToConsole(entry: LogEntry): void {
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
  setLevel(level: LogLevel): void {
    this.config.level = level;
  }

  enableFileLogging(filePath: string): void {
    this.config.enableFile = true;
    this.config.filePath = filePath;
    this.fileManager = new LogFileManager(this.config);
  }

  disableFileLogging(): void {
    this.config.enableFile = false;
  }

  clearPerformanceMetrics(): void {
    this.performanceMonitor.clearMetrics();
  }

  // Get current configuration
  getConfig(): LoggerConfig {
    return { ...this.config };
  }
}

// Create default logger instance
export const logger = new Logger();

// Create specialized loggers
export const routeLogger = logger.withOperation('route');
export const apiLogger = logger.withOperation('api');
export const buildLogger = logger.withOperation('build');
export const guardianLogger = logger.withOperation('guardian');
export const doctorLogger = logger.withOperation('doctor');

// Back-compat exports
export function log(...args: unknown[]): void {
  logger.info(args.join(' '));
}

export function error(...args: unknown[]): void {
  logger.error(args.join(' '));
}

/** Route-specific logger for API endpoints */
export function createRouteLogger(method: string, path: string) {
  const routeLogger = logger.withOperation(`route:${method}:${path}`);
  
  return {
    log: (status: number, startTime: number) => {
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
export default legacyLogger;

// Export types for external use
