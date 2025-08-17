# 🚀 MIT HERO SYSTEM - STRUCTURED LOGGING

Advanced structured logging system with correlation IDs, performance metrics, and environment-specific configuration for production-grade monitoring.

## ✨ Features

- **Multiple Log Levels**: DEBUG, INFO, WARN, ERROR, FATAL
- **Structured JSON Output**: Consistent metadata format
- **Correlation IDs**: Track operations across systems
- **Performance Metrics**: Built-in timing and monitoring
- **Environment Configuration**: Different settings for dev/prod
- **File & Console Output**: Flexible output destinations
- **Log Rotation**: Automatic file management
- **Memory Leak Prevention**: Safe for long-running processes

## 🏗️ Architecture

### Core Components

1. **Logger Class**: Main logging interface
2. **PerformanceMonitor**: Tracks operation timing
3. **LogFileManager**: Handles file output and rotation
4. **Specialized Loggers**: Pre-configured for common operations

### Log Entry Structure

```typescript
interface LogEntry {
  timestamp: string;           // ISO timestamp
  level: LogLevel;            // Numeric log level
  levelName: string;          // Human-readable level
  message: string;            // Log message
  correlationId: string;      // Unique operation ID
  operationId?: string;       // Specific operation context
  duration?: number;          // Operation duration in ms
  metadata?: Record<string, any>; // Additional data
  error?: Error;              // Error object if applicable
  stack?: string;             // Stack trace if enabled
  context?: {                 // Caller context
    file?: string;
    function?: string;
    line?: number;
    column?: number;
  };
  performance?: {              // System metrics
    memory: NodeJS.MemoryUsage;
    cpu: number;
  };
}
```

## 🚀 Quick Start

### Basic Usage

```typescript
import { logger } from '@lib/logger';

// Simple logging
logger.info('Application started');
logger.warn('Resource usage high', { memory: process.memoryUsage() });
logger.error('Operation failed', { error: new Error('Something went wrong') });

// Performance tracking
const operationId = logger.startTimer('database-query');
// ... perform operation ...
const duration = logger.endTimer(operationId);
logger.info('Database query completed', { duration });
```

### Specialized Loggers

```typescript
import { buildLogger, guardianLogger, doctorLogger } from '@lib/logger';

// Build operations
buildLogger.info('Starting build process', { target: 'production' });

// Guardian system
guardianLogger.warn('Security threat detected', { threat: 'suspicious-import' });

// Doctor system
doctorLogger.error('TypeScript compilation failed', { errorCount: 5 });
```

### Correlation IDs

```typescript
// Create new correlation for related operations
const requestLogger = logger.withCorrelation();
requestLogger.info('Request started', { userId: 123 });

// Use same correlation across operations
const dbLogger = requestLogger.withOperation('database');
dbLogger.info('Querying user data', { query: 'SELECT * FROM users' });
```

## ⚙️ Configuration

### Environment Variables

```bash
# Log level (DEBUG, INFO, WARN, ERROR, FATAL)
LOG_LEVEL=INFO

# Enable file logging
ENABLE_FILE_LOGGING=true
LOG_FILE_PATH=./logs/app.log

# Performance monitoring
ENABLE_PERFORMANCE_MONITORING=true

# Stack traces
INCLUDE_STACK_TRACES=true
```

### Programmatic Configuration

```typescript
import { logger, LogLevel } from '@lib/logger';

// Set log level
logger.setLevel(LogLevel.DEBUG);

// Enable file logging
logger.enableFileLogging('./logs/app.log');

// Disable file logging
logger.disableFileLogging();

// Clear performance metrics
logger.clearPerformanceMetrics();
```

### Default Configuration

```typescript
const DEFAULT_CONFIG = {
  level: process.env.NODE_ENV === 'production' ? LogLevel.INFO : LogLevel.DEBUG,
  enableConsole: true,
  enableFile: false,
  maxFileSize: 10 * 1024 * 1024, // 10MB
  maxFiles: 5,
  enablePerformance: process.env.NODE_ENV !== 'production',
  enableCorrelation: true,
  format: process.env.NODE_ENV === 'production' ? 'json' : 'pretty',
  includeStack: process.env.NODE_ENV !== 'production',
  includePerformance: process.env.NODE_ENV !== 'production'
};
```

