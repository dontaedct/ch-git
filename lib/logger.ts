export function log(...a: unknown[]) { console.log(...a); }
export function error(...a: unknown[]) { console.error(...a); }

/** Route-specific logger for API endpoints */
export function createRouteLogger(method: string, path: string) {
  return {
    log: (status: number, startTime: number) => {
      const duration = Date.now() - startTime;
      console.log(`[${method}] ${path} - ${status} (${duration}ms)`);
    }
  };
}

/** Back-compat default export for sites that import default */
const logger = { log, error };
export default logger;
