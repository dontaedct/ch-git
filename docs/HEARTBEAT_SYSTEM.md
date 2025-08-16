# Heartbeat System for Long-Running Tasks

## Overview

The Heartbeat System provides real-time progress updates, memory monitoring, and structured output for long-running tasks to prevent UIs from appearing frozen and provide better user experience.

## Features

- **Progress Tracking**: Real-time progress updates with percentages and ETA
- **Memory Monitoring**: RSS, heap, and external memory usage tracking
- **CPU Monitoring**: Basic CPU usage information
- **Multiple Operations**: Support for concurrent operations
- **Event-Driven**: Built on Node.js EventEmitter for extensibility
- **Progress Bars**: Built-in progress bar generation
- **Error Handling**: Graceful error handling and cancellation
- **Memory Leak Prevention**: Automatic cleanup and resource management

## Quick Start

### Basic Usage

```typescript
import { heartbeat } from '@lib/heartbeat';

// Start an operation
heartbeat.start('my-operation', 'Processing Files', 100);

// Update progress
heartbeat.update('my-operation', 50, 'Halfway done');

// Complete operation
heartbeat.complete('my-operation', 'All files processed');
```

### Advanced Usage

```typescript
import { HeartbeatEmitter } from '@lib/heartbeat';

const customHeartbeat = new HeartbeatEmitter({
  interval: 3000,           // 3 second intervals
  includeMemory: true,      // Include memory info
  includeCPU: true,         // Include CPU info
  consoleOutput: false      // Custom output handling
});

// Listen to events
customHeartbeat.on('heartbeat', (data) => {
  console.log(`${data.operationName}: ${data.progress}% - ${data.status}`);
});

customHeartbeat.on('operation:complete', (data) => {
  console.log(`✅ ${data.operationName} completed in ${data.elapsed}ms`);
});
```

## API Reference

### HeartbeatEmitter Class

#### Constructor Options

```typescript
interface HeartbeatConfig {
  interval?: number;           // Heartbeat interval in ms (default: 5000)
  includeMemory?: boolean;     // Include memory usage (default: true)
  includeCPU?: boolean;        // Include CPU usage (default: true)
  formatter?: (data: HeartbeatData) => string; // Custom formatter
  consoleOutput?: boolean;     // Auto-console output (default: true)
}
```

#### Methods

- `startOperation(id: string, name: string, totalSteps?: number)`: Start monitoring an operation
- `updateProgress(id: string, progress: number, status?: string, metadata?: object)`: Update operation progress
- `completeOperation(id: string, finalStatus?: string)`: Mark operation as complete
- `cancelOperation(id: string, reason?: string)`: Cancel an operation
- `getOperationStatus(id: string)`: Get current operation status
- `getActiveOperations()`: Get all active operations
- `createProgressBar(progress: number, options?: ProgressBarOptions)`: Create progress bar string
- `stop()`: Stop all operations and cleanup

#### Events

- `operation:start`: Emitted when an operation starts
- `progress:update`: Emitted when progress is updated
- `heartbeat`: Emitted at regular intervals
- `operation:complete`: Emitted when an operation completes
- `operation:cancel`: Emitted when an operation is cancelled

### Global Heartbeat Instance

The `heartbeat` object provides convenient global access:

```typescript
import { heartbeat } from '@lib/heartbeat';

// Convenience methods
heartbeat.start(id, name, totalSteps);
heartbeat.update(id, progress, status, metadata);
heartbeat.complete(id, status);
heartbeat.cancel(id, reason);
heartbeat.status(id);
heartbeat.active();
heartbeat.stop();
```

## Integration Examples

### With Doctor Script

```typescript
// In scripts/doctor.ts
import { heartbeat } from '../lib/heartbeat';

async run(): Promise<void> {
  const operationId = `doctor-${Date.now()}`;
  heartbeat.start(operationId, 'TypeScript Doctor Analysis', 4);
  
  try {
    heartbeat.update(operationId, 1, 'Adding source files...');
    await this.addSourceFilesSafely();
    
    heartbeat.update(operationId, 2, 'Building exports index...');
    await this.buildExportsIndexSafely();
    
    // ... more steps
    
    heartbeat.complete(operationId, 'Completed successfully');
  } catch (error) {
    heartbeat.complete(operationId, `Failed - ${error}`);
    throw error;
  }
}
```

### With Build Scripts

```typescript
// In build scripts
import { heartbeat } from '../lib/heartbeat';

async function runBuild(buildType: string) {
  const buildId = `build-${buildType}-${Date.now()}`;
  heartbeat.start(buildId, `Next.js ${buildType}`, 5);
  
  try {
    heartbeat.update(buildId, 1, 'Initializing build process...');
    // ... build steps
    heartbeat.update(buildId, 4, 'Build process completed, finalizing...');
    heartbeat.complete(buildId, 'Build completed successfully');
  } catch (error) {
    heartbeat.complete(buildId, `Build error: ${error.message}`);
    throw error;
  }
}
```

### With File Processing Loops

```typescript
// In file processing loops
for (let i = 0; i < files.length; i += batchSize) {
  const batch = files.slice(i, i + batchSize);
  
  // Process batch
  await this.processBatch(batch);
  
  // Update heartbeat with batch progress
  const progress = (i + batchSize) / files.length * 100;
  heartbeat.update(operationId, progress, 
    `Processed batch ${Math.floor(i/batchSize) + 1}: ${i + batchSize}/${files.length} files`);
  
  // Delay between batches
  await new Promise(resolve => setTimeout(resolve, 300));
}
```

