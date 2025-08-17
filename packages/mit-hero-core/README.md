# MIT Hero Core

A robust, autonomous system orchestration framework designed for enterprise-grade applications with built-in safety mechanisms, performance monitoring, and intelligent error recovery.

## 🚀 Features

- **Autonomous Operation**: Self-healing systems with intelligent error detection
- **Performance Monitoring**: Real-time metrics and budget enforcement
- **Safety First**: Circuit breakers, timeouts, and graceful degradation
- **Extensible Architecture**: Plugin-based system for custom integrations
- **Enterprise Ready**: Comprehensive logging, monitoring, and compliance

## 📦 Installation

```bash
npm install @mit-hero/core
```

## 🎯 Quick Start

### Basic Usage

```typescript
import { HeroSystem, HealthMonitor, PerformanceBudget } from '@mit-hero/core';

// Initialize the system
const hero = new HeroSystem({
  name: 'my-application',
  version: '1.0.0',
  environment: process.env.NODE_ENV || 'development'
});

// Add health monitoring
const healthMonitor = new HealthMonitor({
  checkInterval: 30000, // 30 seconds
  timeout: 5000,        // 5 seconds
  retries: 3
});

hero.addMonitor(healthMonitor);

// Add performance budgets
const buildBudget = new PerformanceBudget({
  name: 'build',
  maxDuration: 60000,   // 1 minute
  maxMemory: 512,       // 512MB
  maxCPU: 80            // 80% CPU
});

hero.addBudget(buildBudget);

// Start the system
await hero.start();
```

### Advanced Configuration

```typescript
import { HeroSystem, CircuitBreaker, RetryHelper } from '@mit-hero/core';

const hero = new HeroSystem({
  name: 'enterprise-app',
  version: '2.0.0',
  environment: 'production',
  features: {
    circuitBreaker: true,
    retryMechanism: true,
    performanceMonitoring: true,
    autonomousRecovery: true
  }
});

// Configure circuit breaker
const circuitBreaker = new CircuitBreaker({
  failureThreshold: 5,
  recoveryTimeout: 60000,
  expectedResponseTime: 1000
});

// Configure retry mechanism
const retryHelper = new RetryHelper({
  maxRetries: 3,
  backoffStrategy: 'exponential',
  baseDelay: 1000
});

hero.addCircuitBreaker(circuitBreaker);
hero.addRetryHelper(retryHelper);
```

## 🔧 API Reference

### HeroSystem

The main orchestrator class that manages all system components.

#### Constructor Options

```typescript
interface HeroSystemConfig {
  name: string;                    // System identifier
  version: string;                 // System version
  environment: string;             // Environment (dev/staging/prod)
  features?: {                     // Optional feature flags
    circuitBreaker?: boolean;
    retryMechanism?: boolean;
    performanceMonitoring?: boolean;
    autonomousRecovery?: boolean;
  };
  logging?: {                      // Logging configuration
    level: 'debug' | 'info' | 'warn' | 'error';
    format: 'json' | 'text';
    destination: 'console' | 'file' | 'remote';
  };
}
```

#### Methods

- `start(): Promise<void>` - Initialize and start the system
- `stop(): Promise<void>` - Gracefully shutdown the system
- `addMonitor(monitor: HealthMonitor): void` - Add health monitoring
- `addBudget(budget: PerformanceBudget): void` - Add performance constraints
- `addCircuitBreaker(cb: CircuitBreaker): void` - Add circuit breaker
- `addRetryHelper(retry: RetryHelper): void` - Add retry mechanism
- `getStatus(): SystemStatus` - Get current system status
- `getHealth(): HealthReport` - Get detailed health information

### HealthMonitor

Monitors system health and reports issues.

```typescript
interface HealthCheck {
  name: string;
  check: () => Promise<boolean>;
  timeout?: number;
  retries?: number;
  critical?: boolean;
}

const monitor = new HealthMonitor({
  checkInterval: 30000,
  timeout: 5000,
  retries: 3
});

monitor.addCheck({
  name: 'database-connection',
  check: async () => {
    // Check database connectivity
    return await db.ping();
  },
  critical: true
});
```

