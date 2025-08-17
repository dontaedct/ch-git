# 🔄 Retry Helper System - MIT Hero System

## Overview

The Retry Helper System provides comprehensive retry functionality with exponential backoff, jitter, and circuit breaker patterns for the MIT Hero System. It prevents silent failures and improves system reliability across all network and model operations.

## Features

- **Exponential Backoff**: Configurable base delay with exponential increase
- **Jitter**: Prevents thundering herd problems with randomized delays
- **Circuit Breaker**: Automatically opens circuit after repeated failures
- **Error Taxonomy**: Intelligent categorization for retry decisions
- **Multiple Strategies**: Immediate, linear, exponential, and custom backoff
- **Comprehensive Logging**: Detailed tracking of retry attempts and failures
- **Statistics & Monitoring**: Real-time operation metrics and circuit breaker status

## Error Taxonomy

The system automatically classifies errors into categories to make intelligent retry decisions:

### Retryable Errors
- **Network Errors**: Connection failures, timeouts, network issues
- **Rate Limit Errors**: API rate limiting, quota exceeded
- **Resource Errors**: Service unavailable, resource temporarily unavailable

### Non-Retryable Errors
- **Authentication Errors**: Unauthorized, forbidden, token expired
- **System Errors**: Configuration errors, validation failures, syntax errors

## Quick Start

### Basic Usage

```typescript
import { RetryHelper, retryWithBackoff, retryImmediate } from '../lib/retry';

// Create a retry helper instance
const retryHelper = new RetryHelper({
  maxAttempts: 3,
  baseDelay: 1000, // 1 second
  strategy: 'EXPONENTIAL'
});

// Use the retry helper
const result = await retryHelper.retry(
  async () => {
    // Your operation here
    return await someNetworkOperation();
  },
  'network-operation',
  { maxAttempts: 5 }
);

if (result.success) {
  console.log('Operation succeeded:', result.data);
} else {
  console.error('Operation failed after', result.attempts, 'attempts');
}
```

### Utility Functions

```typescript
// Quick retry with exponential backoff
const data = await retryWithBackoff(
  async () => await fetchData(),
  3, // max attempts
  1000 // base delay
);

// Quick retry with immediate retries
const data = await retryImmediate(
  async () => await quickOperation(),
  3 // max attempts
);
```

## Configuration Options

### RetryHelper Constructor

```typescript
const retryHelper = new RetryHelper({
  maxAttempts: 3,              // Maximum retry attempts
  baseDelay: 1000,             // Base delay in milliseconds
  maxDelay: 30000,             // Maximum delay cap
  jitterFactor: 0.1,           // Jitter factor (0.1 = 10%)
  strategy: 'EXPONENTIAL',      // Retry strategy
  circuitBreakerThreshold: 5,   // Failures before opening circuit
  circuitBreakerTimeout: 60000, // Time to wait before testing circuit
  customBackoff: (attempt, baseDelay) => baseDelay * Math.pow(1.5, attempt - 1)
});
```

### Retry Strategies

- **IMMEDIATE**: No delay between retries
- **LINEAR**: Linear increase in delay
- **EXPONENTIAL**: Exponential increase in delay (default)
- **CUSTOM**: Custom backoff function

## Integration Examples

### With Guardian Backup System

```typescript
// In guardian.js
class GuardianBackup {
  constructor() {
    this.retryHelper = new RetryHelper({
      maxAttempts: 3,
      baseDelay: 2000, // 2 seconds for backup operations
      maxDelay: 60000, // 1 minute max delay
      strategy: 'EXPONENTIAL'
    });
  }

  async spawnCommand(command, args, options = {}) {
    const result = await this.retryHelper.retry(
      async () => {
        // Command execution logic
        return await spawnWithTimeout(command, args, options, 5 * 60 * 1000);
      },
      `spawn-${command}-${args.join('-')}`,
      { maxAttempts: 3, baseDelay: 2000 }
    );

    if (!result.success) {
      throw new Error(`Command failed after ${result.attempts} attempts`);
    }

    return result.data;
  }
}
```

