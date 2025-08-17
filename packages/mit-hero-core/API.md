# MIT Hero Core API Documentation

## Table of Contents

1. [Overview](#overview)
2. [Core Classes](#core-classes)
3. [Interfaces](#interfaces)
4. [Types](#types)
5. [Utilities](#utilities)
6. [Error Handling](#error-handling)
7. [Examples](#examples)

## Overview

The MIT Hero Core module provides a comprehensive framework for building autonomous, self-healing systems. This document details the complete API surface area, including all public classes, interfaces, methods, and types.

## Core Classes

### HeroSystem

The main orchestrator class that manages all system components and provides the primary interface for system operations.

#### Constructor

```typescript
constructor(config: HeroSystemConfig)
```

**Parameters:**
- `config` - Configuration object for the system

**Example:**
```typescript
const hero = new HeroSystem({
  name: 'my-application',
  version: '1.0.0',
  environment: 'production',
  features: {
    circuitBreaker: true,
    performanceMonitoring: true
  }
});
```

#### Methods

##### start()
```typescript
start(): Promise<void>
```
Initializes and starts the system. This method:
- Sets up all configured monitors
- Initializes performance budgets
- Starts health check cycles
- Begins metric collection

**Returns:** Promise that resolves when the system is fully started

**Example:**
```typescript
try {
  await hero.start();
  console.log('System started successfully');
} catch (error) {
  console.error('Failed to start system:', error);
}
```

##### stop()
```typescript
stop(): Promise<void>
```
Gracefully shuts down the system. This method:
- Stops all monitors
- Saves final metrics
- Performs cleanup operations
- Closes all connections

**Returns:** Promise that resolves when the system is fully stopped

**Example:**
```typescript
process.on('SIGTERM', async () => {
  console.log('Shutting down system...');
  await hero.stop();
  process.exit(0);
});
```

##### addMonitor()
```typescript
addMonitor(monitor: HealthMonitor): void
```
Adds a health monitor to the system.

**Parameters:**
- `monitor` - HealthMonitor instance to add

**Example:**
```typescript
const dbMonitor = new HealthMonitor({
  checkInterval: 30000,
  timeout: 5000
});

dbMonitor.addCheck({
  name: 'database',
  check: async () => await db.ping(),
  critical: true
});

hero.addMonitor(dbMonitor);
```

##### addBudget()
```typescript
addBudget(budget: PerformanceBudget): void
```
Adds a performance budget to the system.

**Parameters:**
- `budget` - PerformanceBudget instance to add

**Example:**
```typescript
const buildBudget = new PerformanceBudget({
  name: 'build',
  maxDuration: 120000,
  maxMemory: 1024,
  maxCPU: 90
});

hero.addBudget(buildBudget);
```

##### addCircuitBreaker()
```typescript
addCircuitBreaker(circuitBreaker: CircuitBreaker): void
```
Adds a circuit breaker to the system.

**Parameters:**
- `circuitBreaker` - CircuitBreaker instance to add

**Example:**
```typescript
const apiBreaker = new CircuitBreaker({
  failureThreshold: 5,
  recoveryTimeout: 60000,
  expectedResponseTime: 1000
});

hero.addCircuitBreaker(apiBreaker);
```

##### addRetryHelper()
```typescript
addRetryHelper(retryHelper: RetryHelper): void
```
Adds a retry helper to the system.

**Parameters:**
- `retryHelper` - RetryHelper instance to add

**Example:**
```typescript
const retryHelper = new RetryHelper({
  maxRetries: 3,
  backoffStrategy: 'exponential',
  baseDelay: 1000
});

hero.addRetryHelper(retryHelper);
```

##### getStatus()
```typescript
getStatus(): SystemStatus
```
Gets the current system status.

**Returns:** SystemStatus object containing current system state

**Example:**
```typescript
const status = hero.getStatus();
console.log('System Status:', status.state);
console.log('Uptime:', status.uptime);
console.log('Active Monitors:', status.activeMonitors);
```

##### getHealth()
```typescript
getHealth(): Promise<HealthReport>
```
Gets detailed health information for all system components.

**Returns:** Promise that resolves to HealthReport object

**Example:**
```typescript
const health = await hero.getHealth();
console.log('Overall Health:', health.status);
console.log('Failed Checks:', health.failedChecks.length);
```

##### getPerformanceMetrics()
```typescript
getPerformanceMetrics(): Promise<PerformanceMetrics>
```
Gets performance metrics for all configured budgets.

**Returns:** Promise that resolves to PerformanceMetrics object

**Example:**
```typescript
const metrics = await hero.getPerformanceMetrics();
Object.entries(metrics).forEach(([name, metric]) => {
  console.log(`${name}: ${metric.withinBudget ? '✅' : '❌'}`);
});
```

### HealthMonitor

Monitors system health through configurable health checks.

#### Constructor

```typescript
constructor(config: HealthMonitorConfig)
```

**Parameters:**
- `config` - Configuration object for the monitor

**Example:**
```typescript
const monitor = new HealthMonitor({
  checkInterval: 30000,
  timeout: 5000,
  retries: 3
});
```

#### Methods

##### addCheck()
```typescript
addCheck(check: HealthCheck): void
```
Adds a health check to the monitor.

**Parameters:**
- `check` - HealthCheck configuration object

**Example:**
```typescript
monitor.addCheck({
  name: 'database-connection',
  check: async () => {
    try {
      await db.query('SELECT 1');
      return true;
    } catch {
      return false;
    }
  },
  timeout: 3000,
  retries: 2,
  critical: true
});
```

##### removeCheck()
```typescript
removeCheck(name: string): boolean
```
Removes a health check by name.

**Parameters:**
- `name` - Name of the health check to remove

**Returns:** true if check was removed, false if not found

**Example:**
```typescript
const removed = monitor.removeCheck('database-connection');
if (removed) {
  console.log('Database check removed');
}
```

##### getStatus()
```typescript
getStatus(): HealthMonitorStatus
```
Gets the current status of the health monitor.

**Returns:** HealthMonitorStatus object

**Example:**
```typescript
const status = monitor.getStatus();
console.log('Monitor Active:', status.active);
console.log('Total Checks:', status.totalChecks);
console.log('Failed Checks:', status.failedChecks);
```

### PerformanceBudget

Enforces performance constraints and tracks violations.

#### Constructor

```typescript
constructor(config: BudgetConfig)
```

**Parameters:**
- `config` - Configuration object for the budget

**Example:**
```typescript
const budget = new PerformanceBudget({
  name: 'build-process',
  maxDuration: 120000,
  maxMemory: 1024,
  maxCPU: 90,
  alertThreshold: 80
});
```

#### Methods

##### startMeasurement()
```typescript
startMeasurement(): MeasurementToken
```
Starts measuring performance for an operation.

**Returns:** MeasurementToken that must be passed to stopMeasurement

**Example:**
```typescript
const token = budget.startMeasurement();
try {
  await performOperation();
} finally {
  budget.stopMeasurement(token);
}
```

##### stopMeasurement()
```typescript
stopMeasurement(token: MeasurementToken): PerformanceResult
```
Stops measuring performance and returns the result.

**Parameters:**
- `token` - MeasurementToken from startMeasurement

**Returns:** PerformanceResult object with metrics

**Example:**
```typescript
const result = budget.stopMeasurement(token);
if (!result.withinBudget) {
  console.warn('Performance budget exceeded:', result.violations);
}
```

##### getViolations()
```typescript
getViolations(): BudgetViolation[]
```
Gets all current budget violations.

**Returns:** Array of BudgetViolation objects

**Example:**
```typescript
const violations = budget.getViolations();
violations.forEach(violation => {
  console.log(`${violation.metric}: ${violation.value} > ${violation.limit}`);
});
```

### CircuitBreaker

Prevents cascading failures by temporarily disabling failing operations.

#### Constructor

```typescript
constructor(config: CircuitBreakerConfig)
```

**Parameters:**
- `config` - Configuration object for the circuit breaker

**Example:**
```typescript
const breaker = new CircuitBreaker({
  failureThreshold: 5,
  recoveryTimeout: 60000,
  expectedResponseTime: 1000
});
```

#### Methods

##### wrap()
```typescript
wrap<T>(operation: () => Promise<T>): () => Promise<T>
```
Wraps an operation with circuit breaker protection.

**Parameters:**
- `operation` - Async function to wrap

**Returns:** Wrapped function with circuit breaker protection

**Example:**
```typescript
const safeOperation = breaker.wrap(async () => {
  return await riskyOperation();
});

try {
  const result = await safeOperation();
} catch (error) {
  if (breaker.isOpen()) {
    console.log('Circuit breaker is open, operation blocked');
  }
}
```

##### isOpen()
```typescript
isOpen(): boolean
```
Checks if the circuit breaker is currently open.

**Returns:** true if circuit breaker is open, false otherwise

**Example:**
```typescript
if (breaker.isOpen()) {
  console.log('Circuit breaker is open, using fallback');
  return await fallbackOperation();
}
```

##### reset()
```typescript
reset(): void
```
Manually resets the circuit breaker to closed state.

**Example:**
```typescript
if (breaker.isOpen()) {
  console.log('Manually resetting circuit breaker');
  breaker.reset();
}
```

##### getStatus()
```typescript
getStatus(): CircuitBreakerStatus
```
Gets the current status of the circuit breaker.

**Returns:** CircuitBreakerStatus object

**Example:**
```typescript
const status = breaker.getStatus();
console.log('State:', status.state);
console.log('Failure Count:', status.failureCount);
console.log('Last Failure:', status.lastFailureTime);
```

### RetryHelper

Provides intelligent retry mechanisms with configurable backoff strategies.

#### Constructor

```typescript
constructor(config: RetryConfig)
```

**Parameters:**
- `config` - Configuration object for the retry helper

**Example:**
```typescript
const retry = new RetryHelper({
  maxRetries: 3,
  backoffStrategy: 'exponential',
  baseDelay: 1000,
  maxDelay: 10000
});
```

#### Methods

##### execute()
```typescript
execute<T>(operation: () => Promise<T>): Promise<T>
```
Executes an operation with retry logic.

**Parameters:**
- `operation` - Async function to execute

**Returns:** Promise that resolves to the operation result

**Example:**
```typescript
try {
  const result = await retry.execute(async () => {
    return await unreliableOperation();
  });
} catch (error) {
  console.log('Operation failed after all retries:', error);
}
```

##### executeWithCondition()
```typescript
executeWithCondition<T>(
  operation: () => Promise<T>,
  shouldRetry: (error: Error) => boolean
): Promise<T>
```
Executes an operation with custom retry conditions.

**Parameters:**
- `operation` - Async function to execute
- `shouldRetry` - Function that determines if retry should occur

**Returns:** Promise that resolves to the operation result

**Example:**
```typescript
const result = await retry.executeWithCondition(
  async () => await apiCall(),
  (error) => error.code === 'RATE_LIMIT' || error.code === 'TIMEOUT'
);
```

## Interfaces

### HeroSystemConfig

```typescript
interface HeroSystemConfig {
  name: string;
  version: string;
  environment: string;
  features?: {
    circuitBreaker?: boolean;
    retryMechanism?: boolean;
    performanceMonitoring?: boolean;
    autonomousRecovery?: boolean;
  };
  logging?: {
    level: 'debug' | 'info' | 'warn' | 'error';
    format: 'json' | 'text';
    destination: 'console' | 'file' | 'remote';
  };
}
```

### HealthMonitorConfig

```typescript
interface HealthMonitorConfig {
  checkInterval: number;
  timeout: number;
  retries: number;
  criticalFailureThreshold?: number;
}
```

### HealthCheck

```typescript
interface HealthCheck {
  name: string;
  check: () => Promise<boolean>;
  timeout?: number;
  retries?: number;
  critical?: boolean;
}
```

### BudgetConfig

```typescript
interface BudgetConfig {
  name: string;
  maxDuration: number;
  maxMemory: number;
  maxCPU: number;
  alertThreshold?: number;
}
```

### CircuitBreakerConfig

```typescript
interface CircuitBreakerConfig {
  failureThreshold: number;
  recoveryTimeout: number;
  expectedResponseTime: number;
}
```

### RetryConfig

```typescript
interface RetryConfig {
  maxRetries: number;
  backoffStrategy: 'linear' | 'exponential' | 'fibonacci';
  baseDelay: number;
  maxDelay?: number;
}
```

## Types

### SystemStatus

```typescript
type SystemStatus = {
  state: 'starting' | 'running' | 'stopping' | 'stopped' | 'error';
  uptime: number;
  activeMonitors: number;
  activeBudgets: number;
  lastUpdate: Date;
};
```

### HealthReport

```typescript
type HealthReport = {
  status: 'healthy' | 'degraded' | 'unhealthy' | 'critical';
  activeChecks: number;
  failedChecks: HealthCheckResult[];
  lastCheckTime: Date;
  overallScore: number;
};
```

### PerformanceMetrics

```typescript
type PerformanceMetrics = {
  [budgetName: string]: {
    duration: number;
    memory: number;
    cpu: number;
    withinBudget: boolean;
    violations: string[];
  };
};
```

### CircuitBreakerStatus

```typescript
type CircuitBreakerStatus = {
  state: 'closed' | 'open' | 'half-open';
  failureCount: number;
  lastFailureTime: Date | null;
  nextAttemptTime: Date | null;
};
```

### BudgetViolation

```typescript
type BudgetViolation = {
  metric: 'duration' | 'memory' | 'cpu';
  value: number;
  limit: number;
  timestamp: Date;
};
```

## Utilities

### TimeoutWrapper

Utility class for adding timeout protection to operations.

```typescript
class TimeoutWrapper {
  constructor(config: TimeoutConfig);
  
  execute<T>(
    operation: () => Promise<T>,
    options?: TimeoutOptions
  ): Promise<T>;
}
```

### FallbackStrategy

Utility class for implementing fallback strategies.

```typescript
class FallbackStrategy<T> {
  constructor(config: FallbackConfig<T>);
  
  execute(): Promise<T>;
}
```

### MetricsCollector

Utility class for collecting and aggregating metrics.

```typescript
class MetricsCollector {
  constructor(config: MetricsConfig);
  
  record(metric: string, value: number): void;
  getMetrics(): MetricsSummary;
  reset(): void;
}
```

## Error Handling

The MIT Hero Core module provides comprehensive error handling with custom error types and error recovery mechanisms.

### Error Types

#### HeroSystemError
Base error class for all MIT Hero system errors.

```typescript
class HeroSystemError extends Error {
  constructor(message: string, code: string, details?: any);
  
  readonly code: string;
  readonly details?: any;
  readonly timestamp: Date;
}
```

#### CircuitBreakerError
Error thrown when circuit breaker is open.

```typescript
class CircuitBreakerError extends HeroSystemError {
  constructor(message: string, details?: any);
}
```

#### PerformanceBudgetError
Error thrown when performance budget is exceeded.

```typescript
class PerformanceBudgetError extends HeroSystemError {
  constructor(message: string, violations: BudgetViolation[]);
  
  readonly violations: BudgetViolation[];
}
```

#### HealthCheckError
Error thrown when health checks fail.

```typescript
class HealthCheckError extends HeroSystemError {
  constructor(message: string, failedChecks: HealthCheckResult[]);
  
  readonly failedChecks: HealthCheckResult[];
}
```

### Error Recovery

The system automatically attempts to recover from errors when possible:

1. **Circuit Breaker Recovery**: Automatically attempts to close after recovery timeout
2. **Health Check Recovery**: Retries failed checks with exponential backoff
3. **Performance Budget Recovery**: Resets budgets after violation windows
4. **System Recovery**: Automatically restarts failed components

## Examples

### Complete System Setup

```typescript
import { 
  HeroSystem, 
  HealthMonitor, 
  PerformanceBudget, 
  CircuitBreaker,
  RetryHelper 
} from '@mit-hero/core';

async function setupSystem() {
  // Create the main system
  const hero = new HeroSystem({
    name: 'enterprise-api',
    version: '2.0.0',
    environment: 'production',
    features: {
      circuitBreaker: true,
      retryMechanism: true,
      performanceMonitoring: true,
      autonomousRecovery: true
    },
    logging: {
      level: 'info',
      format: 'json',
      destination: 'console'
    }
  });

  // Add health monitoring
  const healthMonitor = new HealthMonitor({
    checkInterval: 30000,
    timeout: 5000,
    retries: 3
  });

  healthMonitor.addCheck({
    name: 'database',
    check: async () => await checkDatabase(),
    critical: true
  });

  healthMonitor.addCheck({
    name: 'redis',
    check: async () => await checkRedis(),
    critical: false
  });

  hero.addMonitor(healthMonitor);

  // Add performance budgets
  const apiBudget = new PerformanceBudget({
    name: 'api-requests',
    maxDuration: 5000,
    maxMemory: 256,
    maxCPU: 70
  });

  hero.addBudget(apiBudget);

  // Add circuit breakers
  const externalApiBreaker = new CircuitBreaker({
    failureThreshold: 10,
    recoveryTimeout: 120000,
    expectedResponseTime: 2000
  });

  hero.addCircuitBreaker(externalApiBreaker);

  // Add retry helpers
  const retryHelper = new RetryHelper({
    maxRetries: 3,
    backoffStrategy: 'exponential',
    baseDelay: 1000
  });

  hero.addRetryHelper(retryHelper);

  // Start the system
  await hero.start();

  return hero;
}

// Usage
const system = await setupSystem();

// Monitor system health
setInterval(async () => {
  const health = await system.getHealth();
  if (health.status !== 'healthy') {
    console.warn('System health degraded:', health.status);
  }
}, 60000);
```

### API Endpoint with Protection

```typescript
import { CircuitBreaker, RetryHelper, TimeoutWrapper } from '@mit-hero/core';

// Create protection mechanisms
const apiBreaker = new CircuitBreaker({
  failureThreshold: 5,
  recoveryTimeout: 60000,
  expectedResponseTime: 3000
});

const retryHelper = new RetryHelper({
  maxRetries: 3,
  backoffStrategy: 'exponential',
  baseDelay: 1000
});

const timeoutWrapper = new TimeoutWrapper({
  defaultTimeout: 10000,
  cleanupOnTimeout: true
});

// Protected API endpoint
export async function protectedApiEndpoint(req: Request) {
  try {
    // Wrap with all protection mechanisms
    const result = await timeoutWrapper.execute(
      () => retryHelper.execute(
        () => apiBreaker.wrap(async () => {
          return await externalApiCall(req);
        })()
      ),
      { timeout: 15000 }
    );

    return Response.json({ success: true, data: result });
  } catch (error) {
    if (error instanceof CircuitBreakerError) {
      return Response.json(
        { error: 'Service temporarily unavailable' },
        { status: 503 }
      );
    }

    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

### Performance Monitoring

```typescript
import { PerformanceBudget } from '@mit-hero/core';

const buildBudget = new PerformanceBudget({
  name: 'build-process',
  maxDuration: 120000,
  maxMemory: 1024,
  maxCPU: 90
});

async function monitoredBuild() {
  const token = buildBudget.startMeasurement();
  
  try {
    const result = await performBuild();
    
    const metrics = buildBudget.stopMeasurement(token);
    if (!metrics.withinBudget) {
      console.warn('Build exceeded performance budget:', metrics.violations);
    }
    
    return result;
  } catch (error) {
    buildBudget.stopMeasurement(token);
    throw error;
  }
}
```

This API documentation provides comprehensive coverage of all public interfaces, methods, and types in the MIT Hero Core module. For additional examples and advanced usage patterns, refer to the main README and the test suite.