## 📊 Performance Monitoring

### Operation Timing

```typescript
// Start timing an operation
const operationId = logger.startTimer('api-request');

// ... perform operation ...

// End timing and get duration
const duration = logger.endTimer(operationId);
logger.info('API request completed', { duration });
```

### Metrics Collection

```typescript
// Get performance metrics for an operation
const metrics = logger.getMetrics('api-request');
if (metrics) {
  console.log(`API Request Metrics:
    Count: ${metrics.count}
    Average: ${metrics.avg.toFixed(2)}ms
    Min: ${metrics.min.toFixed(2)}ms
    Max: ${metrics.max.toFixed(2)}ms
  `);
}
```

## 📁 File Logging

### Log Rotation

The system automatically rotates log files when they reach the configured size limit:

- **Current log**: `app.log`
- **Rotated logs**: `app.0.log`, `app.1.log`, etc.
- **Max files**: Configurable (default: 5)
- **Max size**: Configurable (default: 10MB)

### Output Formats

1. **JSON**: Machine-readable structured format
2. **Pretty**: Human-readable with formatting
3. **Minimal**: Compact format for high-volume logging

## 🔧 Migration Guide

### From console.log

```typescript
// Before
console.log('User logged in', { userId: 123, timestamp: new Date() });

// After
logger.info('User logged in', { userId: 123, timestamp: new Date() });
```

### From console.error

```typescript
// Before
console.error('Database connection failed:', error);

// After
logger.error('Database connection failed', { error });
```

### From console.warn

```typescript
// Before
console.warn('High memory usage detected');

// After
logger.warn('High memory usage detected', { memory: process.memoryUsage() });
```

## 🧪 Testing

### Test Script

Run the test script to verify the logging system:

```bash
node scripts/test-logging.js
```

This will:
- Test all log levels
- Demonstrate correlation IDs
- Show performance tracking
- Create sample log files

### Test Output

```
✅ Logging system test completed!
📁 Logs saved to: ./logs/test-logging.log
🔗 Operation ID: 550e8400-e29b-41d4-a716-446655440000
⏱️  Total duration: 123.45ms
```

## 🚨 Production Considerations

### Console Log Removal

The system automatically removes console.log statements in production builds via webpack configuration.

### Performance Impact

- **Development**: Full logging with performance monitoring
- **Production**: Minimal logging, no performance overhead
- **Memory**: Efficient string handling, no memory leaks

### Security

- No sensitive data in logs by default
- Configurable metadata filtering
- Safe error handling

## 🔍 Troubleshooting

### Common Issues

1. **Logger not found**: Check import path and ensure lib/logger.ts exists
2. **File permissions**: Ensure log directory is writable
3. **Memory usage**: Monitor log file sizes and rotation
4. **Performance**: Disable performance monitoring in production

### Debug Mode

```typescript
// Enable debug logging
logger.setLevel(LogLevel.DEBUG);

// Check configuration
const config = logger.getConfig();
console.log('Logger config:', config);
```

## 📚 API Reference

### Logger Methods

- `logger.debug(message, metadata?)`
- `logger.info(message, metadata?)`
- `logger.warn(message, metadata?)`
- `logger.error(message, metadata?)`
- `logger.fatal(message, metadata?)`

### Utility Methods

- `logger.startTimer(operationName): string`
- `logger.endTimer(operationId): number | undefined`
- `logger.getMetrics(operationName): Metrics | undefined`
- `logger.withOperation(operationName): Logger`
- `logger.withCorrelation(): Logger`

### Configuration Methods

- `logger.setLevel(level: LogLevel): void`
- `logger.enableFileLogging(filePath: string): void`
- `logger.disableFileLogging(): void`
- `logger.clearPerformanceMetrics(): void`
- `logger.getConfig(): LoggerConfig`

## 🤝 Contributing

When adding new logging features:

1. Follow the existing pattern
2. Add appropriate TypeScript types
3. Include performance considerations
4. Update this documentation
5. Add tests to the test script

## 📄 License

This logging system is part of the MIT Hero System and follows the same licensing terms.
