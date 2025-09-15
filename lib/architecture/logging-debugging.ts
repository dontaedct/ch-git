/**
 * @fileoverview HT-008.6.4: Comprehensive Logging and Debugging System
 * @module lib/architecture/logging-debugging
 * @author OSS Hero System
 * @version 1.0.0
 * 
 * UNIVERSAL HEADER: Hero Tasks System Integration
 * Task: HT-008.6.4 - Add comprehensive logging and debugging
 * Focus: Microservice-ready architecture with enterprise-grade observability
 * Methodology: AUDIT → DECIDE → APPLY → VERIFY (strict adherence)
 * Risk Level: MEDIUM (architecture refactoring)
 */

/**
 * Comprehensive Logging and Debugging System
 * 
 * Implements enterprise-grade logging and debugging capabilities:
 * - Structured logging with multiple levels
 * - Context-aware logging with correlation IDs
 * - Performance monitoring and profiling
 * - Error tracking and stack trace analysis
 * - Log aggregation and filtering
 * - Debug mode with detailed information
 * - Log rotation and retention policies
 */

import { container, Injectable, Inject } from './dependency-injection';

// ============================================================================
// CORE LOGGING TYPES
// ============================================================================

export enum LogLevel {
  TRACE = 0,
  DEBUG = 1,
  INFO = 2,
  WARN = 3,
  ERROR = 4,
  FATAL = 5
}

export interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: number;
  context?: LogContext;
  metadata?: Record<string, any>;
  error?: Error;
  stack?: string;
  correlationId?: string;
  userId?: string;
  sessionId?: string;
  requestId?: string;
  component?: string;
  operation?: string;
  duration?: number;
  memoryUsage?: NodeJS.MemoryUsage;
  performance?: PerformanceMetrics;
}

export interface LogContext {
  component: string;
  operation: string;
  userId?: string;
  sessionId?: string;
  requestId?: string;
  correlationId?: string;
  environment: string;
  version: string;
  buildId?: string;
}

export interface PerformanceMetrics {
  cpuUsage?: number;
  memoryUsage?: NodeJS.MemoryUsage;
  heapUsed?: number;
  heapTotal?: number;
  externalMemory?: number;
  arrayBuffers?: number;
  rss?: number;
  heapUsedPercentage?: number;
}

export interface LogFilter {
  level?: LogLevel;
  component?: string;
  operation?: string;
  userId?: string;
  sessionId?: string;
  correlationId?: string;
  timeRange?: {
    start: number;
    end: number;
  };
  messagePattern?: RegExp;
}

export interface LogConfig {
  level: LogLevel;
  enableConsole: boolean;
  enableFile: boolean;
  enableRemote: boolean;
  enablePerformance: boolean;
  enableStackTrace: boolean;
  maxFileSize: number;
  maxFiles: number;
  retentionDays: number;
  remoteEndpoint?: string;
  remoteApiKey?: string;
  filters: LogFilter[];
}

// ============================================================================
// LOGGER IMPLEMENTATION
// ============================================================================

@Injectable('Logger')
export class Logger {
  private config: LogConfig;
  private context: LogContext;
  private logs: LogEntry[] = [];
  private performanceStartTimes = new Map<string, number>();
  private correlationId?: string;

  constructor(config: LogConfig, context: LogContext) {
    this.config = config;
    this.context = context;
    this.correlationId = this.generateCorrelationId();
  }

  // ============================================================================
  // LOGGING METHODS
  // ============================================================================

  trace(message: string, metadata?: Record<string, any>): void {
    this.log(LogLevel.TRACE, message, metadata);
  }

  debug(message: string, metadata?: Record<string, any>): void {
    this.log(LogLevel.DEBUG, message, metadata);
  }

  info(message: string, metadata?: Record<string, any>): void {
    this.log(LogLevel.INFO, message, metadata);
  }

  warn(message: string, metadata?: Record<string, any>): void {
    this.log(LogLevel.WARN, message, metadata);
  }

  error(message: string, error?: Error, metadata?: Record<string, any>): void {
    this.log(LogLevel.ERROR, message, metadata, error);
  }

  fatal(message: string, error?: Error, metadata?: Record<string, any>): void {
    this.log(LogLevel.FATAL, message, metadata, error);
  }