### PerformanceBudget

Enforces performance constraints and alerts on violations.

```typescript
interface BudgetConfig {
  name: string;
  maxDuration: number;    // milliseconds
  maxMemory: number;      // MB
  maxCPU: number;         // percentage
  alertThreshold?: number; // percentage of limit
}

const budget = new PerformanceBudget({
  name: 'build-process',
  maxDuration: 120000,    // 2 minutes
  maxMemory: 1024,        // 1GB
  maxCPU: 90,             // 90% CPU
  alertThreshold: 80      // Alert at 80% of limit
});
```

### CircuitBreaker

Prevents cascading failures by temporarily disabling failing operations.

```typescript
interface CircuitBreakerConfig {
  failureThreshold: number;      // Number of failures before opening
  recoveryTimeout: number;       // Time to wait before attempting recovery
  expectedResponseTime: number;  // Expected response time in ms
}

const cb = new CircuitBreaker({
  failureThreshold: 5,
  recoveryTimeout: 60000,        // 1 minute
  expectedResponseTime: 1000     // 1 second
});

// Wrap operations
const safeOperation = cb.wrap(async () => {
  return await riskyOperation();
});
```

### RetryHelper

Provides intelligent retry mechanisms with backoff strategies.

```typescript
interface RetryConfig {
  maxRetries: number;
  backoffStrategy: 'linear' | 'exponential' | 'fibonacci';
  baseDelay: number;
  maxDelay?: number;
}

const retry = new RetryHelper({
  maxRetries: 3,
  backoffStrategy: 'exponential',
  baseDelay: 1000,
  maxDelay: 10000
});

// Retry with exponential backoff
const result = await retry.execute(async () => {
  return await unreliableOperation();
});
```

## 🛡️ Safety Features

### Circuit Breaker Pattern

The system automatically detects failing operations and temporarily disables them to prevent cascading failures.

```typescript
// Circuit breaker automatically opens after 5 failures
const operation = circuitBreaker.wrap(async () => {
  return await externalService.call();
});

try {
  const result = await operation();
} catch (error) {
  if (circuitBreaker.isOpen()) {
    console.log('Service temporarily disabled due to failures');
  }
}
```

### Timeout Protection

All operations are protected by configurable timeouts to prevent hanging processes.

```typescript
const timeoutWrapper = new TimeoutWrapper({
  defaultTimeout: 5000,
  cleanupOnTimeout: true
});

const result = await timeoutWrapper.execute(
  async () => await longRunningOperation(),
  { timeout: 10000 } // 10 second timeout
);
```

### Graceful Degradation

The system automatically falls back to alternative strategies when primary operations fail.

```typescript
const fallback = new FallbackStrategy({
  primary: async () => await primaryOperation(),
  fallback: async () => await alternativeOperation(),
  fallbackCondition: (error) => error.code === 'TIMEOUT'
});

const result = await fallback.execute();
```

## 📊 Monitoring & Metrics

### Health Checks

```typescript
// Get system health status
const health = await hero.getHealth();

console.log('Overall Health:', health.status);
console.log('Active Checks:', health.activeChecks);
console.log('Failed Checks:', health.failedChecks);
console.log('Last Check:', health.lastCheckTime);
```

### Performance Metrics

```typescript
// Monitor performance budgets
const metrics = await hero.getPerformanceMetrics();

console.log('Build Duration:', metrics.build.duration);
console.log('Memory Usage:', metrics.build.memory);
console.log('CPU Usage:', metrics.build.cpu);
console.log('Budget Status:', metrics.build.withinBudget ? '✅' : '❌');
```

### Circuit Breaker Status