## Progress Bar Options

```typescript
interface ProgressBarOptions {
  width?: number;           // Width of progress bar (default: 30)
  char?: string;            // Filled character (default: '█')
  emptyChar?: string;       // Empty character (default: '░')
  showPercentage?: boolean; // Show percentage (default: true)
  showETA?: boolean;        // Show ETA (default: true)
}

// Example
const bar = heartbeat.createProgressBar(75, { width: 40, char: '#' });
// Output: [########################░░░░░░░░░░░░░░░░░░░░] 75.0%
```

## Memory and CPU Information

### Memory Info

```typescript
interface MemoryInfo {
  rss: number;        // Resident Set Size in bytes
  heapUsed: number;   // Heap used in bytes
  heapTotal: number;  // Heap total in bytes
  external: number;   // External memory in bytes
  arrayBuffers: number; // Array buffers in bytes
}
```

### CPU Info

```typescript
interface CPUInfo {
  usage: number;      // CPU usage percentage
  user: number;       // User CPU time in milliseconds
  system: number;     // System CPU time in milliseconds
}
```

## Best Practices

### 1. Operation Naming

Use descriptive operation names that clearly indicate what's happening:

```typescript
// Good
heartbeat.start('build-production', 'Production Build', 10);
heartbeat.start('migrate-database', 'Database Migration', 25);

// Avoid
heartbeat.start('op1', 'Process', 10);
```

### 2. Progress Granularity

Choose appropriate step counts based on operation complexity:

```typescript
// For simple operations
heartbeat.start('simple-task', 'Simple Task', 5);

// For complex operations
heartbeat.start('complex-task', 'Complex Task', 100);
```

### 3. Status Messages

Provide clear, actionable status messages:

```typescript
// Good
heartbeat.update(id, 50, 'Processing user data...');
heartbeat.update(id, 75, 'Validating input files...');

// Avoid
heartbeat.update(id, 50, 'Working...');
heartbeat.update(id, 75, 'Still working...');
```

### 4. Error Handling

Always complete operations, even on failure:

```typescript
try {
  // ... operation logic
  heartbeat.complete(id, 'Completed successfully');
} catch (error) {
  heartbeat.complete(id, `Failed: ${error.message}`);
  throw error;
}
```

### 5. Memory Management

Clean up resources and avoid memory leaks:

```typescript
// Clean up arrays and objects
memoryArrays.length = 0;
largeObjects = null;

// Stop heartbeat when done
heartbeat.stop();
```

## Configuration

### Environment Variables

```bash
# Heartbeat interval (default: 5000ms)
HEARTBEAT_INTERVAL=3000

# Enable/disable memory monitoring
HEARTBEAT_INCLUDE_MEMORY=true

# Enable/disable CPU monitoring
HEARTBEAT_INCLUDE_CPU=true

# Enable/disable console output
HEARTBEAT_CONSOLE_OUTPUT=true
```

### Custom Formatters

```typescript
const customFormatter = (data: HeartbeatData): string => {
  return `[${data.operationName}] ${data.progress}% - ${data.status}`;
};

const heartbeat = new HeartbeatEmitter({
  formatter: customFormatter
});
```

## Troubleshooting

### Common Issues

1. **Operations not updating**: Ensure operation ID is consistent between start/update/complete calls
2. **Memory leaks**: Call `heartbeat.stop()` when done with custom instances
3. **Performance impact**: Adjust heartbeat interval for very fast operations
4. **Console spam**: Set `consoleOutput: false` for custom output handling

### Debug Mode

Enable debug logging:

```typescript
const heartbeat = new HeartbeatEmitter({
  consoleOutput: true,
  verbose: true
});

// Listen to all events
heartbeat.on('*', (event, data) => {
  console.log(`[DEBUG] ${event}:`, data);
});
```

## Performance Considerations

- **Heartbeat Interval**: Default 5-second intervals provide good balance between responsiveness and performance
- **Memory Monitoring**: Minimal overhead (~0.1ms per heartbeat)
- **Event Emission**: Efficient EventEmitter implementation
- **Progress Calculation**: O(1) complexity for progress updates

## Migration Guide

### From Manual Progress Logging

```typescript
// Before
console.log('Processing file 1/100...');
console.log('Processing file 2/100...');
// ... repeat 98 more times

// After
heartbeat.start('file-processing', 'File Processing', 100);
for (let i = 0; i < files.length; i++) {
  processFile(files[i]);
  heartbeat.update('file-processing', i + 1, `Processed ${files[i]}`);
}
heartbeat.complete('file-processing', 'All files processed');
```

### From Custom Progress Systems

```typescript
// Before
class CustomProgress {
  update(progress: number) {
    // Custom implementation
  }
}

// After
import { heartbeat } from '@lib/heartbeat';
heartbeat.update(operationId, progress, status);
```

## Contributing

When adding new features to the heartbeat system:

1. Follow the existing code style and patterns
2. Add comprehensive TypeScript types
3. Include JSDoc documentation
4. Add unit tests for new functionality
5. Update this documentation

## License

MIT License - see LICENSE file for details.
