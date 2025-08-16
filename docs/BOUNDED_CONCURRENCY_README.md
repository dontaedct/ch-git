# Bounded Concurrency Utility

## Overview

The Bounded Concurrency Utility provides controlled concurrency management to prevent resource overload and ensure predictable performance across the MIT Hero System. This system replaces unbounded concurrency (like `Promise.all()`) with intelligent, resource-aware execution queues.

## Features

- **Configurable Limits**: Set maximum concurrent operations per operation type
- **Priority Queue**: Execute high-priority operations first
- **Resource Monitoring**: CPU, memory, and disk usage tracking
- **Graceful Degradation**: Automatic fallback when limits are exceeded
- **Retry Logic**: Built-in retry mechanisms with exponential backoff
- **Metrics & Logging**: Comprehensive performance monitoring
- **Timeout Protection**: Prevent hanging operations

## Architecture

### Core Components

1. **ConcurrencyLimiter**: Main class for managing operation execution
2. **ResourceMonitor**: Tracks system resource usage
3. **PriorityQueue**: Manages operation execution order
4. **MetricsCollector**: Gathers performance statistics

### Pre-configured Limiters

```typescript
// Health checks: max 20 concurrent, 15s timeout
healthCheckLimiter: new ConcurrencyLimiter({
  maxConcurrent: 20,
  maxQueueSize: 50,
  priorityLevels: 3,
  timeoutMs: 15000
})

// Build operations: max 3 concurrent, 5min timeout
buildLimiter: new ConcurrencyLimiter({
  maxConcurrent: 3,
  maxQueueSize: 20,
  priorityLevels: 5,
  timeoutMs: 300000
})

// Test operations: max 5 concurrent, 1min timeout
testLimiter: new ConcurrencyLimiter({
  maxConcurrent: 5,
  maxQueueSize: 30,
  priorityLevels: 4,
  timeoutMs: 60000
})
```

## Usage Examples

### Basic Operation Execution

```typescript
import { ConcurrencyLimiter } from './lib/concurrency';

const limiter = new ConcurrencyLimiter({
  maxConcurrent: 10,
  timeoutMs: 30000
});

// Execute single operation
const result = await limiter.execute(
  async () => await someAsyncOperation(),
  priority: 1,
  metadata: { type: 'healthCheck' }
);
```

### Batch Operations

```typescript
const operations = [
  {
    operation: async () => await checkSystemHealth('system1'),
    priority: 1,
    metadata: { system: 'system1' }
  },
  {
    operation: async () => await checkSystemHealth('system2'),
    priority: 2,
    metadata: { system: 'system2' }
  }
];

const results = await limiter.executeBatch(operations);
```

### Integration with MIT Hero System

```typescript
// In mit-hero-unified-integration.js
const healthCheckOperations = [
  {
    operation: async () => {
      const health = await this.sentientArmy.phase1SystemHealthAudit();
      this.systemHealth.sentientArmy = health;
      return health;
    },
    priority: 1,
    metadata: { system: 'sentientArmy', type: 'healthCheck' }
  }
];

const results = await this.concurrencyLimiters.healthChecks.executeBatch(
  healthCheckOperations,
  20 // Max 20 concurrent health checks
);
```

## Configuration Options

### ConcurrencyConfig Interface

```typescript
interface ConcurrencyConfig {
  maxConcurrent: number;        // Maximum concurrent operations
  maxQueueSize: number;         // Maximum queued operations
  priorityLevels: number;       // Number of priority levels (1-5)
  resourceLimits: {
    cpu: number;                // CPU usage threshold (0-100)
    memory: number;             // Memory usage threshold (0-100)
    disk: number;               // Disk I/O threshold (0-100)
  };
  timeoutMs: number;            // Operation timeout in milliseconds
  retryAttempts: number;        // Maximum retry attempts
  enableMetrics: boolean;       // Enable metrics collection
}
```

### Recommended Configurations

#### Health Checks
```typescript
{
  maxConcurrent: 20,           // Allow many concurrent health checks
  maxQueueSize: 50,            // Moderate queue size
  priorityLevels: 3,           // Simple priority system
  timeoutMs: 15000,            // 15 second timeout
  resourceLimits: {
    cpu: 75,                   // 75% CPU threshold
    memory: 80,                // 80% memory threshold
    disk: 60                   // 60% disk threshold
  }
}
```

#### Build Operations
```typescript
{
  maxConcurrent: 3,            // Limit concurrent builds
  maxQueueSize: 20,            // Small queue for builds
  priorityLevels: 5,           // Full priority system
  timeoutMs: 300000,           // 5 minute timeout
  resourceLimits: {
    cpu: 70,                   // Conservative CPU limit
    memory: 80,                // Memory intensive
    disk: 60                   // Moderate disk usage
  }
}
```

#### Test Operations
```typescript
{
  maxConcurrent: 5,            // Moderate concurrency
  maxQueueSize: 30,            // Balanced queue size
  priorityLevels: 4,           // Good priority granularity
  timeoutMs: 60000,            // 1 minute timeout
  resourceLimits: {
    cpu: 75,                   // Allow CPU usage
    memory: 85,                // Memory intensive tests
    disk: 65                   // Moderate disk usage
  }
}
```

