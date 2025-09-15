/**
 * @fileoverview Route Logger
 * @module lib/logging/route-logger
 */

export interface RouteLoggerConfig {
  enabled: boolean;
  logLevel: 'debug' | 'info' | 'warn' | 'error';
}

export class RouteLogger {
  constructor(private config: RouteLoggerConfig = { enabled: true, logLevel: 'info' }) {}

  log(level: string, message: string, meta?: any): void {
    if (!this.config.enabled) return;
    
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] [${level.toUpperCase()}] ${message}`, meta);
  }

  info(message: string, meta?: any): void {
    this.log('info', message, meta);
  }

  error(message: string, meta?: any): void {
    this.log('error', message, meta);
  }

  warn(message: string, meta?: any): void {
    this.log('warn', message, meta);
  }

  debug(message: string, meta?: any): void {
    this.log('debug', message, meta);
  }
}

export const routeLogger = new RouteLogger();

export function createRouteLogger(method: string, route: string): RouteLogger {
  return new RouteLogger({ enabled: true, logLevel: 'info' });
}

export default routeLogger;