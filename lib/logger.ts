export function log(...a: unknown[]) { console.warn(...a); }
export function error(...a: unknown[]) { console.error(...a); }

/** Route-specific logger for API endpoints */
export function createRouteLogger(method: string, path: string) {
  return {
    log: (status: number, startTime: number) => {
      const duration = Date.now() - startTime;
      console.warn(`[${method}] ${path} - ${status} (${duration}ms)`);
    },
    warn: (...args: unknown[]) => {
      console.warn(`[${method}] ${path}`, ...args);
    },
    error: (...args: unknown[]) => {
      console.error(`[${method}] ${path}`, ...args);
    }
  };
}

/** Logger with operation context */
export function createOperationLogger(operation: string) {
  return {
    log: (...args: unknown[]) => {
      console.warn(`[${operation}]`, ...args);
    },
    error: (...args: unknown[]) => {
      console.error(`[${operation}]`, ...args);
    },
    withOperation: (subOperation: string) => createOperationLogger(`${operation}:${subOperation}`)
  };
}

/** Back-compat default export for sites that import default */
const logger = { 
  log, 
  error,
  withOperation: (operation: string) => createOperationLogger(operation)
};
export default logger;

/** Named export for logger */
export { logger };