  private log(
    level: LogLevel,
    message: string,
    metadata?: Record<string, any>,
    error?: Error
  ): void {
    if (level < this.config.level) {
      return;
    }

    const logEntry: LogEntry = {
      level,
      message,
      timestamp: Date.now(),
      context: { ...this.context },
      metadata,
      error,
      correlationId: this.correlationId,
      component: this.context.component,
      operation: this.context.operation,
      userId: this.context.userId,
      sessionId: this.context.sessionId,
      requestId: this.context.requestId
    };

    // Add stack trace if enabled
    if (this.config.enableStackTrace && (level >= LogLevel.ERROR || error)) {
      logEntry.stack = this.getStackTrace();
    }

    // Add performance metrics if enabled
    if (this.config.enablePerformance) {
      logEntry.performance = this.getPerformanceMetrics();
      logEntry.memoryUsage = process.memoryUsage();
    }

    // Apply filters
    if (this.shouldLog(logEntry)) {
      this.processLogEntry(logEntry);
    }
  }

  // ============================================================================
  // PERFORMANCE MONITORING
  // ============================================================================

  startTimer(operation: string): void {
    this.performanceStartTimes.set(operation, Date.now());
  }

  endTimer(operation: string): number {
    const startTime = this.performanceStartTimes.get(operation);
    if (!startTime) {
      this.warn(`Timer for operation '${operation}' was not started`);
      return 0;
    }

    const duration = Date.now() - startTime;
    this.performanceStartTimes.delete(operation);
    
    this.debug(`Operation '${operation}' completed`, {
      duration,
      operation
    });

    return duration;
  }

  measure<T>(operation: string, fn: () => T): T {
    this.startTimer(operation);
    try {
      const result = fn();
      this.endTimer(operation);
      return result;
    } catch (error) {
      this.endTimer(operation);
      throw error;
    }
  }

  async measureAsync<T>(operation: string, fn: () => Promise<T>): Promise<T> {
    this.startTimer(operation);
    try {
      const result = await fn();
      this.endTimer(operation);
      return result;
    } catch (error) {
      this.endTimer(operation);
      throw error;
    }
  }

  // ============================================================================
  // CONTEXT MANAGEMENT
  // ============================================================================

  setContext(context: Partial<LogContext>): void {
    this.context = { ...this.context, ...context };
  }

  setCorrelationId(correlationId: string): void {
    this.correlationId = correlationId;
    this.context.correlationId = correlationId;
  }

  createChildLogger(component: string, operation: string): Logger {
    const childContext: LogContext = {
      ...this.context,
      component,
      operation,
      correlationId: this.correlationId
    };

    return new Logger(this.config, childContext);
  }

  // ============================================================================
  // LOG PROCESSING
  // ============================================================================

  private processLogEntry(entry: LogEntry): void {
    this.logs.push(entry);

    // Console output
    if (this.config.enableConsole) {
      this.outputToConsole(entry);
    }

    // File output
    if (this.config.enableFile) {
      this.outputToFile(entry);
    }

    // Remote output
    if (this.config.enableRemote) {
      this.outputToRemote(entry);
    }

    // Cleanup old logs
    this.cleanupLogs();
  }

  private outputToConsole(entry: LogEntry): void {
    const timestamp = new Date(entry.timestamp).toISOString();
    const level = LogLevel[entry.level];
    const context = entry.context ? `[${entry.context.component}:${entry.context.operation}]` : '';
    const correlation = entry.correlationId ? `[${entry.correlationId}]` : '';
    
    const message = `${timestamp} ${level} ${context}${correlation} ${entry.message}`;
    
    switch (entry.level) {
      case LogLevel.TRACE:
      case LogLevel.DEBUG:
        console.debug(message, entry.metadata);
        break;
      case LogLevel.INFO:
        console.info(message, entry.metadata);
        break;
      case LogLevel.WARN:
        console.warn(message, entry.metadata);
        break;
      case LogLevel.ERROR:
      case LogLevel.FATAL:
        console.error(message, entry.metadata, entry.error);
        break;
    }
  }

  private outputToFile(entry: LogEntry): void {
    // Implementation would write to file system
    // This would include log rotation and retention policies
    console.log('File logging not implemented:', entry);
  }