## Resource Monitoring

### CPU Usage
- Monitors CPU utilization across all cores
- Calculates percentage of active vs idle time
- Triggers warnings at 80% of configured threshold

### Memory Usage
- Tracks total vs free memory
- Monitors memory pressure
- Alerts when approaching limits

### Disk Usage
- Basic disk I/O monitoring
- Placeholder for advanced disk monitoring
- Can be enhanced with actual I/O tracking

## Priority System

### Priority Levels (1-5)
1. **Critical**: System health, emergency operations
2. **High**: User-facing operations, core functionality
3. **Medium**: Background tasks, maintenance
4. **Low**: Cleanup, non-essential operations
5. **Background**: Long-running, low-impact tasks

### Priority Queue Behavior
- Higher priority operations execute first
- Same priority operations execute in FIFO order
- Retry operations get lower priority
- Resource limits can override priority

## Error Handling & Recovery

### Retry Logic
- Configurable retry attempts (default: 3)
- Exponential backoff strategy
- Priority degradation on retry
- Circuit breaker pattern for repeated failures

### Fallback Mechanisms
- Individual operation execution if batch fails
- Graceful degradation under load
- Resource limit enforcement
- Timeout protection

### Monitoring & Alerts
- Real-time resource usage tracking
- Warning thresholds at 80% of limits
- Detailed metrics collection
- Performance trend analysis

## Performance Impact

### Benefits
- **Predictable Performance**: Consistent resource usage
- **Resource Protection**: Prevents system overload
- **Better User Experience**: Responsive system under load
- **Scalability**: Controlled growth of concurrent operations

### Overhead
- **Queue Management**: Minimal CPU overhead
- **Resource Monitoring**: ~5% CPU overhead
- **Priority Sorting**: O(log n) for queue operations
- **Memory Usage**: ~1MB per limiter instance

### Optimization Tips
- Use appropriate queue sizes for your workload
- Set realistic resource limits
- Monitor metrics to tune configurations
- Use priority levels effectively

## Integration Points

### MIT Hero Unified Integration
- Health check concurrency control
- System operation management
- Integration task coordination

### Hero Unified Orchestrator
- Health check batching
- Build operation limits
- Test execution control
- System operation management

### CLI Commands
```bash
# Check concurrency status
npm run hero:unified:status

# View concurrency metrics
node scripts/mit-hero-unified-integration.js concurrency
node scripts/hero-unified-orchestrator.js concurrency

# Monitor system health
npm run hero:unified:health
```

## Troubleshooting

### Common Issues

#### Queue Full Errors
```typescript
// Increase queue size or reduce incoming operations
maxQueueSize: 200  // Increase from default 100
```

#### Resource Limit Exceeded
```typescript
// Adjust resource thresholds or reduce concurrency
resourceLimits: {
  cpu: 90,         // Increase from 80
  memory: 90,      // Increase from 85
  disk: 80         // Increase from 70
}
```

#### Timeout Issues
```typescript
// Increase timeout for long-running operations
timeoutMs: 60000   // Increase from 30000
```

### Debugging Commands
```bash
# Check concurrency status
npm run hero:unified:status

# View detailed metrics
node scripts/mit-hero-unified-integration.js concurrency

# Monitor resource usage
node scripts/hero-unified-orchestrator.js concurrency
```

## Best Practices

### Configuration
1. **Start Conservative**: Begin with lower concurrency limits
2. **Monitor Metrics**: Use built-in monitoring to tune settings
3. **Resource Awareness**: Set limits based on actual system capacity
4. **Priority Planning**: Design priority levels for your use case

### Operation Design
1. **Timeout Appropriately**: Set realistic timeouts for operations
2. **Handle Errors**: Implement proper error handling in operations
3. **Use Metadata**: Include useful information for debugging
4. **Batch When Possible**: Use executeBatch for related operations

### Monitoring
1. **Track Metrics**: Monitor execution times and failure rates
2. **Resource Alerts**: Set up alerts for resource usage
3. **Performance Trends**: Analyze metrics over time
4. **Capacity Planning**: Use data to plan system capacity

## Future Enhancements

### Planned Features
- **Dynamic Scaling**: Automatic concurrency adjustment
- **Advanced Metrics**: More detailed performance analytics
- **Machine Learning**: Predictive resource optimization
- **Distributed Coordination**: Multi-node concurrency control

### Extension Points
- **Custom Resource Monitors**: Add specialized monitoring
- **Priority Strategies**: Implement custom priority algorithms
- **Load Balancing**: Distribute operations across limiters
- **Integration APIs**: Connect with external monitoring systems

## Contributing

### Development Guidelines
1. Follow the universal header conventions
2. Add tests for new functionality
3. Update documentation for changes
4. Use the AUDIT → DECIDE → APPLY → VERIFY pattern

### Testing
```bash
# Run concurrency tests
npm run test:concurrency

# Test specific limiters
npm run test:health-limiter
npm run test:build-limiter
npm run test:test-limiter
```

## License

MIT License - See LICENSE file for details.

## Support

For issues and questions:
1. Check the troubleshooting section
2. Review the metrics and status commands
3. Consult the MIT Hero System documentation
4. Open an issue in the project repository