### With Hero Unified Orchestrator

```typescript
// In hero-unified-orchestrator.js
class HeroUnifiedOrchestrator {
  constructor() {
    this.retryHelper = new RetryHelper({
      maxAttempts: 5,
      baseDelay: 1000,
      maxDelay: 30000,
      strategy: 'EXPONENTIAL',
      circuitBreakerThreshold: 3,
      circuitBreakerTimeout: 120000
    });
  }

  async checkSystemHealth(key, system) {
    const result = await this.retryHelper.retry(
      async () => {
        return await this.runCommand(system.healthCheck, { timeout: 15000, silent: true });
      },
      `health-check-${key}`,
      { maxAttempts: 3, baseDelay: 2000 }
    );

    if (!result.success) {
      return { score: 0.3, status: 'unhealthy', error: result.lastError?.message };
    }

    return { score: 1.0, status: 'healthy', message: 'Health check passed' };
  }
}
```

## Circuit Breaker Pattern

The circuit breaker automatically protects the system from repeated failures:

1. **CLOSED**: Normal operation, all requests pass through
2. **OPEN**: Circuit open, all requests are blocked
3. **HALF-OPEN**: Testing if service has recovered

```typescript
// Check circuit breaker status
const status = retryHelper.getCircuitBreakerStatus('operation-key');
console.log('Circuit state:', status.state);
console.log('Failure count:', status.failureCount);

// Reset circuit breaker manually
retryHelper.resetCircuitBreaker('operation-key');
retryHelper.resetAllCircuitBreakers();
```

## Monitoring and Statistics

### Operation Statistics

```typescript
// Get statistics for specific operation
const stats = retryHelper.getStats('operation-key');
console.log('Success rate:', (stats.success / (stats.success + stats.failure)) * 100, '%');

// Get all statistics
const allStats = retryHelper.getStats();
console.log('Total operations tracked:', Object.keys(allStats).length);
```

### Circuit Breaker Status

```typescript
// Get status for specific operation
const breaker = retryHelper.getCircuitBreakerStatus('operation-key');

// Get all circuit breakers
const allBreakers = retryHelper.getCircuitBreakerStatus();
```

## Best Practices

### 1. Choose Appropriate Retry Strategies

- **IMMEDIATE**: For quick, idempotent operations
- **LINEAR**: For operations with predictable failure patterns
- **EXPONENTIAL**: For network operations and external services (default)
- **CUSTOM**: For specialized backoff requirements

### 2. Configure Circuit Breaker Thresholds

```typescript
// For critical operations
const criticalRetryHelper = new RetryHelper({
  circuitBreakerThreshold: 2,    // Open circuit quickly
  circuitBreakerTimeout: 30000   // Test recovery after 30 seconds
});

// For non-critical operations
const standardRetryHelper = new RetryHelper({
  circuitBreakerThreshold: 5,    // More tolerant
  circuitBreakerTimeout: 120000  // Longer recovery time
});
```

### 3. Use Descriptive Operation Keys

```typescript
// Good operation keys
await retryHelper.retry(operation, 'health-check-guardian-backup');
await retryHelper.retry(operation, 'git-commit-push');
await retryHelper.retry(operation, 'supabase-query-users');

// Avoid generic keys
await retryHelper.retry(operation, 'operation'); // Too generic
```

### 4. Handle Retry Results Properly

```typescript
const result = await retryHelper.retry(operation, 'operation-key');

if (result.success) {
  // Handle success
  return result.data;
} else {
  // Handle failure
  console.error(`Operation failed after ${result.attempts} attempts`);
  console.error('Last error:', result.lastError?.message);
  console.error('Total time:', result.totalTime, 'ms');
  
  // Decide on fallback or error handling
  throw new Error(`Operation failed: ${result.lastError?.message}`);
}
```

