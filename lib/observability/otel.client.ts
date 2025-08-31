/**
 * Client-side stub for OpenTelemetry helpers.
 * Keeps Edge/browser bundles free of Node-specific OTEL deps and APIs.
 */

export function initializeOpenTelemetry(): void {
  // no-op on client
}

export async function shutdown(): Promise<void> {
  // no-op on client
}

export function getCurrentTraceId(): string | undefined {
  return undefined;
}

export function addSpanAttributes(_attributes: Record<string, string | number | boolean>): void {
  // no-op on client
}

export function getBusinessMetrics(): any {
  return undefined;
}

export function recordBusinessMetric(
  _metricName: string,
  _value: number = 1,
  _attributes?: Record<string, string | number | boolean>
): void {
  // no-op on client
}