```typescript
// Check circuit breaker state
const status = circuitBreaker.getStatus();

console.log('State:', status.state); // 'closed' | 'open' | 'half-open'
console.log('Failure Count:', status.failureCount);
console.log('Last Failure:', status.lastFailureTime);
console.log('Next Attempt:', status.nextAttemptTime);
```

## 🔄 Migration Guide

### From v1.x to v2.x

#### Breaking Changes

1. **Constructor API**: The `HeroSystem` constructor now requires explicit feature flags
2. **Monitor Interface**: Health monitors now use a more structured configuration
3. **Budget API**: Performance budgets have been simplified and made more flexible

#### Migration Steps

```typescript
// Old v1.x code
const hero = new HeroSystem('my-app', '1.0.0');

// New v2.x code
const hero = new HeroSystem({
  name: 'my-app',
  version: '1.0.0',
  environment: 'development',
  features: {
    circuitBreaker: true,
    performanceMonitoring: true
  }
});
```

#### Feature Flag Migration

```typescript
// Old v1.x automatic features
const hero = new HeroSystem('my-app', '1.0.0');
// All features were enabled by default

// New v2.x explicit features
const hero = new HeroSystem({
  name: 'my-app',
  version: '1.0.0',
  environment: 'development',
  features: {
    circuitBreaker: true,           // Explicitly enable
    retryMechanism: true,           // Explicitly enable
    performanceMonitoring: true,    // Explicitly enable
    autonomousRecovery: false       // Explicitly disable
  }
});
```

## 🧪 Testing

### Unit Tests

```bash
npm test
```

### Integration Tests

```bash
npm run test:integration
```

### Performance Tests

```bash
npm run test:performance
```

### Coverage Report

```bash
npm run test:coverage
```

## 🚨 Troubleshooting

### Common Issues

#### Circuit Breaker Stuck Open

```typescript
// Check circuit breaker state
const status = circuitBreaker.getStatus();
console.log('Circuit Breaker State:', status.state);

// Manually reset if needed
if (status.state === 'open') {
  circuitBreaker.reset();
}
```

#### Performance Budget Violations

```typescript
// Check which budgets are being violated
const metrics = await hero.getPerformanceMetrics();
const violations = Object.entries(metrics)
  .filter(([_, metric]) => !metric.withinBudget);

console.log('Budget Violations:', violations);
```

#### Health Check Failures

```typescript
// Get detailed health information
const health = await hero.getHealth();
const failedChecks = health.failedChecks;

failedChecks.forEach(check => {
  console.log(`Failed: ${check.name}`);
  console.log(`Error: ${check.error}`);
  console.log(`Last Failure: ${check.lastFailureTime}`);
});
```

### Debug Mode

Enable debug logging for detailed troubleshooting:

```typescript
const hero = new HeroSystem({
  name: 'debug-app',
  version: '1.0.0',
  environment: 'development',
  logging: {
    level: 'debug',
    format: 'text',
    destination: 'console'
  }
});
```

## 🤝 Contributing

### Development Setup

1. Clone the repository
2. Install dependencies: `npm install`
3. Run tests: `npm test`
4. Build: `npm run build`

### Code Style

- Follow TypeScript best practices
- Use ESLint and Prettier
- Write comprehensive tests
- Document all public APIs

### Pull Request Process

1. Create a feature branch
2. Make your changes
3. Add tests for new functionality
4. Update documentation
5. Submit a pull request

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: [GitHub Wiki](https://github.com/mit-hero/core/wiki)
- **Issues**: [GitHub Issues](https://github.com/mit-hero/core/issues)
- **Discussions**: [GitHub Discussions](https://github.com/mit-hero/core/discussions)
- **Email**: support@mit-hero.com

## 🔗 Related Projects

- [MIT Hero CLI](https://github.com/mit-hero/cli) - Command-line interface
- [MIT Hero Dashboard](https://github.com/mit-hero/dashboard) - Web-based monitoring
- [MIT Hero Plugins](https://github.com/mit-hero/plugins) - Community plugins

---

**Built with ❤️ by the MIT Hero Team**
