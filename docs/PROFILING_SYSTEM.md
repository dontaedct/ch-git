# Memory/CPU Profiling System

The MIT Hero System includes comprehensive memory and CPU profiling utilities to help diagnose performance issues and memory leaks.

## Overview

The profiling system consists of three main components:

1. **Memory Profiler** (`scripts/profile-memory.js`) - Heap snapshots and memory analysis
2. **CPU Profiler** (`scripts/profile-cpu.js`) - CPU profiling and performance analysis  
3. **Integrated Profiler** (`scripts/profile-integrated.js`) - Combined memory and CPU profiling

## Quick Start

### Basic Memory Profiling
```bash
# Profile memory for 1 minute (default)
npm run profile:memory

# Profile memory for 30 seconds
npm run profile:memory --duration=30000

# Generate heap snapshot only
npm run profile:memory --snapshot

# Export memory data for analysis
npm run profile:memory --export
```

### Basic CPU Profiling
```bash
# Profile CPU for 30 seconds (default)
npm run profile:cpu

# Profile CPU for 1 minute
npm run profile:cpu --duration=60000

# Profile during build process
npm run profile:cpu --build

# Profile during test execution
npm run profile:cpu --test

# Export CPU data for analysis
npm run profile:cpu --export
```

### Integrated Profiling
```bash
# Full system profile (memory + CPU) for 1 minute
npm run profile:integrated

# Profile during build with integrated monitoring
npm run profile:integrated --build

# Profile during tests with integrated monitoring
npm run profile:integrated --test

# Export all profiling data
npm run profile:integrated --export
```

## Available Commands

### Memory Profiling
- `npm run profile:memory` - Basic memory profile
- `npm run profile:memory:snapshot` - Generate heap snapshot
- `npm run profile:memory:export` - Export memory data

### CPU Profiling
- `npm run profile:cpu` - Basic CPU profile
- `npm run profile:cpu:build` - Profile during build
- `npm run profile:cpu:test` - Profile during tests
- `npm run profile:cpu:export` - Export CPU data

### Integrated Profiling
- `npm run profile:integrated` - Full system profile
- `npm run profile:integrated:build` - Profile during build
- `npm run profile:integrated:test` - Profile during tests
- `npm run profile:integrated:export` - Export all data

## Configuration Options

### Memory Profiler
- `--interval=<ms>` - Memory sampling interval (default: 10000ms)
- `--duration=<ms>` - Profiling duration (default: 60000ms)
- `--snapshot` - Generate heap snapshot only
- `--analyze` - Analyze existing snapshots
- `--export` - Export data for external analysis
- `--verbose` - Enable verbose logging

### CPU Profiler
- `--duration=<ms>` - Profiling duration (default: 30000ms)
- `--sampling=<ms>` - CPU sampling interval (default: 1000ms)
- `--build` - Profile during build process
- `--test` - Profile during test execution
- `--export` - Export data for external analysis
- `--verbose` - Enable verbose logging

### Integrated Profiler
- `--duration=<ms>` - Profiling duration (default: 60000ms)
- `--memory-interval=<ms>` - Memory sampling interval (default: 10000ms)
- `--cpu-sampling=<ms>` - CPU sampling interval (default: 1000ms)
- `--build` - Profile during build process
- `--test` - Profile during test execution
- `--export` - Export all profiling data
- `--verbose` - Enable verbose logging

## Output and Reports

### Report Location
All profiling reports are saved to `./reports/profiles/` with timestamped filenames.

### Report Types
- **Memory Profile Reports** - `memory-profile-{timestamp}.json`
- **CPU Profile Reports** - `cpu-profile-{timestamp}.json`
- **Integrated Profile Reports** - `integrated-profile-{timestamp}.json`
- **Heap Snapshots** - `heap-snapshot-{timestamp}.json`
- **Data Exports** - `{type}-export-{timestamp}.json`

### Report Contents

#### Memory Profile Reports
- Memory usage patterns and trends
- Potential memory leak detection
- Memory optimization recommendations
- Heap usage statistics
- External memory usage

#### CPU Profile Reports
- CPU usage patterns and trends
- Performance bottleneck identification
- Function execution time analysis
- Optimization suggestions
- Build and test process metrics