  private async outputToRemote(entry: LogEntry): Promise<void> {
    if (!this.config.remoteEndpoint) return;

    try {
      const response = await fetch(this.config.remoteEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.remoteApiKey}`
        },
        body: JSON.stringify(entry)
      });

      if (!response.ok) {
        console.error('Failed to send log to remote endpoint:', response.status);
      }
    } catch (error) {
      console.error('Error sending log to remote endpoint:', error);
    }
  }

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================

  private shouldLog(entry: LogEntry): boolean {
    for (const filter of this.config.filters) {
      if (filter.level && entry.level < filter.level) return false;
      if (filter.component && entry.component !== filter.component) return false;
      if (filter.operation && entry.operation !== filter.operation) return false;
      if (filter.userId && entry.userId !== filter.userId) return false;
      if (filter.sessionId && entry.sessionId !== filter.sessionId) return false;
      if (filter.correlationId && entry.correlationId !== filter.correlationId) return false;
      if (filter.timeRange && (entry.timestamp < filter.timeRange.start || entry.timestamp > filter.timeRange.end)) return false;
      if (filter.messagePattern && !filter.messagePattern.test(entry.message)) return false;
    }
    return true;
  }

  private getStackTrace(): string {
    const stack = new Error().stack;
    return stack ? stack.split('\n').slice(3).join('\n') : '';
  }

  private getPerformanceMetrics(): PerformanceMetrics {
    const usage = process.memoryUsage();
    return {
      memoryUsage: usage,
      heapUsed: usage.heapUsed,
      heapTotal: usage.heapTotal,
      externalMemory: usage.external,
      arrayBuffers: usage.arrayBuffers,
      rss: usage.rss,
      heapUsedPercentage: (usage.heapUsed / usage.heapTotal) * 100
    };
  }

  private generateCorrelationId(): string {
    return `corr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private cleanupLogs(): void {
    const cutoffTime = Date.now() - (this.config.retentionDays * 24 * 60 * 60 * 1000);
    this.logs = this.logs.filter(log => log.timestamp > cutoffTime);
  }

  // ============================================================================
  // QUERY AND ANALYSIS
  // ============================================================================

  getLogs(filter?: LogFilter): LogEntry[] {
    if (!filter) return [...this.logs];

    return this.logs.filter(log => {
      if (filter.level && log.level < filter.level) return false;
      if (filter.component && log.component !== filter.component) return false;
      if (filter.operation && log.operation !== filter.operation) return false;
      if (filter.userId && log.userId !== filter.userId) return false;
      if (filter.sessionId && log.sessionId !== filter.sessionId) return false;
      if (filter.correlationId && log.correlationId !== filter.correlationId) return false;
      if (filter.timeRange && (log.timestamp < filter.timeRange.start || log.timestamp > filter.timeRange.end)) return false;
      if (filter.messagePattern && !filter.messagePattern.test(log.message)) return false;
      return true;
    });
  }

  getErrorLogs(): LogEntry[] {
    return this.logs.filter(log => log.level >= LogLevel.ERROR);
  }

  getPerformanceLogs(): LogEntry[] {
    return this.logs.filter(log => log.performance);
  }

  getLogStats(): {
    total: number;
    byLevel: Record<string, number>;
    byComponent: Record<string, number>;
    errorRate: number;
    averageResponseTime: number;
  } {
    const stats = {
      total: this.logs.length,
      byLevel: {} as Record<string, number>,
      byComponent: {} as Record<string, number>,
      errorRate: 0,
      averageResponseTime: 0
    };

    let errorCount = 0;
    let totalDuration = 0;
    let durationCount = 0;

    for (const log of this.logs) {
      // Count by level
      const level = LogLevel[log.level];
      stats.byLevel[level] = (stats.byLevel[level] || 0) + 1;

      // Count by component
      if (log.component) {
        stats.byComponent[log.component] = (stats.byComponent[log.component] || 0) + 1;
      }

      // Count errors
      if (log.level >= LogLevel.ERROR) {
        errorCount++;
      }

      // Calculate duration
      if (log.duration) {
        totalDuration += log.duration;
        durationCount++;
      }
    }

    stats.errorRate = stats.total > 0 ? (errorCount / stats.total) * 100 : 0;
    stats.averageResponseTime = durationCount > 0 ? totalDuration / durationCount : 0;

    return stats;
  }
}

// ============================================================================
// DEBUGGING SYSTEM
// ============================================================================

@Injectable('Debugger')
export class Debugger {
  private logger: Logger;
  private breakpoints = new Map<string, boolean>();
  private watchExpressions = new Map<string, () => any>();
  private debugMode = false;

  constructor(logger: Logger) {
    this.logger = logger;
  }

  enableDebugMode(): void {
    this.debugMode = true;
    this.logger.info('Debug mode enabled');
  }

  disableDebugMode(): void {
    this.debugMode = false;
    this.logger.info('Debug mode disabled');
  }

  setBreakpoint(name: string, condition?: () => boolean): void {
    this.breakpoints.set(name, true);
    this.logger.debug(`Breakpoint set: ${name}`, { condition: condition?.toString() });
  }

  removeBreakpoint(name: string): void {
    this.breakpoints.delete(name);
    this.logger.debug(`Breakpoint removed: ${name}`);
  }

  checkBreakpoint(name: string, context?: Record<string, any>): void {
    if (this.debugMode && this.breakpoints.get(name)) {
      this.logger.debug(`Breakpoint hit: ${name}`, context);
      // In a real implementation, this would pause execution
      console.log(`🔍 Breakpoint: ${name}`, context);
    }
  }

  watch(name: string, expression: () => any): void {
    this.watchExpressions.set(name, expression);
    this.logger.debug(`Watch expression added: ${name}`);
  }

  unwatch(name: string): void {
    this.watchExpressions.delete(name);
    this.logger.debug(`Watch expression removed: ${name}`);
  }

  evaluateWatches(): Record<string, any> {
    const results: Record<string, any> = {};
    
    for (const [name, expression] of this.watchExpressions) {
      try {
        results[name] = expression();
      } catch (error) {
        results[name] = `Error: ${error}`;
      }
    }

    return results;
  }

  inspect(object: any, name?: string): void {
    if (this.debugMode) {
      const inspection = {
        name: name || 'object',
        type: typeof object,
        constructor: object?.constructor?.name,
        keys: object && typeof object === 'object' ? Object.keys(object) : undefined,
        value: object
      };

      this.logger.debug('Object inspection', inspection);
      console.log('🔍 Inspection:', inspection);
    }
  }

  traceExecution<T>(operation: string, fn: () => T): T {
    if (this.debugMode) {
      this.logger.debug(`Execution started: ${operation}`);
      this.checkBreakpoint('execution_start', { operation });
    }

    try {
      const result = fn();
      
      if (this.debugMode) {
        this.logger.debug(`Execution completed: ${operation}`, { result });
        this.checkBreakpoint('execution_end', { operation, result });
      }

      return result;
    } catch (error) {
      if (this.debugMode) {
        this.logger.error(`Execution failed: ${operation}`, error as Error);
        this.checkBreakpoint('execution_error', { operation, error });
      }
      throw error;
    }
  }

  async traceAsyncExecution<T>(operation: string, fn: () => Promise<T>): Promise<T> {
    if (this.debugMode) {
      this.logger.debug(`Async execution started: ${operation}`);
      this.checkBreakpoint('async_execution_start', { operation });
    }

    try {
      const result = await fn();
      
      if (this.debugMode) {
        this.logger.debug(`Async execution completed: ${operation}`, { result });
        this.checkBreakpoint('async_execution_end', { operation, result });
      }

      return result;
    } catch (error) {
      if (this.debugMode) {
        this.logger.error(`Async execution failed: ${operation}`, error as Error);
        this.checkBreakpoint('async_execution_error', { operation, error });
      }
      throw error;
    }
  }
}

// ============================================================================
// LOGGING FACTORY
// ============================================================================

export class LoggingFactory {
  static createLogger(config: LogConfig, context: LogContext): Logger {
    return new Logger(config, context);
  }

  static createDebugger(logger: Logger): Debugger {
    return new Debugger(logger);
  }

  static createDefaultConfig(): LogConfig {
    return {
      level: LogLevel.INFO,
      enableConsole: true,
      enableFile: false,
      enableRemote: false,
      enablePerformance: false,
      enableStackTrace: true,
      maxFileSize: 10 * 1024 * 1024, // 10MB
      maxFiles: 5,
      retentionDays: 7,
      filters: []
    };
  }

  static createDefaultContext(): LogContext {
    return {
      component: 'unknown',
      operation: 'unknown',
      environment: process.env.NODE_ENV || 'development',
      version: process.env.npm_package_version || '1.0.0'
    };
  }
}

// ============================================================================
// REACT HOOKS FOR LOGGING
// ============================================================================

import { useEffect, useRef } from 'react';

export function useLogger(component: string, operation: string): Logger {
  const loggerRef = useRef<Logger>();

  if (!loggerRef.current) {
    const config = LoggingFactory.createDefaultConfig();
    const context = LoggingFactory.createDefaultContext();
    context.component = component;
    context.operation = operation;
    
    loggerRef.current = LoggingFactory.createLogger(config, context);
  }

  useEffect(() => {
    loggerRef.current?.info('Component mounted', { component, operation });
    
    return () => {
      loggerRef.current?.info('Component unmounted', { component, operation });
    };
  }, [component, operation]);

  return loggerRef.current;
}

export function useDebugger(logger: Logger): Debugger {
  const debuggerRef = useRef<Debugger>();

  if (!debuggerRef.current) {
    debuggerRef.current = LoggingFactory.createDebugger(logger);
  }

  return debuggerRef.current;
}

export default {
  Logger,
  Debugger,
  LoggingFactory,
  LogLevel,
  useLogger,
  useDebugger
};