### 5. Monitor and Alert

```typescript
// Set up monitoring for critical operations
setInterval(() => {
  const stats = retryHelper.getStats('critical-operation');
  const successRate = (stats.success / (stats.success + stats.failure)) * 100;
  
  if (successRate < 80) {
    // Alert on low success rate
    console.warn(`Low success rate for critical operation: ${successRate}%`);
  }
}, 60000); // Check every minute
```

## Error Handling Patterns

### Network Operations

```typescript
const result = await retryHelper.retry(
  async () => {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    return await response.json();
  },
  'api-fetch-users',
  { maxAttempts: 5, baseDelay: 2000 }
);
```

### Database Operations

```typescript
const result = await retryHelper.retry(
  async () => {
    return await supabase.from('users').select('*');
  },
  'supabase-query-users',
  { maxAttempts: 3, baseDelay: 1000 }
);
```

### File Operations

```typescript
const result = await retryHelper.retry(
  async () => {
    return await fs.promises.readFile(filePath, 'utf8');
  },
  'file-read-config',
  { maxAttempts: 2, baseDelay: 500 }
);
```

## Testing

Run the comprehensive test suite:

```bash
npm test -- tests/retry-helper.test.ts
```

The test suite covers:
- Error classification
- Delay calculation
- Circuit breaker functionality
- Retry logic
- Statistics and monitoring
- Utility functions
- Edge cases

## Troubleshooting

### Common Issues

1. **Circuit breaker stuck open**: Use `resetCircuitBreaker()` or wait for timeout
2. **High retry counts**: Check if errors are properly classified as retryable
3. **Performance impact**: Adjust `maxAttempts` and `baseDelay` for your use case

### Debug Mode

```typescript
// Enable detailed logging
const debugRetryHelper = new RetryHelper({
  maxAttempts: 3,
  baseDelay: 1000,
  // Add debug logging here
});

// Check operation status
console.log('Stats:', debugRetryHelper.getStats());
console.log('Circuit breakers:', debugRetryHelper.getCircuitBreakerStatus());
```

## Migration Guide

### From Manual Retry Logic

**Before:**
```typescript
let attempts = 0;
const maxAttempts = 3;

while (attempts < maxAttempts) {
  try {
    return await operation();
  } catch (error) {
    attempts++;
    if (attempts >= maxAttempts) throw error;
    await new Promise(resolve => setTimeout(resolve, 1000 * attempts));
  }
}
```

**After:**
```typescript
const result = await retryHelper.retry(
  operation,
  'operation-name',
  { maxAttempts: 3, baseDelay: 1000 }
);

if (!result.success) {
  throw result.error;
}
return result.data;
```

## Performance Considerations

- **Memory usage**: Circuit breakers and statistics are stored in memory
- **CPU overhead**: Minimal overhead for error classification and delay calculation
- **Network impact**: Jitter prevents thundering herd, reducing server load

## Security Considerations

- **Error information**: Be careful not to expose sensitive information in error messages
- **Circuit breaker**: Can be used as a DoS protection mechanism
- **Retry limits**: Prevents infinite retry loops

## Future Enhancements

- **Distributed circuit breakers**: Redis-based shared state
- **Advanced backoff strategies**: Fibonacci, polynomial backoff
- **Metrics export**: Prometheus, StatsD integration
- **Machine learning**: Adaptive retry strategies based on historical data

## Contributing

When modifying the retry helper system:

1. Follow the universal header rules
2. Add comprehensive tests for new functionality
3. Update this documentation
4. Run the test suite: `npm test -- tests/retry-helper.test.ts`
5. Verify integration with guardian and orchestrator systems

## Support

For issues or questions about the retry helper system:

1. Check the test suite for usage examples
2. Review the error taxonomy for proper error classification
3. Monitor circuit breaker status and operation statistics
4. Consult the integration examples in guardian.js and orchestrator.js