#### Integrated Profile Reports
- Combined memory and CPU analysis
- Cross-correlation between memory and CPU usage
- Performance regression detection
- Comprehensive optimization recommendations
- System-wide performance insights

## Advanced Usage

### Custom Profiling Durations
```bash
# Profile for 5 minutes
npm run profile:memory --duration=300000

# Profile for 2 minutes with 5-second intervals
npm run profile:memory --duration=120000 --interval=5000
```

### High-Frequency Sampling
```bash
# Sample CPU every 100ms for 1 minute
npm run profile:cpu --duration=60000 --sampling=100
```

### Build Process Profiling
```bash
# Profile memory and CPU during build
npm run profile:integrated --build

# Profile only CPU during build
npm run profile:cpu --build
```

### Test Execution Profiling
```bash
# Profile memory and CPU during tests
npm run profile:integrated --test

# Profile only CPU during tests
npm run profile:cpu --test
```

## Integration with Existing Systems

### Performance Monitoring
The profiling system integrates with the existing `lib/performance-monitor.ts` to provide comprehensive performance insights.

### Memory Leak Detection
Works alongside `lib/memory-leak-detector.ts` to identify and prevent memory leaks.

### Build Monitoring
Integrates with existing build scripts to profile performance during compilation and bundling.

## Analysis and Optimization

### Memory Analysis
- **Trend Detection**: Identifies growing, stable, or declining memory patterns
- **Leak Detection**: Flags potential memory leaks based on usage patterns
- **Heap Analysis**: Monitors heap usage and garbage collection patterns
- **Optimization Recommendations**: Provides specific suggestions for memory optimization

### CPU Analysis
- **Usage Patterns**: Tracks CPU usage trends and volatility
- **Bottleneck Identification**: Identifies performance bottlenecks and slow functions
- **Function Profiling**: Measures execution times and call frequencies
- **Process Monitoring**: Tracks build and test process performance

### Cross-Correlation Analysis
- **Memory-CPU Correlation**: Identifies relationships between memory pressure and CPU spikes
- **Performance Regression Detection**: Alerts on performance degradation patterns
- **System Health Monitoring**: Provides holistic system performance insights

## Best Practices

### When to Use Memory Profiling
- During development to catch memory leaks early
- Before and after major refactoring
- When investigating performance issues
- During load testing and stress testing
- Regular health checks in production

### When to Use CPU Profiling
- During build optimization
- When investigating slow operations
- Performance regression testing
- Load testing and capacity planning
- Function-level optimization

### When to Use Integrated Profiling
- Comprehensive system performance analysis
- Performance regression detection
- Build and test process optimization
- Production performance monitoring
- Cross-team performance investigations

## Troubleshooting

### Common Issues

#### Profiling Not Starting
- Check if another profiling session is already running
- Verify output directory permissions
- Check for sufficient disk space

#### High Memory Usage During Profiling
- Reduce sampling frequency
- Limit profiling duration
- Use snapshot mode for quick analysis

#### CPU Profiling Overhead
- Increase sampling interval
- Use build/test mode for specific processes
- Profile only when necessary

### Performance Impact
- **Memory Profiler**: Minimal overhead (~1-2% memory increase)
- **CPU Profiler**: Low overhead (~2-5% CPU increase)
- **Integrated Profiler**: Combined overhead (~3-7% total)

## Examples

### Development Workflow
```bash
# Start development with memory monitoring
npm run profile:memory --duration=300000 --interval=15000

# In another terminal, run your development server
npm run dev
```

### Build Optimization
```bash
# Profile build performance
npm run profile:integrated --build

# Analyze results
npm run profile:integrated --export
```

### Performance Investigation
```bash
# Profile during specific operation
npm run profile:cpu --duration=60000 --sampling=500

# Generate memory snapshot
npm run profile:memory --snapshot

# Export data for external analysis
npm run profile:memory --export
```

## Contributing

The profiling system is designed to be extensible. Key areas for enhancement:

- Additional profiling metrics
- Custom analysis algorithms
- Integration with external monitoring tools
- Performance regression baselines
- Automated optimization suggestions

## Support

For issues or questions about the profiling system:

1. Check the console output for error messages
2. Review the generated reports for insights
3. Use `--verbose` flag for detailed logging
4. Check the `./reports/profiles/` directory for output files

The profiling system is part of the MIT Hero System and follows the same development and contribution guidelines.
