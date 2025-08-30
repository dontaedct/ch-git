/**
 * Enhanced Structured Logging with Pino
 * 
 * Provides production-grade structured logging with OpenTelemetry integration,
 * performance tracking, and security event logging.
 */

import pino from 'pino';
import { getCurrentTraceId } from './observability/otel';

// Environment configuration
const isDevelopment = process.env.NODE_ENV === 'development';
const logLevel = process.env.LOG_LEVEL || (isDevelopment ? 'debug' : 'info');

// Create base pino logger with structured configuration
const baseLogger = pino({
  level: logLevel,
  formatters: {
    level: (label) => {
      return { level: label };
    },
  },
  timestamp: pino.stdTimeFunctions.isoTime,
  redact: [
    'password',
    'token',
    'secret',
    'key',
    'authorization',
    'cookie',
    'session',
  ],
  serializers: {
    req: pino.stdSerializers.req,
    res: pino.stdSerializers.res,
    err: pino.stdSerializers.err,
  },
  // Pretty print in development
  transport: isDevelopment ? {
    target: 'pino-pretty',
    options: {
      colorize: true,
      translateTime: 'SYS:standard',
      ignore: 'pid,hostname',
    }
  } : undefined,
});

/**
 * Enhanced logger with OpenTelemetry integration
 */
function createEnhancedLogger(context?: Record<string, any>) {
  const child = context ? baseLogger.child(context) : baseLogger;
  
  return {
    debug: (msg: string, meta?: any) => {
      child.debug({ 
        ...meta, 
        traceId: getCurrentTraceId() 
      }, msg);
    },
    info: (msg: string, meta?: any) => {
      child.info({ 
        ...meta, 
        traceId: getCurrentTraceId() 
      }, msg);
    },
    warn: (msg: string, meta?: any) => {
      child.warn({ 
        ...meta, 
        traceId: getCurrentTraceId() 
      }, msg);
    },
    error: (msg: string, meta?: any) => {
      child.error({ 
        ...meta, 
        traceId: getCurrentTraceId() 
      }, msg);
    },
    fatal: (msg: string, meta?: any) => {
      child.fatal({ 
        ...meta, 
        traceId: getCurrentTraceId() 
      }, msg);
    },
  };
}

// Enhanced logger functions for backward compatibility
export function log(msg: string, meta?: any) {
  createEnhancedLogger().info(msg, meta);
}

export function error(msg: string, meta?: any) {
  createEnhancedLogger().error(msg, meta);
}

/** Route-specific logger for API endpoints */
export function createRouteLogger(method: string, path: string) {
  const logger = createEnhancedLogger({ 
    component: 'api-route',
    method,
    path 
  });
  
  return {
    log: (status: number, startTime: number) => {
      const duration = Date.now() - startTime;
      logger.info('Request completed', {
        status,
        duration,
        performance: {
          category: duration > 1000 ? 'slow' : duration > 500 ? 'medium' : 'fast'
        }
      });
    },
    warn: (msg: string, meta?: any) => {
      logger.warn(msg, meta);
    },
    error: (msg: string, meta?: any) => {
      logger.error(msg, meta);
    },
    debug: (msg: string, meta?: any) => {
      logger.debug(msg, meta);
    },
    info: (msg: string, meta?: any) => {
      logger.info(msg, meta);
    }
  };
}

/** Logger with operation context */
export function createOperationLogger(operation: string) {
  const logger = createEnhancedLogger({ 
    component: 'operation',
    operation 
  });
  
  return {
    log: (msg: string, meta?: any) => {
      logger.info(msg, meta);
    },
    debug: (msg: string, meta?: any) => {
      logger.debug(msg, meta);
    },
    info: (msg: string, meta?: any) => {
      logger.info(msg, meta);
    },
    warn: (msg: string, meta?: any) => {
      logger.warn(msg, meta);
    },
    error: (msg: string, meta?: any) => {
      logger.error(msg, meta);
    },
    fatal: (msg: string, meta?: any) => {
      logger.fatal(msg, meta);
    },
    withOperation: (subOperation: string) => createOperationLogger(`${operation}:${subOperation}`)
  };
}

/** Security event logger */
export function createSecurityLogger() {
  return createEnhancedLogger({ 
    component: 'security',
    category: 'security-event'
  });
}

/** Performance logger */
export function createPerformanceLogger() {
  return createEnhancedLogger({ 
    component: 'performance'
  });
}

/** Business metrics logger */
export function createBusinessLogger() {
  return createEnhancedLogger({ 
    component: 'business-metrics'
  });
}

/** Back-compat default export for sites that import default */
const logger = { 
  log, 
  error,
  info: (msg: string, meta?: any) => createEnhancedLogger().info(msg, meta),
  warn: (msg: string, meta?: any) => createEnhancedLogger().warn(msg, meta),
  debug: (msg: string, meta?: any) => createEnhancedLogger().debug(msg, meta),
  fatal: (msg: string, meta?: any) => createEnhancedLogger().fatal(msg, meta),
  withOperation: (operation: string) => createOperationLogger(operation),
  withContext: (context: Record<string, any>) => createEnhancedLogger(context),
  security: createSecurityLogger(),
  performance: createPerformanceLogger(),
  business: createBusinessLogger(),
};

export default logger;

/** Named export for logger */
export { logger, baseLogger };

/** Structured logging helpers */
export const Logger = {
  create: createEnhancedLogger,
  route: createRouteLogger,
  operation: createOperationLogger,
  security: createSecurityLogger,
  performance: createPerformanceLogger,
  business: createBusinessLogger,
};
